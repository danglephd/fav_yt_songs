export interface PlaylistProgressEntry {
  positionSeconds: number;
  updatedAt: number;
}

export interface PlaylistProgressStore {
  activeVideoId?: string;
  videos: { [videoId: string]: PlaylistProgressEntry };
}
