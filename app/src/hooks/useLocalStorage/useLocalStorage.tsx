function get<T>(key: string): T | null {
  const item = localStorage.getItem(key);

  if (item === null) {
    return null;
  }

  try {
    const value = JSON.parse(item);

    return value;
  } catch {
    return item as unknown as T;
  }
}

const set = (key: string, value: unknown = {}) => {
  const val = typeof value === "object" ? JSON.stringify(value) : value;

  localStorage.setItem(key, val as string);
};

export const useLocalStorage = () => ({
  set,
  get,
});
