import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, Play, Pause, SkipBack, SkipForward, Music,
  Shuffle, Loader, List, Plus, Volume2, VolumeX, Check
} from "lucide-react"; // Removed Sparkles
//
// V IMPORTANT: Change this to the new CSS file name
//
import './HydeMusicPremium.css';
//
// +++ IMPORT YOUR AUTH BUTTON +++
//
import AuthButton from "./AuthButton";
import { API_BASE_URL } from "../apiConfig";


export default function HydeMusicPlayer() {
  const [showBetaPopup, setShowBetaPopup] = useState(true)
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
  const [shuffleQueue, setShuffleQueue] = useState(() => []);
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('player.currentIndex');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isShuffled, setIsShuffled] = useState(() => {
    const saved = localStorage.getItem('player.isShuffled');
    return saved ? JSON.parse(saved) : false;
  });
  const [repeatMode] = useState('off');
  const [showQueue, setShowQueue] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  const [playerReady, setPlayerReady] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  // const [isLoadingQueue, setIsLoadingQueue] = useState(false); // Removed AI state

  const playerRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

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
        if (!window.YT && !document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
          setPlayerReady(true);
        };
      }
    };
    const timer = setTimeout(initYouTubeAPI, 100);
    return () => clearTimeout(timer);
  }, []);

  // Initialize player when track changes
  useEffect(() => {
    if (currentTrack && playerReady && currentTrack.youtube_id) {
      const timer = setTimeout(() => {
        initializePlayer();
      }, 200);
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
  useEffect(() => {
    try { localStorage.setItem('player.playlist', JSON.stringify(playlist)); } catch { }
  }, [playlist]);
  useEffect(() => { localStorage.setItem('player.isShuffled', JSON.stringify(isShuffled)); }, [isShuffled]);

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
      const response = await fetch(`${API_BASE_URL}/search_music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.tracks || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      showToast("Search failed. Please try again.", "error");
    } finally {
      setSearchLoading(false);
    }
  };

  // Removed loadShuffleQueue and loadAISuggestions

  const toggleShuffle = async () => {
    const newShuffleState = !isShuffled;
    setIsShuffled(newShuffleState);

    if (!newShuffleState) {
      setShuffleQueue([]);
      setCurrentShuffleIndex(0);
      showToast("Shuffle disabled", "info");
    } else {
      showToast("Shuffle enabled", "info");
    }
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
    if (!track.youtube_id) {
      showToast("This track is not available for playback", "error");
      return;
    }
    setCurrentTrack(track);
    let trackIndex = playlist.findIndex(t => t.id === track.id);
    if (trackIndex === -1) {
      const newPlaylist = [track, ...playlist];
      setPlaylist(newPlaylist);
      trackIndex = 0;
    }
    setCurrentIndex(trackIndex);
    setIsLoading(true);
  };

  const playTrackFromSearch = (track) => {
    if (!track.youtube_id) {
      showToast("This track is not available for playback", "error");
      return;
    }
    let trackIndex = playlist.findIndex(t => t.id === track.id);
    if (trackIndex !== -1) {
      setCurrentTrack(track);
      setCurrentIndex(trackIndex);
    } else {
      const newPlaylist = [track, ...playlist];
      setPlaylist(newPlaylist);
      setCurrentTrack(track);
      setCurrentIndex(0);
    }
    setIsLoading(true);
  };

  const initializePlayer = () => {
    let container = document.getElementById('youtube-player');
    if (!container) {
      container = document.createElement('div');
      container.id = 'youtube-player';
      container.style.cssText = 'position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; z-index: -9999;';
      document.body.appendChild(container);
    }
    try {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    } catch (e) { console.warn('Player destroy failed:', e); }
    if (!currentTrack?.youtube_id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      playerRef.current = new window.YT.Player(container, {
        height: '1', width: '1', videoId: currentTrack.youtube_id,
        playerVars: {
          autoplay: 1, controls: 0, disablekb: 1, fs: 0,
          modestbranding: 1, rel: 0, showinfo: 0, start: 0,
          origin: window.location.origin, enablejsapi: 1
        },
        events: {
          onReady: (event) => {
            try {
              const duration = event.target.getDuration();
              setDuration(duration > 0 ? duration : 180);
              event.target.setVolume(Math.round(volume * 100));
              setIsLoading(false);
              event.target.playVideo();
            } catch (e) { setIsLoading(false); }
          },
          onStateChange: (event) => {
            try {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true); setIsLoading(false);
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
                      } catch (e) { console.error('Repeat error:', e); }
                    }
                  }, 100);
                } else {
                  handleNext();
                }
              } else if (event.data === window.YT.PlayerState.BUFFERING) {
                setIsLoading(true);
              }
            } catch (e) { console.error('State change error:', e); }
          },
          onError: (event) => {
            console.error('YouTube player error:', event.data);
            setIsLoading(false); setIsPlaying(false);
            showToast("Failed to load video. Trying next track...", "error");
            if (playlist.length > 1) {
              setTimeout(() => { handleNext(); }, 1000);
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
    } catch (error) { console.error('Error toggling play/pause:', error); }
  };

  const handleProgressClick = (e) => {
    if (!playerRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);
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
      if (playerRef.current) playerRef.current.setVolume(previousVolume * 100);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
      if (playerRef.current) playerRef.current.setVolume(0);
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
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 50 }}
            className="toast-notification"
          >
            <Check size={16} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BETA VERSION POPUP --- */}
      <AnimatePresence>
        {showBetaPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="beta-popup"
          >
            <div className="beta-popup-content">
              <h2>Hyde Music (Beta)</h2>
              <p>
                Hyde Music is currently in <strong>beta</strong>.
                You may experience bugs or missing features —
                we’re improving things every day.
                Thanks for supporting the project!
              </p>
              <button onClick={() => setShowBetaPopup(false)} className="close-beta-btn">
                Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="hyde-music-container">

        <nav className="hyde-sidebar">
          <div className="brand">
            {/* <Music size={32} /> */}
            <h1 style={{ color: 'green' }}>Hyde Music</h1>
            <p style={{ color: '#FF6D00' }}>By Tirth</p><span style={{ color: '#FF6D00' }}>(Beta V-1.0)</span>
            <span><warn>Please Check For Any Update On <a href="https://hyde-music.vercel.app/" target="_blank" style={{ color: '#FF6D00', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>Hyde Music</a></warn> Official Site.</span>

          </div>
          <div className="queue-header">
            <h2 style={{ color: '#FF6D00' }}>Queue ({playlist.length} tracks)</h2>
            <button style={{ color: '#FF6D00' }} onClick={() => setShowQueue(!showQueue)} className="menu-button" title={showQueue ? "Hide Queue" : "Show Queue"}>
              <List size={16} />
            </button>
          </div>

          {playlist.length === 0 && (
            <p className="empty-state" style={{ color: '#FF6D00' }}>Your queue is empty.</p>
          )}

          {showQueue && (
            <div className="track-list queue-list">
              {playlist.map((track, index) => (
                <div
                  key={`${track.id}-${index}`}
                  className={`track-item ${index === currentIndex ? 'active' : ''}`}
                  onDoubleClick={() => playTrack(track, index)}
                >
                  <div className="track-index">
                    <span className="index-number" style={{ color: '#FF6D00' }}>{index === currentIndex ? <Volume2 size={16} className="active-icon" /> : index + 1}</span>
                    <button className="play-icon-button menu-button" onClick={() => playTrack(track, index)} style={{ color: '#FF6D00' }} >
                      <Play size={16} />
                    </button>
                  </div>
                  <img
                    src={track.image || '/api/placeholder/30/30'}
                    alt={track.name}
                    className="track-image small"
                  />
                  <div className="track-info">
                    <div className="track-name">{track.name}</div>
                    <div className="track-artist">{track.artists?.join(', ') || 'Unknown Artist'}</div>
                  </div>
                  <button
                    style={{ color: '#FF6D00' }}
                    onClick={() => removeFromPlaylist(track.id)}
                    className="menu-button remove-button"
                    title="Remove from Queue"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
                <Search size={18} className="search-icon" />
                <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for music..."
                className="search-input"
                />
                {searchLoading && <Loader size={16} className="search-loader" />}
            </form>
          </div> */}

          {!playerReady && (
            <div className="player-loading">
              <Loader size={16} className="animate-spin" />
              <span style={{ color: '#FF6D00' }}>Loading Player...</span>
            </div>
          )}
        </nav>

        <main className="hyde-main-content">

          {/* +++ AUTH BUTTON INSERTED HERE +++ */}
          <header className="main-header">
            <div className="search-container">
              <form onSubmit={handleSearch} className="search-form">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for music..."
                  className="search-input"
                />
                {searchLoading && <Loader size={16} className="search-loader" />}
              </form>
            </div>
            <AuthButton />

          </header>

          <section className="main-section">
            <h2 style={{ color: '#FF6D00' }}>Search Results</h2>
            {searchLoading && <div className="full-width-loader"><Loader size={24} className="animate-spin" /></div>}

            {!searchLoading && searchResults.length === 0 && (
              <p className="empty-state" style={{ color: '#FF6D00' }}>Search for songs to get started.</p>
            )}

            <div className="track-list">
              {searchResults.map((track) => (
                <div key={track.id} className="track-item" onDoubleClick={() => playTrackFromSearch(track)}>
                  <img
                    src={track.image || '/api/placeholder/40/40'}
                    alt={track.name}
                    className="track-image"
                  />
                  <div className="track-info">
                    <div className="track-name">{track.name}</div>
                    <div className="track-artist">{track.artists?.join(', ') || 'Unknown Artist'}</div>
                    {!track.youtube_id && (
                      <div className="track-unavailable" style={{ color: '#FF6D00' }}>No playable version</div>
                    )}
                  </div>
                  <div className="track-controls">
                    <button
                      style={{ color: '#FF6D00' }}
                      onClick={() => playTrackFromSearch(track)}
                      className="menu-button"
                      title="Play"
                      disabled={!track.youtube_id}
                    >
                      <Play size={16} />
                    </button>
                    <button
                      style={{ color: '#FF6D00' }}
                      onClick={() => addToPlaylist(track)}
                      className="menu-button"
                      title="Add to Queue"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* <section className="main-section">
             <div className="queue-header">
                <h2 style={{ color: '#FF6D00' }}>Queue ({playlist.length} tracks)</h2>
                <button style={{ color: '#FF6D00' }} onClick={() => setShowQueue(!showQueue)} className="menu-button" title={showQueue ? "Hide Queue" : "Show Queue"}>
                  <List size={16} />
                </button>
             </div>

            {playlist.length === 0 && (
                <p className="empty-state" style={{ color: '#FF6D00' }}>Your queue is empty.</p>
            )}

            {showQueue && (
                <div className="track-list queue-list">
                {playlist.map((track, index) => (
                  <div 
                    key={`${track.id}-${index}`} 
                    className={`track-item ${index === currentIndex ? 'active' : ''}`}
                    onDoubleClick={() => playTrack(track, index)}
                  >
                    <div className="track-index">
                        <span className="index-number" style={{ color: '#FF6D00' }}>{index === currentIndex ? <Volume2 size={16} className="active-icon" /> : index + 1}</span>
                        <button className="play-icon-button menu-button" onClick={() => playTrack(track, index)} style={{ color: '#FF6D00' }} >
                            <Play size={16} />
                        </button>
                    </div>
                    <img 
                      src={track.image || '/api/placeholder/30/30'} 
                      alt={track.name}
                      className="track-image small"
                    />
                    <div className="track-info">
                      <div className="track-name">{track.name}</div>
                      <div className="track-artist">{track.artists?.join(', ') || 'Unknown Artist'}</div>
                    </div>
                    <button 
                      style={{ color: '#FF6D00' }}
                      onClick={() => removeFromPlaylist(track.id)}
                      className="menu-button remove-button"
                      title="Remove from Queue"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section> */}

        </main>

        <footer className="hyde-player-bar">

          <div className="player-left">
            {currentTrack && (
              <>
                <img
                  src={currentTrack.image || '/api/placeholder/60/60'}
                  alt={currentTrack.name}
                  className="player-track-image"
                />
                <div className="player-track-info">
                  <div className="player-track-name">{currentTrack.name}</div>
                  <div className="player-track-artist">{currentTrack.artists?.join(', ') || 'Unknown Artist'}</div>
                </div>
              </>
            )}
          </div>

          <div className="player-center">
            <div className="player-controls">
              <button
                type="button"
                onClick={toggleShuffle}
                className={`menu-button ${isShuffled ? 'active' : ''}`}
                title="Shuffle queue"
              >
                <Shuffle size={16} />
              </button>
              <button type="button" onClick={handlePrevious} className="menu-button" title="Previous">
                <SkipBack size={18} />
              </button>

              <button
                type="button"
                onClick={togglePlayPause}
                className="menu-button play-button"
                disabled={isLoading || !currentTrack?.youtube_id}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? <Loader size={24} className="animate-spin" /> : isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              <button type="button" onClick={handleNext} className="menu-button" title="Next">
                <SkipForward size={18} />
              </button>
            </div>

            <div className="progress-bar-container">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 1}
                value={currentTime}
                step="1"
                ref={progressRef}
                className="progress-slider"
                onChange={(e) => setCurrentTime(e.target.value)}
                onMouseUp={handleProgressClick}
                onTouchEnd={handleProgressClick}
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="player-right">
            <button type="button" onClick={toggleMute} className="menu-button">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              ref={volumeRef}
            />
          </div>

        </footer>
      </div>
    </>
  );
}