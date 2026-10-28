import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { MySongsComponent } from './my-songs/my-songs.component';
import { MySongs2Component } from './my-songs-2/my-songs-2.component';
import { AddYouTubeSongDialogComponent } from './add-youtube-song-dialog/add-youtube-song-dialog.component';
import { VideoPlayerDialogComponent } from './video-player-dialog/video-player-dialog.component';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { MaterialModule } from './material/material.module';
import { environment } from '../environments/environment';

const routes: Routes = [
  { path: '', component: MySongs2Component },
  { path: 'my-songs-2', component: MySongsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    MySongsComponent,
    MySongs2Component,
    AddYouTubeSongDialogComponent,
    VideoPlayerDialogComponent,
    SettingsDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
