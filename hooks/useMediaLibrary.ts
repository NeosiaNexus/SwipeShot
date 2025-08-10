import { SortByValue } from 'expo-media-library';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { deleteAssets, listAssets } from '../services/media.service';
import { GalleryItem, MediaTypeStr } from '../types/media';
import { useMediaPermission } from './useMediaPermission';

type EventType = 'loaded' | 'loadMore' | 'purge' | 'error';

interface UseMediaLibraryOptions {
  pageSize?: number;
  albumId?: string;
  mediaTypes?: MediaTypeStr[];
  sortBy?: SortByValue;
  debug?: boolean;
  onEvent?: (e: { type: EventType; payload?: unknown }) => void;
}

export function useMediaLibrary(options: UseMediaLibraryOptions = {}) {
  const {
    pageSize = 200,
    albumId,
    mediaTypes = ['photo'],
    sortBy,
    debug = false,
    onEvent,
  } = options;

  const didInitialLoad = useRef(false);

  const permission = useMediaPermission();

  const [assets, setAssets] = useState<GalleryItem[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [purging, setPurging] = useState(false);

  const mounted = useRef(true);
  const seenIds = useRef<Set<string>>(new Set());
  const loadTimer = useRef<NodeJS.Timeout | null>(null);

  const trashSet = useRef<Set<string>>(new Set());
  const trashOrder = useRef<string[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [refreshSeq, setRefreshSeq] = useState(0);

  const resetError = useCallback(() => setError(null), []);

  const debugEvent = useCallback(
    (type: EventType, payload?: unknown) => {
      if (debug) {
        // eslint-disable-next-line no-console
        console.log('[media]', type, payload);
      }
      onEvent?.({ type, payload });
    },
    [debug, onEvent],
  );

  const refresh = useCallback(async () => {
    try {
      setLoadingInitial(v => (didInitialLoad.current ? v : true));
      setError(null);
      const page = await listAssets({ first: pageSize, albumId, mediaTypes, sortBy });
      seenIds.current = new Set(page.assets.map(a => a.id));
      setAssets(page.assets);
      setRefreshSeq(prev => prev + 1);
      setEndCursor(page.endCursor);
      setHasNextPage(page.hasNextPage);
      debugEvent('loaded', { count: page.assets.length });
    } catch (e) {
      setError(e);
      debugEvent('error', e);
    } finally {
      if (mounted.current) setLoadingInitial(false);
    }
  }, [albumId, mediaTypes, pageSize, sortBy, debugEvent]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage || !endCursor) return;
    setLoadingMore(true);
    try {
      const page = await listAssets({
        first: pageSize,
        after: endCursor,
        albumId,
        mediaTypes,
        sortBy,
      });
      const filtered = page.assets.filter(a => !seenIds.current.has(a.id));
      filtered.forEach(a => seenIds.current.add(a.id));
      setAssets(prev => [...prev, ...filtered]);
      setEndCursor(page.endCursor);
      setHasNextPage(page.hasNextPage);
      debugEvent('loadMore', { added: filtered.length });
    } catch (e) {
      setError(e);
      debugEvent('error', e);
    } finally {
      if (mounted.current) setLoadingMore(false);
    }
  }, [albumId, mediaTypes, pageSize, sortBy, endCursor, hasNextPage, loadingMore, debugEvent]);

  const throttledLoadMore = useCallback(() => {
    if (loadTimer.current) return;
    loadTimer.current = setTimeout(() => {
      loadTimer.current && clearTimeout(loadTimer.current);
      loadTimer.current = null;
      loadMore();
    }, 300);
  }, [loadMore]);

  const queueHas = useCallback((id: string) => trashSet.current.has(id), []);

  const enqueue = useCallback((id: string) => {
    if (trashSet.current.has(id)) return;
    trashSet.current.add(id);
    trashOrder.current.push(id);
    setQueueCount(trashSet.current.size);
  }, []);

  const enqueueMany = useCallback((ids: string[]) => {
    let added = false;
    for (const id of ids) {
      if (!trashSet.current.has(id)) {
        trashSet.current.add(id);
        trashOrder.current.push(id);
        added = true;
      }
    }
    if (added) setQueueCount(trashSet.current.size);
  }, []);

  const dequeueLast = useCallback(() => {
    const last = trashOrder.current.pop();
    if (!last) return undefined;
    trashSet.current.delete(last);
    setQueueCount(trashSet.current.size);
    return last;
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    if (!trashSet.current.has(id)) return;
    trashSet.current.delete(id);
    const idx = trashOrder.current.lastIndexOf(id);
    if (idx >= 0) trashOrder.current.splice(idx, 1);
    setQueueCount(trashSet.current.size);
  }, []);

  const clearQueue = useCallback(() => {
    trashSet.current.clear();
    trashOrder.current = [];
    setQueueCount(0);
  }, []);

  const purge = useCallback(async () => {
    const snapshot = Array.from(trashSet.current);
    if (!snapshot.length) return { successIds: [] as string[], failedIds: [] as string[] };
    setPurging(true);
    const prev = assets;
    try {
      const remaining = new Set(snapshot);
      const nextAssets = assets.filter(a => !remaining.has(a.id));
      setAssets(nextAssets);
      await deleteAssets(snapshot);
      clearQueue();
      debugEvent('purge', { count: snapshot.length });
      return { successIds: snapshot, failedIds: [] };
    } catch (e) {
      setAssets(prev);
      setError(e);
      debugEvent('error', e);
      return { successIds: [] as string[], failedIds: snapshot };
    } finally {
      if (mounted.current) setPurging(false);
    }
  }, [assets, clearQueue, debugEvent]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (loadTimer.current) clearTimeout(loadTimer.current);
    };
  }, []);

  useEffect(() => {
    const granted = permission.status === 'granted' || permission.isLimited;
    if (!granted) {
      setLoadingInitial(false);
      return;
    }
    if (!didInitialLoad.current) {
      didInitialLoad.current = true;
      refresh();
    }
  }, [permission.status, permission.isLimited, refresh]);

  const queue = useMemo(
    () => ({
      ids: Array.from(trashSet.current),
      count: queueCount,
      has: queueHas,
      enqueue,
      enqueueMany,
      dequeueLast,
      remove: removeFromQueue,
      clear: clearQueue,
    }),
    [queueCount, queueHas, enqueue, enqueueMany, dequeueLast, removeFromQueue, clearQueue],
  );

  return {
    assets,
    page: { endCursor, hasNextPage },
    status: loadingInitial
      ? 'loadingInitial'
      : loadingMore
        ? 'loadingMore'
        : purging
          ? 'purging'
          : 'ready',
    error,
    resetError,
    refresh,
    loadMore: throttledLoadMore,
    queue,
    purge,
    permission,
    refreshSeq,
  };
}
