#!/bin/bash

echo "🚀 Setting up Chatbot Project..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Please install Ollama first from https://ollama.ai/"
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r Backend/requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd Frontend/Chatbot-Main
npm install
cd ../..

echo "✅ Dependencies installed!"

# Check if Ollama model is available
echo "🤖 Checking Ollama models..."
# Ensure qwen2.5-coder:7b is available
if ollama list | grep -q "qwen2.5-coder:7b"; then
    echo "✅ qwen2.5-coder:7b model found!"
else
    echo "📥 Downloading qwen2.5-coder:7b model (this may take a while)..."
    ollama pull qwen2.5-coder:7b
fi

# Ensure llava:latest (vision) is available
if ollama list | grep -q "llava:latest"; then
    echo "✅ llava:latest model found!"
else
    echo "📥 Downloading llava:latest model (this may take a while)..."
    ollama pull llava:latest
fi

echo ""
echo "🎉 Setup complete! To run the chatbot:"
echo ""
echo "1. Start the backend:"
echo "   cd Backend && python3 main_api.py"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   cd Frontend/Chatbot-Main && npm run dev"
echo ""
echo "3. Open your browser to the URL shown by the frontend"
echo "4. Make sure Ollama is running: ollama serve"
echo ""
echo "Note: Backend runs on port 5001 (changed from 5000 to avoid macOS AirPlay conflicts)"