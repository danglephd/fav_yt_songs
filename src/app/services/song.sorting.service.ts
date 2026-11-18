import { Injectable } from '@angular/core';
import { Song } from '../shared/models/song.model';

export type SortDirection = 'asc' | 'desc';

export interface SortCriteria {
  field: string;
  direction: SortDirection;
  priority: number;
  comparator?: (left: Song, right: Song) => number;
}

@Injectable({ providedIn: 'root' })
export class SongSortingService {
  private sortCriteria: SortCriteria[] = [
    { field: 'createdAt', direction: 'desc', priority: 1 },
    { field: 'playCount', direction: 'asc', priority: 0 }
  ];
  private songs: Song[] = [];

  sortSongs(songs: Song[], criteria: SortCriteria[] = this.sortCriteria): Song[] {
    this.songs = songs;
    this.sortCriteria = [...criteria];

    const orderedCriteria = this.sortCriteria
      .map((criterion, index) => ({ criterion, index }))
      .sort((left, right) => right.criterion.priority - left.criterion.priority || left.index - right.index)
      .map(item => item.criterion);

    return songs
      .map((song, index) => ({ song, index }))
      .sort((left, right) => {
        for (const criterion of orderedCriteria) {
          const result = this.compareSongs(left.song, right.song, criterion);
          if (result !== 0) return result;
        }
        return left.index - right.index;
      })
      .map(item => item.song);
  }

  addSortCriteria(criteria: SortCriteria): void {
    this.sortCriteria.push(criteria);
  }

  removeSortCriteria(criteria: SortCriteria): void {
    const index = this.sortCriteria.findIndex(current =>
      current.field === criteria.field &&
      current.direction === criteria.direction &&
      current.priority === criteria.priority &&
      current.comparator === criteria.comparator
    );
    if (index >= 0) this.sortCriteria.splice(index, 1);
  }

  clearSortCriteria(): void {
    this.sortCriteria = [];
  }

  updatePlayCount(songId: string, newPlayCount: number): void {
    if (!Number.isFinite(newPlayCount) || newPlayCount < 0) return;

    const song = this.songs.find(item => item.id === songId);
    if (song) song.playCount = newPlayCount;
  }

  private compareSongs(left: Song, right: Song, criteria: SortCriteria): number {
    if (criteria.comparator) {
      const comparison = criteria.comparator(left, right);
      return criteria.direction === 'desc' ? -comparison : comparison;
    }

    const leftValue = (left as unknown as Record<string, unknown>)[criteria.field];
    const rightValue = (right as unknown as Record<string, unknown>)[criteria.field];

    if (leftValue == null || rightValue == null) {
      if (leftValue == null && rightValue == null) return 0;
      return leftValue == null ? -1 : 1;
    }

    const comparison = this.compareValues(leftValue, rightValue);
    return criteria.direction === 'desc' ? -comparison : comparison;
  }

  private compareValues(left: unknown, right: unknown): number {
    if (typeof left === 'number' && typeof right === 'number') {
      if (Number.isNaN(left) || Number.isNaN(right)) return 0;
      return left - right;
    }
    if (typeof left === 'string' && typeof right === 'string') {
      return left.localeCompare(right);
    }
    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return Number(left) - Number(right);
    }
    return 0;
  }
}
