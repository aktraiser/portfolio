'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, MicOff, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
}

const API_URL = 'http://localhost:3001/api';

// Ajout du composant LoadingDots
const LoadingDots = () => {
  return (
    <div className="flex items-center">
      <span className="text-gray-500 dark:text-gray-300">Generation</span>
      <span className="inline-flex ml-1">
        <span className="animate-dot1 opacity-0">.</span>
        <span className="animate-dot2 opacity-0">.</span>
        <span className="animate-dot3 opacity-0">.</span>
      </span>
    </div>
  );
};

export function ChatInput() {
  const [inputValue, setInputValue] = useState('');
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioChunks = useRef<Blob[]>([]);
  
  // Détection du mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Ajout d'une classe au body lorsque le volet est ouvert
  useEffect(() => {
    if (!isMobile) {
      if (isConversationOpen) {
        document.body.classList.add('conversation-open');
      } else {
        document.body.classList.remove('conversation-open');
      }
    }
    
    return () => {
      document.body.classList.remove('conversation-open');
    };
  }, [isConversationOpen, isMobile]);

  // Ajuster la hauteur du textarea en fonction du contenu
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Gestion de l'enregistrement audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      audioChunks.current = [];
      recorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await sendAudioMessage(audioBlob);
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setMediaRecorder(null);
    setAudioStream(null);
  };

  const sendAudioMessage = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const audioData = base64Audio.split(',')[1];

        const newMessage: ChatMessage = {
          role: 'user',
          content: '🎤 Audio message'
        };
        setMessages(prev => [...prev, newMessage]);
        setIsConversationOpen(true);
        setIsLoading(true);

        try {
          const response = await fetch(`${API_URL}/chat/audio`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audioData,
              format: 'wav'
            }),
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          
          // Créer un Blob à partir de la réponse audio
          const audioResponseBlob = new Blob([Buffer.from(data.audioResponse)], { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioResponseBlob);

          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: data.text,
            audioUrl
          };
          
          setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
          console.error('Error sending audio message:', error);
        } finally {
          setIsLoading(false);
        }
      };
    } catch (error) {
      console.error('Error sending audio message:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage: ChatMessage = {
        role: 'user',
        content: inputValue.trim()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      setIsConversationOpen(true);
      setIsLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/chat/text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: newMessage.content
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        // Créer un Blob à partir de la réponse audio
        const audioBlob = new Blob([Buffer.from(data.audioResponse)], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.text,
          audioUrl
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const closeConversation = async () => {
    try {
      await fetch(`${API_URL}/chat/reset`, {
        method: 'POST',
      });
      setIsConversationOpen(false);
      setMessages([]);
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <div className={`w-full mx-auto relative mb-12 mt-16 transition-all duration-300 rounded-2xl p-6 ${isConversationOpen && !isMobile ? 'conversation-container' : ''}`}>
      <div className="max-w-3xl mx-auto px-6">
        {/* En-tête aligné à gauche */}
        <div className="mb-10 text-left">
          <div className="mb-3">
            <h1 className="text-5xl font-bold text-white">Hi, I&apos;m 
              <span className="inline-flex items-center ml-2">
                <span className="font-extrabold text-4xl text-white">Lucas !</span>
              </span>
            </h1>
          </div>
          <div className="text-2xl">
            <span className="text-gray-400 font-light">I&apos;m a</span> 
            <span className="font-bold mx-1 text-white">Lead Designer</span> 
            <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="inline-flex ml-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 hover:text-[#0A66C2]">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://x.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="inline-flex ml-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 hover:text-black">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="inline-flex ml-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 hover:text-black">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51h6.938v-.007zM16.94 16.665c.44.428 1.073.643 1.894.643.59 0 1.1-.148 1.53-.447.396-.29.66-.61.78-.94h2.588c-.403 1.28-1.048 2.2-1.9 2.75-.85.56-1.884.83-3.08.83-.837 0-1.584-.13-2.272-.4-.673-.27-1.24-.65-1.72-1.14-.464-.49-.823-1.08-1.077-1.77-.253-.69-.373-1.45-.373-2.27 0-.803.135-1.54.403-2.23.27-.7.644-1.28 1.12-1.79.495-.51 1.063-.895 1.736-1.194s1.4-.433 2.22-.433c.91 0 1.69.164 2.38.523.67.34 1.22.82 1.66 1.4.426.58.738 1.25.93 2.01.19.75.254 1.57.215 2.43h-7.67c0 .87.23 1.55.7 2.05zm-9.996-10.43c-.26-.23-.62-.35-1.09-.35H2.27v3.29h3.486c.55 0 .963-.108 1.27-.332.305-.224.46-.58.46-1.07 0-.527-.174-.9-.517-1.13zm.573 4.223c-.307-.222-.743-.333-1.306-.333H2.28v3.693h3.783c.563 0 1.03-.11 1.384-.355.345-.233.518-.63.518-1.18 0-.577-.213-.994-.63-1.25l.003-.005zM17.76 6.797c.615 0 1.14.077 1.59.232.437.152.8.362 1.077.625.265.262.455.578.562.945.107.37.16.772.16 1.188h-6.96c.063-.745.25-1.345.427-1.684.515-.988 1.487-1.305 3.153-1.305h-.002z"/>
              </svg>
            </a>
            <a href="https://behance.net/yourusername" target="_blank" rel="noopener noreferrer" aria-label="Behance" className="inline-flex ml-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600 hover:text-[#0057ff]">
                <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51h6.938v-.007zM16.94 16.665c.44.428 1.073.643 1.894.643.59 0 1.1-.148 1.53-.447.396-.29.66-.61.78-.94h2.588c-.403 1.28-1.048 2.2-1.9 2.75-.85.56-1.884.83-3.08.83-.837 0-1.584-.13-2.272-.4-.673-.27-1.24-.65-1.72-1.14-.464-.49-.823-1.08-1.077-1.77-.253-.69-.373-1.45-.373-2.27 0-.803.135-1.54.403-2.23.27-.7.644-1.28 1.12-1.79.495-.51 1.063-.895 1.736-1.194s1.4-.433 2.22-.433c.91 0 1.69.164 2.38.523.67.34 1.22.82 1.66 1.4.426.58.738 1.25.93 2.01.19.75.254 1.57.215 2.43h-7.67c0 .87.23 1.55.7 2.05zm-9.996-10.43c-.26-.23-.62-.35-1.09-.35H2.27v3.29h3.486c.55 0 .963-.108 1.27-.332.305-.224.46-.58.46-1.07 0-.527-.174-.9-.517-1.13zm.573 4.223c-.307-.222-.743-.333-1.306-.333H2.28v3.693h3.783c.563 0 1.03-.11 1.384-.355.345-.233.518-.63.518-1.18 0-.577-.213-.994-.63-1.25l.003-.005zM17.76 6.797c.615 0 1.14.077 1.59.232.437.152.8.362 1.077.625.265.262.455.578.562.945.107.37.16.772.16 1.188h-6.96c.063-.745.25-1.345.427-1.684.515-.988 1.487-1.305 3.153-1.305h-.002z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Conteneur du textarea style ChatGPT - visible uniquement quand la conversation n'est pas ouverte */}
        {(!isConversationOpen || isMobile) && (
          <div className="relative">
            <div className="w-full">
              <div className="relative rounded-2xl bg-gray-900 dark:bg-gray-800 overflow-hidden">
                <textarea
                  ref={textareaRef}
                  className="w-full px-5 py-6 bg-transparent resize-none outline-none min-h-[90px] max-h-[200px] pr-24 text-white dark:text-white"
                  placeholder="Comment puis-je vous aider aujourd'hui ?"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={3}
                />
                <div className="absolute right-3 bottom-5 flex gap-2">
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className="p-1.5 rounded-full hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                    aria-label={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
                  >
                    {isRecording ? (
                      <MicOff className="h-5 w-5 text-red-500" />
                    ) : (
                      <Mic className="h-5 w-5 text-gray-300 dark:text-gray-300" />
                    )}
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    className="p-1.5 rounded-full hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Envoyer"
                  >
                    <ArrowUp className="h-5 w-5 text-gray-300 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Volet latéral pour desktop (fixed sur la droite) mais qui pousse le contenu */}
        {isConversationOpen && !isMobile && (
          <div className="fixed top-0 right-0 h-full w-[384px] bg-white dark:bg-black border-l border-gray-200 dark:border-gray-700 shadow-lg flex flex-col z-30">
            <div className="h-16 px-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Conversation</h3>
              <button 
                onClick={closeConversation}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-5">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-[#3B9BFF] text-white rounded-br-none' 
                          : 'bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 rounded-bl-none'
                      }`}
                    >
                      {message.content}
                      {message.audioUrl && message.role === 'assistant' && (
                        <button
                          onClick={() => playAudio(message.audioUrl!)}
                          className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                        >
                          Écouter la réponse
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-black p-4 rounded-lg rounded-bl-none">
                      <LoadingDots />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700">
              <div className="relative">
                <textarea
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-black border-0 rounded-2xl resize-none outline-none pr-24 text-gray-800 dark:text-gray-200"
                  placeholder="Tapez votre message..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={2}
                />
                <div className="absolute right-3 bottom-3 flex gap-2">
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    aria-label={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
                  >
                    {isRecording ? (
                      <MicOff className="h-5 w-5 text-red-500" />
                    ) : (
                      <Mic className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    className="p-2 rounded-full bg-[#3B9BFF] text-white hover:bg-blue-600 transition-colors"
                    aria-label="Envoyer"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale pour mobile */}
        {isConversationOpen && isMobile && (
          <div className="fixed inset-0 bg-black z-50 flex">
            <div className="w-full h-full flex flex-col bg-black">
              <div className="h-16 px-5 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Conversation</h3>
                <button 
                  onClick={closeConversation}
                  className="p-1.5 rounded-full hover:bg-gray-800 text-gray-300"
                  aria-label="Fermer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5 space-y-5 overflow-y-auto flex-grow">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-[#3B9BFF] text-white rounded-br-none' 
                          : 'bg-black text-white rounded-bl-none'
                      }`}
                    >
                      {message.content}
                      {message.audioUrl && message.role === 'assistant' && (
                        <button
                          onClick={() => playAudio(message.audioUrl!)}
                          className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                        >
                          Écouter la réponse
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-black p-4 rounded-lg rounded-bl-none">
                      <LoadingDots />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5 border-t border-gray-700">
                <div className="relative">
                  <textarea
                    className="w-full px-4 py-3 bg-black border-0 rounded-2xl resize-none outline-none pr-24 text-white placeholder-gray-300"
                    placeholder="Tapez votre message..."
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={2}
                  />
                  <div className="absolute right-3 bottom-3 flex gap-2">
                    <button 
                      onClick={isRecording ? stopRecording : startRecording}
                      className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                      aria-label={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
                    >
                      {isRecording ? (
                        <MicOff className="h-5 w-5 text-red-500" />
                      ) : (
                        <Mic className="h-5 w-5 text-gray-300" />
                      )}
                    </button>
                    <button 
                      onClick={handleSendMessage}
                      className="p-2 rounded-full bg-[#3B9BFF] text-white hover:bg-blue-600 transition-colors"
                      aria-label="Envoyer"
                    >
                      <ArrowUp className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 