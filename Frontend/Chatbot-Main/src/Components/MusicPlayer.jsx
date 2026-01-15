import React from 'react';

const MusicPlayer = () => {
  return (
    <div className="music-player">
      <h2>Now Playing</h2>
      <div className="song-info">
        <p>Song Title</p>
        <p>Artist Name</p>
      </div>
      <div className="controls">
        <button>Previous</button>
        <button>Play/Pause</button>
        <button>Next</button>
      </div>
    </div>
  );
};

export default MusicPlayer;
