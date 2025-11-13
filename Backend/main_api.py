from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import ollama
import logging
import json
import time
from base64 import b64encode
import requests
import os
from dotenv import load_dotenv
import urllib.parse
import re
from functools import lru_cache
import urllib3
from urllib.parse import quote_plus
from concurrent.futures import ThreadPoolExecutor, as_completed

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define the prompt template
templet = """
You are a friendly and knowledgeable AI assistant. 
Your goal is to provide a clear, detailed, and well-structured answer.

Conversation History:
{context}

User Question:
{question}

Instructions for your response:
- Give a thorough and detailed explanation, not just a short answer.  
- Break down complex concepts into simple, easy-to-understand steps.  
- Use examples, analogies, or comparisons if helpful.  
- Format your response with bullet points, numbered lists, or short paragraphs for readability.  
- If the question allows, provide additional insights, best practices, or tips.  
- Be polite, supportive, and encouraging in tone.  

Assistant Answer:
"""


# Dynamic music data based on search queries
MUSIC_DATABASE = {
    "trending": [
        {
            "name": "Flowers",
            "artists": ["Miley Cyrus"],
            "album": "Endless Summer Vacation",
            "image": "https://img.youtube.com/vi/G7KNmW9a75Y/hqdefault.jpg",
            "youtube_id": "G7KNmW9a75Y",
            "duration": 200000,
            "source": "youtube"
        },
        {
            "name": "Anti-Hero",
            "artists": ["Taylor Swift"],
            "album": "Midnights",
            "image": "https://img.youtube.com/vi/b1kbLWvqugk/hqdefault.jpg",
            "youtube_id": "b1kbLWvqugk",
            "duration": 201000,
            "source": "youtube"
        },
        {
            "name": "As It Was",
            "artists": ["Harry Styles"],
            "album": "Harry's House",
            "image": "https://img.youtube.com/vi/H5v3kku4y6Q/hqdefault.jpg",
            "youtube_id": "H5v3kku4y6Q",
            "duration": 167000,
            "source": "youtube"
        }
    ],
    "chill": [
        {
            "name": "Lofi Hip Hop Radio",
            "artists": ["ChilledCow"],
            "album": "Lofi Collection",
            "image": "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg",
            "youtube_id": "jfKfPfyJRdk",
            "duration": 3600000,
            "source": "youtube"
        },
        {
            "name": "Weightless",
            "artists": ["Marconi Union"],
            "album": "Ambient Works",
            "image": "https://img.youtube.com/vi/UfcAVejslrU/hqdefault.jpg",
            "youtube_id": "UfcAVejslrU",
            "duration": 485000,
            "source": "youtube"
        },
        {
            "name": "River Flows in You",
            "artists": ["Yiruma"],
            "album": "First Love",
            "image": "https://img.youtube.com/vi/7maJOI3QMu0/hqdefault.jpg",
            "youtube_id": "7maJOI3QMu0",
            "duration": 180000,
            "source": "youtube"
        }
    ],
    "coding": [
        {
            "name": "Synthwave Programming Mix",
            "artists": ["The Midnight"],
            "album": "Coding Beats",
            "image": "https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg",
            "youtube_id": "4xDzrJKXOOY",
            "duration": 3600000,
            "source": "youtube"
        },
        {
            "name": "Focus Flow",
            "artists": ["Brain.fm"],
            "album": "Deep Work",
            "image": "https://img.youtube.com/vi/kgx4WGK0oNU/hqdefault.jpg",
            "youtube_id": "kgx4WGK0oNU",
            "duration": 1800000,
            "source": "youtube"
        },
        {
            "name": "Cyberpunk 2077 OST",
            "artists": ["Marcin Przybyłowicz"],
            "album": "Game Soundtrack",
            "image": "https://img.youtube.com/vi/P4kemWzNcx4/hqdefault.jpg",
            "youtube_id": "P4kemWzNcx4",
            "duration": 240000,
            "source": "youtube"
        }
    ],
    "popular": [
        {
            "name": "Blinding Lights",
            "artists": ["The Weeknd"],
            "album": "After Hours",
            "image": "https://img.youtube.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
            "youtube_id": "4NRXx6U8ABQ",
            "duration": 200000,
            "source": "youtube"
        },
        {
            "name": "Shape of You",
            "artists": ["Ed Sheeran"],
            "album": "÷ (Divide)",
            "image": "https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg",
            "youtube_id": "JGwWNGJdvx8",
            "duration": 233000,
            "source": "youtube"
        },
        {
            "name": "Bad Guy",
            "artists": ["Billie Eilish"],
            "album": "When We All Fall Asleep, Where Do We Go?",
            "image": "https://img.youtube.com/vi/DyDfgMOUjCI/hqdefault.jpg",
            "youtube_id": "DyDfgMOUjCI",
            "duration": 194000,
            "source": "youtube"
        }
    ]
}

