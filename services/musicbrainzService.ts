import { ReleaseCategory } from '../types';

// MusicBrainz API Service for Willwi
// Targeted Artist UUID: 526cc0f8-da20-4d2d-86a5-4bf841a6ba3c

const MB_API_BASE = 'https://musicbrainz.org/ws/2';
const WILLWI_MBID = '526cc0f8-da20-4d2d-86a5-4bf841a6ba3c';
const USER_AGENT = 'WillwiMusicManager/2.0 ( will@willwi.com )'; 

export interface MBReleaseGroup {
  id: string;
  title: string;
  'primary-type': string;
  'first-release-date': string;
  score?: number;
  tags?: { count: number, name: string }[];
}

export interface MBTrack {
  id: string; // Recording ID
  title: string;
  position: number;
  isrcs?: string[]; // Added ISRC support
  length?: number;
}

export interface MBImportData {
  id: string; // Release ID
  tracks: MBTrack[];
  releaseDate: string;
  releaseCompany: string;
  category: ReleaseCategory;
  upc?: string;
  genre?: string;
}

export const mapMBTypeToCategory = (type: string): ReleaseCategory => {
  if (type === 'EP') return ReleaseCategory.EP;
  if (type === 'Single') return ReleaseCategory.Single;
  return ReleaseCategory.Album; 
};

export const getWillwiReleases = async (): Promise<MBReleaseGroup[]> => {
  try {
    const url = `${MB_API_BASE}/release-group?artist=${WILLWI_MBID}&fmt=json&limit=100`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': USER_AGENT
      }
    });

    if (!response.ok) {
        console.error(`MusicBrainz API Error: ${response.status}`);
        return [];
    }

    const data = await response.json();
    return data['release-groups'] || [];

  } catch (error) {
    console.error("MusicBrainz Network Error:", error);
    return [];
  }
};

export const getReleaseGroupDetails = async (releaseGroupId: string, primaryType: string): Promise<MBImportData | null> => {
  try {
    // Fetch release group with releases and tags
    const groupUrl = `${MB_API_BASE}/release-group/${releaseGroupId}?inc=tags&fmt=json`;
    const groupResponse = await fetch(groupUrl, { headers: { 'User-Agent': USER_AGENT } });
    let genre = '';
    if (groupResponse.ok) {
        const groupData = await groupResponse.json();
        // Simple heuristic: pick the most popular tag that looks like a genre
        if (groupData.tags && groupData.tags.length > 0) {
            genre = groupData.tags.sort((a:any, b:any) => b.count - a.count)[0].name;
        }
    }

    // Fetch release group with releases
    const url = `${MB_API_BASE}/release?release-group=${releaseGroupId}&inc=recordings+media+labels+isrcs&fmt=json&limit=20`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': USER_AGENT
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const releases = data.releases || [];
    
    if (releases.length === 0) return null;

    // Prefer releases that have a date
    releases.sort((a: any, b: any) => {
        const da = a.date || '9999-99-99';
        const db = b.date || '9999-99-99';
        return da.localeCompare(db);
    });

    // Select the best release (prefer one with date and tracks)
    const targetRelease = releases.find((r: any) => r.date) || releases[0];
    if (!targetRelease) return null;

    const tracks: MBTrack[] = [];
    if (targetRelease.media) {
        targetRelease.media.forEach((medium: any) => {
            if (medium.tracks) {
                medium.tracks.forEach((t: any) => {
                    // Extract ISRCs if available in the recording relation
                    const isrcs = t.recording?.isrcs?.map((i: any) => i) || [];
                    
                    tracks.push({
                        id: t.recording?.id || t.id,
                        title: t.title,
                        position: t.position,
                        length: t.length,
                        isrcs: isrcs
                    });
                });
            }
        });
    }

    const label = targetRelease['label-info']?.[0]?.label?.name || '';
    
    return {
        id: targetRelease.id,
        tracks,
        releaseDate: targetRelease.date || '',
        releaseCompany: label,
        category: mapMBTypeToCategory(primaryType),
        upc: targetRelease.barcode,
        genre: genre
    };

  } catch (error) {
    console.error("MB Tracks Fetch Error:", error);
    return null;
  }
};

export const getCoverArtUrl = async (releaseGroupId: string): Promise<string | null> => {
  try {
    const url = `https://coverartarchive.org/release-group/${releaseGroupId}`;
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) return null;
    const data = await response.json();
    const frontImage = data.images.find((img: any) => img.front) || data.images[0];
    return frontImage ? frontImage.image : null;
  } catch (e) {
    return null;
  }
};
