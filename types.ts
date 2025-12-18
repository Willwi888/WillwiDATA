
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
  PaoMien = '泡麵聲學院',
  Commercial = '商業合作'
}

export enum ReleaseCategory {
  Single = 'Single',
  EP = 'EP',
  Album = 'Album'
}

export interface Song {
  id: string;
  title: string;
  versionLabel?: string; 
  coverUrl: string;
  coverOverlayText?: string; 
  language: Language;
  projectType: ProjectType;
  releaseCategory: ReleaseCategory;
  releaseCompany?: string;
  releaseDate: string;
  isEditorPick: boolean;
  
  // Standard Metadata (MusicBrainz/DistroKid)
  genre?: string;      // Added: Genre
  isExplicit?: boolean; // Added: Explicit Content
  
  // Industry Standard IDs
  isrc?: string;
  upc?: string;
  musicBrainzId?: string; // Recording ID
  musicBrainzReleaseId?: string; // Release ID
  
  // Platform IDs (For API usage)
  spotifyId?: string; 
  appleMusicId?: string;
  youtubeVideoId?: string;
  
  // Public Links (Asset Management)
  distrokidHyperFollowLink?: string; // Added: Main DistroKid Link
  spotifyLink?: string; 
  appleMusicLink?: string;
  youtubeMusicLink?: string;
  youtubeUrl?: string;
  kkboxLink?: string;     
  musixmatchLink?: string;
  streetvoiceLink?: string; 
  
  // Content
  audioUrl?: string; 
  lyrics?: string;
  description?: string;
  credits?: string; 
}

export interface SongContextType {
  songs: Song[];
  addSong: (song: Song) => Promise<boolean>;
  updateSong: (id: string, updatedSong: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  getSong: (id: string) => Song | undefined;
  importData: (newSongs: Song[]) => void;
  undo: () => void;
  canUndo: boolean;
  currentSong: Song | null;
  playSong: (song: Song) => void;
  closePlayer: () => void;
}