def search_youtube_music(query, limit=5):
    """Search YouTube for any music using web scraping"""
    try:
        logger.info(f"Searching YouTube for: {query}")
        
        # Clean and encode the search query
        search_query = f"{query} music"
        encoded_query = quote_plus(search_query)
        search_url = f"https://www.youtube.com/results?search_query={encoded_query}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        response = requests.get(search_url, headers=headers, timeout=10, verify=False)
        logger.info(f"YouTube response status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text
            logger.info(f"Response content length: {len(content)}")
            
            # Multiple regex patterns to catch different YouTube formats
            patterns = [
                r'"videoId":"([a-zA-Z0-9_-]{11})"[^}]*"title":\{"runs":\[\{"text":"([^"]+)"[^}]*\}[^}]*"lengthText":\{"simpleText":"([^"]+)"',
                r'"videoId":"([a-zA-Z0-9_-]{11})"[^}]*"title":\{"simpleText":"([^"]+)"[^}]*"lengthText":\{"simpleText":"([^"]+)"',
                r'"videoId":"([a-zA-Z0-9_-]{11})".*?"text":"([^"]+)".*?"lengthText".*?"simpleText":"([^"]+)"',
                r'{"videoId":"([a-zA-Z0-9_-]{11})".*?"title":{"runs":\[{"text":"([^"]+)"}.*?"lengthText":{"simpleText":"([^"]+)"}',
            ]
            
            results = []
            seen_video_ids = set()  # Track seen video IDs to prevent duplicates
            
            for pattern in patterns:
                matches = re.findall(pattern, content, re.DOTALL)
                logger.info(f"Pattern found {len(matches)} matches")
                
                if matches:
                    for i, match in enumerate(matches):
                        if len(match) >= 3 and len(results) < limit:
                            video_id, title, duration = match[0], match[1], match[2]
                            
                            # Skip if we've already seen this video ID
                            if video_id in seen_video_ids:
                                continue
                            seen_video_ids.add(video_id)
                            
                            # Clean title
                            clean_title = title.replace('\\u0026', '&').replace('\\"', '"').replace('\\/', '/').replace('\\u003c', '<').replace('\\u003e', '>')
                            
                            # Enhanced artist and song extraction with better logic
                            artist = "Unknown Artist"
                            song_name = clean_title
                            
                            logger.info(f"Processing title: {clean_title}")
                            
                            # Improved parsing logic with multiple strategies
                            if ' - ' in clean_title:
                                parts = clean_title.split(' - ', 1)
                                if len(parts) == 2:
                                    # Check which part is more likely to be the song
                                    first_part = parts[0].strip()
                                    second_part = parts[1].strip()
                                    
                                    # If first part contains query, it's likely the song
                                    if query.lower() in first_part.lower():
                                        song_name = first_part
                                        artist = second_part
                                    else:
                                        artist = first_part
                                        song_name = second_part
                                    logger.info(f"Parsed with ' - ': artist={artist}, song={song_name}")
                            elif ' | ' in clean_title:
                                parts = clean_title.split(' | ')
                                if len(parts) >= 2:
                                    # First part is usually the song, second is artist
                                    song_name = parts[0].strip()
                                    artist = parts[1].strip()
                                    logger.info(f"Parsed with ' | ': artist={artist}, song={song_name}")
                            elif ' by ' in clean_title.lower():
                                by_index = clean_title.lower().find(' by ')
                                if by_index != -1:
                                    song_name = clean_title[:by_index].strip()
                                    artist = clean_title[by_index + 4:].strip()
                                    logger.info(f"Parsed with ' by ': artist={artist}, song={song_name}")
                            elif '(' in clean_title and ')' in clean_title:
                                # Extract artist from parentheses if present
                                paren_match = re.search(r'\(([^)]+)\)', clean_title)
                                if paren_match:
                                    potential_artist = paren_match.group(1).strip()
                                    if not any(word in potential_artist.lower() for word in ['official', 'video', 'audio', 'lyrics', 'music', 'ft', 'feat']):
                                        artist = potential_artist
                                        song_name = clean_title.replace(f'({potential_artist})', '').strip()
                                        logger.info(f"Parsed with parentheses: artist={artist}, song={song_name}")
                            
                            # Additional fallback: try to extract from common patterns
                            if artist == "Unknown Artist":
                                # Try patterns like "Artist Name - Song Title (Official Video)"
                                title_patterns = [
                                    r'^([^-]+)\s*-\s*([^(]+)',  # Artist - Song
                                    r'^([^|]+)\s*\|\s*([^(]+)',  # Artist | Song
                                    r'([^-]+)\s*-\s*(.+)',      # Fallback Artist - Song
                                ]
                                
                                for pattern in title_patterns:
                                    match = re.match(pattern, clean_title)
                                    if match:
                                        potential_artist = match.group(1).strip()
                                        potential_song = match.group(2).strip()
                                        
                                        # Validate that it's not just metadata
                                        if not any(word in potential_artist.lower() for word in ['official', 'video', 'audio', 'lyrics', 'hd', '4k']):
                                            artist = potential_artist
                                            song_name = potential_song
                                            logger.info(f"Parsed with regex pattern: artist={artist}, song={song_name}")
                                            break
                            
                            # Final fallback: use query as song name if no good parsing found
                            if artist == "Unknown Artist" and query:
                                song_name = query
                                # Try to extract artist from remaining title
                                remaining = clean_title.replace(query, '').strip()
                                if remaining and len(remaining) > 2:
                                    # Clean up common prefixes/suffixes
                                    remaining = re.sub(r'^[-|•·\s]+|[-|•·\s]+$', '', remaining)
                                    if remaining and not any(word in remaining.lower() for word in ['official', 'video', 'audio', 'lyrics', 'music']):
                                        artist = remaining
                                        logger.info(f"Fallback parsing: artist={artist}, song={song_name}")
                            
                            # Ensure we always have an artist name
                            if not artist or artist.strip() == "":
                                artist = "Unknown Artist"
                            
                            # Clean up common suffixes from song names
                            suffixes_to_remove = [
                                '(Official Video)', '(Official Audio)', '(Official Music Video)',
                                '(Lyrics)', '(Lyric Video)', '[Official Video]', '[Official Audio]',
                                '- Official Video', '- Official Audio', '| Official Video',
                                '(Full Video)', '(HD)', '[HD]', '(4K)', '[4K]', '(Official)'
                            ]
                            for suffix in suffixes_to_remove:
                                if suffix in song_name:
                                    song_name = song_name.replace(suffix, '').strip()
                            
                            # Calculate relevance score for sorting
                            relevance_score = 0
                            query_lower = query.lower()
                            song_lower = song_name.lower()
                            artist_lower = artist.lower()
                            
                            # Exact match gets highest score
                            if query_lower == song_lower:
                                relevance_score = 100
                            elif query_lower in song_lower:
                                relevance_score = 80
                            elif any(word in song_lower for word in query_lower.split()):
                                relevance_score = 60
                            elif query_lower in artist_lower:
                                relevance_score = 40
                            else:
                                relevance_score = 20
                            
                            # Parse duration
                            duration_seconds = 180  # Default
                            if ':' in duration:
                                try:
                                    time_parts = duration.split(':')
                                    if len(time_parts) == 2:
                                        duration_seconds = int(time_parts[0]) * 60 + int(time_parts[1])
                                    elif len(time_parts) == 3:
                                        duration_seconds = int(time_parts[0]) * 3600 + int(time_parts[1]) * 60 + int(time_parts[2])
                                except:
                                    duration_seconds = 180
                            
                            results.append({
                                "id": f"youtube_{video_id}",
                                "name": song_name,
                                "artists": [artist],
                                "album": "YouTube Music",
                                "image": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                                "youtube_id": video_id,
                                "duration": duration_seconds * 1000,
                                "source": "youtube",
                                "relevance_score": relevance_score
                            })
                    
                    if results:
                        break
            
            # Sort by relevance score (highest first)
            results.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            
            # Remove relevance_score from final results
            for result in results:
                result.pop('relevance_score', None)
            
            if results:
                logger.info(f"Successfully found {len(results)} unique tracks, sorted by relevance")
                return results
            else:
                logger.warning("No tracks found with any pattern, trying fallback search")
                # Fallback: simpler search without duration
                simple_pattern = r'"videoId":"([a-zA-Z0-9_-]{11})"'
                video_ids = re.findall(simple_pattern, content)
                
                if video_ids:
                    fallback_results = []
                    seen_fallback_ids = set()
                    for i, video_id in enumerate(video_ids[:limit]):
                        if video_id not in seen_fallback_ids:
                            seen_fallback_ids.add(video_id)
                            fallback_results.append({
                                "id": f"youtube_{video_id}",
                                "name": f"Search Result {len(fallback_results)+1}",
                                "artists": ["YouTube"],
                                "album": "Search Results",
                                "image": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                                "youtube_id": video_id,
                                "duration": 180000,
                                "source": "youtube"
                            })
                    logger.info(f"Fallback search found {len(fallback_results)} unique video IDs")
                    return fallback_results
        
        logger.error("All search methods failed")
        return []
        
    except Exception as e:
        logger.error(f"YouTube search failed with error: {e}")
        return []

def get_trending_music():
    """Get trending music"""
    return MUSIC_DATABASE['trending']

# Flask App
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5001", "http://127.0.0.1:5001"], 
     allow_headers=["Content-Type", "Authorization"], 
     methods=["GET", "POST", "OPTIONS"])  # Enable CORS for all routes

