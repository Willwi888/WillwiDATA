import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Song, Language, ProjectType, SongContextType, ReleaseCategory } from '../types';
import { supabase } from '../services/supabaseClient';

const DataContext = createContext<SongContextType | undefined>(undefined);

const MAX_HISTORY_STEPS = 10; // Keep last 10 steps in memory

// Initial sample data if local storage is empty
const INITIAL_DATA: Song[] = [
  {
    id: '1',
    title: '再愛一次',
    versionLabel: 'Original',
    coverUrl: 'https://picsum.photos/id/26/400/400',
    language: Language.Mandarin,
    projectType: ProjectType.Indie,
    releaseCategory: ReleaseCategory.Single,
    releaseDate: '2023-10-15',
    isEditorPick: true,
    genre: 'Mandopop',
    isExplicit: false,
    isrc: 'TW-A01-23-00001',
    spotifyId: '4uLU6hMCjMI75M1A2tKZBC', // Example ID
    lyrics: "走在 熟悉的街角\n回憶 像是海浪拍打\n每一個呼吸\n都是你的氣息\n再愛一次\n能不能\n再愛一次",
    description: "一首關於失去與重逢的抒情搖滾。",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick roll as placeholder
    distrokidHyperFollowLink: "https://distrokid.com/hyperfollow/willwi/example",
    musixmatchLink: "https://www.musixmatch.com/artist/Willwi",
    youtubeMusicLink: "https://music.youtube.com/channel/WillwiID",
    spotifyLink: "https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4",
    appleMusicLink: "https://music.apple.com/us/artist/willwi/1798471457"
  },
  {
    id: '2',
    title: '泡麵之歌',
    coverUrl: 'https://picsum.photos/id/192/400/400',
    language: Language.Japanese,
    projectType: ProjectType.PaoMien,
    releaseCategory: ReleaseCategory.Single,
    releaseDate: '2024-01-20',
    isEditorPick: false,
    genre: 'J-Pop',
    isExplicit: false,
    isrc: 'TW-A01-24-00002',
    description: "深夜肚子餓時的即興創作。",
    distrokidHyperFollowLink: "https://distrokid.com/hyperfollow/willwi/noodles",
    musixmatchLink: "https://www.musixmatch.com/artist/Willwi",
    youtubeMusicLink: "https://music.youtube.com/channel/WillwiID",
    spotifyLink: "https://open.spotify.com/artist/3ascZ8Rb2KDw4QyCy29Om4",
    appleMusicLink: "https://music.apple.com/us/artist/willwi/1798471457"
  }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Global Player State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  
  // History Stack for Undo (Time Machine)
  const [history, setHistory] = useState<Song[][]>([]);

  // Helper function to convert camelCase to snake_case for database
  const toSnakeCase = (obj: any): any => {
    const snakeObj: any = {};
    Object.keys(obj).forEach(key => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeObj[snakeKey] = obj[key];
    });
    return snakeObj;
  };

  // Helper function to convert snake_case to camelCase from database
  const toCamelCase = (obj: any): any => {
    const camelObj: any = {};
    Object.keys(obj).forEach(key => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = obj[key];
    });
    return camelObj;
  };

  // Load from Supabase on mount
  useEffect(() => {
    const loadSongs = async () => {
      try {
        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error loading songs from Supabase:', error);
          // Fallback to initial data if Supabase fails
          setSongs(INITIAL_DATA);
        } else {
          // Convert snake_case to camelCase and set songs
          const songsData = (data || []).map(toCamelCase);
          setSongs(songsData.length > 0 ? songsData : INITIAL_DATA);
        }
      } catch (error) {
        console.error('Failed to load songs:', error);
        setSongs(INITIAL_DATA);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSongs();

    // Set up real-time subscription for song changes
    const subscription = supabase
      .channel('songs_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'songs' },
        (payload) => {
          console.log('Song changed:', payload);
          // Reload songs on any change
          loadSongs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper to save history before making changes
  const saveToHistory = useCallback(() => {
    setHistory(prev => {
        const newHistory = [...prev, songs];
        if (newHistory.length > MAX_HISTORY_STEPS) {
            return newHistory.slice(newHistory.length - MAX_HISTORY_STEPS);
        }
        return newHistory;
    });
  }, [songs]);

  const undo = () => {
    setHistory(prev => {
        if (prev.length === 0) return prev;
        const previousState = prev[prev.length - 1];
        setSongs(previousState);
        return prev.slice(0, prev.length - 1);
    });
  };

  const addSong = async (song: Song): Promise<boolean> => {
    try {
        saveToHistory();
        
        // Convert camelCase to snake_case for database
        const dbSong = toSnakeCase(song);
        
        const { error } = await supabase
          .from('songs')
          .insert([dbSong]);
        
        if (error) {
          console.error('Error adding song to Supabase:', error);
          alert('儲存失敗：無法新增歌曲到資料庫。請檢查網路連線。');
          return false;
        }
        
        // Optimistically update local state
        setSongs(prev => [song, ...prev]);
        return true;
    } catch (error) {
        console.error("Failed to add song", error);
        alert('儲存失敗：發生錯誤。');
        return false;
    }
  };

  const updateSong = async (id: string, updatedFields: Partial<Song>) => {
    try {
        saveToHistory();
        
        // Convert camelCase to snake_case for database
        const dbUpdates = toSnakeCase(updatedFields);
        
        const { error } = await supabase
          .from('songs')
          .update(dbUpdates)
          .eq('id', id);
        
        if (error) {
          console.error('Error updating song in Supabase:', error);
          alert('更新失敗：無法更新歌曲資料。請檢查網路連線。');
          return;
        }
        
        // Update local state
        if (currentSong && currentSong.id === id) {
            setCurrentSong(prev => prev ? ({ ...prev, ...updatedFields } as Song) : null);
        }
        setSongs(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
    } catch (error) {
        console.error("Failed to update song", error);
        alert('更新失敗：發生錯誤。');
    }
  };

  const deleteSong = async (id: string) => {
    try {
        saveToHistory();
        
        const { error } = await supabase
          .from('songs')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting song from Supabase:', error);
          alert('刪除失敗：無法刪除歌曲。請檢查網路連線。');
          return;
        }
        
        // Update local state
        if (currentSong && currentSong.id === id) {
            setCurrentSong(null);
        }
        setSongs(prev => prev.filter(s => s.id !== id));
    } catch (error) {
        console.error("Failed to delete song", error);
        alert('刪除失敗：發生錯誤。');
    }
  };

  const getSong = (id: string) => songs.find(s => s.id === id);

  const importData = async (newSongs: Song[]) => {
    if (!Array.isArray(newSongs)) {
        alert("匯入失敗：檔案格式錯誤 (必須是 Array)。");
        return;
    }
    
    try {
        saveToHistory();
        
        // Convert all songs to snake_case
        const dbSongs = newSongs.map(toSnakeCase);
        
        // Delete all existing songs first using a more explicit condition
        const { error: deleteError } = await supabase
          .from('songs')
          .delete()
          .gte('created_at', '1970-01-01'); // Delete all records with valid timestamp
        
        if (deleteError) {
          console.error('Error deleting existing songs:', deleteError);
        }
        
        // Insert new songs
        const { error: insertError } = await supabase
          .from('songs')
          .insert(dbSongs);
        
        if (insertError) {
          console.error('Error importing songs to Supabase:', insertError);
          alert('匯入失敗：無法匯入資料到資料庫。');
          return;
        }
        
        setSongs(newSongs);
        alert(`成功匯入 ${newSongs.length} 筆資料！`);
    } catch (error) {
        console.error("Failed to import data", error);
        alert('匯入失敗：發生錯誤。');
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
  };

  const closePlayer = () => {
    setCurrentSong(null);
  };

  return (
    <DataContext.Provider value={{ 
        songs, 
        addSong, 
        updateSong, 
        deleteSong, 
        getSong, 
        importData,
        undo,
        canUndo: history.length > 0,
        currentSong,
        playSong,
        closePlayer
    }}>
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