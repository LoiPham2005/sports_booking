import { apiDelete, apiGet, apiPatch, apiPost } from '../client';
import { toUiUser, type UiUser } from '../adapters/user';
import { toUiVenue, type UiVenue } from '../adapters/venue';
import type { UserDto, VenueDto, Gender } from '../types';

export interface UpdateMeInput {
  fullName?: string;
  avatarUrl?: string;
  dob?: string; // ISO date
  gender?: Gender;
  locale?: string;
}

interface FavoriteDto {
  venueId: string;
  venue: VenueDto;
  createdAt: string;
}

export const usersApi = {
  /** Profile của user hiện tại. */
  me: async (): Promise<UiUser> => {
    const dto = await apiGet<UserDto>('/me');
    return toUiUser(dto);
  },

  /** Trả về list permission keys của role hiện tại. */
  myPermissions: () => apiGet<{ role: string; keys: string[] }>('/me/permissions'),

  /** Cập nhật profile (fullName/avatar/dob/gender/locale). */
  updateMe: (body: UpdateMeInput) => apiPatch<UserDto>('/me', body),

  /** List venue yêu thích. */
  favorites: async (): Promise<UiVenue[]> => {
    const list = await apiGet<FavoriteDto[]>('/me/favorites');
    return list.map((f) => toUiVenue(f.venue));
  },

  addFavorite: (venueId: string) =>
    apiPost<{ userId: string; venueId: string }>(`/me/favorites/${encodeURIComponent(venueId)}`),

  removeFavorite: (venueId: string) =>
    apiDelete<{ ok: boolean }>(`/me/favorites/${encodeURIComponent(venueId)}`),
};
