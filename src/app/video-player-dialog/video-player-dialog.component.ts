import { Component, Inject, OnDestroy, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Song } from '../shared/models/song.model';

export interface VideoPlayerDialogData {
  song: Song;
  songList: Song[];
  currentIndex: number;
  autoPlayNext?: boolean;
}

interface PlaylistProgressEntry {
  positionSeconds: number;
  updatedAt: number;
}

interface PlaylistProgressStore {
  activeVideoId?: string;
  videos: { [videoId: string]: PlaylistProgressEntry };
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

@Component({
  selector: 'app-video-player-dialog',
  templateUrl: './video-player-dialog.component.html',
  styleUrls: ['./video-player-dialog.component.css']
})
export class VideoPlayerDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('youtubePlayerContainer', { static: false }) playerContainer!: ElementRef;

  player: any = null;
  isLoadingVideo = true;
  autoPlayNext: boolean = true;
  isInitialized = false;
  shuffleEnabled = false;
  loopEnabled = false;
  currentSong: Song | null = null;
  playingList: Song[] = [];
  private readonly maxPlaylistSize: number = 30;
  private playTimeout: ReturnType<typeof setTimeout> | null = null;
  private navigationDirection: 'next' | 'previous' | null = null;
  private readonly progressStorageKey = 'playlistPlaybackProgress';
  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private activeVideoId: string | null = null;
  private lastKnownPositionSeconds = 0;
  private resumeTargetSong: Song | null = null;
  private preparedPlaylist: string[] = [];
  private preparedStartIndex = 0;
  showResumeOptions = false;
  savedProgressSeconds = 0;

  constructor(
    public dialogRef: MatDialogRef<VideoPlayerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VideoPlayerDialogData,
    private ngZone: NgZone
  ) {
    this.autoPlayNext = data.autoPlayNext !== false;
    //load local storage settings
    const shuffleSetting = localStorage.getItem('shuffleEnabled');
    const loopSetting = localStorage.getItem('loopEnabled');
    const maxPlaylistSizeSetting = localStorage.getItem('maxPlaylistSize');
    if (!maxPlaylistSizeSetting) {
      localStorage.setItem('maxPlaylistSize', '30');
    }

    this.shuffleEnabled = shuffleSetting ? JSON.parse(shuffleSetting) : false;
    this.loopEnabled = loopSetting ? JSON.parse(loopSetting) : false;
    this.maxPlaylistSize = maxPlaylistSizeSetting ? parseInt(maxPlaylistSizeSetting, 10) : 30;
    this.currentSong = data.song;
    this.findResumeTarget();
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initializePlayer();
  }

