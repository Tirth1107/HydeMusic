// src/ChatPage.js

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, AlertCircle, Copy, Check, Sparkles, MessageCircle, Square, Clock, Music, Zap, Download, Trash2, X, Menu, Plus, Search, MessageSquare, Camera, Image } from "lucide-react";
import AuthButton from "./AuthButton";
import Sidebar from "./Sidebar";
import LeftSidebar from "./LeftSidebar";
import ErrorBoundary from "./ErrorBoundary";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Initialize from localStorage, default to false
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(() => {
    // Initialize from localStorage, default to false
    const saved = localStorage.getItem('leftSidebarOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    // Initialize from localStorage, default to empty array
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(() => {
    // Initialize from localStorage, default to null
    const saved = localStorage.getItem('currentChatId');
    return saved ? JSON.parse(saved) : null;
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const quickActionsRef = useRef(null);
  const fileInputRef = useRef(null);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('leftSidebarOpen', JSON.stringify(isLeftSidebarOpen));
  }, [isLeftSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('currentChatId', JSON.stringify(currentChatId));
  }, [currentChatId]);

  // Ensure there is always an active chat and load its messages on first mount
  useEffect(() => {
    if (!currentChatId) {
      const existingHistory = Array.isArray(chatHistory) ? chatHistory : [];
      if (existingHistory.length > 0) {
        setCurrentChatId(existingHistory[0].id);
        setMessages(existingHistory[0].messages || []);
      } else {
        const newChatId = Date.now().toString();
        const newChat = {
          id: newChatId,
          title: "New Chat",
          messages: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        setChatHistory([newChat]);
        setCurrentChatId(newChatId);
      }
    } else {
      // Load messages for the active chat from history (in case of reload)
      const active = chatHistory.find(c => c.id === currentChatId);
      if (active) {
        setMessages(active.messages || []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the current chat's messages into chatHistory whenever messages change
  useEffect(() => {
    if (!currentChatId) return;
    setChatHistory(prev => {
      const history = Array.isArray(prev) ? prev : [];
      const idx = history.findIndex(c => c.id === currentChatId);
      const updatedChat = {
        id: currentChatId,
        title: history[idx]?.title || (messages[0]?.text ? messages[0].text.slice(0, 40) : "New Chat"),
        messages: messages,
        timestamp: history[idx]?.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        created: history[idx]?.created || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      if (idx === -1) return [updatedChat, ...history];
      const copy = [...history];
      copy[idx] = updatedChat;
      return copy;
    });
  }, [messages, currentChatId]);

  // Close quick actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setIsQuickActionsOpen(false);
      }
    };

    if (isQuickActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isQuickActionsOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(index);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    
    // Save the current streaming message as a complete message
    if (streamingMessage.trim()) {
      const botMessage = { 
        sender: "bot", 
        text: streamingMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMessage]);
    }
    
    setStreamingMessage("");
    setIsStreaming(false);
    setLoading(false);
  };

  const handleNewChat = () => {
    // Save current chat if it has messages
    if (messages.length > 0 && currentChatId) {
      const updatedHistory = chatHistory.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: messages, lastUpdated: new Date().toISOString() }
          : chat
      );
      setChatHistory(updatedHistory);
    }

    // Create new chat
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: "New Chat",
      messages: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setStreamingMessage("");
    setIsStreaming(false);
    setError("");
    setIsLeftSidebarOpen(false);
  };

  const handleSelectChat = (chatId) => {
    // Save current chat if it has messages
    if (messages.length > 0 && currentChatId) {
      const updatedHistory = chatHistory.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: messages, lastUpdated: new Date().toISOString() }
          : chat
      );
      setChatHistory(updatedHistory);
    }

    // Load selected chat
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      setCurrentChatId(chatId);
      setMessages(selectedChat.messages || []);
      setStreamingMessage("");
      setIsStreaming(false);
      setError("");
      setIsLeftSidebarOpen(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
    setStreamingMessage("");
    setIsStreaming(false);
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const renderMarkdownInline = (str, keyPrefix = "") => {
    const chunks = String(str).split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/);
    return chunks.map((chunk, idx) => {
      if (/^\*\*[^*]+\*\*$/.test(chunk) || /^__[^_]+__$/.test(chunk)) {
        const text = chunk.slice(2, -2);
        return <strong key={`${keyPrefix}b${idx}`}>{text}</strong>;
      }
      if (/^\*[^*]+\*$/.test(chunk) || /^_[^_]+_$/.test(chunk)) {
        const text = chunk.slice(1, -1);
        return <em key={`${keyPrefix}i${idx}`}>{text}</em>;
      }
      return <React.Fragment key={`${keyPrefix}t${idx}`}>{chunk}</React.Fragment>;
    });
  };

  const renderWithLineBreaks = (str) => {
    const lines = String(str).split("\n");
    return lines.map((line, i) => {
      // Check if line is a markdown header
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        
        // Get appropriate emoji based on header level and content
        const getHeaderEmoji = (level, text) => {
          const lowerText = text.toLowerCase();
          
          // Content-based emojis
          if (lowerText.includes('feature') || lowerText.includes('benefit')) return '✨';
          if (lowerText.includes('step') || lowerText.includes('install') || lowerText.includes('setup')) return '🔧';
          if (lowerText.includes('example') || lowerText.includes('demo')) return '💡';
          if (lowerText.includes('tip') || lowerText.includes('note') || lowerText.includes('important')) return '💡';
          if (lowerText.includes('error') || lowerText.includes('issue') || lowerText.includes('problem')) return '⚠️';
          if (lowerText.includes('solution') || lowerText.includes('fix')) return '✅';
          if (lowerText.includes('code') || lowerText.includes('implementation')) return '💻';
          if (lowerText.includes('summary') || lowerText.includes('conclusion')) return '📋';
          if (lowerText.includes('change') || lowerText.includes('update')) return '🔄';
          if (lowerText.includes('key') || lowerText.includes('main') || lowerText.includes('primary')) return '🔑';
          
          // Level-based fallback emojis
          switch (level) {
            case 1: return '🎯';
            case 2: return '📌';
            case 3: return '▶️';
            default: return '•';
          }
        };
        
        const emoji = getHeaderEmoji(level, text);
        const HeadingTag = `h${Math.min(level, 6)}`;
        
        return (
          <React.Fragment key={i}>
            <HeadingTag 
              style={{
                fontSize: level === 1 ? '1.4em' : level === 2 ? '1.2em' : '1.05em',
                fontWeight: level === 1 ? '700' : level === 2 ? '600' : '500',
                color: level === 1 ? '#7c3aed' : level === 2 ? '#8b5cf6' : '#a78bfa',
                margin: level === 1 ? '20px 0 12px 0' : level === 2 ? '16px 0 10px 0' : '12px 0 8px 0',
                lineHeight: '1.4',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderLeft: level === 1 ? '4px solid #7c3aed' : level === 2 ? '3px solid #8b5cf6' : 'none',
                paddingLeft: level <= 2 ? '12px' : '0',
                background: level === 1 ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.05), transparent)' : 'transparent',
                borderRadius: level === 1 ? '4px' : '0'
              }}
            >
              <span style={{ fontSize: '1.1em', minWidth: '20px' }}>{emoji}</span>
              <span>{renderMarkdownInline(text, `h${i}-`)}</span>
            </HeadingTag>
            {i < lines.length - 1 ? <br /> : null}
          </React.Fragment>
        );
      }
      
      return (
        <React.Fragment key={i}>
          {renderMarkdownInline(line, `l${i}-`)}
          {i < lines.length - 1 ? <br /> : null}
        </React.Fragment>
      );
    });
  };

  const formatMessage = (text) => {
    const parts = String(text).split(/(```[\s\S]*?```|`[^`]*`)/);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const code = part.slice(3, -3);
        const lines = code.split("\n");
        const firstLine = lines[0].trim();
        const language = firstLine.match(/^[A-Za-z0-9#.+-]+$/) ? firstLine : "code";
        const codeContent = firstLine === language ? lines.slice(1).join("\n") : code;

        return (
          <motion.div 
            key={index} 
            className="code-block"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="code-block__header">
              <div className="code-block__dots">
                <span className="dot dot--red"></span>
                <span className="dot dot--yellow"></span>
                <span className="dot dot--green"></span>
              </div>
              <span className="code-block__lang">{language || "code"}</span>
              <button
                onClick={() => copyToClipboard(codeContent.trim(), `block-${index}`)}
                className="code-block__copy"
                title="Copy code"
              >
                {copiedCode === `block-${index}` ? (
                  <>
                    <Check className="icon" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="icon" /> Copy
                  </>
                )}
              </button>
            </div>
            <pre className="code-block__content">
              <code>{codeContent.trim()}</code>
            </pre>
          </motion.div>
        );
      } else if (part.startsWith("`") && part.endsWith("`")) {
        const code = part.slice(1, -1);
        return (
          <span key={index} className="code-inline">
            {code}
            <button
              onClick={() => copyToClipboard(code, `inline-${index}`)}
              className="code-inline__btn"
              aria-label="Copy"
              title="Copy"
            >
              {copiedCode === `inline-${index}` ? <Check className="icon" /> : <Copy className="icon" />}
            </button>
          </span>
        );
      }
      return (
        <span key={index}>
          {renderWithLineBreaks(part)}
        </span>
      );
    });
  };

  const sendMessage = async () => {
    if (!input.trim() && !uploadedImage) return;

    // Ensure an active chat exists
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      const newChat = {
        id: newChatId,
        title: "New Chat",
        messages: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      setChatHistory(prev => [newChat, ...(Array.isArray(prev) ? prev : [])]);
      setCurrentChatId(newChatId);
    }

    const userMessage = { 
      sender: "user", 
      text: input || "What do you see in this image?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: imagePreview // Include image preview for display
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    const currentImage = uploadedImage;
    
    setInput("");
    setUploadedImage(null);
    setImagePreview(null);
    setLoading(true);
    setIsStreaming(true);
    setStreamingMessage("");
    setError("");

    // Create AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Prepare the request body
      const requestBody = { 
        session_id: "user123", 
        question: currentInput || "What do you see in this image?"
      };

      // If there's an image, add it to the request
      if (currentImage) {
        requestBody.image = currentImage;
        requestBody.has_image = true;
      }

      const response = await fetch("http://127.0.0.1:5001/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }
              
              if (data.chunk && !data.done) {
                setStreamingMessage(prev => prev + data.chunk);
              }
              
              if (data.done) {
                const finalResponse = data.full_response || streamingMessage;
                const botMessage = { 
                  sender: "bot", 
                  text: finalResponse,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages((prev) => [...prev, botMessage]);
                setStreamingMessage("");
                setIsStreaming(false);
                setLoading(false);
                setAbortController(null);
                return;
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was aborted by user
        return;
      }
      
      const errorMessage = {
        sender: "bot",
        text: err.message || "Sorry, I'm having trouble connecting to the server.",
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(err.message || "Request failed");
      setStreamingMessage("");
      setIsStreaming(false);
      setAbortController(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setImagePreview(base64String);
        // Convert to base64 without data URL prefix for backend
        const base64Data = base64String.split(',')[1];
        setUploadedImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages.map((msg) => ({
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp,
        isError: msg.isError || false
      }))
    };
    const jsonString = JSON.stringify(chatData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chat_history_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="chat-root theme--dark">
      {/* Animated background */}
      <div className="bg-anim bg-anim--dark" aria-hidden="true" />

      <header className="chat-header">
        <div className="chat-header__left">
          <button 
            className="btn btn--ghost" 
            onClick={() => setIsLeftSidebarOpen(true)}
            title="Chat History"
            style={{ marginRight: '12px' }}
          >
            <Menu className="icon" />
          </button>
          <div className="chat-logo">
            <Sparkles className="icon" />
          </div>
          <div>
            <h1 className="chat-title">VibeEra</h1>
            <p className="chat-subtitle">Powered by Qwen2.5-Coder</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button 
            className="btn btn--ghost" 
            onClick={() => setIsSidebarOpen(true)}
            title="Open Music Player"
          >
            <Music className="icon" />
            Music
          </button>
          <AuthButton />
          <button 
            className="btn btn--ghost" 
            onClick={() => setIsQuickActionsOpen(true)}
            title="Quick Actions"
          >
            <Zap className="icon" />
            Quick Actions
          </button>
        </div>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="error-banner"
          >
            <AlertCircle className="icon" />
            <span className="error-text">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isQuickActionsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="quick-actions-backdrop"
              onClick={() => setIsQuickActionsOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 999,
              }}
            />
            
            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="quick-actions-popup"
              ref={quickActionsRef}
              style={{
                position: 'fixed',
                top: '70px',
                right: '20px',
                backgroundColor: 'rgba(20, 20, 30, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '12px',
                minWidth: '180px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                zIndex: 1000,
              }}
            >
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2px',
                fontSize: '14px'
              }}>
                <div style={{
                  padding: '8px 12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '12px',
                  fontWeight: '500',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: '4px'
                }}>
                  Quick Actions
                </div>
                
                <button 
                  className="btn btn--ghost" 
                  onClick={() => {
                    clearChat();
                    setIsQuickActionsOpen(false);
                  }}
                  title="Clear Chat"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    justifyContent: 'flex-start',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    width: '100%',
                    color: '#ff6b6b',
                    fontSize: '14px',
                    fontWeight: '400',
                    border: 'none',
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <Trash2 size={16} />
                  Clear Chat
                </button>
                
                <button 
                  className="btn btn--ghost" 
                  onClick={() => {
                    exportChat();
                    setIsQuickActionsOpen(false);
                  }}
                  title="Export Chat"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    justifyContent: 'flex-start',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    width: '100%',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    fontWeight: '400',
                    border: 'none',
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <Download size={16} />
                  Export Chat
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="chat-main">
        <div className="chat-content">
          {messages.length === 0 && !isStreaming && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="welcome"
            >
              <div className="welcome__logo">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <MessageCircle className="welcome__icon" />
                </motion.div>
              </div>
              <h1 className="welcome__title">Welcome to VibeEra</h1>
              <p className="welcome__desc">I'm your AI assistant. Ask me anything and I'll help you!</p>
              <div className="welcome__suggestions">
                <button className="suggestion-chip" onClick={() => setInput("What can you help me with?")}>
                  What can you help me with?
                </button>
                <button className="suggestion-chip" onClick={() => setInput("Write a Python function")}>
                  Write a Python function
                </button>
                <button className="suggestion-chip" onClick={() => setInput("Explain a concept")}>
                  Explain a concept
                </button>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className={`msg-row ${msg.sender === "user" ? "msg-row--end" : "msg-row--start"}`}
              >
                {msg.sender === "bot" && (
                  <motion.div 
                    className="avatar avatar--bot"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bot className="icon" />
                  </motion.div>
                )}

                <div className="message-container">
                  {msg.image && (
                    <div className="message-image">
                      <img 
                        src={msg.image} 
                        alt="Uploaded" 
                        style={{
                          maxWidth: '300px',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}
                  <div
                    className={`bubble ${
                      msg.sender === "user"
                        ? "bubble--user"
                        : msg.isError
                        ? "bubble--error"
                        : "bubble--bot"
                    }`}
                  >
                    <div className="bubble__content">{formatMessage(msg.text)}</div>
                  </div>
                  <div className="message-meta">
                    <span className="message-time">
                      <Clock className="time-icon" />
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {msg.sender === "user" && (
                  <motion.div 
                    className="avatar avatar--user"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="icon" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming message */}
          {isStreaming && streamingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="msg-row msg-row--start"
            >
              <motion.div 
                className="avatar avatar--bot avatar--streaming"
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(124, 58, 237, 0.4)",
                    "0 0 0 8px rgba(124, 58, 237, 0)",
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Bot className="icon" />
              </motion.div>
              <div className="message-container">
                <div className="bubble bubble--bot bubble--streaming">
                  <div className="bubble__content">{formatMessage(streamingMessage)}</div>
                  <div className="streaming-indicator">
                    <motion.div
                      className="cursor-blink"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      |
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {loading && !streamingMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="typing"
            >
              <motion.div 
                className="avatar avatar--bot avatar--thinking"
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(124, 58, 237, 0.4)",
                    "0 0 0 8px rgba(124, 58, 237, 0)",
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Bot className="icon" />
              </motion.div>
              <div className="typing__bubble">
                <div className="dots">
                  <motion.span 
                    className="dot"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span 
                    className="dot"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.span 
                    className="dot"
                    animate={{ y: [8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span className="typing__text">AI is thinking...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="chat-input">
        <div className="chat-input__inner">
          {imagePreview && (
            <div className="image-preview">
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{
                  maxWidth: '100px',
                  maxHeight: '100px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  border: '2px solid rgba(124, 58, 237, 0.3)'
                }}
              />
              <button
                onClick={removeImage}
                className="remove-image-btn"
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'rgba(220, 38, 38, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="chat-input__row">
            <motion.textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={uploadedImage ? "Ask a question about your image..." : "Ask me anything... (Shift+Enter for new line)"}
              className="chat-textarea"
              rows={1}
              disabled={loading}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
              }}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <div className="chat-input__buttons">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn--ghost btn--icon"
                title="Upload Image"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  background: uploadedImage ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
                  color: uploadedImage ? '#7c3aed' : 'rgba(255, 255, 255, 0.7)',
                  minWidth: '40px',
                  height: '40px'
                }}
              >
                <Image className="icon" size={18} />
              </motion.button>
              {isStreaming ? (
                <motion.button
                  onClick={stopGeneration}
                  className="btn btn--danger chat-send"
                  title="Stop generation"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Square className="icon" />
                </motion.button>
              ) : (
                <motion.button
                  onClick={sendMessage}
                  disabled={loading || (!input.trim() && !uploadedImage)}
                  className="btn btn--primary chat-send"
                  title="Send"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="icon" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
        <p className="hint">Press Enter to send, Shift+Enter for new line • Click image icon to upload photos</p>
      </footer>

      {/* Sidebar */}
      <ErrorBoundary>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      </ErrorBoundary>
      {/* Left Sidebar */}
      <LeftSidebar 
        isOpen={isLeftSidebarOpen} 
        onClose={() => setIsLeftSidebarOpen(false)} 
        onNewChat={handleNewChat} 
        onSelectChat={handleSelectChat} 
        onRenameChat={(chatId, newTitle) => {
          setChatHistory(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle, lastUpdated: new Date().toISOString() } : c));
        }}
        onDeleteChat={(chatId) => {
          setChatHistory(prev => prev.filter(c => c.id !== chatId));
          if (currentChatId === chatId) {
            const remaining = chatHistory.filter(c => c.id !== chatId);
            if (remaining.length > 0) {
              setCurrentChatId(remaining[0].id);
              setMessages(remaining[0].messages || []);
            } else {
              setCurrentChatId(null);
              setMessages([]);
            }
          }
        }}
        chatHistory={chatHistory} 
        currentChatId={currentChatId} 
      />
    </div>
  );
}