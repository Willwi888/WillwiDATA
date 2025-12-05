import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Song, Language, ProjectType, SongContextType } from '../types';

const DataContext = createContext<SongContextType | undefined>(undefined);

const STORAGE_KEY = 'willwi_music_db_v1';

// Initial sample data if local storage is empty
const INITIAL_DATA: Song[] = [
  {
    id: '1',
    title: '再愛一次',
    versionLabel: 'Original',
    coverUrl: 'https://picsum.photos/id/26/400/400',
    language: Language.Mandarin,
    projectType: ProjectType.Indie,
    releaseDate: '2023-10-15',
    isEditorPick: true,
    isrc: 'TW-A01-23-00001',
    spotifyId: '4uLU6hMCjMI75M1A2tKZBC', // Example ID
    lyrics: "走在 熟悉的街角\n回憶 像是海浪拍打...",
    description: "一首關於失去與重逢的抒情搖滾。",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick roll as placeholder
    musixmatchUrl: "https://www.musixmatch.com/artist/Willwi",
    youtubeMusicUrl: "https://music.youtube.com/channel/WillwiID"
  },
  {
    id: '2',
    title: '泡麵之歌',
    coverUrl: 'https://picsum.photos/id/192/400/400',
    language: Language.Japanese,
    projectType: ProjectType.PaoMien,
    releaseDate: '2024-01-20',
    isEditorPick: false,
    isrc: 'TW-A01-24-00002',
    description: "深夜肚子餓時的即興創作。",
  }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setSongs(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse local storage", e);
        setSongs(INITIAL_DATA);
      }
    } else {
      setSongs(INITIAL_DATA);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever songs change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
    }
  }, [songs, isLoaded]);

  const addSong = (song: Song) => {
    setSongs(prev => [song, ...prev]);
  };

  const updateSong = (id: string, updatedFields: Partial<Song>) => {
    setSongs(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  const deleteSong = (id: string) => {
    if (window.confirm("確定要刪除這首歌嗎？此操作無法復原。")) {
      setSongs(prev => prev.filter(s => s.id !== id));
    }
  };

  const getSong = (id: string) => songs.find(s => s.id === id);

  return (
    <DataContext.Provider value={{ songs, addSong, updateSong, deleteSong, getSong }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};