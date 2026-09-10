const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers.cjs');

test('stacked dialogs keep only the top dialog interactive and restore focus/scroll', () => {
  const keyListeners = [];
  let document;
  class Element {
    children = []; parentElement = null; inert = false; isConnected = true; attributes = {}; style = {}; events = {};
    add(child) { child.parentElement = this; this.children.push(child); return child; }
    querySelectorAll() { return this.children.flatMap(child => [child, ...child.querySelectorAll()]).filter(child => child.button); }
    hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
    getAttribute(name) { return this.attributes[name]; }
    setAttribute(name, value) { this.attributes[name] = value; }
    removeAttribute(name) { delete this.attributes[name]; }
    closest() { return this.inert ? this : this.parentElement?.closest() ?? null; }
    getClientRects() { return [this.getBoundingClientRect()]; }
    getBoundingClientRect() { return { width: 100, height: 30 }; }
    contains(child) { return child === this || this.children.some(value => value.contains(child)); }
    addEventListener(name, listener) { this.events[name] = listener; }
    removeEventListener(name) { delete this.events[name]; }
    focus() { document.activeElement = this; }
  }
  const body = new Element(); body.style.overflow = 'auto';
  const opener = body.add(new Element()); opener.button = true;
  const root1 = body.add(new Element()), dialog1 = root1.add(new Element()), first = dialog1.add(new Element()), last = dialog1.add(new Element());
  first.button = last.button = true;
  const root2 = body.add(new Element()), dialog2 = root2.add(new Element()), upper = dialog2.add(new Element()); upper.button = true;
  document = { body, activeElement: opener };
  const window = {
    requestAnimationFrame: callback => callback(), getComputedStyle: () => ({}),
    addEventListener: (_name, listener) => keyListeners.push(listener),
    removeEventListener: (_name, listener) => keyListeners.splice(keyListeners.indexOf(listener), 1)
  };
  const { mountModal } = createLoader({}, { document, window, HTMLElement: Element })('@/lib/a11y/focus-trap');
  let lowerEscapes = 0, upperEscapes = 0;
  const close1 = mountModal(root1, dialog1, () => lowerEscapes++);
  assert.equal(document.activeElement, first);
  assert.equal(opener.inert, true);
  const close2 = mountModal(root2, dialog2, () => upperEscapes++);
  assert.equal(root2.inert, false);
  assert.equal(root1.inert, true);
  assert.equal(document.activeElement, upper);
  const event = { key: 'Escape', preventDefault() {}, stopImmediatePropagation() { this.stopped = true; } };
  for (const listener of [...keyListeners]) { listener(event); if (event.stopped) break; }
  assert.equal(lowerEscapes, 0); assert.equal(upperEscapes, 1);
  close2();
  assert.equal(root1.inert, false);
  assert.equal(document.activeElement, first);
  assert.equal(body.style.overflow, 'hidden');
  last.focus();
  dialog1.events.keydown({ key: 'Tab', preventDefault() {}, stopPropagation() {} });
  assert.equal(document.activeElement, first);
  close1();
  assert.equal(opener.inert, false);
  assert.equal(document.activeElement, opener);
  assert.equal(body.style.overflow, 'auto');
});
