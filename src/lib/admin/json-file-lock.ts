/** Per-file async mutex to prevent read-modify-write races on local JSON stores. */
const queues = new Map<string, Promise<void>>();

export async function withJsonFileLock<T>(fileKey: string, task: () => Promise<T>): Promise<T> {
  const previous = queues.get(fileKey) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  queues.set(
    fileKey,
    previous.then(() => gate)
  );

  await previous;

  try {
    return await task();
  } finally {
    release();
    if (queues.get(fileKey) === gate) {
      queues.delete(fileKey);
    }
  }
}
