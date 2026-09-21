# AI setup guide: standalone My Songs Angular app

## Goal

This folder is an isolated Angular 13 application for the `my-songs` feature only. Do not restore or copy unrelated features from the original workspace.

## Build and run

1. Use Node.js compatible with Angular CLI 13.
2. Run `npm install` (or `yarn install`) in this folder.
3. Set Firebase Realtime Database and YouTube API values in `src/environments/environment.ts` for local development.
4. Run `npm start` and open the URL printed by Angular CLI.
5. Validate with `npm run build1` before reporting completion.

## Source boundaries

- Screen: `src/app/my-songs`
- Dialogs: `src/app/add-youtube-song-dialog`, `src/app/video-player-dialog`, `src/app/settings-dialog`
- Services: `src/app/services/song.realtimedb.service.ts`, `youtube.service.ts`, `youtube-tag.service.ts`
- Models: `src/app/models/youtube.model.ts`, `src/app/shared/models/song.model.ts`, `tag.model.ts`
- Angular Material imports: `src/app/material/material.module.ts`
- Firebase and YouTube configuration: `src/environments`

`src/app/app.module.ts` is intentionally limited to these declarations. `AppComponent` renders `MySongsComponent` directly; there are no routes or other application features.

## Environment handling

Never hard-code or print API keys in source control. Use local values in `environment.ts` and deployment substitution for the `${...}` placeholders in `environment.prod.ts`. Required Firebase fields are `apiKey`, `authDomain`, `databaseURL`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId`; YouTube requires `youtube.apiKey`.

## Functional dependencies

The screen reads and writes songs under Firebase Realtime Database path `/songs` and master tags under `/master_tags`. YouTube add/import actions call the YouTube Data API v3. Firebase rules and API quota are external prerequisites; a successful Angular build does not verify those credentials.

## AI change rules

Keep changes inside this folder. Preserve the standalone boundary, the Angular 13 dependency versions in `package.json`, and the existing dialog/service contracts. When changing a template or service, run the narrowest available Angular build, then run `npm run build1`.
