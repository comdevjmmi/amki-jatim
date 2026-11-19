"use client";

import { useEffect, useState } from "react";

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;

/**
 * Debounced "type a few letters, get suggestions" lookup shared by the
 * name-search inputs (presensi, candidate form). `fetcher` runs only once the
 * query has at least 2 characters and the user paused typing; stale
 * responses are dropped. All state is set from the timer callback, never
 * synchronously in the effect body.
 */
export function useSuggestions<T>(
  query: string,
  fetcher: (term: string) => Promise<{ data: T[] | null; error: unknown }>,
) {
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_CHARS) return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      if (cancelled) return;
      setIsSearching(true);
      const { data, error } = await fetcher(term);
      if (cancelled) return;
      if (error) console.error("suggestion search failed:", error);
      setFailed(Boolean(error));
      setResults(error || !data ? [] : data);
      setIsSearching(false);
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // fetcher is intentionally excluded: callers pass an inline closure that
    // changes every render, which would restart the debounce on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return { results, isSearching, failed, ready: query.trim().length >= MIN_CHARS };
}
