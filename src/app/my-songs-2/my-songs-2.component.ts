import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Song } from '../shared/models/song.model';
import { YouTubeVideoInfo, TagSource } from '../models/youtube.model';
import { SongRealtimedbService } from '../services/song.realtimedb.service';
import { YoutubeTagService } from '../services/youtube-tag.service';
import { AddYouTubeSongDialogComponent } from '../add-youtube-song-dialog/add-youtube-song-dialog.component';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { VideoPlayerDialogComponent } from '../video-player-dialog/video-player-dialog.component';
import { PlaylistProgressStore } from '../models/playlist-progress.model';

type SearchWordState = 'include' | 'require' | 'exclude';
type SearchWordFilter = { word: string; state: SearchWordState };
type TagSortMode = 'countAsc' | 'countDesc' | 'alphabetAsc' | 'alphabetDesc';

@Component({
  selector: 'app-my-songs-2',
  templateUrl: './my-songs-2.component.html',
  styleUrls: [
    './my-songs-2.component.css',
    './my-songs-2-light.css',
    './my-songs-2-dark.css'
  ]
})
export class MySongs2Component implements OnInit, AfterViewInit, OnDestroy {
  songs: Song[] = [];
  filteredSongs: Song[] = [];
  pageSongs: Song[] = [];
  tagCounts: Array<{ name: string; count: number }> = [];
  filteredTagList: Array<{ name: string; count: number }> = [];
  searchWords: SearchWordFilter[] = [];
  searchQuery = '';
  tagSearchQuery = '';
  tagSortMode: TagSortMode = 'alphabetAsc';
  isLoading = true;
  mobilePanelOpen = false;
  isMobile = window.innerWidth < 600;
  pageIndex = 0;
  pageSize = 20;
  readonly pageSizeOptions = [10, 20, 50];

  @ViewChild('tableRegion') private tableRegion?: ElementRef<HTMLElement>;

  private readonly visibleTagCounts = new Map<string, number>();
  private resizeObserver?: ResizeObserver;
  private observedTagContainers = new Set<Element>();
  private layoutFrame: number | null = null;
  private touchStartX = 0;
  private touchStartY = 0;

