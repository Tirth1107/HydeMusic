import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Support CORS for frontend
CORS(app)

# Security Configuration
HYDE_API_KEY = os.getenv("HYDE_API_KEY", "hyde-api-key-2026")

def require_api_key(f):
    def decorated(*args, **kwargs):
        api_key = request.headers.get("X-HYDE-API-KEY")
        if api_key != HYDE_API_KEY:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Hyde Music API running"})

@app.route("/search", methods=["GET"])
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
            # Use ytsearch to find up to 10 results
            search_results = ydl.extract_info(f"ytsearch10:{query}", download=False)
            
            songs = []
            if 'entries' in search_results:
                for entry in search_results['entries']:
                    songs.append({
                        "title": entry.get("title"),
                        "url": f"https://www.youtube.com/watch?v={entry.get('id')}",
                        "thumbnail": f"https://img.youtube.com/vi/{entry.get('id')}/hqdefault.jpg"
                    })
            
            return jsonify(songs)
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return jsonify({"error": "Failed to search music"}), 500

@app.route("/stream", methods=["GET"])
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
            stream_url = info.get("url")
            title = info.get("title")
            
            return jsonify({
                "title": title,
                "stream_url": stream_url
            })
    except Exception as e:
        logger.error(f"Stream extraction error: {str(e)}")
        return jsonify({"error": "Failed to extract stream"}), 500

if __name__ == "__main__":
    # Render uses $PORT or default to 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
