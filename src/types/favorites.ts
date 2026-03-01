import type { PublicMaster } from './masters';

export type FavoriteDto = {
  id: string;
  masterId: string;
  createdAt: string;
  master: PublicMaster;
};

export type FavoritesCheckResponse = { isFavorite: boolean };
export type FavoritesCountResponse = { count: number };
export type FavoritesRemoveResponse = { success: true };