  constructor(
    private songService: SongRealtimedbService,
    private youtubeTagService: YoutubeTagService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadSongs();
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.scheduleTagLayout());
    this.scheduleTagLayout();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.observedTagContainers.clear();
    if (this.layoutFrame !== null) cancelAnimationFrame(this.layoutFrame);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth < 600;
    if (!this.isMobile) {
      this.mobilePanelOpen = false;
    }
    this.scheduleTagLayout();
  }

  @HostListener('document:keydown.escape')
  closePanelOnEscape(): void {
    this.mobilePanelOpen = false;
  }

  loadSongs(): void {
    const cachedSongs = localStorage.getItem('cachedSongs');
    if (cachedSongs && cachedSongs !== '[]') {
      this.songService.getActiveSongsFromCache().subscribe(songs => {
        this.setSongs(songs || []);
      }, () => {
        this.isLoading = false;
        this.showMessage('Error loading song list', 'error');
      });
      return;
    }

    if (!confirm('No cached songs found, do you want to load songs from the database?')) {
      this.isLoading = false;
      return;
    }

    this.songService.getActiveSongs().subscribe(songs => {
      this.setSongs(songs || []);
      localStorage.setItem('cachedSongs', JSON.stringify(this.songs));
    }, () => {
      this.isLoading = false;
      this.showMessage('Error loading song list', 'error');
    });
  }

  private setSongs(songs: Song[]): void {
    this.songs = songs.filter(song => !song.deleted);
    this.buildTagCounts();
    this.applyFilters();
    this.isLoading = false;
  }

  getSongTags(song: Song): string[] {
    const approved = Object.keys(song.approvedTags || {})
      .filter(tag => song.approvedTags?.[tag]);
    const source = approved.length ? approved : (song.tags || []);
    const unique = new Map<string, string>();

    source.forEach(tag => {
      const normalized = this.normalizeTag(tag);
      if (normalized && normalized !== 'unavailable') {
        unique.set(normalized, tag.trim());
      }
    });

    return Array.from(unique.keys());
  }

  private normalizeTag(tag: string): string {
    return this.youtubeTagService.normalizeTag(tag || '');
  }

  private buildTagCounts(): void {
    const counts = new Map<string, number>();
    this.songs.forEach(song => {
      this.getSongTags(song).forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1));
    });

    this.tagCounts = Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
    this.filterTagList();
  }

  filterTagList(): void {
    const query = this.normalizeTag(this.tagSearchQuery);
    const sorters: Record<TagSortMode, (left: { name: string; count: number }, right: { name: string; count: number }) => number> = {
      countAsc: (left, right) => left.count - right.count || left.name.localeCompare(right.name),
      countDesc: (left, right) => right.count - left.count || left.name.localeCompare(right.name),
      alphabetAsc: (left, right) => left.name.localeCompare(right.name),
      alphabetDesc: (left, right) => right.name.localeCompare(left.name)
    };
    this.filteredTagList = this.tagCounts
      .filter(tag => !query || tag.name.includes(query))
      .sort(sorters[this.tagSortMode]);
  }

  setTagSortMode(mode: TagSortMode): void {
    this.tagSortMode = mode;
    this.filterTagList();
  }

  addTagFilter(tag: string): void {
    const tagWord = this.normalizeTag(tag);
    const queryWords = this.parseSearchQuery(this.searchQuery);
    const isSelected = queryWords.some(item => item.word === tagWord);
    const tagParts = new Set(tagWord.split(/\s+/));
    const nextWords = isSelected
      ? queryWords.filter(item => item.word !== tagWord && !tagParts.has(item.word))
      : [...queryWords, { text: tag, word: tagWord, quoted: /\s/.test(tag) }];

    this.searchQuery = nextWords
      .map(item => item.quoted || /\s/.test(item.text) ? `"${item.text}"` : item.text)
      .join(' ');
    this.applyFilters();
  }

  isTagSelected(tag: string): boolean {
    const normalizedTag = this.normalizeTag(tag);
    return this.searchWords.some(item => item.word === normalizedTag);
  }

  clearTagFilters(): void {
    this.clearSearch();
  }

  applyFilters(): void {
    this.syncSearchWords();
    const includes = this.searchWords.filter(item => item.state === 'include').map(item => item.word);
    const requires = this.searchWords.filter(item => item.state === 'require').map(item => item.word);
    const excludes = this.searchWords.filter(item => item.state === 'exclude').map(item => item.word);

    this.filteredSongs = this.songs.filter(song => {
      const tags = this.getSongTags(song);
      if (excludes.some(word => tags.some(tag => tag.includes(word)))) return false;
      if (requires.length) return requires.every(word => tags.some(tag => tag.includes(word)));
      if (includes.length && !includes.some(word => tags.some(tag => tag.includes(word)))) return false;
      return true;
    });

    this.resetToFirstPage();
  }

  private syncSearchWords(): void {
    const previousStates = new Map(this.searchWords.map(item => [item.word, item.state]));
    this.searchWords = this.parseSearchQuery(this.searchQuery)
      .map(({ word }) => ({ word, state: previousStates.get(word) || 'include' }));
  }

  private parseSearchQuery(query: string): Array<{ text: string; word: string; quoted: boolean }> {
    const parsed: Array<{ text: string; word: string; quoted: boolean }> = [];
    const tokens = /"([^"]+)"|(\S+)/g;
    let match: RegExpExecArray | null;

    while ((match = tokens.exec(query))) {
      const text = match[1] || match[2];
      const word = this.normalizeTag(text);
      if (word && !parsed.some(item => item.word === word)) {
        parsed.push({ text, word, quoted: !!match[1] });
      }
    }

    return parsed;
  }

  toggleSearchWord(word: string): void {
    const filter = this.searchWords.find(item => item.word === word);
    if (!filter) return;
    filter.state = filter.state === 'include' ? 'require' : filter.state === 'require' ? 'exclude' : 'include';
    this.applyFilters();
  }

  removeSearchWord(word: string): void {
    const remainingWords = this.parseSearchQuery(this.searchQuery)
      .filter(item => item.word !== word);
    this.searchQuery = remainingWords
      .map(item => item.quoted || /\s/.test(item.text) ? `"${item.text}"` : item.text)
      .join(' ');
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchWords = [];
    this.applyFilters();
  }

  getSearchWordTooltip(state: SearchWordState): string {
    return state === 'include' ? 'Include this word in tag search'
      : state === 'require' ? 'Require this word in tag search'
        : 'Exclude this word from tag search';
  }

  getTagColorClass(tag: string): string {
    let hash = 0;
    for (let index = 0; index < tag.length; index++) hash = (hash * 31 + tag.charCodeAt(index)) | 0;
    return `tag-tone-${Math.abs(hash) % 12}`;
  }

  getDisplayTags(song: Song): string[] {
    const requiredWords = this.searchWords.filter(item => item.state === 'require').map(item => item.word);
    const queryWords = this.searchWords.map(item => item.word);
    return this.getSongTags(song).sort((left, right) => {
      const requiredRank = (tag: string) => requiredWords.some(word => tag.includes(word)) ? 0 : 1;
      const matchRank = (tag: string) => queryWords.some(word => tag.includes(word)) ? 0 : 1;
      return requiredRank(left) - requiredRank(right)
        || matchRank(left) - matchRank(right)
        || left.localeCompare(right);
    });
  }

  getVisibleTags(song: Song): string[] {
    return this.getDisplayTags(song).slice(0, this.visibleTagCounts.get(song.id) || 0);
  }

  getHiddenTagsCount(song: Song): number {
    return Math.max(0, this.getDisplayTags(song).length - this.getVisibleTags(song).length);
  }

  private scheduleTagLayout(): void {
    if (this.layoutFrame !== null) return;
    this.layoutFrame = requestAnimationFrame(() => {
      this.layoutFrame = null;
      this.updateObservedTagContainers();
      this.updateVisibleTagCounts();
    });
  }

  private updateObservedTagContainers(): void {
    const region = this.tableRegion?.nativeElement;
    if (!region || !this.resizeObserver) return;

    const containers = new Set(Array.from(region.querySelectorAll('.tags-cell, .mobile-tags')));
    this.observedTagContainers.forEach(container => {
      if (!containers.has(container)) {
        this.resizeObserver?.unobserve(container);
        this.observedTagContainers.delete(container);
      }
    });
    containers.forEach(container => {
      if (!this.observedTagContainers.has(container)) {
        this.resizeObserver?.observe(container);
        this.observedTagContainers.add(container);
      }
    });
  }

  private updateVisibleTagCounts(): void {
    const region = this.tableRegion?.nativeElement;
    if (!region) return;

    const nextCounts = new Map<string, number>();
    region.querySelectorAll<HTMLElement>('.tags-cell, .mobile-tags').forEach(container => {
      if (container.clientWidth <= 0) return;

      const songId = container.dataset['songId'];
      const measure = container.querySelector<HTMLElement>('.tag-measurements');
      if (!songId || !measure) return;

      const tags = Array.from(measure.querySelectorAll<HTMLElement>('.song-tag'));
      const tagWidths = tags.map(tag => tag.getBoundingClientRect().width);
      const prefixWidths = [0];
      tagWidths.forEach(width => prefixWidths.push(prefixWidths[prefixWidths.length - 1] + width));
      const moreTag = measure.querySelector<HTMLElement>('.more-tags');
      const containerStyle = getComputedStyle(container);
      const gap = parseFloat(containerStyle.columnGap || containerStyle.gap) || 0;
      const availableWidth = container.clientWidth;
      let selectedCount = 0;

      for (let count = tagWidths.length; count >= 0; count--) {
        const hiddenCount = tagWidths.length - count;
        let requiredWidth = prefixWidths[count] + Math.max(0, count - 1) * gap;
        if (hiddenCount > 0 && moreTag) {
          moreTag.textContent = `+${hiddenCount}`;
          requiredWidth += moreTag.getBoundingClientRect().width + (count > 0 ? gap : 0);
        }
        if (requiredWidth <= availableWidth) {
          selectedCount = count;
          break;
        }
      }
      nextCounts.set(songId, selectedCount);
    });

    this.zone.run(() => {
      nextCounts.forEach((count, songId) => {
        if (this.visibleTagCounts.get(songId) !== count) {
          this.visibleTagCounts.set(songId, count);
        }
      });
    });
  }

  resetToFirstPage(): void {
    this.pageIndex = 0;
    this.updatePageSongs();
  }

  updatePageSongs(): void {
    const start = this.pageIndex * this.pageSize;
    this.pageSongs = this.filteredSongs.slice(start, start + this.pageSize);
    this.scheduleTagLayout();
  }

  changePageSize(value: string): void {
    this.pageSize = Number(value);
    this.resetToFirstPage();
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filteredSongs.length / this.pageSize));
  }

  get pageEnd(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.filteredSongs.length);
  }

  get pageNumbers(): number[] {
    const start = Math.max(0, Math.min(this.pageIndex - 1, this.pageCount - 3));
    return Array.from({ length: Math.min(3, this.pageCount) }, (_, index) => start + index);
  }

  goToPage(index: number): void {
    this.pageIndex = ((index % this.pageCount) + this.pageCount) % this.pageCount;
    this.updatePageSongs();
  }

  onRowClick(song: Song): void {
    if (this.isUnavailable(song)) {
      if (song.youtubeLink) window.open(song.youtubeLink, '_blank', 'noopener');
      return;
    }

    const progress = this.readProgress().videos?.[song.videoId]?.positionSeconds;
    const resumePosition = this.isPlaylistSong(song) && Number.isFinite(progress) ? progress : undefined;
    const currentIndex = this.filteredSongs.findIndex(item => item.id === song.id);
    this.dialog.open(VideoPlayerDialogComponent, {
      data: {
        song,
        songList: this.filteredSongs,
        currentIndex: Math.max(0, currentIndex),
        autoPlayNext: true,
        resumePositionSeconds: resumePosition
      },
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      panelClass: 'video-player-dialog-panel',
      disableClose: true,
      backdropClass: 'video-player-backdrop'
    });
  }

  private readProgress(): PlaylistProgressStore {
    try {
      return JSON.parse(localStorage.getItem('playlistPlaybackProgress') || '{"videos":{}}');
    } catch {
      return { videos: {} };
    }
  }

  private isPlaylistSong(song: Song): boolean {
    return (song.tags || []).some(tag => tag.trim().toLowerCase() === 'playlist')
      || !!song.approvedTags?.['playlist']
      || !!song.generatedTags?.['playlist'];
  }

  isUnavailable(song: Song): boolean {
    return song.tags?.includes('unavailable') ?? false;
  }

  deleteSong(song: Song, event: Event): void {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      const cached = JSON.parse(localStorage.getItem('cachedSongs') || '[]') as Song[];
      const updated = cached.map(item => item.id === song.id ? { ...item, deleted: true } : item);
      localStorage.setItem('cachedSongs', JSON.stringify(updated));
      this.songs = this.songs.filter(item => item.id !== song.id);
      this.buildTagCounts();
      this.applyFilters();
      this.showMessage('Song deleted', 'success');
    } catch {
      this.showMessage('Error deleting song', 'error');
    }
  }

  openAddSongDialog(): void {
    const dialogRef = this.dialog.open(AddYouTubeSongDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'add-song-dialog-no-padding'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (!result) return;
      const entries = Array.isArray(result) ? result : [result];
      let added = 0;
      let duplicates = 0;

      for (const entry of entries) {
        if (await this.addSongToCache(entry.videoInfo, entry.youtubeUrl)) added++;
        else duplicates++;
      }

      if (added) this.loadSongsFromCache();
      if (added && duplicates) this.showMessage(`Added ${added} songs. ${duplicates} already exist.`, 'info');
      else if (added) this.showMessage(`Successfully added ${added} songs`, 'success');
      else if (duplicates) this.showMessage(`All ${duplicates} songs already exist in the list`, 'info');
    });
  }

  private async addSongToCache(videoInfo: YouTubeVideoInfo, youtubeUrl: string): Promise<boolean> {
    if (this.songs.some(song => song.videoId === videoInfo.videoId)) return false;
    const tagResult = await this.youtubeTagService.generateVideoTags(videoInfo as TagSource);
    const thumbnails = videoInfo.thumbnails || {} as YouTubeVideoInfo['thumbnails'];
    const song: Song = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
      videoId: videoInfo.videoId,
      title: videoInfo.title,
      description: videoInfo.description,
      youtubeLink: youtubeUrl,
      channel: videoInfo.channel,
      largestThumbnail: thumbnails.maxres?.url || thumbnails.standard?.url || thumbnails.high?.url
        || thumbnails.medium?.url || thumbnails.default?.url || '',
      durationSeconds: videoInfo.durationSeconds,
      viewCount: videoInfo.viewCount,
      localized: {
        title: videoInfo.localized?.title || videoInfo.title,
        description: videoInfo.localized?.description || videoInfo.description
      },
      tags: Object.keys(tagResult.approvedTags),
      approvedTags: tagResult.approvedTags,
      generatedTags: tagResult.generatedTags,
      searchableText: tagResult.searchableText
    };

    const cached = JSON.parse(localStorage.getItem('cachedSongs') || '[]') as Song[];
    localStorage.setItem('cachedSongs', JSON.stringify([...cached, song]));
    return true;
  }

  private loadSongsFromCache(): void {
    this.songService.getActiveSongsFromCache().subscribe(songs => this.setSongs(songs || []));
  }

  openSettings(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, { width: '500px', maxWidth: '90vw' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.showMessage('Settings saved successfully', 'success');
    });
  }

  onTouchStart(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.isMobile) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.3) return;

    if (!this.mobilePanelOpen && this.touchStartX <= 24 && deltaX > 0) {
      this.mobilePanelOpen = true;
    } else if (this.mobilePanelOpen && deltaX < 0) {
      this.mobilePanelOpen = false;
    }
  }

  formatAdded(createdAt?: number): string {
    if (!createdAt) return '—';
    return new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  trackBySongId(_index: number, song: Song): string {
    return song.id;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: [type] });
  }
}