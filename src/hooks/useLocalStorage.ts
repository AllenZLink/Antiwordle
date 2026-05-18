import { useEffect, useState } from "react";

function migrateLegacyStorage() {
  const oldKey = "antiwordle";

  try {
    const value = window.localStorage.getItem(oldKey);
    if (!value) return;

    const parsed = JSON.parse(value) as Record<string, unknown>;
    Object.keys(parsed).forEach((key) => {
      window.localStorage.setItem(key, JSON.stringify(parsed[key]));
    });
    window.localStorage.removeItem(oldKey);
  } catch (error) {
    console.log(error);
  }
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    if (value) return JSON.parse(value) as T;
  } catch (error) {
    console.log(error);
  }

  return fallback;
}

export function useLocalStorage<T>(fallback: T, key: string) {
  const [value, setValue] = useState<T>(() => {
    migrateLegacyStorage();
    return readStorage(key, fallback);
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
