const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const clone = value => structuredClone(value);

// Load actual application modules, but reject unapproved external dependencies.
// Tests never load .env, initialize Firebase, or call an external provider.
function createLoader(stubs = {}, globals = {}) {
  stubs = { '@/lib/cache/cached-data': { CACHE_TAGS: { seoContent: 'seo-content', menuDisplay: 'menu-display', menuCategories: 'menu-categories', homepageMenu: 'homepage-menu', siteImages: 'site-images' } }, ...stubs };
  const cache = new Map();
  const builtins = new Set(['fs/promises', 'path', 'crypto', 'fs']);
  const quiet = { info() {}, warn() {}, error() {}, log() {} };
  function load(name) {
    if (Object.hasOwn(stubs, name)) return stubs[name];
    if (name === 'server-only') return {};
    if (builtins.has(name)) return require(name);
    if (!name.startsWith('@/')) throw new Error(`Unmocked dependency: ${name}`);
    const base = path.join(root, 'src', name.slice(2));
    const file = ['.ts', '.tsx', '/index.ts'].map(ext => base + ext).find(fs.existsSync);
    if (!file) throw new Error(`Missing source: ${name}`);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }
    }).outputText;
    const scope = {
      process: { env: {}, cwd: () => { throw new Error('Test cwd must be explicit'); } },
      console: quiet,
      ...globals
    };
    const run = vm.runInThisContext(`(function(exports,require,module,${Object.keys(scope).join(',')}){${code}\n})`, { filename: file });
    const localRequire = dependency => dependency.startsWith('.')
      ? load('@/' + path.relative(path.join(root, 'src'), path.resolve(path.dirname(file), dependency)).replaceAll('\\', '/'))
      : load(dependency);
    run(module.exports, localRequire, module, ...Object.values(scope));
    return module.exports;
  }
  return load;
}

function memoryStore(seed = []) {
  let rows = clone(seed);
  return {
    async getAll() { return clone(rows); },
    async getById(id) { return clone(rows.find(row => row.id === id) ?? null); },
    async save(row) { const i = rows.findIndex(value => value.id === row.id); if (i < 0) rows.push(clone(row)); else rows[i] = clone(row); return clone(row); },
    async remove(id) { const old = rows.length; rows = rows.filter(row => row.id !== id); return old !== rows.length; }
  };
}

function fakeFirestore(initial = {}) {
  let data = clone(initial), queue = Promise.resolve();
  const db = {
    transactions: 0,
    failNextCommit: false,
    collection(name) { return { name, doc(id) { return { name, id }; } }; },
    dump() { return clone(data); },
    runTransaction(callback) {
      const run = queue.then(async () => {
        db.transactions++;
        const next = clone(data);
        const transaction = {
          async get(ref) {
            if (ref.id !== undefined) return { exists: Boolean(next[ref.name]?.[ref.id]), data: () => clone(next[ref.name]?.[ref.id]) };
            return { docs: Object.entries(next[ref.name] ?? {}).map(([id, value]) => ({ id, data: () => clone(value) })) };
          },
          set(ref, value) { (next[ref.name] ??= {})[ref.id] = clone(value); },
          delete(ref) { delete (next[ref.name] ?? {})[ref.id]; }
        };
        const result = await callback(transaction);
        if (db.failNextCommit) { db.failNextCommit = false; throw new Error('simulated commit failure'); }
        data = next;
        return result;
      });
      queue = run.catch(() => {});
      return run;
    }
  };
  return db;
}

function storageStubs(stores, db = null) {
  return {
    '@/lib/firebase': { isFirebaseConfigured: () => Boolean(db), getFirestoreDb: () => db },
    '@/lib/firebase/admin-runtime': { getAdminFirestore: async () => db },
    '@/lib/firebase/local-stores': stores,
    '@/lib/firebase/firestore-store': { createFirestoreCollectionStore: (_name, local) => local },
    'firebase/firestore': { doc: (database, name, id) => database.collection(name).doc(id), getDoc: async ref => ({ exists: () => Boolean(db.dump()[ref.name]?.[ref.id]), data: () => db.dump()[ref.name]?.[ref.id] }) },
    'next/cache': { revalidatePath() {}, updateTag() {}, revalidateTag() {} }
  };
}
module.exports = { createLoader, memoryStore, fakeFirestore, storageStubs, root };
