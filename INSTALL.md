# 🚀 Quick Install Guide for New Users

## ⚡ Super Quick Start (3 commands)

```bash
# 1. Clone and setup
git clone <your-repo-url>
cd ChatbotMain
./start_chatbot.sh

# 2. Open new terminal and run again
./start_chatbot.sh

# 3. Open browser
open http://localhost:5173
```

## 📋 What You Need First

- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Ollama** - [Download here](https://ollama.ai/)

## 🎯 Step-by-Step (If Quick Start Doesn't Work)

### Step 1: Setup
```bash
git clone <your-repo-url>
cd ChatbotMain
chmod +x setup.sh
./setup.sh
```

### Step 2: Start Ollama
```bash
ollama serve
```
**Keep this terminal open!**

### Step 3: Start Backend
```bash
# New terminal
source venv/bin/activate
python3 main_api.py
```
**Keep this terminal open!**

### Step 4: Start Frontend
```bash
# New terminal
cd Frontend/Chatbot-Main
npm run dev
```
**Keep this terminal open!**

### Step 5: Open Browser
Go to `http://localhost:5173`

## 🐛 Common Issues

- **"Port 5000 in use"** → We use port 5001 now
- **"Module not found"** → Run `source venv/bin/activate` first
- **"Ollama connection failed"** → Make sure `ollama serve` is running
- **"CORS errors"** → Backend must be running on port 5001

### 🚨 **Frontend Won't Start? (esbuild error)**

If you see an error like:
```
You installed esbuild for another platform than the one you're currently using.
```

**Quick Fix:**
```bash
# Run this from the ChatbotMain directory
./fix_frontend.sh
```

**Manual Fix:**
```bash
cd Frontend/Chatbot-Main
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Why This Happens:**
- Node.js dependencies were installed on a different platform/architecture
- Common when copying projects between different systems
- The `fix_frontend.sh` script automatically detects and fixes this

## 🧪 Test Everything Works

```bash
python3 test_integration.py
```

## 💡 Need More Help?

- Check `README.md` for detailed instructions
- Run `./start_chatbot.sh` for automated startup
- Run `./fix_frontend.sh` if frontend has esbuild issues
- Make sure all 3 services are running:
  - Ollama service
  - Backend API (port 5001)
  - Frontend (port 5173)

## 🔧 Advanced Troubleshooting

### If Frontend Still Won't Start:
1. **Check Node.js version**: `node --version` (should be 16+)
2. **Clear npm cache**: `npm cache clean --force`
3. **Use Node Version Manager**: Install `nvm` or `fnm` for better Node.js management
4. **Check system architecture**: Make sure you're using the right platform (ARM64 vs x64)

### If Backend Won't Start:
1. **Check Python version**: `python3 --version` (should be 3.8+)
2. **Activate virtual environment**: `source venv/bin/activate`
3. **Reinstall dependencies**: `pip install -r requirements.txt`

### If Ollama Won't Start:
1. **Check if Ollama is installed**: `ollama --version`
2. **Start Ollama service**: `ollama serve`
3. **Download model**: `ollama pull CodeLlama`
