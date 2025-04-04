'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, MicOff, Loader2 } from 'lucide-react';

// Interface pour les actions
interface Action {
  type: string;
  label: string;
  url: string;
  metadata?: {
    duration?: string;
    type?: string;
    [key: string]: any;
  };
}

// Interface pour gérer la réponse de l'API
interface ApiResponse {
  response: string;
  actions?: Array<{
    type: string;
    label: string;
    url: string;
  }>;
  session_id?: string;
}

// Interface pour les messages de chat
interface Message {
  content: string;
  role: 'user' | 'assistant';
  audioUrl?: string;
  actions?: Action[];
}

const API_URL = 'http://localhost:5003/api';

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

// Composant pour le bouton d'action
const ActionButton: React.FC<{ action: Action }> = ({ action }) => {
  return (
    <button
      onClick={() => window.open(action.url, '_blank')}
      className="mt-4 w-full bg-[#3B9BFF] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
    >
      {action.type === 'schedule_meeting' && (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )}
      {action.label}
    </button>
  );
};

export function ChatInput() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("Comment puis-je vous aider ?");
  const [actions, setActions] = useState<any[]>([]);
  const [isCommercial, setIsCommercial] = useState(false); // Flag pour le mode commercial
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Référence pour le scroll automatique
  
  // Animation du placeholder
  useEffect(() => {
    const placeholders = [
      "Comment puis-je vous aider ?",
      "Vous avez un projet ?",
      "Vous avez une question ?"
    ];
    
    // Si la conversation est ouverte, on fixe le placeholder à "Posez une question"
    if (isConversationOpen) {
      setPlaceholderText("Posez une question");
      return; // On sort de l'effet pour ne pas démarrer l'intervalle
    }
    
    let index = 0;
    
    const intervalId = setInterval(() => {
      index = (index + 1) % placeholders.length;
      setPlaceholderText(placeholders[index]);
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [isConversationOpen]); // Ajout de la dépendance isConversationOpen
  
  // Détection du mobile et de la tablette
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640); // Mobile en dessous de 640px
      setIsTablet(width >= 640 && width < 1024); // Tablette entre 640px et 1024px
    };
    
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  // Ajout d'une classe au body lorsque le volet est ouvert
  useEffect(() => {
    if (!isMobile && !isTablet) {
      if (isConversationOpen) {
        document.body.classList.add('conversation-open');
      } else {
        document.body.classList.remove('conversation-open');
      }
    }
    
    // Émettre un événement personnalisé lorsque l'état de la conversation change
    const event = new CustomEvent('conversationStateChanged', { 
      detail: { isOpen: isConversationOpen } 
    });
    document.dispatchEvent(event);
    
    return () => {
      document.body.classList.remove('conversation-open');
    };
  }, [isConversationOpen, isMobile, isTablet]);

  // Ajuster la hauteur du textarea en fonction du contenu
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

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
      // Suppression de console.error
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

        const newMessage: Message = {
          role: 'user',
          content: '🎤 Audio message'
        };
        setMessages(prev => [...prev, newMessage]);
        setIsConversationOpen(true);
        setIsLoading(true);

        try {
          // Pour l'instant, comme nous n'avons pas d'endpoint audio,
          // envoyons juste un message texte standard à l'API
          const response = await fetch(`${API_URL}/agno_chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: "Message audio transcrit: <Transcription non disponible>"
            }),
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          
          let finalContent: string = '';
          let finalActions: Action[] | undefined = undefined;

          // Prioritize top-level 'actions' if it exists and is a valid array
          if (Array.isArray(data.actions) && data.actions.length > 0) {
              finalContent = typeof data.response === 'string' ? data.response : JSON.stringify(data.response); // Ensure content is a string
              finalActions = data.actions;
          }
          // If top-level 'actions' is missing or empty, check if 'response' might contain the nested structure
          else if (typeof data.response === 'string') {
              try {
                  // Replace single quotes ONLY if it looks like a Python dict literal string
                  let potentialJsonString = data.response;
                  // Basic check if it looks like an object string
                  if (potentialJsonString.trim().startsWith('{') && potentialJsonString.trim().endsWith('}')) {
                     // Suppression des console.log
                     potentialJsonString = potentialJsonString.replace(/'/g, '"');
                     // Attempt to fix common issues like d" => d'
                     potentialJsonString = potentialJsonString.replace(/([a-zA-Z])"([a-zA-Z])/g, "$1'$2");
                  }

                  const parsedInnerData = JSON.parse(potentialJsonString);

                  // Check if the parsed object has the expected structure
                  if (parsedInnerData && typeof parsedInnerData.response === 'string') {
                      finalContent = parsedInnerData.response;
                      // Use inner actions. Ensure it's an array.
                      finalActions = Array.isArray(parsedInnerData.actions) ? parsedInnerData.actions : undefined;
                  } else {
                      // Parsed object structure is unexpected. Use original 'response' string as content.
                      finalContent = data.response;
                      finalActions = undefined; // No valid actions found
                  }
              } catch (e) {
                  // Parsing failed. Treat 'response' string as plain content.
                  finalContent = data.response;
                  finalActions = undefined; // No valid actions found
              }
          }
          // Default case: 'response' is not a string or 'actions' was missing/empty and parsing failed/not attempted
          else {
               finalContent = data.response ? JSON.stringify(data.response) : ''; // Ensure content is string, handle non-string response
               finalActions = undefined; // No actions available
          }

          // Créer le message de l'assistant
          const assistantMessage: Message = {
            role: 'assistant',
            content: finalContent,
            // S'assurer que finalActions est bien un tableau avant de mapper
            actions: Array.isArray(finalActions) ? finalActions.map((action: Action) => ({
              type: action.type,
              label: action.label,
              url: action.url,
              metadata: action.metadata
            })) : undefined // Mettre undefined si ce n'est pas un tableau valide
          };
          
          setMessages(prev => {
            const newMessages = [...prev, assistantMessage];
            return newMessages;
          });
        } catch (error) {
          // Suppression de console.error
        } finally {
          setIsLoading(false);
        }
      };
    } catch (error) {
      // Suppression de console.error
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      
      const newMessage: Message = {
        role: 'user',
        content: input.trim()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      setIsConversationOpen(true);
      setIsLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/agno_chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: newMessage.content
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        
        let finalContent: string = '';
        let finalActions: Action[] | undefined = undefined;

        // Prioritize top-level 'actions' if it exists and is a valid array
        if (Array.isArray(data.actions) && data.actions.length > 0) {
            finalContent = typeof data.response === 'string' ? data.response : JSON.stringify(data.response); // Ensure content is a string
            finalActions = data.actions;
        }
        // If top-level 'actions' is missing or empty, check if 'response' might contain the nested structure
        else if (typeof data.response === 'string') {
            try {
                // Replace single quotes ONLY if it looks like a Python dict literal string
                let potentialJsonString = data.response;
                // Basic check if it looks like an object string
                if (potentialJsonString.trim().startsWith('{') && potentialJsonString.trim().endsWith('}')) {
                   // Suppression des console.log
                   potentialJsonString = potentialJsonString.replace(/'/g, '"');
                   // Attempt to fix common issues like d" => d'
                   potentialJsonString = potentialJsonString.replace(/([a-zA-Z])"([a-zA-Z])/g, "$1'$2");
                }

                const parsedInnerData = JSON.parse(potentialJsonString);

                // Check if the parsed object has the expected structure
                if (parsedInnerData && typeof parsedInnerData.response === 'string') {
                    finalContent = parsedInnerData.response;
                    // Use inner actions. Ensure it's an array.
                    finalActions = Array.isArray(parsedInnerData.actions) ? parsedInnerData.actions : undefined;
                } else {
                    // Parsed object structure is unexpected. Use original 'response' string as content.
                    finalContent = data.response;
                    finalActions = undefined; // No valid actions found
                }
            } catch (e) {
                // Parsing failed. Treat 'response' string as plain content.
                finalContent = data.response;
                finalActions = undefined; // No valid actions found
            }
        }
        // Default case: 'response' is not a string or 'actions' was missing/empty and parsing failed/not attempted
        else {
             finalContent = data.response ? JSON.stringify(data.response) : ''; // Ensure content is string, handle non-string response
             finalActions = undefined; // No actions available
        }

        // Créer le message de l'assistant
        const assistantMessage: Message = {
          role: 'assistant',
          content: finalContent,
          // S'assurer que finalActions est bien un tableau avant de mapper
          actions: Array.isArray(finalActions) ? finalActions.map((action: Action) => ({
            type: action.type,
            label: action.label,
            url: action.url,
            metadata: action.metadata
          })) : undefined // Mettre undefined si ce n'est pas un tableau valide
        };
        
        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          return newMessages;
        });
      } catch (error) {
        // Suppression de console.error
      } finally {
        setIsLoading(false);
      }
    }
  };

  const closeConversation = async () => {
    // Suppression de l'appel à un endpoint reset inexistant
    setIsConversationOpen(false);
    setMessages([]);
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  // Composant pour le rendu des messages
  const MessageComponent: React.FC<{ message: Message }> = ({ message }) => {
    return (
      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div 
          className={`max-w-[80%] p-4 rounded-lg ${
            message.role === 'user' 
              ? 'bg-[#B82EAF] text-white rounded-br-none' 
              : 'bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 rounded-bl-none'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
          {message.actions && message.actions.length > 0 && (
            <div className="mt-4">
              {message.actions.map((action, actionIndex) => (
                <button
                  key={actionIndex}
                  onClick={() => {
                    window.open(action.url, '_blank');
                  }}
                  className="w-full bg-[#B82EAF] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  {action.type === 'schedule_meeting' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          )}
          {message.content.includes('🎤 Audio message') && message.role === 'assistant' && (
            <button
              onClick={() => playAudio(message.content.split(': ')[1]!)}
              className="mt-2 text-sm text-blue-500 hover:text-blue-600"
            >
              Écouter la réponse
            </button>
          )}
        </div>
      </div>
    );
  };

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setMessages([...messages, { content: message, role: 'user' }]);
      
      // Déterminer l'API à utiliser
      const apiUrl = isCommercial 
        ? '/api/chat/commercial'
        : '/api/chat';
      
      // Construire la requête API avec la session_id si disponible
      const requestBody: any = {
        query: message,
        context: ""
      };
      
      // Ajouter la session_id pour les conversations commerciales
      if (isCommercial && sessionId) {
        requestBody.session_id = sessionId;
        console.log("Utilisation de la session commerciale:", sessionId);
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data: ApiResponse = await response.json();
      
      // Mettre à jour la session_id si présente dans la réponse
      if (data.session_id && isCommercial) {
        setSessionId(data.session_id);
        console.log("Nouvelle session_id reçue:", data.session_id);
      }
      
      // Traiter les actions si présentes
      if (data.actions && data.actions.length > 0) {
        setActions(data.actions);
      } else {
        setActions([]);
      }
      
      setMessages([...messages, { content: message, role: 'user' }, { content: data.response, role: 'assistant' }]);
      setInput('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...messages, { content: message, role: 'user' }, { content: "Désolé, une erreur s'est produite lors de la communication avec le serveur.", role: 'assistant' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour défiler vers le dernier message
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Défilement automatique lorsque les messages changent
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className={`w-full mx-auto relative ${isMobile || isTablet ? 'mb-6 mt-6' : 'mb-12 mt-16'} transition-all duration-300 rounded-2xl ${isMobile || isTablet ? 'p-2' : 'p-6'} ${isConversationOpen && !isMobile && !isTablet ? 'conversation-container' : ''}`}>
      <div className={`${isMobile || isTablet ? 'max-w-full px-2' : 'max-w-3xl px-6'} mx-auto`}>
        {/* En-tête aligné à gauche */}
        <div className={`${isMobile || isTablet ? 'mb-4' : 'mb-10'} text-left`}>
          <div className={`${isMobile || isTablet ? 'mb-1' : 'mb-3'}`}>
            <h1 className={`${isMobile || isTablet ? 'text-4xl' : 'text-5xl'} font-bold text-[#B82EAF]`}>Hi, I&apos;m 
              <span className="inline-flex items-center ml-2">
                <span className={`font-extrabold ${isMobile || isTablet ? 'text-3xl' : 'text-4xl'} text-white`}>Lucas !</span>
              </span>
            </h1>
          </div>
          <div className={`${isMobile || isTablet ? 'text-xl' : 'text-2xl'}`}>
            <span className="text-gray-400 font-light">I&apos;m a</span> 
            <span className="font-bold mx-1 text-white">Lead IA Designer</span> 
            <div className={`flex ${isMobile || isTablet ? 'flex-wrap' : ''} items-center ${isMobile || isTablet ? 'gap-2 mt-2' : 'gap-4 mt-4'}`}>
                <div className="bg-[#252339] dark:bg-[#252339] px-4 py-2 rounded-md flex items-center">
                  <span className="text-white dark:text-white text-sm font-medium">Genrative IA</span>
                </div>
                <div className="bg-[#252339] dark:bg-[#252339] px-4 py-2 rounded-md flex items-center">
                  <span className="text-white dark:text-white text-sm font-medium">LlamaIndex</span>
                </div>
                <div className="bg-[#252339] dark:bg-[#252339] px-4 py-2 rounded-md flex items-center">
                  <span className="text-white dark:text-white text-sm font-medium">HuggingFace</span>
                </div>
                <div className="bg-[#252339] dark:bg-[#252339] px-4 py-2 rounded-md flex items-center">
                  <span className="text-white dark:text-white text-sm font-medium">Fine-tuning</span>
                </div>
                <div className="bg-[#252339] dark:bg-[#252339] px-4 py-2 rounded-md flex items-center">
                  <span className="text-white dark:text-white text-sm font-medium">UX</span>
                </div>
              </div>
          </div>
        </div>

        {/* Conteneur du textarea style ChatGPT - visible uniquement quand la conversation n'est pas ouverte */}
        {(!isConversationOpen) && (
          <div className="relative">
            <div className="w-full">
              <div className="relative rounded-2xl bg-[#252339] dark:bg-[#252339] overflow-hidden">
                <textarea
                  ref={textareaRef}
                  className={`w-full ${isMobile || isTablet ? 'px-3 py-4' : 'px-5 py-6'} bg-transparent resize-none outline-none ${isMobile || isTablet ? 'min-h-[60px] max-h-[150px]' : 'min-h-[90px] max-h-[200px]'} pr-24 text-white dark:text-white`}
                  placeholder={placeholderText}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={isMobile || isTablet ? 2 : 3}
                />
                <div className="absolute right-3 bottom-5 flex gap-2">
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className="p-1.5 rounded-full hover:bg-gray-700 dark:hover:bg-[#B82EAF] transition-colors"
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
                    className="p-1.5 rounded-full hover:bg-gray-700 dark:hover:bg-[#B82EAF] transition-colors"
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
        {isConversationOpen && !isMobile && !isTablet && (
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
                  <MessageComponent key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-black p-4 rounded-lg rounded-bl-none">
                      <LoadingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} /> {/* Élément invisible pour le scroll automatique */}
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700">
              <div className="relative">
                <textarea
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-black border-0 rounded-2xl resize-none outline-none pr-24 text-gray-800 dark:text-gray-200"
                  placeholder={placeholderText}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={2}
                />
                <div className="absolute right-3 bottom-3 flex gap-2">
                  <button 
                    onClick={handleSendMessage}
                    className="p-2 rounded-full bg-[#252339] text-white hover:bg-[#B82EAF] transition-colors"
                    aria-label="Envoyer"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale pour mobile et tablette */}
        {isConversationOpen && (isMobile || isTablet) && (
          <div className="fixed inset-0 bg-black z-50 flex">
            <div className="w-full h-full flex flex-col bg-black">
              <div className={`${isTablet ? 'h-16 px-5' : 'h-12 px-3'} border-b border-gray-700 flex justify-between items-center`}>
                <h3 className={`${isTablet ? 'text-xl' : 'text-lg'} font-bold text-white`}>Conversation</h3>
                <button 
                  onClick={closeConversation}
                  className="p-1.5 rounded-full hover:bg-gray-800 text-gray-300"
                  aria-label="Fermer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`${isTablet ? 'h-6 w-6' : 'h-5 w-5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className={`${isTablet ? 'p-5 space-y-5' : 'p-3 space-y-3'} overflow-y-auto flex-grow`}>
                {messages.map((message, index) => (
                  <MessageComponent key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={`bg-black ${isTablet ? 'p-4' : 'p-3'} rounded-lg rounded-bl-none`}>
                      <LoadingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} /> {/* Élément invisible pour le scroll automatique */}
              </div>
              <div className={`${isTablet ? 'p-5' : 'p-3'} border-t border-gray-700`}>
                <div className="relative">
                  <textarea
                    className={`w-full ${isTablet ? 'px-4 py-3' : 'px-3 py-2'} bg-black border-0 rounded-2xl resize-none outline-none ${isTablet ? 'pr-24' : 'pr-20'} text-white placeholder-gray-300`}
                    placeholder={placeholderText}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={2}
                  />
                  <div className={`absolute ${isTablet ? 'right-3 bottom-3' : 'right-2 bottom-2'} flex gap-1.5`}>
                    <button 
                      onClick={handleSendMessage}
                      className={`${isTablet ? 'p-2' : 'p-1.5'} rounded-full bg-[#252339] text-white hover:bg-[#B82EAF] transition-colors`}
                      aria-label="Envoyer"
                    >
                      <ArrowUp className={`${isTablet ? 'h-5 w-5' : 'h-4 w-4'}`} />
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