import * as MediaLibrary from 'expo-media-library';
import { GalleryItem, MediaPage, MediaSortBy, MediaTypeStr } from '../types/media';

function toExpoMediaTypes(types: MediaTypeStr[] | undefined): MediaLibrary.MediaTypeValue[] {
  if (!types || types.length === 0) return [MediaLibrary.MediaType.photo];
  const set = new Set(types);
  const arr: MediaLibrary.MediaTypeValue[] = [];
  if (set.has('photo')) arr.push(MediaLibrary.MediaType.photo);
  if (set.has('video')) arr.push(MediaLibrary.MediaType.video);
  return arr.length ? arr : [MediaLibrary.MediaType.photo];
}

export function mapAsset(a: MediaLibrary.Asset): GalleryItem {
  return {
    id: a.id,
    uri: a.uri,
    filename: a.filename ?? undefined,
    creationTime: a.creationTime,
    mediaType: a.mediaType,
  };
}

export async function listAssets(params: {
  first: number;
  after?: string | null;
  albumId?: string;
  mediaTypes?: MediaTypeStr[];
  sortBy?: MediaLibrary.SortByValue;
}): Promise<MediaPage> {
  const page = await MediaLibrary.getAssetsAsync({
    first: params.first,
    after: params.after ?? undefined,
    album: params.albumId ?? undefined,
    mediaType: toExpoMediaTypes(params.mediaTypes),
    sortBy: params.sortBy ?? MediaLibrary.SortBy.creationTime,
  });
  return {
    assets: page.assets.map(mapAsset),
    endCursor: page.endCursor ?? null,
    hasNextPage: page.hasNextPage,
  };
}

export async function deleteAssets(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await MediaLibrary.deleteAssetsAsync(ids);
}