# Store conversation history per session
conversation_history = {}

@app.route("/search_music", methods=["POST", "OPTIONS"])
def search_music():
    if request.method == "OPTIONS":
        return "", 200
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        logger.info(f"Searching YouTube Music for: {query}")
        
        # Search YouTube Music
        results = search_youtube_music(query, limit=5)
        
        logger.info(f"Found {len(results)} tracks")
        logger.info(f"Returning tracks: {[track['name'] for track in results]}")
        
        return jsonify({"tracks": results})
        
    except Exception as e:
        logger.error(f"Music search error: {e}")
        return jsonify({"error": "Failed to search music"}), 500

@app.route("/trending_music", methods=["GET"])
def trending_music():
    try:
        logger.info("Fetching trending music")
        results = get_trending_music()
        return jsonify({"tracks": results})
    except Exception as e:
        logger.error(f"Trending music error: {e}")
        return jsonify({"error": "Failed to fetch trending music"}), 500

@app.route("/search", methods=["GET"])
def search_tracks():
    try:
        query = request.args.get("q")
        if not query:
            logger.error("No query parameter provided")
            return jsonify({"error": "Query parameter 'q' is required"}), 400
        
        # Search YouTube Music
        results = search_youtube_music(query, limit=5)
        
        logger.info(f"Found {len(results)} tracks")
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Music search error: {e}")
        return jsonify({"error": "Failed to search music"}), 500

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400

        session_id = data.get("session_id", "default")
        user_input = data.get("question", "")

        if not user_input:
            return jsonify({"error": "No question provided"}), 400

        logger.info(f"Received request - Session: {session_id}, Question: {user_input}")

        if session_id not in conversation_history:
            conversation_history[session_id] = ""

        # Current context
        context = conversation_history[session_id]

        # Create prompt with context
        prompt = f"""
You are a friendly and knowledgeable AI assistant. 
Your goal is to provide a clear, detailed, and well-structured answer.

Conversation History:
{context}

User Question:
{user_input}

Instructions for your response:
- Give a thorough and detailed explanation, not just a short answer.  
- Break down complex concepts into simple, easy-to-understand steps.  
- Use examples, analogies, or comparisons if helpful.  
- Format your response with bullet points, numbered lists, or short paragraphs for readability.  
- If the question allows, provide additional insights, best practices, or tips.  
- Be polite, supportive, and encouraging in tone.  

Assistant Answer:
"""

        # Initialize model and get response
        try:
            response = ollama.chat(
                model='qwen2.5-coder:7b',
                messages=[{
                    'role': 'user',
                    'content': prompt
                }]
            )
            
            result = response['message']['content']
            
            # Update context
            conversation_history[session_id] += f"User: {user_input}\nBot: {result}\n"
            
            logger.info(f"Generated response for session {session_id}")
            
            return jsonify({
                "session_id": session_id,
                "user": user_input,
                "bot": str(result)
            })
            
        except Exception as e:
            logger.error(f"Error with Ollama model: {str(e)}")
            return jsonify({
                "error": "Model error",
                "details": str(e),
                "bot": "I'm sorry, I'm having trouble processing your request right now. Please make sure the Ollama service is running with the Qwen2.5-Coder model."
            }), 500
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500

