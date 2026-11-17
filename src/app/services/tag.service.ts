import { Injectable } from '@angular/core';
import { Song } from '../shared/models/song.model';
import { YoutubeTagService } from './youtube-tag.service';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  constructor(private youtubeTagService: YoutubeTagService) {}

  normalizeTag(tag: string): string {
    return this.youtubeTagService.normalizeTag(tag || '');
  }

  getSongTags(song: Song): string[] {
    const approvedKeys = Object.keys(song.approvedTags || {})
      .filter(tag => song.approvedTags?.[tag]);
    const generatedKeys = Object.keys(song.generatedTags || {})
      .filter(tag => song.generatedTags?.[tag]);

    const sourceTags = Array.from(new Set([
      ...(song.tags || []),
      ...approvedKeys,
      ...generatedKeys
    ]));

    const unique = new Map<string, string>();

    sourceTags.forEach(tag => {
      const normalized = this.normalizeTag(tag);
      if (normalized && normalized !== 'unavailable') {
        unique.set(normalized, tag.trim());
      }
    });

    return Array.from(unique.keys());
  }

  async ensureSongTags(song: Song): Promise<Partial<Song> | null> {
    const hasCompleteTagData =
      Array.isArray(song.tags) && song.tags.length > 0 &&
      !!song.approvedTags && Object.keys(song.approvedTags).length > 0 &&
      !!song.generatedTags && Object.keys(song.generatedTags).length > 0 &&
      typeof song.searchableText === 'string' && song.searchableText.trim().length > 0;

    if (hasCompleteTagData) {
      // ghi log 
      console.log(`Using cached tags for song: ${song.title} - https://www.youtube.com/watch?v=${song.videoId}`);

      return null;
    }

    try {
      const tagResult = await this.youtubeTagService.generateVideoTags({
        title: song.title,
        channel: song.channel,
        description: song.description,
        durationSeconds: song.durationSeconds
      });

      const generatedTags = { ...tagResult.generatedTags, ...(song.generatedTags || {}) };
      const approvedTags = { ...tagResult.approvedTags, ...(song.approvedTags || {}) };
      const tags = Array.from(new Set([
        ...(song.tags || []),
        ...Object.keys(approvedTags).filter(tag => approvedTags[tag])
      ]));
      const searchableText = Array.from(new Set([
        ...Object.keys(generatedTags),
        ...(song.tags || []).map(tag => this.normalizeTag(tag)).filter(Boolean)
      ])).join(' ');

      return {
        tags,
        approvedTags,
        generatedTags,
        searchableText
      };
    } catch {
      return null;
    }
  }
}