  /**
   * Load YouTube Iframe API script
   */
  private loadYouTubeAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.YT?.Player) {
        resolve();
        return;
      }
      // Another component/dialog may already be loading the API. 
      if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const previousCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          previousCallback?.();
          resolve();
        };
        return;
      }
      // First component that loads the API. 
      window.onYouTubeIframeAPIReady = () => { resolve(); };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      // script.defer = true;
      script.onerror = () => { reject(new Error('Failed to load YouTube IFrame API')); };
      document.body.appendChild(script);
    });
  }

  /**
   * Initialize YouTube player with API
   */
  private async initializePlayer(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!this.playerContainer) {
      //ghi log error or handle the case where playerContainer is not available
      console.error('Player container is not available.');
      return;
    }

    try {
      // IMPORTANT: 
      // Wait until YT.Player is actually available.
      await this.loadYouTubeAPI();

      if (!window.YT?.Player) {
        throw new Error('YouTube IFrame API loaded, but YT.Player is not available.');
      }

      if (this.isInitialized) {
        return;
      }

      this.ngZone.runOutsideAngular(() => {
        this.player = new window.YT.Player(this.playerContainer.nativeElement, {
          // Nếu mobile thì set hw nhỏ, desktop thì set full size
          height: window.innerWidth <= 768 ? '150' : '100%',
          width: window.innerWidth <= 768 ? '200' : '100%',

          events: {
            onReady: () => this.onPlayerReady(),
            onStateChange: (event: any) => this.onPlayerStateChange(event),
            onError: (event: any) => this.onPlayerError(event),
          },
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            fs: 1,
          }
        });
        this.isInitialized = true;
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      setTimeout(() => this.initializePlayer(), 500);
    }
  }

  private isPlaylistSong(song: Song | null | undefined): boolean {
    if (!song) {
      return false;
    }

    return (song.tags || []).some(tag => tag.trim().toLowerCase() === 'playlist')
      || !!song.approvedTags?.['playlist']
      || !!song.generatedTags?.['playlist'];
  }

  private readProgressStore(): PlaylistProgressStore {
    try {
      const saved = localStorage.getItem(this.progressStorageKey);
      const parsed = saved ? JSON.parse(saved) : null;
      if (!parsed || typeof parsed !== 'object' || !parsed.videos || typeof parsed.videos !== 'object') {
        return { videos: {} };
      }

      const videos: { [videoId: string]: PlaylistProgressEntry } = {};
      Object.entries(parsed.videos).forEach(([videoId, value]) => {
        const entry = value as PlaylistProgressEntry;
        if (videoId && Number.isFinite(entry?.positionSeconds) && entry.positionSeconds > 0
          && Number.isFinite(entry.updatedAt)) {
          videos[videoId] = { positionSeconds: entry.positionSeconds, updatedAt: entry.updatedAt };
        }
      });

      return {
        activeVideoId: typeof parsed.activeVideoId === 'string' ? parsed.activeVideoId : undefined,
        videos
      };
    } catch {
      return { videos: {} };
    }
  }

  private getValidProgress(song: Song | null | undefined, entry?: PlaylistProgressEntry): PlaylistProgressEntry | null {
    if (!this.isPlaylistSong(song) || !entry || !Number.isFinite(entry.positionSeconds) || entry.positionSeconds <= 0) {
      return null;
    }

    if (song?.durationSeconds && entry.positionSeconds >= song.durationSeconds - 1) {
      return null;
    }

    return entry;
  }

  private findResumeTarget(): void {
    const store = this.readProgressStore();
    const activeSong = store.activeVideoId
      ? this.data.songList.find(song => song.videoId === store.activeVideoId && this.isPlaylistSong(song))
      : undefined;
    const activeProgress = activeSong
      ? this.getValidProgress(activeSong, store.videos[activeSong.videoId])
      : null;
    const selectedProgress = this.getValidProgress(this.data.song, store.videos[this.data.song.videoId]);
    const targetSong = activeProgress ? activeSong : selectedProgress ? this.data.song : null;
    const targetProgress = activeProgress || selectedProgress;

    if (targetSong && targetProgress) {
      this.resumeTargetSong = targetSong;
      this.savedProgressSeconds = targetProgress.positionSeconds;
      this.showResumeOptions = true;
    }
  }

  private writeProgressStore(store: PlaylistProgressStore): void {
    try {
      localStorage.setItem(this.progressStorageKey, JSON.stringify(store));
    } catch (error) {
      console.warn('Unable to save playlist playback progress:', error);
    }
  }

  private removeProgress(videoId: string): void {
    const store = this.readProgressStore();
    if (!store.videos[videoId] && store.activeVideoId !== videoId) {
      return;
    }

    delete store.videos[videoId];
    if (store.activeVideoId === videoId) {
      store.activeVideoId = undefined;
    }
    this.writeProgressStore(store);
  }

  private initPlaylist(startIndex: number = this.data.currentIndex): { videoIds: string[], startIndex: number } {
    const videoIds = this.data.songList
      .filter(song => !!song.videoId)
      .map(song => song.videoId);
    const halfSize = Math.floor(this.maxPlaylistSize / 2);
    const start = Math.max(0, startIndex - halfSize);
    const end = Math.min(videoIds.length, this.maxPlaylistSize + start);
    const limitedVideoIds = videoIds.slice(start, end);
    this.playingList = this.data.songList.slice(start, end);
    let adjustedStartIndex = 0;

    const currentSongId = this.data.songList[startIndex].videoId;
    const currentIndex = limitedVideoIds.indexOf(currentSongId);
    if (this.shuffleEnabled) {
      //Nếu shuffleEnabled là true thì shuffle playlist trừ current song
      if (currentIndex !== -1) {
        // Remove the current song from the list
        limitedVideoIds.splice(currentIndex, 1);
        // Shuffle the remaining songs
        for (let i = limitedVideoIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [limitedVideoIds[i], limitedVideoIds[j]] = [limitedVideoIds[j], limitedVideoIds[i]];
        }
        // Add the current song back to the beginning
        limitedVideoIds.unshift(currentSongId);
      }
    } else {
      // Nếu shuffleEnabled là false thì giữ nguyên thứ tự và điều chỉnh startIndex
      adjustedStartIndex = limitedVideoIds.indexOf(currentSongId);
    }

    //ghi log for debugging
    // console.log('Limited video IDs for playlist:', limitedVideoIds);
    return { videoIds: limitedVideoIds, startIndex: adjustedStartIndex };
  }

  /**
   * Handle player ready
   */
  private onPlayerReady(): void {
    //ghi log for debugging
    console.log('YouTube player is ready.');
    this.isLoadingVideo = false;

    const startSong = this.showResumeOptions && this.resumeTargetSong
      ? this.resumeTargetSong
      : this.data.song;
    const sourceIndex = this.data.songList.findIndex(song => song.videoId === startSong.videoId);
    const { videoIds: limitedVideoIds, startIndex } = this.initPlaylist(sourceIndex >= 0 ? sourceIndex : this.data.currentIndex);
    this.preparedPlaylist = limitedVideoIds;
    this.preparedStartIndex = startIndex;
    this.currentSong = startSong;

    const playlistOptions = {
      playlist: limitedVideoIds,
      index: startIndex, // Adjust index to match the limited playlist
      startSeconds: 0
    };

    if (this.showResumeOptions) {
      this.player.cuePlaylist(playlistOptions);
      return;
    }

    this.startPlayTimeout();
    this.player.loadPlaylist(playlistOptions);
    this.applyPlaybackSettings();
  }

  playFromBeginning(): void {
    if (!this.player || !this.isInitialized) {
      return;
    }

    this.removeProgress(this.data.song.videoId);
    if (this.resumeTargetSong) {
      this.removeProgress(this.resumeTargetSong.videoId);
    }
    this.showResumeOptions = false;
    this.currentSong = this.data.song;
    const sourceIndex = this.data.songList.findIndex(song => song.videoId === this.data.song.videoId);
    const playlist = this.initPlaylist(sourceIndex >= 0 ? sourceIndex : this.data.currentIndex);
    this.preparedPlaylist = playlist.videoIds;
    this.preparedStartIndex = playlist.startIndex;
    this.startPlayTimeout();
    this.player.loadPlaylist({
      playlist: this.preparedPlaylist,
      index: this.preparedStartIndex,
      startSeconds: 0
    });
    this.applyPlaybackSettings();
  }

  resumePlayback(): void {
    if (!this.player || !this.isInitialized || !this.resumeTargetSong) {
      return;
    }

    const sourceIndex = this.data.songList.findIndex(song => song.videoId === this.resumeTargetSong?.videoId);
    const playlist = this.initPlaylist(sourceIndex >= 0 ? sourceIndex : this.data.currentIndex);
    this.preparedPlaylist = playlist.videoIds;
    this.preparedStartIndex = playlist.startIndex;
    this.currentSong = this.resumeTargetSong;
    this.showResumeOptions = false;
    this.startPlayTimeout();
    this.player.loadPlaylist({
      playlist: this.preparedPlaylist,
      index: this.preparedStartIndex,
      startSeconds: this.savedProgressSeconds
    });
    this.applyPlaybackSettings();
  }

  formatProgressTime(totalSeconds: number): string {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
      : `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  private applyPlaybackSettings(): void {
    if (!this.player) {
      return;
    }

    try {
      this.player.setLoop(this.loopEnabled);
      this.navigationDirection = 'next';

    } catch (error) {
      console.warn('Unable to apply playback settings to YouTube player:', error);
    }
  }

  toggleShuffle(): void {
    this.shuffleEnabled = !this.shuffleEnabled;
    //save local storage
    localStorage.setItem('shuffleEnabled', JSON.stringify(this.shuffleEnabled));
    this.applyPlaybackSettings();
  }

  toggleLoop(): void {
    this.loopEnabled = !this.loopEnabled;
    //save local storage
    localStorage.setItem('loopEnabled', JSON.stringify(this.loopEnabled));
    this.applyPlaybackSettings();
  }

  /**
   * Handle player state change 
   */
  private onPlayerStateChange(event: any): void {
    //ghi log for debugging
    // console.log('Player state changed:', event.data);
    this.ngZone.run(() => {
      const videoId = this.player?.getVideoData?.()?.video_id;
      this.detectVideoChange(videoId);

      if (event.data === window.YT.PlayerState.PLAYING) {
        this.clearPlayTimeout();
        // console.log('Current video Data:', videoData);
        // console.log('Current video ID:', videoId);

        // Update currentSong based on the videoId for UI 
        this.currentSong = this.playingList.find(song => song.videoId === videoId) || null;
        this.activeVideoId = videoId || null;
        this.lastKnownPositionSeconds = this.getCurrentPosition();
        this.updateNavigation();
        if (this.isPlaylistSong(this.currentSong)) {
          this.startProgressTimer();
        } else {
          this.clearProgressTimer();
        }
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        this.clearProgressTimer();
        this.saveActiveProgress();
      } else if (event.data === window.YT.PlayerState.ENDED) {
        this.clearProgressTimer();
        if (this.activeVideoId && this.isPlaylistSong(this.currentSong)) {
          this.removeProgress(this.activeVideoId);
        }
        this.activeVideoId = null;
        this.lastKnownPositionSeconds = 0;
      } else if (event.data !== window.YT.PlayerState.BUFFERING) {
        this.clearProgressTimer();
      }
    });
  }

  private getCurrentPosition(): number {
    try {
      const position = Number(this.player?.getCurrentTime?.());
      return Number.isFinite(position) && position >= 0 ? position : this.lastKnownPositionSeconds;
    } catch {
      return this.lastKnownPositionSeconds;
    }
  }

  private detectVideoChange(videoId?: string): void {
    if (!videoId || !this.activeVideoId || videoId === this.activeVideoId) {
      return;
    }

    this.saveActiveProgress(true);
    this.clearProgressTimer();
    this.activeVideoId = null;
    this.lastKnownPositionSeconds = 0;
  }

  private startProgressTimer(): void {
    if (this.progressTimer !== null) {
      return;
    }

    this.progressTimer = setInterval(() => {
      if (this.player?.getPlayerState?.() === window.YT?.PlayerState?.PLAYING) {
        this.saveActiveProgress();
      }
    }, 15000);
  }

  private clearProgressTimer(): void {
    if (this.progressTimer !== null) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private saveActiveProgress(useLastKnownPosition: boolean = false): void {
    if (!this.activeVideoId || !this.isPlaylistSong(this.currentSong)) {
      return;
    }

    const currentPlayerVideoId = this.player?.getVideoData?.()?.video_id;
    const position = !useLastKnownPosition && currentPlayerVideoId === this.activeVideoId
      ? this.getCurrentPosition()
      : this.lastKnownPositionSeconds;
    const positionSeconds = Math.floor(position);
    if (positionSeconds <= 0) {
      return;
    }

    this.lastKnownPositionSeconds = position;
    const store = this.readProgressStore();
    const previous = store.videos[this.activeVideoId];
    if (store.activeVideoId === this.activeVideoId && previous?.positionSeconds === positionSeconds) {
      return;
    }

    store.activeVideoId = this.activeVideoId;
    store.videos[this.activeVideoId] = { positionSeconds, updatedAt: Date.now() };
    this.writeProgressStore(store);
  }

  private clearPlayTimeout(): void {
    if (this.playTimeout !== null) {
      clearTimeout(this.playTimeout);
      this.playTimeout = null;
    }
  }
  /**
   * Update the current index in the playlist and determine navigation direction
   * This is important for handling errors and moving to the next or previous video correctly
  **/
  private updateNavigation(): void {
    const currentIndex = this.player.getPlaylistIndex();
    // ghi log for debugging
    // console.log('Current index in playlist:', currentIndex, this.data.currentIndex);
    if (currentIndex >= this.data.currentIndex) {
      this.navigationDirection = 'next';
    } else if (currentIndex < this.data.currentIndex) {
      this.navigationDirection = 'previous';
    }
    this.data.currentIndex = currentIndex;
  }

  //update tags unvailable for current song
  private updateCurrentSongTags(unavailableSong: Song | null): void {
    if (unavailableSong && unavailableSong.videoId) {
      // update tag: unavailable to song in database to prevent future attempts to play it
      unavailableSong.tags = unavailableSong.tags || [];
      if (!unavailableSong.tags.includes('unavailable')) {
        unavailableSong.tags.push('unavailable');
      }
      const searchableText = unavailableSong.searchableText || '';
      const updatedSearchableText = searchableText.toLowerCase().includes('unavailable')
        ? searchableText
        : `${searchableText} unavailable`.trim();
      const cachedSongs = localStorage.getItem('cachedSongs');
      try {
        const songs: Song[] = cachedSongs ? JSON.parse(cachedSongs) : [];
        const songIndex = songs.findIndex(song => song.id === unavailableSong.id);
        if (songIndex >= 0) {
          songs[songIndex] = {
            ...songs[songIndex],
            tags: unavailableSong.tags,
            searchableText: updatedSearchableText
          };
          localStorage.setItem('cachedSongs', JSON.stringify(songs));
        }
      } catch (error) {
        console.error(`Failed to update tags for unavailable song with ID: ${unavailableSong.id}`, error);
      }
    } else {
      console.warn('No unavailable song to update tags for.');
    }
  }

  private onPlayerError(event: any): void {
    console.log('YouTube player error:', event.data);
    const currentIndex = this.player.getPlaylistIndex();
    const currentSong = this.playingList[currentIndex] || null;

    this.updateNavigation();

    if ([100, 101, 150].includes(event.data)) {
      if (currentSong?.videoId) {
        this.removeProgress(currentSong.videoId);
      }
      if (this.activeVideoId === currentSong?.videoId) {
        this.activeVideoId = null;
        this.lastKnownPositionSeconds = 0;
        this.clearProgressTimer();
      }
      this.updateCurrentSongTags(currentSong);
      if (this.navigationDirection === 'next') {
        this.player.nextVideo();
      } else if (this.navigationDirection === 'previous') {
        this.player.previousVideo();
      }
    }
  }

  private startPlayTimeout(): void {
    this.clearPlayTimeout();

    this.playTimeout = setTimeout(() => {
      console.log('Video did not start playing within 10000ms. Moving to next song.');
      // close the dialog if the video doesn't start playing within 10 seconds
      this.closeDialog(this.data.song);

      this.playTimeout = null;
    }, 10000);
  }

  /**
   * Close dialog manually
   */
  closeDialog(song: Song | null): void {
    this.saveActiveProgress();
    this.dialogRef.close(song);
  }

  @HostListener('window:pagehide')
  saveProgressBeforePageHide(): void {
    this.saveActiveProgress();
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    this.saveActiveProgress();
    this.clearProgressTimer();
    this.clearPlayTimeout();

    if (this.player && this.isInitialized) {
      try {
        this.player.destroy();
      } catch (error) {
        console.error('Error destroying player:', error);
      }
    }
    this.player = null;
  }
}
