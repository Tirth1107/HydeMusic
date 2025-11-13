#!/usr/bin/env python3

import requests
import json
import time
import sys

def test_backend_health():
    """Test if backend is running and healthy"""
    print("🔍 Testing Backend Health...")
    try:
        response = requests.get("http://localhost:5001/health", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Backend is healthy: {result['status']}")
            print(f"   Model: {result.get('model', 'Unknown')}")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False

def test_frontend_access():
    """Test if frontend is accessible"""
    print("\n🔍 Testing Frontend Access...")
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend access failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend not accessible: {e}")
        return False

def test_chat_api():
    """Test the chat API"""
    print("\n🔍 Testing Chat API...")
    try:
        response = requests.post(
            "http://localhost:5001/chat",
            json={"session_id": "test", "question": "Hello, test message"},
            timeout=30
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Chat API working: {result['bot'][:50]}...")
            return True
        else:
            print(f"❌ Chat API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Chat API error: {e}")
        return False

def test_streaming_api():
    """Test the streaming chat API"""
    print("\n🔍 Testing Streaming Chat API...")
    try:
        response = requests.post(
            "http://localhost:5001/chat/stream",
            json={"session_id": "test", "question": "Quick test"},
            timeout=10,
            stream=True
        )
        if response.status_code == 200:
            chunk_count = 0
            for line in response.iter_lines():
                if line:
                    chunk_count += 1
                    if chunk_count >= 3:  # Test a few chunks
                        break
            print(f"✅ Streaming API working: received {chunk_count} chunks")
            return True
        else:
            print(f"❌ Streaming API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Streaming API error: {e}")
        return False

def test_music_api():
    """Test the music search API"""
    print("\n🔍 Testing Music Search API...")
    try:
        response = requests.post(
            "http://localhost:5001/search_music",
            json={"query": "test song"},
            timeout=15
        )
        if response.status_code == 200:
            result = response.json()
            tracks = result.get('tracks', [])
            print(f"✅ Music API working: found {len(tracks)} tracks")
            return True
        else:
            print(f"❌ Music API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Music API error: {e}")
        return False

def test_cors():
    """Test CORS configuration"""
    print("\n🔍 Testing CORS Configuration...")
    try:
        # Test preflight request
        response = requests.options(
            "http://localhost:5001/chat/stream",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            },
            timeout=5
        )
        if response.status_code == 200:
            print("✅ CORS preflight working")
            return True
        else:
            print(f"❌ CORS preflight failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ CORS test error: {e}")
        return False

def main():
    print("🧪 Full Integration Test Suite")
    print("=" * 50)
    
    # Wait for servers to be ready
    print("⏳ Waiting for servers to be ready...")
    time.sleep(3)
    
    tests = [
        test_backend_health,
        test_frontend_access,
        test_cors,
        test_chat_api,
        test_streaming_api,
        test_music_api
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your API is working perfectly!")
        print("\n🚀 You can now:")
        print("   • Open http://localhost:5173 in your browser")
        print("   • Start chatting with your AI assistant")
        print("   • Use the music search feature")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
