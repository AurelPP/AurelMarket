"use client";

import { useCallback, useRef, useState } from "react";

type Type = "species" | "ability" | "nature" | "move";
const cache = new Map<string, string | null>();

export function useTranslation() {
  const [, setTick] = useState(0);
  const loading = useRef(new Set<string>());

  const translate = useCallback(async (type: Type, name: string | null | undefined): Promise<string | null> => {
    if (!name?.trim()) return null;
    const key = `${type}:${(name as string).toLowerCase().trim()}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    if (loading.current.has(key)) return null;
    loading.current.add(key);
    try {
      const res = await fetch(
        `/api/translate?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`
      );
      const data = (await res.json()) as { fr?: string | null };
      const fr = data.fr ?? null;
      cache.set(key, fr);
      return fr;
    } catch {
      cache.set(key, null);
      return null;
    } finally {
      loading.current.delete(key);
    }
  }, []);

  const get = useCallback((type: Type, name: string | null | undefined): string | null => {
    if (!name?.trim()) return null;
    const key = `${type}:${(name as string).toLowerCase().trim()}`;
    return cache.get(key) ?? null;
  }, []);

  const load = useCallback(
    async (type: Type, name: string | null | undefined) => {
      const result = await translate(type, name);
      setTick((n) => n + 1);
      return result;
    },
    [translate]
  );

  return { translate, get, load };
}

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

export function displayName(fr: string | null, en: string | null | undefined): string {
  if (fr) return cap(fr);
  if (en) return cap(en);
  return "";
}
