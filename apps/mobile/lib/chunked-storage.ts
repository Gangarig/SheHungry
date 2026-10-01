export type AsyncStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

type Manifest = { generation: string; count: number };

// Small chunks avoid historical iOS Keychain value limits, including sessions
// with provider metadata. Publish the manifest last so a failed write keeps
// the previous complete session. Serialize readers as well as writers.
export function createChunkedStorage(storage: AsyncStorage): AsyncStorage {
  const operations = new Map<string, Promise<unknown>>();
  const manifestKey = (key: string) => `${key}.sh-manifest`;
  const chunkKey = (key: string, manifest: Manifest, index: number) =>
    `${key}.sh-${manifest.generation}-${index}`;

  async function readManifest(key: string): Promise<Manifest | null> {
    const value = await storage.getItem(manifestKey(key));
    if (!value) return null;
    const parsed = JSON.parse(value) as Manifest;
    if (!/^[a-z0-9-]+$/.test(parsed.generation) || !Number.isInteger(parsed.count) || parsed.count < 1 || parsed.count > 1000) {
      throw new Error('The saved session could not be read. Please contact support before clearing app data.');
    }
    return parsed;
  }

  function serialized<T>(key: string, action: () => Promise<T>): Promise<T> {
    const operation = (operations.get(key) ?? Promise.resolve()).catch(() => undefined).then(action);
    operations.set(key, operation);
    void operation.finally(() => {
      if (operations.get(key) === operation) operations.delete(key);
    }).catch(() => undefined);
    return operation;
  }

  async function removeChunks(key: string, manifest: Manifest) {
    await Promise.all(Array.from({ length: manifest.count }, (_, index) =>
      storage.removeItem(chunkKey(key, manifest, index)),
    ));
  }

  return {
    getItem: (key) => serialized(key, async () => {
      const manifest = await readManifest(key);
      if (!manifest) return storage.getItem(key); // Migrate existing beta sessions on their next refresh.
      const chunks = await Promise.all(Array.from({ length: manifest.count }, (_, index) =>
        storage.getItem(chunkKey(key, manifest, index)),
      ));
      if (chunks.some((chunk) => chunk === null)) throw new Error('The saved session is incomplete. Please try reopening the app.');
      return chunks.join('');
    }),
    setItem: (key, value) => serialized(key, async () => {
      const previous = await readManifest(key);
      const characters = Array.from(value);
      const manifest = { generation: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, count: Math.max(1, Math.ceil(characters.length / 450)) };
      if (manifest.count > 1000) throw new Error('The session is too large to store safely.');
      try {
        for (let index = 0; index < manifest.count; index += 1) {
          await storage.setItem(chunkKey(key, manifest, index), characters.slice(index * 450, (index + 1) * 450).join(''));
        }
        await storage.setItem(manifestKey(key), JSON.stringify(manifest));
      } catch (error) {
        await removeChunks(key, manifest).catch(() => undefined);
        throw error;
      }
      // The committed session is already safe. Cleanup failures must not turn
      // a successful token refresh into a failed sign-in.
      await storage.removeItem(key).catch(() => undefined);
      if (previous) await removeChunks(key, previous).catch(() => undefined);
    }),
    removeItem: (key) => serialized(key, async () => {
      const manifest = await readManifest(key);
      await storage.removeItem(key);
      await storage.removeItem(manifestKey(key));
      if (manifest) await removeChunks(key, manifest);
    }),
  };
}
