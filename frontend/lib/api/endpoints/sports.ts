import { apiGet } from '../client';
import { toUiSport, type UiSport } from '../adapters/venue';
import type { SportDto } from '../types';

export const sportsApi = {
  /** GET /sports — danh sách môn (có count nếu backend aggregate). */
  list: async (): Promise<UiSport[]> => {
    const dto = await apiGet<SportDto[]>('/sports');
    return dto.map(toUiSport);
  },
};