@app.route("/chat/stream", methods=["POST", "OPTIONS"])
def chat_stream():
    if request.method == "OPTIONS":
        return "", 200
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400

        session_id = data.get("session_id", "default")
        user_input = data.get("question", "")
        has_image = data.get("has_image", False)
        image_data = data.get("image", None)

        if not user_input and not has_image:
            return jsonify({"error": "No question or image provided"}), 400

        logger.info(f"Received streaming request - Session: {session_id}, Question: {user_input}, Has Image: {has_image}")
        
        # Debug image data
        if has_image and image_data:
            logger.info(f"Image data length: {len(image_data) if image_data else 0}")
            logger.info(f"Image data type: {type(image_data)}")
        else:
            logger.info("No image data received")

        if session_id not in conversation_history:
            conversation_history[session_id] = ""

        # Current context
        context = conversation_history[session_id]

        def generate_response():
            try:
                full_response = ""
                chunk_buffer = ""
                buffer_size = 3
                
                # Choose model and prepare messages based on whether image is present
                if has_image and image_data:
                    # Use vision-capable model for image analysis
                    model = 'llava:latest'  # or 'llava:7b' if available
                    
                    # Create simple, flexible prompt like ChatGPT
                    vision_prompt = f"""
You are a helpful AI assistant with vision capabilities. Analyze the provided image and respond to the user's request naturally and comprehensively.

Conversation History:
{context}

User Request: {user_input}

Instructions:
- Examine the image carefully and understand what the user is asking for
- If they want you to create code from the image, generate complete HTML/CSS/JavaScript code
- If they want identification, describe what you see in detail
- If they want design ideas, provide creative suggestions based on the image
- If they want modifications or improvements, suggest specific changes
- Always be helpful and provide exactly what the user is asking for
- Format code in proper code blocks when generating code
- Be detailed and thorough in your responses

Respond naturally to their request:
"""
                    
                    # Ensure image data is properly formatted for Ollama
                    try:
                        # Ollama expects base64 string without data URL prefix
                        if isinstance(image_data, str):
                            # Remove data URL prefix if present
                            if image_data.startswith('data:'):
                                image_data = image_data.split(',')[1]
                        
                        messages = [{
                            'role': 'user',
                            'content': vision_prompt,
                            'images': [image_data]
                        }]
                        
                        logger.info(f"Prepared vision request with image data length: {len(image_data)}")
                        
                    except Exception as img_error:
                        logger.error(f"Error preparing image data: {img_error}")
                        # Fallback to text-only response
                        messages = [{
                            'role': 'user',
                            'content': f"The user uploaded an image and asked: '{user_input}'. However, I cannot process the image. Please provide a helpful response about what they might be trying to do."
                        }]
                        model = 'qwen2.5-coder:7b'
                    
                    logger.info("Using vision model for image analysis")
                else:
                    # Use regular text model
                    model = 'qwen2.5-coder:7b'
                    
                    # Create regular prompt
                    text_prompt = f"""
You are a friendly and knowledgeable AI assistant. 
Your goal is to provide a clear, detailed, and well-structured answer.

Conversation History:
{context}

User Question:
{user_input}

Instructions for your response:
- Give a thorough and detailed explanation, not just a short answer.  
- Break down complex concepts into simple, easy-to-understand steps.  
- Use examples, analogies, or comparisons if helpful.  
- Format your response with bullet points, numbered lists, or short paragraphs for readability.  
- If the question allows, provide additional insights, best practices, or tips.  
- Be polite, supportive, and encouraging in tone.  

Assistant Answer:
"""
                    
                    messages = [{
                        'role': 'user',
                        'content': text_prompt
                    }]
                    
                    logger.info("Using text model for regular chat")
                
                # Make the streaming request to Ollama
                try:
                    stream = ollama.chat(
                        model=model,
                        messages=messages,
                        stream=True
                    )
                    
                    for chunk in stream:
                        if chunk['message']['content']:
                            content = chunk['message']['content']
                            full_response += content
                            chunk_buffer += content
                            
                            # Send buffered chunks for smoother streaming
                            if len(chunk_buffer) >= buffer_size:
                                yield f"data: {json.dumps({'chunk': chunk_buffer, 'done': False})}\n\n"
                                chunk_buffer = ""
                    
                    # Send any remaining buffer
                    if chunk_buffer:
                        yield f"data: {json.dumps({'chunk': chunk_buffer, 'done': False})}\n\n"
                    
                    # Update context with full response
                    conversation_history[session_id] += f"User: {user_input}\nBot: {full_response}\n"
                    
                    # Send completion signal
                    yield f"data: {json.dumps({'chunk': '', 'done': True, 'full_response': full_response})}\n\n"
                    
                except Exception as model_error:
                    logger.error(f"Model error: {str(model_error)}")
                    
                    # If vision model fails and we have an image, try text model with helpful message
                    if has_image and 'llava' in model:
                        logger.info("Vision model failed, falling back to text model")
                        fallback_prompt = f"""
The user uploaded an image and asked: "{user_input}"

I cannot process images directly, but I can help you with:
- HTML/CSS/JavaScript code creation
- Web design guidance
- UI/UX best practices
- General programming assistance

Based on your request "{user_input}", here's what I can help you with:
"""
                        
                        try:
                            fallback_stream = ollama.chat(
                                model='qwen2.5-coder:7b',
                                messages=[{
                                    'role': 'user',
                                    'content': fallback_prompt
                                }],
                                stream=True
                            )
                            
                            full_response = ""
                            chunk_buffer = ""
                            
                            for chunk in fallback_stream:
                                if chunk['message']['content']:
                                    content = chunk['message']['content']
                                    full_response += content
                                    chunk_buffer += content
                                    
                                    if len(chunk_buffer) >= buffer_size:
                                        yield f"data: {json.dumps({'chunk': chunk_buffer, 'done': False})}\n\n"
                                        chunk_buffer = ""
                            
                            if chunk_buffer:
                                yield f"data: {json.dumps({'chunk': chunk_buffer, 'done': False})}\n\n"
                            
                            conversation_history[session_id] += f"User: {user_input}\nBot: {full_response}\n"
                            yield f"data: {json.dumps({'chunk': '', 'done': True, 'full_response': full_response})}\n\n"
                            
                        except Exception as fallback_error:
                            logger.error(f"Fallback model also failed: {str(fallback_error)}")
                            error_msg = "I'm having trouble processing your request. Please make sure Ollama is running. For image analysis, you need the LLaVa model installed: `ollama pull llava`"
                            yield f"data: {json.dumps({'error': str(fallback_error), 'chunk': error_msg, 'done': True})}\n\n"
                    else:
                        error_msg = "I'm having trouble processing your request. Please make sure Ollama is running with the required models."
                        if has_image:
                            error_msg += " For image analysis, install LLaVa: `ollama pull llava`"
                        yield f"data: {json.dumps({'error': str(model_error), 'chunk': error_msg, 'done': True})}\n\n"
                
            except Exception as e:
                logger.error(f"Error with streaming: {str(e)}")
                error_msg = "I'm sorry, I'm having trouble processing your request right now. Please make sure the Ollama service is running."
                yield f"data: {json.dumps({'error': str(e), 'chunk': error_msg, 'done': True})}\n\n"

        return Response(
            generate_response(),
            mimetype='text/plain',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST'
            }
        )
            
    except Exception as e:
        logger.error(f"Unexpected error in streaming: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500

@app.route("/get_related_songs", methods=["POST", "OPTIONS"])
def get_related_songs():
    if request.method == "OPTIONS":
        return "", 200
    try:
        data = request.get_json()
        track_name = data.get('track_name', '').strip()
        artist_name = data.get('artist_name', '').strip()
        page = data.get('page', 0)
        limit = data.get('limit', 5)
        
        if not track_name:
            return jsonify({"error": "Track name is required"}), 400
        
        # Create a search query combining track and artist
        search_query = f"{track_name} {artist_name}".strip()
        logger.info(f"Searching for related songs: {search_query}")
        
        # Search for related songs
        results = search_youtube_music(search_query, limit=limit)
        
        return jsonify({
            "tracks": results,
            "has_more": len(results) >= limit,
            "total_available": len(results)
        })
        
    except Exception as e:
        logger.error(f"Related songs error: {e}")
        return jsonify({"error": "Failed to fetch related songs"}), 500

@app.route("/get_shuffle_songs", methods=["POST", "OPTIONS"])
def get_shuffle_songs():
    if request.method == "OPTIONS":
        return "", 200
    try:
        data = request.get_json()
        current_track = data.get('current_track', {})
        current_artist = current_track.get('artists', [''])[0] if current_track else ''
        current_song = current_track.get('name', '') if current_track else ''
        
        logger.info(f"Getting Llama 3 shuffle recommendations for: {current_song} by {current_artist}")
        
        # Create AI prompt for shuffle recommendations using Llama 3
        if current_song and current_artist:
            prompt = f"""Based on the current song "{current_song}" by {current_artist}, create a diverse shuffle playlist of 25 POPULAR songs.

SHUFFLE CRITERIA:
- Include songs from DIFFERENT genres and artists for variety
- Mix popular hits from 2010-2024 and classic songs
- Only recommend MAINSTREAM, CHART-TOPPING songs that most people know
- Avoid repeating the same artist more than 2 times
- Create a good flow between different moods and tempos
- Include songs that complement the current track's vibe but also add variety

IMPORTANT: Return ONLY a JSON array of exactly 25 songs in this format:
[
  {{"song": "Popular Song Title", "artist": "Well-Known Artist Name"}},
  {{"song": "Another Hit Song", "artist": "Famous Artist"}}
]

NO explanations, just the JSON array of 25 POPULAR songs for shuffle."""
        else:
            prompt = """Create a diverse shuffle playlist of 25 POPULAR mainstream songs for a general music listener.

SHUFFLE CRITERIA:
- Mix of genres: pop, rock, hip-hop, R&B, indie, electronic, etc.
- Include recent hits (2020-2024) and popular classics
- Only MAINSTREAM, CHART-TOPPING songs that most people recognize
- Avoid repeating artists more than twice
- Create good variety in mood and tempo
- Focus on songs with millions of streams/plays

IMPORTANT: Return ONLY a JSON array of exactly 25 songs in this format:
[
  {{"song": "Popular Song Title", "artist": "Well-Known Artist Name"}},
  {{"song": "Another Hit Song", "artist": "Famous Artist"}}
]

NO explanations, just the JSON array of 25 POPULAR songs."""

        try:
            # Get shuffle recommendations using Llama 3
            response = ollama.chat(
                model='llama3',
                messages=[{
                    'role': 'user',
                    'content': prompt
                }]
            )
            
            ai_response = response['message']['content'].strip()
            logger.info(f"Llama 3 response received: {ai_response[:200]}...")
            
            # Parse Llama 3 response to extract song recommendations
            try:
                # Extract JSON from the response
                json_start = ai_response.find('[')
                json_end = ai_response.rfind(']') + 1
                if json_start != -1 and json_end > json_start:
                    json_str = ai_response[json_start:json_end]
                    ai_recommendations = json.loads(json_str)
                else:
                    raise ValueError("No JSON array found in response")
                
                # Convert AI recommendations to our track format (parallelized lookups)
                def lookup_track(index, rec):
                    try:
                        search_query = f"{rec['song']} {rec['artist']}"
                        results = search_youtube_music(search_query, limit=1)
                        if results:
                            track = results[0].copy()
                            track['name'] = rec['song']
                            track['artists'] = [rec['artist']]
                            track['id'] = f"llama3_shuffle_{track['youtube_id']}"
                            track['image'] = f"https://img.youtube.com/vi/{track['youtube_id']}/hqdefault.jpg"
                            track['image_fallbacks'] = [
                                f"https://img.youtube.com/vi/{track['youtube_id']}/mqdefault.jpg",
                                f"https://img.youtube.com/vi/{track['youtube_id']}/default.jpg",
                                "https://via.placeholder.com/300x300/8b5cf6/ffffff?text=♪"
                            ]
                            return index, track
                    except Exception as e:
                        logger.warning(f"Lookup failed for {rec}: {e}")
                    return index, {
                        "id": f"llama3_shuffle_{index}",
                        "name": rec.get('song', 'Unknown'),
                        "artists": [rec.get('artist', 'Unknown Artist')],
                        "album": "Llama 3 Recommendation",
                        "image": "https://via.placeholder.com/300x300/8b5cf6/ffffff?text=♪",
                        "image_fallbacks": [
                            "https://via.placeholder.com/300x300/7c3aed/ffffff?text=Music",
                            "https://via.placeholder.com/300x300/5b21b6/ffffff?text=🎵"
                        ],
                        "youtube_id": None,
                        "duration": 180000,
                        "source": "llama3_shuffle"
                    }

                recs = [rec for rec in ai_recommendations[:25] if isinstance(rec, dict) and 'song' in rec and 'artist' in rec]
                shuffle_tracks = [None] * len(recs)
                with ThreadPoolExecutor(max_workers=8) as executor:
                    futures = [executor.submit(lookup_track, i, rec) for i, rec in enumerate(recs)]
                    for future in as_completed(futures):
                        i, track = future.result()
                        shuffle_tracks[i] = track
                
                logger.info(f"Successfully generated {len(shuffle_tracks)} Llama 3 shuffle recommendations")
                
                return jsonify({
                    "tracks": shuffle_tracks,
                    "total": len(shuffle_tracks)
                })
                
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                logger.error(f"Failed to parse Llama 3 response: {e}")
                # Fallback to curated shuffle playlist
                return get_fallback_shuffle_playlist()
                
        except Exception as e:
            logger.error(f"Error with Llama 3 model: {str(e)}")
            # Fallback to curated shuffle playlist
            return get_fallback_shuffle_playlist()
        
    except Exception as e:
        logger.error(f"Shuffle songs error: {e}")
        return jsonify({"error": "Failed to generate shuffle songs"}), 500

def get_fallback_shuffle_playlist():
    """Fallback shuffle playlist when Llama 3 fails"""
    try:
        logger.info("Using fallback shuffle playlist")
        
        # Curated diverse shuffle playlist
        fallback_tracks = [
            {"id": "youtube_G7KNmW9a75Y", "name": "Flowers", "artists": ["Miley Cyrus"], "album": "Endless Summer Vacation", "image": "https://img.youtube.com/vi/G7KNmW9a75Y/hqdefault.jpg", "youtube_id": "G7KNmW9a75Y", "duration": 200000, "source": "youtube"},
            {"id": "youtube_b1kbLWvqugk", "name": "Anti-Hero", "artists": ["Taylor Swift"], "album": "Midnights", "image": "https://img.youtube.com/vi/b1kbLWvqugk/hqdefault.jpg", "youtube_id": "b1kbLWvqugk", "duration": 201000, "source": "youtube"},
            {"id": "youtube_H5v3kku4y6Q", "name": "As It Was", "artists": ["Harry Styles"], "album": "Harry's House", "image": "https://img.youtube.com/vi/H5v3kku4y6Q/hqdefault.jpg", "youtube_id": "H5v3kku4y6Q", "duration": 167000, "source": "youtube"},
            {"id": "youtube_4NRXx6U8ABQ", "name": "Blinding Lights", "artists": ["The Weeknd"], "album": "After Hours", "image": "https://img.youtube.com/vi/4NRXx6U8ABQ/hqdefault.jpg", "youtube_id": "4NRXx6U8ABQ", "duration": 200000, "source": "youtube"},
            {"id": "youtube_JGwWNGJdvx8", "name": "Shape of You", "artists": ["Ed Sheeran"], "album": "÷ (Divide)", "image": "https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg", "youtube_id": "JGwWNGJdvx8", "duration": 233000, "source": "youtube"},
            {"id": "youtube_DyDfgMOUjCI", "name": "Bad Guy", "artists": ["Billie Eilish"], "album": "When We All Fall Asleep, Where Do We Go?", "image": "https://img.youtube.com/vi/DyDfgMOUjCI/hqdefault.jpg", "youtube_id": "DyDfgMOUjCI", "duration": 194000, "source": "youtube"},
            {"id": "youtube_fJ9rUzIMcZQ", "name": "Bohemian Rhapsody", "artists": ["Queen"], "album": "A Night at the Opera", "image": "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg", "youtube_id": "fJ9rUzIMcZQ", "duration": 355000, "source": "youtube"},
            {"id": "youtube_hTWKbfoikeg", "name": "Smells Like Teen Spirit", "artists": ["Nirvana"], "album": "Nevermind", "image": "https://img.youtube.com/vi/hTWKbfoikeg/hqdefault.jpg", "youtube_id": "hTWKbfoikeg", "duration": 301000, "source": "youtube"},
            {"id": "youtube_OPf0YbXqDm0", "name": "Uptown Funk", "artists": ["Mark Ronson", "Bruno Mars"], "album": "Uptown Special", "image": "https://img.youtube.com/vi/OPf0YbXqDm0/hqdefault.jpg", "youtube_id": "OPf0YbXqDm0", "duration": 270000, "source": "youtube"},
            {"id": "youtube_09R8_2nJtjg", "name": "Sugar", "artists": ["Maroon 5"], "album": "V", "image": "https://img.youtube.com/vi/09R8_2nJtjg/hqdefault.jpg", "youtube_id": "09R8_2nJtjg", "duration": 235000, "source": "youtube"},
            {"id": "youtube_YQHsXMglC9A", "name": "Hello", "artists": ["Adele"], "album": "25", "image": "https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg", "youtube_id": "YQHsXMglC9A", "duration": 295000, "source": "youtube"},
            {"id": "youtube_My2FRPA3Gf8", "name": "Wrecking Ball", "artists": ["Miley Cyrus"], "album": "Bangerz", "image": "https://img.youtube.com/vi/My2FRPA3Gf8/hqdefault.jpg", "youtube_id": "My2FRPA3Gf8", "duration": 221000, "source": "youtube"},
            {"id": "youtube_dQw4w9WgXcQ", "name": "Never Gonna Give You Up", "artists": ["Rick Astley"], "album": "Whenever You Need Somebody", "image": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", "youtube_id": "dQw4w9WgXcQ", "duration": 213000, "source": "youtube"},
            {"id": "youtube_nfWlot6h_JM", "name": "Shake It Off", "artists": ["Taylor Swift"], "album": "1989", "image": "https://img.youtube.com/vi/nfWlot6h_JM/hqdefault.jpg", "youtube_id": "nfWlot6h_JM", "duration": 219000, "source": "youtube"},
            {"id": "youtube_CevxZvSJLk8", "name": "Roar", "artists": ["Katy Perry"], "album": "Prism", "image": "https://img.youtube.com/vi/CevxZvSJLk8/hqdefault.jpg", "youtube_id": "CevxZvSJLk8", "duration": 223000, "source": "youtube"},
            {"id": "youtube_QYh6mYIJG2Y", "name": "7 rings", "artists": ["Ariana Grande"], "album": "thank u, next", "image": "https://img.youtube.com/vi/QYh6mYIJG2Y/hqdefault.jpg", "youtube_id": "QYh6mYIJG2Y", "duration": 178000, "source": "youtube"},
            {"id": "youtube_hT_nvWreIhg", "name": "Counting Stars", "artists": ["OneRepublic"], "album": "Native", "image": "https://img.youtube.com/vi/hT_nvWreIhg/hqdefault.jpg", "youtube_id": "hT_nvWreIhg", "duration": 257000, "source": "youtube"},
            {"id": "youtube_9bZkp7q19f0", "name": "Gangnam Style", "artists": ["PSY"], "album": "PSY 6 (Six Rules), Part 1", "image": "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg", "youtube_id": "9bZkp7q19f0", "duration": 253000, "source": "youtube"},
            {"id": "youtube_kJQP7kiw5Fk", "name": "Despacito", "artists": ["Luis Fonsi", "Daddy Yankee"], "album": "Vida", "image": "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg", "youtube_id": "kJQP7kiw5Fk", "duration": 281000, "source": "youtube"},
            {"id": "youtube_jfKfPfyJRdk", "name": "Lofi Hip Hop Radio", "artists": ["ChilledCow"], "album": "Lofi Collection", "image": "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg", "youtube_id": "jfKfPfyJRdk", "duration": 3600000, "source": "youtube"},
            {"id": "youtube_UfcAVejslrU", "name": "Weightless", "artists": ["Marconi Union"], "album": "Ambient Works", "image": "https://img.youtube.com/vi/UfcAVejslrU/hqdefault.jpg", "youtube_id": "UfcAVejslrU", "duration": 485000, "source": "youtube"},
            {"id": "youtube_7maJOI3QMu0", "name": "River Flows in You", "artists": ["Yiruma"], "album": "First Love", "image": "https://img.youtube.com/vi/7maJOI3QMu0/hqdefault.jpg", "youtube_id": "7maJOI3QMu0", "duration": 180000, "source": "youtube"},
            {"id": "youtube_RBumgq5yVrA", "name": "Let Her Go", "artists": ["Passenger"], "album": "All the Little Lights", "image": "https://img.youtube.com/vi/RBumgq5yVrA/hqdefault.jpg", "youtube_id": "RBumgq5yVrA", "duration": 252000, "source": "youtube"},
            {"id": "youtube_4xDzrJKXOOY", "name": "Synthwave Programming Mix", "artists": ["The Midnight"], "album": "Coding Beats", "image": "https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg", "youtube_id": "4xDzrJKXOOY", "duration": 3600000, "source": "youtube"}
        ]
        
        logger.info(f"Returning {len(fallback_tracks)} fallback shuffle tracks")
        
        return jsonify({
            "tracks": fallback_tracks,
            "total": len(fallback_tracks)
        })
        
    except Exception as e:
        logger.error(f"Fallback shuffle playlist error: {e}")
        return jsonify({"error": "Failed to generate shuffle playlist"}), 500

@app.route("/get_ai_recommendations", methods=["POST", "OPTIONS"])
def get_ai_recommendations():
    if request.method == "OPTIONS":
        return "", 200
    try:
        data = request.get_json()
        song_name = data.get('song_name', '').strip()
        artist_name = data.get('artist_name', '').strip()
        
        logger.info(f"Getting AI recommendations for: {song_name} by {artist_name}")
        
        # Create AI prompt for recommendations using Llama 3
        if song_name and artist_name:
            prompt = f"""Based on the current song "{song_name}" by {artist_name}, recommend 25 similar songs.

RECOMMENDATION CRITERIA:
- Include songs from similar genres and artists
- Mix popular hits and lesser-known gems
- Consider the mood and style of the current track
- Include both recent songs (2020-2024) and classics
- Avoid repeating the same artist more than 2 times
- Focus on songs that complement the current track's vibe

IMPORTANT: Return ONLY a JSON array of exactly 25 songs in this format:
[
  {{"song": "Song Title", "artist": "Artist Name"}},
  {{"song": "Another Song", "artist": "Another Artist"}}
]

NO explanations, just the JSON array of 25 songs."""
        else:
            prompt = """Recommend 25 popular songs for a general music listener.

RECOMMENDATION CRITERIA:
- Mix of genres: pop, rock, hip-hop, R&B, indie, electronic, etc.
- Include recent hits (2020-2024) and popular classics
- Mainstream songs that most people recognize
- Avoid repeating artists more than twice
- Create good variety in mood and tempo

IMPORTANT: Return ONLY a JSON array of exactly 25 songs in this format:
[
  {{"song": "Song Title", "artist": "Artist Name"}},
  {{"song": "Another Song", "artist": "Another Artist"}}
]

NO explanations, just the JSON array of 25 songs."""

        try:
            # Get AI recommendations using Llama 3.1
            response = ollama.chat(
                model='llama3.1',
                messages=[{
                    'role': 'user',
                    'content': prompt
                }]
            )

            ai_response = response['message']['content'].strip()
            logger.info(f"Llama 3.1 response received: {ai_response[:200]}...")
            
            # Parse AI response to extract song recommendations
            try:
                # Extract JSON from the response
                json_start = ai_response.find('[')
                json_end = ai_response.rfind(']') + 1
                if json_start != -1 and json_end > json_start:
                    json_str = ai_response[json_start:json_end]
                    ai_recommendations = json.loads(json_str)
                else:
                    raise ValueError("No JSON array found in response")
                
                # Convert AI recommendations to track format with YouTube lookup
                def lookup_track(rec):
                    try:
                        search_query = f"{rec['song']} {rec['artist']}"
                        results = search_youtube_music(search_query, limit=1)
                        if results:
                            track = results[0].copy()
                            track['name'] = rec['song']
                            track['artists'] = [rec['artist']]
                            return track
                        else:
                            # Return track without YouTube ID if not found
                            return {
                                "id": f"ai_{rec['song'].replace(' ', '_').lower()}_{rec['artist'].replace(' ', '_').lower()}",
                                "name": rec['song'],
                                "artists": [rec['artist']],
                                "album": "AI Recommendation",
                                "image": "/api/placeholder/300/300",
                                "youtube_id": None,
                                "duration": 180000,
                                "source": "ai_recommendation"
                            }
                    except Exception as e:
                        logger.error(f"Error looking up track {rec}: {e}")
                        return None

                # Process recommendations with parallel lookups
                tracks = []
                with ThreadPoolExecutor(max_workers=5) as executor:
                    future_to_rec = {executor.submit(lookup_track, rec): rec for rec in ai_recommendations[:25]}
                    for future in as_completed(future_to_rec):
                        track = future.result()
                        if track:
                            tracks.append(track)
                
                logger.info(f"Successfully processed {len(tracks)} AI recommendations")
                return jsonify({"tracks": tracks})
                
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                logger.error(f"Failed to parse AI response: {e}")
                # Return fallback recommendations
                return get_fallback_recommendations()
                
        except Exception as e:
            logger.error(f"Error with Llama 3.1 model: {str(e)}")
            # Return fallback recommendations
            return get_fallback_recommendations()
            
    except Exception as e:
        logger.error(f"AI recommendations error: {e}")
        return jsonify({"error": "Failed to get AI recommendations"}), 500

def get_fallback_recommendations():
    """Fallback recommendations when AI fails"""
    try:
        logger.info("Using fallback recommendations")
        
        # Mix of popular tracks from different categories
        all_tracks = [
            {"id": "youtube_dQw4w9WgXcQ", "name": "Never Gonna Give You Up", "artists": ["Rick Astley"], "album": "Whenever You Need Somebody", "image": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", "youtube_id": "dQw4w9WgXcQ", "duration": 213000, "source": "youtube"},
            {"id": "youtube_9bZkp7q19f0", "name": "Gangnam Style", "artists": ["PSY"], "album": "PSY 6 (Six Rules), Part 1", "image": "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg", "youtube_id": "9bZkp7q19f0", "duration": 253000, "source": "youtube"},
            {"id": "youtube_kJQP7kiw5Fk", "name": "Despacito", "artists": ["Luis Fonsi", "Daddy Yankee"], "album": "Vida", "image": "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg", "youtube_id": "kJQP7kiw5Fk", "duration": 281000, "source": "youtube"},
            {"id": "youtube_Pkh8UtuejGw", "name": "Senorita", "artists": ["Shawn Mendes", "Camila Cabello"], "album": "Senorita", "image": "https://img.youtube.com/vi/Pkh8UtuejGw/hqdefault.jpg", "youtube_id": "Pkh8UtuejGw", "duration": 191000, "source": "youtube"},
            {"id": "youtube_jfKfPfyJRdk", "name": "Lofi Hip Hop Radio", "artists": ["ChilledCow"], "album": "Lofi Collection", "image": "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg", "youtube_id": "jfKfPfyJRdk", "duration": 3600000, "source": "youtube"},
            {"id": "youtube_UfcAVejslrU", "name": "Weightless", "artists": ["Marconi Union"], "album": "Ambient Works", "image": "https://img.youtube.com/vi/UfcAVejslrU/hqdefault.jpg", "youtube_id": "UfcAVejslrU", "duration": 485000, "source": "youtube"}
        ]
        
        # Add tracks from MUSIC_DATABASE
        for category in MUSIC_DATABASE.values():
            all_tracks.extend(category)
        
        # Return first 25 unique tracks
        seen_ids = set()
        fallback_tracks = []
        for track in all_tracks:
            if track['id'] not in seen_ids and len(fallback_tracks) < 25:
                seen_ids.add(track['id'])
                fallback_tracks.append(track)
        
        logger.info(f"Returning {len(fallback_tracks)} fallback recommendations")
        return jsonify({"tracks": fallback_tracks})
        
    except Exception as e:
        logger.error(f"Fallback recommendations error: {e}")
        return jsonify({"error": "Failed to get recommendations"}), 500

@app.route("/", methods=["GET"])
def home():
    return "Ollama Qwen2.5-Coder Chat API is running!"

@app.route("/health", methods=["GET"])
def health_check():
    try:
        # Test if Ollama is accessible
        ollama.list()
        return jsonify({"status": "healthy", "model": "qwen2.5-coder:7b"})
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

if __name__ == "__main__":
    print("Starting Flask server...")
    print("Make sure Ollama is running with: ollama run qwen2.5-coder:7b")
    app.run(debug=True, port=5001, host="0.0.0.0")
