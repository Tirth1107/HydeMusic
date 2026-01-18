# VibeEra — AI Chatbot with Music Player (React + Flask)

A modern AI assistant with integrated music search/player. Frontend is React (Vite), backend is Flask. AI is powered by Ollama with Llama 3.1 (recommendations), Qwen2.5-Coder (chat), and Llava (vision for images).

## 🚀 Features

- **Modern React Frontend**: React 18 + Vite + Framer Motion
- **Flask Backend API**: REST API with CORS and session context
- **AI Models (Ollama)**:
  - Chat: `qwen2.5-coder:7b`
  - Image understanding: `llava:latest`
  - Music recommendations: `llama3.1`
- **Real-time Chat**: Typing/streaming with SSE
- **Image Upload**: Ask questions about images (vision)
- **Music Player**: YouTube-based search/playback, AI recommendations, queue, shuffle
- **Responsive UI**: Mobile-friendly, purple theme
- **Code Formatting**: Copyable code blocks and inline snippets

## 📋 Prerequisites

Before you start, make sure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **Ollama** - [Download Ollama](https://ollama.ai/)

## 🛠️ Quick Start (For New Users)

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ChatbotMain

# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

### Step 2: Start Ollama Service

```bash
# Start Ollama service (keep this running)
ollama serve
```

### Step 3: Start the Backend

```bash
# In a new terminal, activate virtual environment and start backend
source venv/bin/activate
python3 main_api.py
```

### Step 4: Start the Frontend

In a **new terminal**:

```bash
cd Frontend/Chatbot-Main
npm run dev
```

### Step 5: Access the Chatbot

Open your browser and navigate to `http://localhost:5173`

## 🚀 Detailed Installation

### Option 1: Automated Setup (Recommended for New Users)

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```
   
   This script will:
   - Check all prerequisites
   - Install Python dependencies
   - Install Node.js dependencies
   - Download the LLaMA3 model

### Option 2: Manual Setup

1. **Install Python dependencies:**
   ```bash
   pip3 install -r requirements.txt
   ```

2. **Install Node.js dependencies:**
   ```bash
   cd Frontend/Chatbot-Main
   npm install
   cd ../..
   ```

3. **Install and run Ollama:**
   - Download from [https://ollama.ai/](https://ollama.ai/)
   - Install and start the service: `ollama serve`
   - Pull required models:
     - `ollama pull llama3.1`
     - `ollama pull qwen2.5-coder:7b`
     - `ollama pull llava:latest`

## 🎯 Running the Application

### 1. Start Ollama Service (Required First)

```bash
ollama serve
```

**Keep this terminal running!** Ollama needs to be running for the AI to work.

### 2. Start the Backend API

```bash
# Activate virtual environment
source venv/bin/activate

# Start the Flask server
python3 main_api.py
```

The Flask server will start on `http://127.0.0.1:5001`

### 3. Start the Frontend

In a **new terminal**:

```bash
cd Frontend/Chatbot-Main
npm run dev
```

The React app will start on `http://localhost:5173`

### 4. Access the Chatbot

Open your browser and navigate to `http://localhost:5173`

## 🔧 Configuration

### Backend Configuration

- **Port**: 5001
- **Models** (in `Backend/main_api.py`):
  - Chat: `qwen2.5-coder:7b`
  - Vision: `llava:latest`
  - AI music recommendations: `llama3.1`
- **Host**: `0.0.0.0`

### Frontend Configuration

- **Backend Base URL**: `http://127.0.0.1:5001`
- **Endpoints used**: `/chat`, `/chat/stream`, `/search_music`, `/get_ai_recommendations`, `/trending_music`
- **Auth**: Clerk (publishable key via `VITE_CLERK_PUBLISHABLE_KEY`)

## 📁 Project Structure

```
ChatbotMain/
├── Backend/
│   ├── main_api.py          # Flask API (chat, vision, music search, AI recommendations)
│   ├── music.py             # (optional/legacy) music helpers
│   ├── requirements.txt     # Python deps
│   └── test_integration.py  # Integration tests
├── Frontend/
│   └── Chatbot-Main/
│       ├── index.html
│       └── src/
│           ├── App.jsx
│           ├── main.jsx
│           └── Components/
│               ├── Chat.jsx        # Main chat UI (image upload + streaming)
│               ├── Sidebar.jsx     # Music player (search, queue, AI suggestions)
│               ├── LeftSidebar.jsx # Chat history
│               └── SignInPage.jsx  # Auth screen (Clerk)
├── README.md
├── INSTALL.md
└── PROJECT_OVERVIEW.md
```

## 🧪 Testing

### Run Integration Tests

```bash
source venv/bin/activate
python3 test_integration.py
```

### Test Code Formatting

```bash
source venv/bin/activate
python3 demo_code_formatting.py
```

## 🐛 Troubleshooting

### Common Issues

1. **"Port 5000 in use" Error**
   - **Solution**: The backend now uses port 5001 to avoid macOS AirPlay conflicts
   - **Check**: Make sure you're using port 5001 in the frontend

2. **"Module not found" Errors**
   - **Solution**: Make sure you're in the virtual environment
   - **Fix**: Run `source venv/bin/activate` before starting the backend

3. **"Ollama connection failed"**
   - **Solution**: Make sure Ollama service is running
   - **Fix**: Run `ollama serve` in a separate terminal

4. **"CORS Errors" in Browser**
   - **Solution**: Make sure the backend is running on port 5001
   - **Check**: Verify `http://127.0.0.1:5001/health` returns a response

5. **"Model not found"**
   - **Solution**: Pull required models
   - **Fix**:
     - `ollama pull llama3.1`
     - `ollama pull qwen2.5-coder:7b`
     - `ollama pull llava:latest`

6. **🚨 Frontend Won't Start (esbuild error)**
   - **Error**: "You installed esbuild for another platform than the one you're currently using"
   - **Quick Fix**: Run `./fix_frontend.sh` from the ChatbotMain directory
   - **Manual Fix**: 
     ```bash
     cd Frontend/Chatbot-Main
     rm -rf node_modules package-lock.json
     npm install
     npm run dev
     ```
   - **Why This Happens**: Node.js dependencies were installed on a different platform/architecture

### Debug Steps

1. **Check if services are running:**
   ```bash
   # Check Ollama
   ollama list
   
   # Check backend
   curl http://127.0.0.1:5001/health
   
   # Check frontend
   curl http://localhost:5173
   ```

2. **Check logs:**
   - Backend logs will show in the terminal where you ran `python3 main_api.py`
   - Frontend logs will show in the terminal where you ran `npm run dev`
   - Browser console (F12) will show any frontend errors

3. **Verify dependencies:**
   ```bash
   # Check Python packages
   source venv/bin/activate
   pip list | grep -E "(flask|langchain|ollama)"
   
   # Check Node packages
   cd Frontend/Chatbot-Main
   npm list
   ```

4. **Fix frontend dependencies:**
   ```bash
   # If you have esbuild/platform issues
   ./fix_frontend.sh
   ```

## 🔌 API Endpoints (Backend/main_api.py)

- **GET /** – Home
- **GET /health** – Model status check
- **POST /chat** – Non-streaming chat (text)
- **POST /chat/stream** – Streaming chat (text and optional image via `has_image` + `image`)
- **POST /search_music** – Music search (YouTube scraping)
- **GET /trending_music** – Predefined trending
- **GET /search?q=...** – Alternative search
- **POST /get_ai_recommendations** – AI-powered music suggestions (Llama 3.1)

### Chat Endpoint (non-streaming)

**Request:**
```json
{
  "session_id": "user123",
  "question": "Hello, how are you?"
}
```

**Response:**
```json
{
  "session_id": "user123",
  "user": "Hello, how are you?",
  "bot": "Hello! I'm doing great, thank you for asking..."
}
```

## 🌟 Features to Try

Once the chatbot is running, try these features:

- **Ask coding questions**: "Show me a Python function"
- **Upload an image** and ask: "What do you see?" (uses Llava)
- **Search music** in the sidebar and play results
- **Click AI suggestions** to load a smart queue (Llama 3.1 based)
- **Code formatting** with copy buttons
- **Multi-line input**: Shift+Enter

## 🚀 Future Enhancements

- [ ] User authentication and multiple user support
- [ ] File upload and document processing
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Chat history persistence
- [ ] Model switching interface
- [ ] Streaming responses

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 💡 Need Help?

If you're still having issues:

1. Check the troubleshooting section above
2. Run the integration tests: `python3 test_integration.py`
3. Fix frontend dependencies: `./fix_frontend.sh`
4. Check that all three services are running:
   - Ollama service (`ollama serve`)
   - Backend API (`python3 main_api.py`)
   - Frontend (`npm run dev`)
5. Open an issue with your error details

## 🚀 Quick Commands

```bash
# Start everything automatically
./start_chatbot.sh

# Fix frontend issues
./fix_frontend.sh

# Run tests
python3 test_integration.py

# Manual startup
ollama serve                    # Terminal 1
source venv/bin/activate && python3 main_api.py  # Terminal 2
cd Frontend/Chatbot-Main && npm run dev          # Terminal 3
``` #   H y d e M u s i c  
 