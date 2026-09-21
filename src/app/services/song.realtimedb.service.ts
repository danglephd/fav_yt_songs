import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Observable, map, of } from 'rxjs';
import { Song } from '../shared/models/song.model';

@Injectable({
  providedIn: 'root'
})
export class SongRealtimedbService {
  private songsRef: AngularFireList<Song>;
  private songsPath = '/songs';

  constructor(private db: AngularFireDatabase) {
    this.songsRef = this.db.list<Song>(this.songsPath);
  }

  /**
   * Get all active songs (not deleted)
   */
  getActiveSongs(): Observable<Song[]> {
    // trả về danh sách bài hát đã được lọc để chỉ bao gồm những bài hát chưa bị xóa (deleted: false) và sắp xếp theo thứ tự tạo mới nhất trước (createdAt: desc)
    return this.songsRef.snapshotChanges().pipe(
      map(changes =>
        changes
          .map(c => ({
            id: c.key,
            ...c.payload.val()
          } as Song))
          .filter(song => !song.deleted) // lọc ra những bài hát đã bị xóa
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) // sắp xếp theo createdAt giảm dần (mới nhất trước)
      )
    );
  }


  /**
   * Get all active songs (not deleted)
   */
  getActiveSongsFromCache(): Observable<Song[]> {
    const cachedSongs = localStorage.getItem('cachedSongs');

    if (!cachedSongs) {
      return of([]);
    }

    try {
      const songs = JSON.parse(cachedSongs) as Song[];

      return of(
        songs
          .filter(song => !song.deleted)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      );
    } catch {
      return of([]);
    }
  }

}
