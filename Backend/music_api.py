import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for all routes with specific production-ready settings
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "*"],
        "allow_headers": ["Content-Type", "X-HYDE-API-KEY"],
        "methods": ["GET", "POST", "OPTIONS"],
        "expose_headers": ["Content-Type", "X-HYDE-API-KEY"]
    }
})

# Security Configuration
HYDE_API_KEY = os.getenv("HYDE_API_KEY", "hyde-api-key-2026")

def require_api_key(f):
    def decorated(*args, **kwargs):
        # 1. Skip API key for preflight OPTIONS requests (Required for CORS)
        if request.method == "OPTIONS":
            return "", 200
            
        # 2. Check for the Hyde API Key
        api_key = request.headers.get("X-HYDE-API-KEY")
        if api_key != HYDE_API_KEY:
            logger.warning(f"Unauthorized access attempt from {request.remote_addr}")
            return jsonify({"error": "Unauthorized"}), 401
            
        return f(*args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

def format_track(entry):
    video_id = entry.get('id')
    if not video_id:
        return None
    return {
        "id": f"yt_{video_id}",
        "name": entry.get("title"),
        "title": entry.get("title"),
        "artists": [entry.get("uploader", "Unknown Artist")],
        "image": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
        "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
        "youtube_id": video_id,
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "duration": entry.get("duration", 0) * 1000,
        "source": "youtube"
    }

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Hyde Music API running"})

@app.route("/search", methods=["GET", "OPTIONS"])
@require_api_key
def search():
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400

    logger.info(f"Searching for: {query}")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            search_results = ydl.extract_info(f"ytsearch10:{query}", download=False)
            entries = search_results.get('entries', [])
            songs = [format_track(entry) for entry in entries if entry]
            songs = [s for s in songs if s]
            return jsonify(songs)
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return jsonify({"error": "Failed to search music"}), 500

@app.route("/search_music", methods=["POST", "OPTIONS"])
@require_api_key
def search_music():
    data = request.json
    query = data.get("query")
    if not query:
        return jsonify({"error": "Query is required"}), 400

    logger.info(f"Searching music for: {query}")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            search_results = ydl.extract_info(f"ytsearch10:{query}", download=False)
            entries = search_results.get('entries', [])
            tracks = [format_track(entry) for entry in entries if entry]
            tracks = [t for t in tracks if t]
            return jsonify({"tracks": tracks})
    except Exception as e:
        logger.error(f"Search music error: {str(e)}")
        return jsonify({"error": "Failed to search music"}), 500

@app.route("/suggestions", methods=["GET", "OPTIONS"])
@require_api_key
def get_suggestions():
    query = request.args.get("q", "")
    if not query:
        return jsonify([])
    
    logger.info(f"Fetching suggestions for: {query}")
    import json
    from urllib.parse import quote_plus
    try:
        # YouTube Google Suggest API
        url = f"https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=firefox&q={quote_plus(query)}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = json.loads(response.text)
            if len(data) > 1:
                return jsonify(data[1])
        return jsonify([])
    except Exception as e:
        logger.error(f"Suggestions error: {e}")
        return jsonify([])

@app.route("/stream", methods=["GET", "OPTIONS"])
@require_api_key
def stream():
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "URL parameter 'url' is required"}), 400

    logger.info(f"Extracting stream for: {url}")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return jsonify({
                "title": info.get("title"),
                "stream_url": info.get("url")
            })
    except Exception as e:
        logger.error(f"Stream extraction error: {str(e)}")
        return jsonify({"error": "Failed to extract stream"}), 500

@app.route("/trending_music", methods=["GET", "OPTIONS"])
@require_api_key
def trending_music():
    logger.info("Fetching trending music")
    try:
        with yt_dlp.YoutubeDL({'quiet': True, 'extract_flat': True, 'no_warnings': True}) as ydl:
            search_results = ydl.extract_info("ytsearch10:top trending music 2026", download=False)
            tracks = [format_track(entry) for entry in search_results.get('entries', []) if entry]
            tracks = [t for t in tracks if t]
            return jsonify({"tracks": tracks})
    except Exception as e:
        return jsonify({"tracks": []})

@app.route("/get_related_songs", methods=["POST", "OPTIONS"])
@require_api_key
def get_related_songs():
    data = request.json
    track_name = data.get("track_name", "")
    artist_name = data.get("artist_name", "")
    query = f"{track_name} {artist_name} mix"
    
    try:
        with yt_dlp.YoutubeDL({'quiet': True, 'extract_flat': True, 'no_warnings': True}) as ydl:
            search_results = ydl.extract_info(f"ytsearch8:{query}", download=False)
            tracks = [format_track(entry) for entry in search_results.get('entries', []) if entry]
            tracks = [t for t in tracks if t]
            return jsonify({"tracks": tracks, "has_more": False})
    except Exception as e:
        return jsonify({"tracks": [], "has_more": False})

@app.route("/get_ai_recommendations", methods=["POST", "OPTIONS"])
@require_api_key
def get_ai_recommendations():
    return trending_music()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
