import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, Search, Play, Pause, SkipBack, SkipForward, Music,
  Shuffle, List, Plus, Volume2, VolumeX, Check, Sparkles,
  Home, Library, Trash2, Heart, Repeat
} from "lucide-react";
import AuthButton from "./AuthButton";
import { apiFetch, transformTrack } from "../api/client";

const CURATED_PLAYLISTS = [
  { id: 'c1', name: 'Hindi Party Hits', color: '#ff4b2b', description: 'Non-stop Bollywood party anthems.', search: 'hindi party songs' },
  { id: 'c2', name: 'Lo-Fi Study', color: '#8e2de2', description: 'Beats to keep you focused.', search: 'lofi hip hop' },
  { id: 'c3', name: 'Global Top 50', color: '#1e90ff', description: 'The biggest hits across the globe.', search: 'top global hits' },
  { id: 'c4', name: 'Zen Garden', color: '#00b09b', description: 'Deep meditation and peaceful vibes.', search: 'meditation music' },
  { id: 'c5', name: '90s Bollywood', color: '#f9d423', description: 'The golden era of melodies.', search: '90s hindi hits' },
  { id: 'c6', name: 'Rock Legends', color: '#434343', description: 'Classic rock that never dies.', search: 'classic rock legends' },
  { id: 'c7', name: 'EDM Pulse', color: '#0575e6', description: 'High-energy dance floor killers.', search: 'edm festival hits' },
  { id: 'c8', name: 'Romantic Mood', color: '#e14eca', description: 'Soulful tracks for your special ones.', search: 'romantic hindi songs' },
  { id: 'c9', name: 'Workout Power', color: '#ff5f6d', description: 'Push your limits with heavy beats.', search: 'workout motivation songs' },
  { id: 'c10', name: 'Jazz Cafe', color: '#134e5e', description: 'Smooth jazz for a classy evening.', search: 'smooth jazz classics' },
  { id: 'c11', name: 'Indie Vibes', color: '#4facfe', description: 'Discover the best independent artists.', search: 'indie pop' },
  { id: 'c12', name: 'Classical Bliss', color: '#667eea', description: 'The timeless beauty of orchestra.', search: 'classical piano' },
  { id: 'c13', name: 'Hip Hop Real', color: '#000000', description: 'Pure street energy and flow.', search: 'hip hop essentials' },
  { id: 'c14', name: 'Acoustic Soul', color: '#f6d365', description: 'Raw emotions through strings.', search: 'acoustic pop' },
  { id: 'c15', name: 'Trending India', color: '#ff0844', description: 'What India is listening to right now.', search: 'top hindu songs india' },
];


const PremiumLoader = () => (
  <div className="premium-loader">
    <span></span><span></span><span></span><span></span><span></span>
  </div>
);

