import { Song } from "../types";

// 注意：在正式生產環境中，Client Secret 不應直接暴露在前端代碼中。
// 建議透過後端 Proxy 處理 Token 交換。
// 但為了符合目前的純前端架構需求，我們將在此處直接使用。
const CLIENT_ID = 'a64ec262abd745eeaf4db5faf597d19b';
const CLIENT_SECRET = '67657590909b48afbf1fd45e09400b6b';

let accessToken = '';
let tokenExpiration = 0;

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    release_date: string;
    images: { url: string }[];
    external_ids?: { upc?: string; ean?: string };
  };
  external_ids: { isrc?: string };
  external_urls: { spotify: string };
  uri: string;
}

export const getSpotifyToken = async () => {
  if (accessToken && Date.now() < tokenExpiration) {
    return accessToken;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        throw new Error(`Token fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set expiration (usually 3600 seconds, subtract a bit for safety)
    tokenExpiration = Date.now() + ((data.expires_in - 60) * 1000);
    return accessToken;
  } catch (error) {
    console.error("Spotify Auth Error:", error);
    return null;
  }
};

export const searchSpotifyTracks = async (query: string): Promise<SpotifyTrack[]> => {
  const token = await getSpotifyToken();
  if (!token) return [];

  // 強制加上 artist:Willwi 以確保搜尋結果精準，或者讓使用者搜尋任意關鍵字
  // 這裡我們先做通用搜尋，但在 UI 提示使用者
  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data.tracks?.items || [];
  } catch (error) {
    console.error("Spotify Search Error:", error);
    return [];
  }
};
