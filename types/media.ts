import * as MediaLibrary from 'expo-media-library';

export type MediaTypeStr = 'photo' | 'video';

export interface GalleryItem {
  readonly id: string;
  readonly uri: string;
  readonly filename?: string;
  readonly creationTime?: number;
  readonly mediaType?: MediaLibrary.MediaTypeValue;
  readonly fileSize?: number | null;
}

export interface MediaPage {
  assets: GalleryItem[];
  endCursor: string | null;
  hasNextPage: boolean;
}

export type MediaSortBy = typeof MediaLibrary.SortBy;
