
export enum Language {
  Mandarin = '華語',
  Taiwanese = '台語',
  Japanese = '日語',
  Korean = '韓語',
  English = '英語',
  Thai = '泰語',
  Italian = '義大利語',
  French = '法語',
  Instrumental = '純音樂'
}

export enum ProjectType {
  Indie = '獨立發行',
  PaoMien = '泡麵聲學院'
}

export interface Song {
  id: string;
  title: string;
  versionLabel?: string; // e.g., "Acoustic Ver.", "Remix"
  coverUrl: string;
  language: Language;
  projectType: ProjectType;
  releaseDate: string;
  isEditorPick: boolean;
  
  // Metadata
  isrc?: string;
  upc?: string;
  spotifyId?: string; // for embedding
  musicBrainzArtistId?: string; // New field
  
  // External Links
  youtubeUrl?: string; // Lyric Video / MV
  musixmatchUrl?: string;
  youtubeMusicUrl?: string;
  spotifyLink?: string; // Direct link
  appleMusicLink?: string;
  
  // Content
  lyrics?: string;
  description?: string;
  credits?: string; // Producer, Arranger, etc.
}

export interface SongContextType {
  songs: Song[];
  addSong: (song: Song) => void;
  updateSong: (id: string, updatedSong: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  getSong: (id: string) => Song | undefined;
  importData: (newSongs: Song[]) => void;
}