export default function MusicPage() {
  const [activeView, setActiveView] = useState("home");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(() => {
    try {
      const saved = localStorage.getItem('player.currentTrack');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('player.customPlaylists');
      return saved ? JSON.parse(saved) : [
        { id: 'liked', name: 'Liked Songs', tracks: [], type: 'system' }
      ];
    } catch {
      return [{ id: 'liked', name: 'Liked Songs', tracks: [], type: 'system' }];
    }
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem('player.recentlyPlayed');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [playlist, setPlaylist] = useState(() => {
    try {
      const saved = localStorage.getItem('player.playlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('player.currentIndex');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isShuffled, setIsShuffled] = useState(() => {
    const saved = localStorage.getItem('player.isShuffled');
    return saved ? JSON.parse(saved) : false;
  });
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(() => {
    try {
      const saved = localStorage.getItem('player.isAutoplay');
      return saved ? JSON.parse(saved) : true;
    } catch { return true; }
  });
  const [playerReady, setPlayerReady] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const playerRef = useRef(null);
  const suggestionsRef = useRef(null);
  const mainContentRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  useEffect(() => {
    const initYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        setPlayerReady(true);
      } else {
        if (!window.YT && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
        window.onYouTubeIframeAPIReady = () => setPlayerReady(true);
      }
    };
    initYouTubeAPI();
  }, []);

  const fetchAutoplayTracks = useCallback(async (track) => {
    if (!track) return;
    try {
      const response = await apiFetch(`/get_related_songs`, {
        method: 'POST',
        body: JSON.stringify({
          track_name: track.name,
          artist_name: track.artists?.[0] || "",
          limit: 10
        }),
      });
      const data = await response.json();
      if (data.tracks && data.tracks.length > 0) {
        // Filter out current track if present and take the first new one
        const newTrack = data.tracks.find(t => t.youtube_id !== track.youtube_id) || data.tracks[0];
        setPlaylist(prev => [...prev, newTrack]);
        setCurrentIndex(prev => prev + 1);
        setCurrentTrack(newTrack);
        showToast("Autoplay: Coming up next!");
      }
    } catch { /* ignore */ }
  }, []);

  const handleNext = useCallback(() => {
    if (playlist.length === 0) return;

    if (!isShuffled && currentIndex === playlist.length - 1) {
      if (isAutoplay) {
        fetchAutoplayTracks(currentTrack);
      } else {
        // Loop back to start or stop
        setCurrentIndex(0);
        setCurrentTrack(playlist[0]);
      }
      return;
    }

    let nextIdx = isShuffled
      ? Math.floor(Math.random() * playlist.length)
      : (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIdx);
    setCurrentTrack(playlist[nextIdx]);
  }, [playlist, isShuffled, currentIndex, isAutoplay, currentTrack, fetchAutoplayTracks]);

  const handlePrevious = useCallback(() => {
    if (playlist.length === 0) return;
    let prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(prevIdx);
    setCurrentTrack(playlist[prevIdx]);
  }, [playlist, currentIndex]);

  const initializePlayer = useCallback(() => {
    let container = document.getElementById('youtube-player');
    if (!container) {
      container = document.createElement('div');
      container.id = 'youtube-player';
      container.style.cssText = 'position: fixed; top: -9999px; left: -9999px; opacity: 0;';
      document.body.appendChild(container);
    }
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch { /* ignore */ }
    }

    playerRef.current = new window.YT.Player(container, {
      videoId: currentTrack.youtube_id,
      playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0 },
      events: {
        onReady: (e) => {
          setDuration(e.target.getDuration());
          e.target.setVolume(volume * 100);
          e.target.playVideo();
        },
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
          else if (e.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
          else if (e.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            handleNext();
          }
        },
        onError: () => {
          handleNext();
        }
      }
    });
  }, [currentTrack, volume, handleNext]);

  useEffect(() => {
    if (currentTrack && playerReady && currentTrack.youtube_id) {
      initializePlayer();
    }
  }, [currentTrack, playerReady, initializePlayer]);

  useEffect(() => {
    localStorage.setItem('player.currentTrack', JSON.stringify(currentTrack));
    localStorage.setItem('player.currentIndex', String(currentIndex));
    localStorage.setItem('player.playlist', JSON.stringify(playlist));
    localStorage.setItem('player.isShuffled', JSON.stringify(isShuffled));
    localStorage.setItem('player.isAutoplay', JSON.stringify(isAutoplay));
    localStorage.setItem('player.customPlaylists', JSON.stringify(playlists));
    localStorage.setItem('player.recentlyPlayed', JSON.stringify(recentlyPlayed));
  }, [currentTrack, currentIndex, playlist, isShuffled, isAutoplay, playlists, recentlyPlayed]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        try {
          if (playerRef.current?.getCurrentTime) {
            setCurrentTime(playerRef.current.getCurrentTime());
          }
        } catch { /* ignore */ }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await apiFetch(`/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        // Fallback mock suggestions for better UX if backend is missing them
        setSuggestions([`${searchQuery} music`, `${searchQuery} hits`, `${searchQuery} mix`]);
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeView, selectedPlaylistId]);

  const searchMusic = useCallback(async (query) => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setShowSuggestions(false);
    setActiveView("search");
    try {
      let response = await apiFetch(`/search_music`, {
        method: 'POST',
        body: JSON.stringify({ query }),
      });

      if (!response.ok || response.status === 404) {
        response = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
      }

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      const rawTracks = Array.isArray(data) ? data : (data.tracks || []);
      setSearchResults(rawTracks.map(transformTrack).filter(t => t));
    } catch (err) {
      console.error("Search error:", err);
      showToast("Search failed. Please try again.", "error");
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const loadPlaylistTracks = useCallback(async (query) => {
    setSearchLoading(true);
    try {
      let response = await apiFetch(`/search_music`, {
        method: 'POST',
        body: JSON.stringify({ query }),
      });

      if (!response.ok || response.status === 404) {
        response = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
      }

      const data = await response.json();
      const rawTracks = Array.isArray(data) ? data : (data.tracks || []);
      return rawTracks.map(transformTrack).filter(t => t);
    } catch {
      return [];
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handlePlaylistClick = async (pl) => {
    setSelectedPlaylistId(pl.id);
    setActiveView('playlist');
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  const handleProgressChange = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    playerRef.current?.seekTo(time);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const createPlaylist = () => {
    const newPlaylist = {
      id: Date.now().toString(),
      name: `My Playlist #${playlists.length}`,
      tracks: [],
      type: 'custom'
    };
    setPlaylists([...playlists, newPlaylist]);
    showToast("Playlist created");
  };

  const addTrackToPlaylist = (playlistId, track) => {
    setPlaylists(playlists.map(pl => {
      if (pl.id === playlistId) {
        if (pl.tracks.find(t => t.id === track.id)) {
          showToast("Already in playlist", "info");
          return pl;
        }
        showToast(`Added to ${pl.name}`);
        return { ...pl, tracks: [...pl.tracks, track] };
      }
      return pl;
    }));
  };

  const removePlaylist = (id) => {
    if (id === 'liked') return;
    setPlaylists(playlists.filter(pl => pl.id !== id));
    if (selectedPlaylistId === id) setActiveView('home');
    showToast("Playlist removed");
  };

  const playTrack = useCallback((track, newQueue = null) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 20);
    });

    if (newQueue) {
      setPlaylist(newQueue);
      const idx = newQueue.findIndex(t => t.id === track.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else {
      if (!playlist.find(t => t.id === track.id)) {
        setPlaylist([track, ...playlist]);
        setCurrentIndex(0);
      } else {
        const idx = playlist.findIndex(t => t.id === track.id);
        setCurrentIndex(idx);
      }
    }
    setCurrentTrack(track);
  }, [playlist]);

  const renderTrackItem = (track, index, queueContext = null) => (
    <motion.div
      key={`${track.id}-${index}`}
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
      onClick={() => playTrack(track, queueContext)}
    >
      <div className="track-index">
        {currentTrack?.id === track.id && isPlaying ? (
          <div className="music-bars mini">
            <span></span><span></span><span></span>
          </div>
        ) : index + 1}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <img src={track.image} alt="" className="track-image" />
        <div className="track-main-info">
          <div className="track-name">{track.name}</div>
          <div className="track-artist">{track.artists?.join(', ')}</div>
        </div>
      </div>
      <div className="track-album">Single / Hyde Music</div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-end' }}>
        <Plus
          size={18}
          className="hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            addTrackToPlaylist('liked', track);
          }}
        />
        <Heart
          size={18}
          className={playlists.find(p => p.id === 'liked')?.tracks.some(t => t.id === track.id) ? 'text-red-500 fill-red-500' : ''}
          onClick={(e) => {
            e.stopPropagation();
            addTrackToPlaylist('liked', track);
          }}
        />
      </div>
    </motion.div>
  );

  const getActivePlaylist = () => {
    const custom = playlists.find(p => p.id === selectedPlaylistId);
    if (custom) return custom;
    const curated = CURATED_PLAYLISTS.find(p => p.id === selectedPlaylistId);
    if (curated) return { ...curated, type: 'system' };
    return null;
  };

  const selectedPlaylist = getActivePlaylist();

  const [systemTracks, setSystemTracks] = useState({});
  useEffect(() => {
    if (selectedPlaylist?.type === 'system' && selectedPlaylist.id !== 'liked' && !systemTracks[selectedPlaylist.id]) {
      loadPlaylistTracks(selectedPlaylist.search).then(tracks => {
        setSystemTracks(prev => ({ ...prev, [selectedPlaylist.id]: tracks }));
      });
    }
  }, [selectedPlaylistId, selectedPlaylist, systemTracks, loadPlaylistTracks]);

  const activeTracks = selectedPlaylist?.id === 'liked' ? selectedPlaylist.tracks :
    (selectedPlaylist?.type === 'system' ? systemTracks[selectedPlaylist.id] || [] : selectedPlaylist?.tracks || []);

  return (
    <div className="hyde-music-container animate-fade">
      <nav className="hyde-sidebar">
        <div className="sidebar-nav">
          <div className="brand" onClick={() => setActiveView('home')} style={{ cursor: 'pointer' }}>
            <Music size={28} className="color-primary" />
            <h1>Hyde Music</h1>
          </div>
          <div className={`nav-item ${activeView === 'home' ? 'active' : ''}`} onClick={() => setActiveView('home')}>
            <Home size={24} /> <span>Home</span>
          </div>
          <div className={`nav-item ${activeView === 'search' ? 'active' : ''}`} onClick={() => setActiveView('search')}>
            <Search size={24} /> <span>Search</span>
          </div>
        </div>

        <div className="sidebar-library">
          <div className="library-header">
            <h3><Library size={24} /> <span>Your Library</span></h3>
            <Plus size={20} className="plus-btn" onClick={createPlaylist} />
          </div>
          <div className="sidebar-playlists">
            {playlists.map(pl => (
              <div
                key={pl.id}
                className={`playlist-item ${selectedPlaylistId === pl.id && activeView === 'playlist' ? 'active-bg' : ''}`}
                onClick={() => {
                  setSelectedPlaylistId(pl.id);
                  setActiveView('playlist');
                }}
              >
                <div className="playlist-art">
                  {pl.id === 'liked' ? <Heart className="text-red-500 fill-red-500" /> : <List size={24} />}
                </div>
                <div className="playlist-info">
                  <div className="playlist-name">{pl.name}</div>
                  <div className="playlist-meta">Playlist • {pl.tracks.length} songs</div>
                </div>
                {pl.type !== 'system' && (
                  <Trash2 size={16} className="text-dim hover:text-red-500" onClick={(e) => { e.stopPropagation(); removePlaylist(pl.id); }} />
                )}
              </div>
            ))}
            <div className="sidebar-divider"></div>
            {CURATED_PLAYLISTS.map(pl => (
              <div
                key={pl.id}
                className={`playlist-item ${selectedPlaylistId === pl.id && activeView === 'playlist' ? 'active-bg' : ''}`}
                onClick={() => handlePlaylistClick(pl)}
              >
                <div className="playlist-art" style={{ background: `linear-gradient(135deg, ${pl.color}, #000)` }}>
                  <Music size={18} color="white" />
                </div>
                <div className="playlist-info">
                  <div className="playlist-name">{pl.name}</div>
                  <div className="playlist-meta">Curated Playlist</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="hyde-main-content" ref={mainContentRef}>
        <header className="main-header">
          <div className="search-container" ref={suggestionsRef}>
            <Search size={20} className="search-icon" />
            <input
              className="search-input"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => { setShowSuggestions(true); setActiveView('search'); }}
              onKeyDown={(e) => e.key === 'Enter' && searchMusic(searchQuery)}
              placeholder="What do you want to listen to?"
            />
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="suggestions-box">
                  {suggestions.map((s, i) => (
                    <div key={i} className="suggestion-item" onClick={() => { setSearchQuery(s); searchMusic(s); }}>
                      <Search size={14} /> {s}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AuthButton />
        </header>

        <section className="main-section">
          <AnimatePresence mode="wait">
            {activeView === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="section-title">Good Evening</h2>
                <div className="shelf-grid-simple">
                  {playlists.concat(CURATED_PLAYLISTS.slice(0, 3)).slice(0, 6).map(pl => (
                    <div key={pl.id} className="simple-card glassy" onClick={() => handlePlaylistClick(pl)}>
                      <div className="simple-card-art" style={pl.color ? { background: `linear-gradient(135deg, ${pl.color}, #000)` } : {}}>
                        {pl.id === 'liked' ? <Heart size={20} className="text-red-500 fill-red-500" /> : <Music size={20} color="white" />}
                      </div>
                      <span>{pl.name}</span>
                      <button className="simple-play-btn"><Play fill="black" size={16} /></button>
                    </div>
                  ))}
                </div>

                {recentlyPlayed.length > 0 && (
                  <div className="shelf-section">
                    <h3 className="shelf-title">Recently Played</h3>
                    <div className="shelf-grid">
                      {recentlyPlayed.slice(0, 6).map((track) => (
                        <div key={track.id} className="shelf-card" onClick={() => playTrack(track, recentlyPlayed)}>
                          <img src={track.image} alt="" className="shelf-img" />
                          <div className="shelf-info">
                            <div className="shelf-name">{track.name}</div>
                            <div className="shelf-artist">{track.artists?.[0]}</div>
                          </div>
                          <button className="shelf-play-btn"><Play fill="black" size={20} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="shelf-section">
                  <h3 className="shelf-title">Curated For You</h3>
                  <div className="shelf-grid">
                    {CURATED_PLAYLISTS.slice(0, 6).map((pl) => (
                      <div key={pl.id} className="shelf-card" onClick={() => handlePlaylistClick(pl)}>
                        <div className="shelf-img-mock" style={{ background: `linear-gradient(135deg, ${pl.color}, #000)` }}>
                          <Music size={48} color="white" opacity={0.3} />
                        </div>
                        <div className="shelf-info">
                          <div className="shelf-name">{pl.name}</div>
                          <div className="shelf-artist">{pl.description}</div>
                        </div>
                        <button className="shelf-play-btn"><Play fill="black" size={20} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shelf-section">
                  <h3 className="shelf-title">Moods & Energy</h3>
                  <div className="shelf-grid">
                    {CURATED_PLAYLISTS.slice(6, 12).map((pl) => (
                      <div key={pl.id} className="shelf-card" onClick={() => handlePlaylistClick(pl)}>
                        <div className="shelf-img-mock" style={{ background: `linear-gradient(135deg, ${pl.color}, #000)` }}>
                          <Sparkles size={48} color="white" opacity={0.3} />
                        </div>
                        <div className="shelf-info">
                          <div className="shelf-name">{pl.name}</div>
                          <div className="shelf-artist">{pl.description}</div>
                        </div>
                        <button className="shelf-play-btn"><Play fill="black" size={20} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="section-title">{searchQuery ? `Results for "${searchQuery}"` : 'Browse All'}</h2>
                {!searchQuery && (
                  <div className="genre-grid">
                    {CURATED_PLAYLISTS.map(pl => (
                      <div key={pl.id} className="genre-card" style={{ background: pl.color }} onClick={() => handlePlaylistClick(pl)}>
                        <span>{pl.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="track-list">
                  {searchResults.map((track, i) => renderTrackItem(track, i, searchResults))}
                  {searchLoading && <PremiumLoader />}
                </div>
              </motion.div>
            )}

            {activeView === 'playlist' && selectedPlaylist && (
              <motion.div
                key={`playlist-${selectedPlaylistId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="playlist-header-detail" style={{ background: `linear-gradient(to bottom, ${selectedPlaylist.color || '#ff0000'}44 0%, transparent 100%)` }}>
                  <div className="playlist-art-large" style={selectedPlaylist.color ? { background: `linear-gradient(135deg, ${selectedPlaylist.color}, #000)` } : {}}>
                    {selectedPlaylist.id === 'liked' ? <Heart size={80} className="text-red-500 fill-red-500" /> : <Music size={80} color="white" />}
                  </div>
                  <div className="playlist-info-large">
                    <div className="playlist-label">{selectedPlaylist.type === 'system' ? 'System Curation' : 'Playlist'}</div>
                    <h1 className="playlist-name-large">{selectedPlaylist.name}</h1>
                    <div className="playlist-stats">
                      <span className="owner">Hyde Music</span> • {activeTracks.length} songs
                    </div>
                  </div>
                </div>
                <div className="track-list" style={{ marginTop: '24px' }}>
                  {searchLoading && <div style={{ textAlign: 'center', padding: '40px' }}><Sparkles className="animate-spin" /> Fetching curated beats...</div>}
                  {activeTracks.map((track, i) => renderTrackItem(track, i, activeTracks))}
                  {!searchLoading && activeTracks.length === 0 && (
                    <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '60px 0' }}>
                      <p>No tracks found for this curation.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="hyde-player-bar">
        <div className="player-left">
          {currentTrack && (
            <>
              <motion.img
                key={currentTrack.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                src={currentTrack.image}
                className="player-track-image"
                alt=""
              />
              <div className="player-track-info">
                <div className="player-track-name">{currentTrack.name}</div>
                <div className="player-track-artist">{currentTrack.artists?.[0]}</div>
              </div>
              <Heart
                size={18}
                className={`ml-4 cursor-pointer transition-colors ${playlists.find(p => p.id === 'liked')?.tracks.some(t => t.id === currentTrack.id) ? 'text-red-500 fill-red-500' : 'hover:text-white'}`}
                onClick={() => addTrackToPlaylist('liked', currentTrack)}
              />
            </>
          )}
        </div>

        <div className="player-center">
          <div className="player-controls">
            <Shuffle
              size={18}
              className={isShuffled ? 'color-primary' : 'hover:text-white'}
              onClick={() => setIsShuffled(!isShuffled)}
            />
            <SkipBack size={20} className="hover:text-white" onClick={handlePrevious} />
            <button className="play-button" onClick={togglePlayPause}>
              {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: '2px' }} />}
            </button>
            <SkipForward size={20} className="hover:text-white" onClick={handleNext} />
            <Repeat
              size={18}
              className={!isAutoplay ? 'text-dim' : 'color-primary'}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setIsAutoplay(!isAutoplay);
                showToast(isAutoplay ? "Autoplay Off" : "Autoplay On", "info");
              }}
            />
          </div>
          <div className="progress-bar-container">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              className="progress-slider"
              min="0" max={duration}
              value={currentTime}
              onChange={handleProgressChange}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end', color: 'var(--color-text-secondary)' }}>
            <Sparkles size={18} className="cursor-pointer hover:text-white" onClick={() => showToast("AI Recommendation coming soon!")} />
            <List size={18} className="cursor-pointer hover:text-white" onClick={() => showToast("Next in queue...")} />
            <div className="volume-control-wrapper">
              {isMuted || volume === 0 ? <VolumeX size={18} className="hover:text-white" onClick={() => { setIsMuted(false); playerRef.current?.setVolume(volume * 100); }} /> :
                volume < 0.3 ? <Volume2 size={18} className="hover:text-white" /> :
                  volume < 0.7 ? <Volume2 size={18} className="hover:text-white" /> :
                    <Volume2 size={18} className="hover:text-white" />}
              <input
                type="range"
                className="progress-slider mini"
                min="0" max="1" step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  playerRef.current?.setVolume(v * 100);
                  if (v > 0) setIsMuted(false);
                }}
              />
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="toast">
            {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
