-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Songs Table
CREATE TABLE songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  version_label TEXT,
  cover_url TEXT,
  cover_overlay_text TEXT,
  language TEXT NOT NULL,
  project_type TEXT NOT NULL,
  release_category TEXT,
  release_company TEXT,
  publisher TEXT,
  release_date TEXT NOT NULL,
  is_editor_pick BOOLEAN DEFAULT false,
  is_interactive_active BOOLEAN DEFAULT false,
  genre TEXT,
  is_explicit BOOLEAN DEFAULT false,
  isrc TEXT,
  upc TEXT,
  spotify_id TEXT,
  apple_music_id TEXT,
  youtube_video_id TEXT,
  musicbrainz_id TEXT,
  musicbrainz_release_id TEXT,
  youtube_url TEXT,
  musixmatch_link TEXT,
  youtube_music_link TEXT,
  spotify_link TEXT,
  apple_music_link TEXT,
  kkbox_link TEXT,
  streetvoice_link TEXT,
  distrokid_hyperfollow_link TEXT,
  audio_url TEXT,
  lyrics TEXT,
  description TEXT,
  credits TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  email TEXT UNIQUE,
  credits INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Songs Policies (Public read, authenticated write)
CREATE POLICY "Songs are viewable by everyone" ON songs
  FOR SELECT USING (true);

CREATE POLICY "Songs are insertable by authenticated users" ON songs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Songs are updatable by authenticated users" ON songs
  FOR UPDATE USING (true);

CREATE POLICY "Songs are deletable by authenticated users" ON songs
  FOR DELETE USING (true);

-- Users Policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- Transactions Policies
CREATE POLICY "Transactions are viewable by everyone" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Transactions are insertable by authenticated users" ON transactions
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_songs_language ON songs(language);
CREATE INDEX idx_songs_project_type ON songs(project_type);
CREATE INDEX idx_songs_release_date ON songs(release_date);
CREATE INDEX idx_songs_is_editor_pick ON songs(is_editor_pick);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
