import { supabase } from '../supabaseClient';
import { transformTrack } from './client';

// --- User Management ---
export const syncUser = async (user) => {
    // The SQL schema handles profile creation via triggers on auth.users.
    // We don't need to manually upsert into 'users' or 'profiles' unless we want to sync metadata.
    // If the trigger fails, we might want a fallback, but for now we trust the DB trigger.
    if (!user) return;
    console.log("User sync handled by DB triggers.");
};

// --- Playlist Management ---
export const getUserPlaylists = async (userId) => {
    if (!userId) return [];

    // 1. Get Playlists
    const { data: playlists, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching playlists:', error);
        return [];
    }

    // 2. Get Tracks for each playlist
    // Denormalized schema: playlist_tracks contains all info
    const playlistsWithTracks = await Promise.all(playlists.map(async (pl) => {
        const { data: tracksData } = await supabase
            .from('playlist_tracks')
            .select('*')
            .eq('playlist_id', pl.id)
            .order('added_at', { ascending: true });

        // Transform DB tracks to App format
        const tracks = tracksData?.map(t => ({
            id: t.youtube_id, // App uses youtube_id as key
            name: t.title,
            image: t.image,
            youtube_id: t.youtube_id,
            artists: [t.artist],
            duration_seconds: 0, // Not in schema, allow 0
            source: 'youtube'
        })) || [];

        return {
            id: pl.id,
            name: pl.name,
            type: 'custom',
            tracks: tracks
        };
    }));

    return playlistsWithTracks;
};

export const createPlaylist = async (userId, name) => {
    const { data, error } = await supabase
        .from('playlists')
        .insert({ user_id: userId, name: name })
        .select()
        .single();

    if (error) {
        console.error('Error creating playlist:', error);
        return null;
    }
    return { ...data, tracks: [], type: 'custom' };
};

export const deletePlaylist = async (playlistId) => {
    const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

    if (error) console.error('Error deleting playlist:', error);
    return !error;
};

// --- Track Management (Denormalized) ---

export const addTrackToPlaylist = async (playlistId, track) => {
    // Direct insert into playlist_tracks. No global 'tracks' table lookup.
    const { error } = await supabase
        .from('playlist_tracks')
        .insert({
            playlist_id: playlistId,
            youtube_id: track.youtube_id,
            title: track.name,
            artist: track.artists?.[0] || 'Unknown',
            image: track.image
        });

    if (error) {
        // Ignore duplicate key errors if unique index exists
        if (error.code !== '23505') console.error('Error adding track to playlist:', error);
        return false;
    }
    return true;
};

export const removeTrackFromPlaylist = async (playlistId, track) => {
    const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('youtube_id', track.youtube_id);

    if (error) console.error('Error removing track:', error);
};

// --- History & Now Playing ---

export const addToHistory = async (userId, track) => {
    if (!userId || !track) return;

    const { error } = await supabase
        .from('recently_played')
        .insert({
            user_id: userId,
            youtube_id: track.youtube_id,
            title: track.name,
            artist: track.artists?.[0] || 'Unknown',
            image: track.image
        });

    if (error) console.error('Error adding to history:', error);
};

export const getRecentlyPlayed = async (userId) => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('recently_played')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(20);

    if (error) return [];

    return data.map(t => ({
        id: t.youtube_id,
        name: t.title,
        image: t.image,
        youtube_id: t.youtube_id,
        artists: [t.artist],
        duration_seconds: 0,
        source: 'youtube'
    }));
};

export const setNowPlaying = async (userId, track, deviceId) => {
    if (!userId || !track) return;

    // Upsert logic for now_playing
    const { error } = await supabase
        .from('now_playing')
        .upsert({
            user_id: userId,
            device_id: deviceId,
            youtube_id: track.youtube_id,
            title: track.name,
            artist: track.artists?.[0] || 'Unknown',
            image: track.image,
            is_playing: true,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, device_id' });

    if (error) console.error('Error setting now playing:', error);
};
