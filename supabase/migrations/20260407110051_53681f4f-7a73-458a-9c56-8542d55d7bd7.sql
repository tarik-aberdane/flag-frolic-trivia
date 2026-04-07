
-- Create rooms table
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE DEFAULT substring(md5(random()::text), 1, 6),
  max_players INTEGER NOT NULL DEFAULT 60,
  game_duration INTEGER NOT NULL DEFAULT 300,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  red_score INTEGER NOT NULL DEFAULT 0,
  blue_score INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room players table
CREATE TABLE public.room_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  team TEXT NOT NULL CHECK (team IN ('red', 'blue')),
  pos_x FLOAT NOT NULL DEFAULT 0,
  pos_y FLOAT NOT NULL DEFAULT 0,
  pos_z FLOAT NOT NULL DEFAULT 0,
  has_flag BOOLEAN NOT NULL DEFAULT false,
  is_frozen BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

-- Public read/write for game rooms (no auth required for this game)
CREATE POLICY "Anyone can view rooms" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON public.game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.game_rooms FOR UPDATE USING (true);

-- Public read/write for players
CREATE POLICY "Anyone can view players" ON public.room_players FOR SELECT USING (true);
CREATE POLICY "Anyone can join" ON public.room_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.room_players FOR UPDATE USING (true);
CREATE POLICY "Anyone can leave" ON public.room_players FOR DELETE USING (true);

-- Index for fast lookups
CREATE INDEX idx_room_players_room ON public.room_players(room_id);
CREATE INDEX idx_room_code ON public.game_rooms(code);
