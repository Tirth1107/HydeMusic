import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Play, Pause, SkipBack, SkipForward, Music, Shuffle, Loader, List, Plus, Volume2, VolumeX, Check, Sparkles } from "lucide-react";
import { apiFetch, transformTrack } from "../api/client";

const PremiumLoader = () => (
  <div className="premium-loader">
    <span></span><span></span><span></span><span></span><span></span>
  </div>
);

export default function Sidebar({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(() => {
    try {
      const saved = localStorage.getItem('player.currentTrack');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState(() => {
    try {
      const saved = localStorage.getItem('player.playlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [shuffleQueue, setShuffleQueue] = useState(() => []); // deprecated; AI suggestions fill playlist directly
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('player.currentIndex');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isShuffled, setIsShuffled] = useState(() => {
    const saved = localStorage.getItem('player.isShuffled');
    return saved ? JSON.parse(saved) : false;
  });
  const [repeatMode, setRepeatMode] = useState('off');
  const [showQueue, setShowQueue] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  const [playerReady, setPlayerReady] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [queuePage, setQueuePage] = useState(0);
  const [hasMoreSongs, setHasMoreSongs] = useState(true);

  const playerRef = useRef(null);
  const progressRef = useRef(null);

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Initialize YouTube API when component mounts
  useEffect(() => {
    const initYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        setPlayerReady(true);
      } else {
        // Load YouTube API if not already loaded
        if (!window.YT && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Set up callback
        window.onYouTubeIframeAPIReady = () => {
          setPlayerReady(true);
        };
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initYouTubeAPI, 100);
    return () => clearTimeout(timer);
  }, []);

  // Initialize player when track changes
  useEffect(() => {
    if (currentTrack && playerReady && currentTrack.youtube_id) {
      const timer = setTimeout(() => {
        initializePlayer();
      }, 200); // Small delay to prevent race conditions
      return () => clearTimeout(timer);
    }
  }, [currentTrack, playerReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
          playerRef.current = null;
        }
        // Clean up container
        const container = document.getElementById('youtube-player');
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      } catch (e) {
        console.warn('Player cleanup failed during unmount:', e);
      }
    };
  }, []);

  // Persist core player state
  useEffect(() => {
    try { localStorage.setItem('player.currentTrack', JSON.stringify(currentTrack)); } catch { }
  }, [currentTrack]);
  useEffect(() => { localStorage.setItem('player.currentIndex', String(currentIndex)); }, [currentIndex]);
  // currentShuffleIndex no longer persisted
  useEffect(() => {
    try { localStorage.setItem('player.playlist', JSON.stringify(playlist)); } catch { /* empty */ }
  }, [playlist]);
  // shuffleQueue no longer persisted
  useEffect(() => { localStorage.setItem('player.isShuffled', JSON.stringify(isShuffled)); }, [isShuffled]);
  // repeatMode removed from UI; keep value static

  // Update progress
  useEffect(() => {
    let interval;
    if (isPlaying && !isSeeking) {
      interval = setInterval(() => {
        try {
          const time = playerRef.current.getCurrentTime();
          if (time !== undefined) {
            setCurrentTime(time);
          }
        } catch (error) {
          console.error('Error getting current time:', error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isSeeking]);

  const searchMusic = async (query) => {
    if (!query.trim()) return;

    setSearchLoading(true);
    try {
      let response = await apiFetch('/search_music', {
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
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      showToast("Search failed. Please try again.", "error");
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchRelatedSongs = async (trackName, artistName, page = 0, limit = 5) => {
    try {
      const response = await apiFetch('/get_related_songs', {
        method: 'POST',
        body: JSON.stringify({
          track_name: trackName,
          artist_name: artistName,
          page: page,
          limit: limit
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch related songs');

      const data = await response.json();
      return {
        tracks: data.tracks?.filter(song => song.youtube_id) || [],
        hasMore: data.has_more || false,
        totalAvailable: data.total_available || 0
      };
    } catch (error) {
      console.error('Related songs error:', error);
      return { tracks: [], hasMore: false, totalAvailable: 0 };
    }
  };

  const loadShuffleQueue = async (trackName, artistName) => {
    setIsLoadingQueue(true);
    try {
      const response = await apiFetch('/get_ai_recommendations', {
        method: 'POST',
        body: JSON.stringify({
          song_name: trackName || currentTrack?.name || '',
          artist_name: artistName || (currentTrack?.artists ? currentTrack.artists[0] : '') || ''
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch AI recommendations');

      const data = await response.json();
      const aiRecommendations = data.tracks || [];

      // Merge into visible playlist (unique)
      setPlaylist(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const merged = [...prev];
        aiRecommendations.forEach(t => { if (t && t.id && !existingIds.has(t.id)) merged.push(t); });
        return merged;
      });
      setHasMoreSongs(false);

      // Show success message with AI indication
      showToast(`AI recommendations ready with ${aiRecommendations.length} songs!`, "success");
      return aiRecommendations;
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      showToast("Failed to load AI recommendations", "error");
      return [];
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const toggleShuffle = async () => {
    const newShuffleState = !isShuffled;
    setIsShuffled(newShuffleState);

    if (!newShuffleState) {
      setShuffleQueue([]);
      setCurrentShuffleIndex(0);
      showToast("Shuffle disabled", "info");
    }
  };

  const loadAISuggestions = async () => {
    if (!currentTrack) {
      showToast("Play a song first to get AI suggestions", "info");
      return;
    }
    // Load AI suggestions without interrupting current playback
    await loadShuffleQueue(currentTrack.name, currentTrack.artists[0]);
  };

  const handleNext = () => {
    const totalTracks = playlist.length;
    if (totalTracks === 0) return;
    if (isShuffled) {
      let nextIndex = currentIndex;
      if (totalTracks > 1) {
        while (nextIndex === currentIndex) {
          nextIndex = Math.floor(Math.random() * totalTracks);
        }
      }
      setCurrentIndex(nextIndex);
      setCurrentTrack(playlist[nextIndex]);
      return;
    }
    const nextIndex = (currentIndex + 1) % totalTracks;
    setCurrentIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
  };

  const handlePrevious = () => {
    const totalTracks = playlist.length;
    if (totalTracks === 0) return;
    if (isShuffled) {
      let prevIndex = currentIndex;
      if (totalTracks > 1) {
        while (prevIndex === currentIndex) {
          prevIndex = Math.floor(Math.random() * totalTracks);
        }
      }
      setCurrentIndex(prevIndex);
      setCurrentTrack(playlist[prevIndex]);
      return;
    }
    const prevIndex = currentIndex === 0 ? totalTracks - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchMusic(searchQuery);
  };

  const playTrack = (track, index = 0) => {
    console.log('Playing track:', track.name, 'YouTube ID:', track.youtube_id);

    if (!track.youtube_id) {
      console.warn('No YouTube ID available for track:', track.name);
      showToast("This track is not available for playback", "error");
      return;
    }

    setCurrentTrack(track);
    setCurrentIndex(index);
    setIsLoading(true);

    if (!playlist.find(t => t.id === track.id)) {
      setPlaylist(prev => [...prev, track]);
    }
  };

  const initializePlayer = () => {
    // Create container completely outside React's DOM tree
    let container = document.getElementById('youtube-player');
    if (!container) {
      container = document.createElement('div');
      container.id = 'youtube-player';
      container.style.cssText = 'position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; z-index: -9999;';
      // Append directly to body, not to any React-managed element
      document.body.appendChild(container);
    }

    // Destroy previous player safely
    try {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    } catch (e) {
      console.warn('Player destroy failed:', e);
    }

    // Ensure we have a valid YouTube ID
    if (!currentTrack?.youtube_id) {
      console.warn('No YouTube ID available for track:', currentTrack?.name);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      playerRef.current = new window.YT.Player(container, {
        height: '1',
        width: '1',
        videoId: currentTrack.youtube_id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          start: 0,
          origin: window.location.origin,
          enablejsapi: 1
        },
        events: {
          onReady: (event) => {
            console.log('YouTube player ready');
            try {
              const duration = event.target.getDuration();
              setDuration(duration > 0 ? duration : 180);
              event.target.setVolume(Math.round(volume * 100));
              setIsLoading(false);
              event.target.playVideo();
            } catch (e) {
              console.error('Player ready error:', e);
              setIsLoading(false);
            }
          },
          onStateChange: (event) => {
            try {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                setIsLoading(false);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                if (repeatMode === 'one') {
                  setTimeout(() => {
                    if (playerRef.current) {
                      try {
                        playerRef.current.seekTo(0);
                        playerRef.current.playVideo();
                        setCurrentTime(0);
                      } catch (e) {
                        console.error('Repeat error:', e);
                      }
                    }
                  }, 100);
                } else if (repeatMode === 'all') {
                  handleNext();
                } else {
                  const totalTracks = playlist.length;
                  const currentIdx = currentIndex;

                  if (currentIdx < totalTracks - 1) {
                    handleNext();
                  } else {
                    setIsPlaying(false);
                  }
                }
              } else if (event.data === window.YT.PlayerState.BUFFERING) {
                setIsLoading(true);
              }
            } catch (e) {
              console.error('State change error:', e);
            }
          },
          onError: (event) => {
            console.error('YouTube player error:', event.data);
            setIsLoading(false);
            setIsPlaying(false);
            showToast("Failed to load video. Trying next track...", "error");

            const totalTracks = playlist.length;
            if (totalTracks > 1) {
              setTimeout(() => {
                handleNext();
              }, 1000);
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize YouTube player:', error);
      setIsLoading(false);
      showToast("YouTube player initialization failed", "error");
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleProgressClick = (e) => {
    if (!playerRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);

    const modeMessages = {
      'off': 'Repeat disabled',
      'all': 'Repeat all enabled',
      'one': 'Repeat one enabled'
    };
    showToast(modeMessages[nextMode], "info");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addToPlaylist = (track) => {
    if (!playlist.find(t => t.id === track.id)) {
      setPlaylist(prev => [...prev, track]);
      showToast(`"${track.name}" added to queue!`, "success");
    } else {
      showToast(`"${track.name}" is already in queue`, "info");
    }
  };

  const removeFromPlaylist = (trackId) => {
    setPlaylist(prev => prev.filter(t => t.id !== trackId));
    showToast("Track removed from queue", "info");
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
      if (playerRef.current) {
        playerRef.current.setVolume(previousVolume * 100);
      }
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
      if (playerRef.current) {
        playerRef.current.setVolume(0);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume * 100);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 50 }}
            className="toast-notification"
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1000,
              background: toast.type === 'error'
                ? 'linear-gradient(135deg, #dc2626, #991b1b)'
                : toast.type === 'info'
                  ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                  : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              maxWidth: '300px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Check size={16} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-backdrop"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: 420 }}
        animate={{ x: isOpen ? 0 : 420 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sidebar"
      >
        {/* Header */}
        <div className="sidebar-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Music size={20} />
              Music Player
              {!playerReady && <span style={{ fontSize: '0.7rem', color: '#888' }}>(Loading...)</span>}
            </h3>
            <button onClick={onClose} className="menu-button">
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for music..."
              className="search-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="menu-button" disabled={searchLoading}>
              {searchLoading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </form>
        </div>

        {/* Current Track */}
        {currentTrack && (
          <div className="sidebar-section">
            <h3>Now Playing</h3>
            <div className="current-track">
              <img
                src={currentTrack.image || '/api/placeholder/60/60'}
                alt={currentTrack.name}
                style={{ width: '60px', height: '60px', borderRadius: '8px' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentTrack.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentTrack.artists?.join(', ') || 'Unknown Artist'}
                </div>
                {!currentTrack.youtube_id && (
                  <div style={{ fontSize: '0.75rem', color: '#ff6b6b', marginTop: '4px' }}>
                    No playable version found
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div
              ref={progressRef}
              className="progress-bar"
              onClick={handleProgressClick}
              style={{
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                cursor: 'pointer',
                margin: '1rem 0'
              }}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#7c3aed',
                  borderRadius: '2px',
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  transition: isSeeking ? 'none' : 'width 0.1s ease'
                }}
              />
            </div>

            {/* Time Display */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
              <button
                type="button"
                onClick={toggleShuffle}
                className={`menu-button ${isShuffled ? 'active' : ''}`}
                disabled={isLoadingQueue}
                style={{ opacity: isLoadingQueue ? 0.5 : 1 }}
                title="Shuffle queue"
              >
                {isLoadingQueue ? <Loader size={16} className="animate-spin" /> : <Shuffle size={16} />}
              </button>
              <button type="button" onClick={handlePrevious} className="menu-button" title="Previous">
                <SkipBack size={16} />
              </button>
              <button
                type="button"
                onClick={togglePlayPause}
                className="menu-button"
                disabled={isLoading || !currentTrack?.youtube_id}
                style={{ opacity: (!currentTrack?.youtube_id) ? 0.5 : 1 }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? <Loader size={20} className="animate-spin" /> : isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button type="button" onClick={handleNext} className="menu-button" title="Next">
                <SkipForward size={16} />
              </button>
              <button
                type="button"
                onClick={loadAISuggestions}
                className="menu-button"
                title="This button is used to add 25 songs by ai suggession from the song which is currently playing"
                disabled={isLoadingQueue}
                style={{ opacity: isLoadingQueue ? 0.6 : 1 }}
              >
                {isLoadingQueue ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
              </button>
            </div>

            {/* Volume Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button type="button" onClick={toggleMute} className="menu-button">
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '0.75rem', minWidth: '30px' }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="sidebar-section">
            <h3>Search Results</h3>
            {searchLoading && <PremiumLoader />}
            <div className="search-results">
              {searchResults.map((track, index) => (
                <div key={track.id} className="track-item">
                  <img
                    src={track.image || '/api/placeholder/40/40'}
                    alt={track.name}
                    style={{ width: '40px', height: '40px', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.artists?.join(', ') || 'Unknown Artist'}
                    </div>
                    {!track.youtube_id && (
                      <div style={{ fontSize: '0.65rem', color: '#ff9800' }}>
                        No playable version
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => playTrack(track, index)}
                      className="menu-button"
                      style={{
                        padding: '0.25rem',
                        opacity: track.youtube_id ? 1 : 0.5
                      }}
                      disabled={!track.youtube_id}
                    >
                      <Play size={14} />
                    </button>
                    <button
                      onClick={() => addToPlaylist(track)}
                      className="menu-button"
                      style={{ padding: '0.25rem' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Queue */}
        {playlist.length > 0 && (
          <div className="sidebar-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>
                Queue ({playlist.length} tracks)
                {isLoadingQueue && (
                  <span style={{ fontSize: '0.7rem', color: '#7c3aed', marginLeft: '8px' }}>
                    <Loader size={12} className="animate-spin" style={{ display: 'inline', marginRight: '4px' }} />
                    loading...
                  </span>
                )}
              </h3>
              <button onClick={() => setShowQueue(!showQueue)} className="menu-button">
                <List size={16} />
              </button>
            </div>

            {showQueue && (
              <div className="queue-list">
                {playlist.map((track, index) => (
                  <div
                    key={`${track.id}-${index}`}
                    className={`track-item ${index === currentIndex ? 'active' : ''}`}
                  >
                    <img
                      src={track.image || '/api/placeholder/30/30'}
                      alt={track.name}
                      style={{ width: '30px', height: '30px', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '500', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {track.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {track.artists?.join(', ') || 'Unknown Artist'}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromPlaylist(track.id)}
                      className="menu-button"
                      style={{ padding: '0.25rem' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
}
