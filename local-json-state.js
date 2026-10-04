/* Reused from ErikEhresman-ST1987/module-library: modules/local-json-state */
export function createLocalJsonState({
  key,
  createDefault,
  normalize = (value) => value,
  onError = () => {}
}) {
  if (!key || typeof key !== "string") throw new TypeError("A storage key is required.");
  if (typeof createDefault !== "function") throw new TypeError("createDefault must be a function.");
  if (typeof normalize !== "function") throw new TypeError("normalize must be a function.");

  function load() {
    try {
      const stored = localStorage.getItem(key);
      return stored === null
        ? normalize(createDefault())
        : normalize(JSON.parse(stored));
    } catch (error) {
      onError(error, "load");
      return normalize(createDefault());
    }
  }

  function save(value) {
    try {
      const normalized = normalize(value);
      localStorage.setItem(key, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      onError(error, "save");
      throw error;
    }
  }

  function clear() {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      onError(error, "clear");
      throw error;
    }
  }

  return { load, save, clear };
}