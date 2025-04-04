'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, MicOff, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  actions?: Action[];
}

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
  context?: string;
  session_id?: string;
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
  const [inputValue, setInputValue] = useState('');
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [placeholderText, setPlaceholderText] = useState("Comment puis-je vous aider ?");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioChunks = useRef<Blob[]>([]);
  
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
              console.log('ℹ️ Utilisation des champs "response" et "actions" de premier niveau.');
              finalContent = typeof data.response === 'string' ? data.response : JSON.stringify(data.response); // Ensure content is a string
              finalActions = data.actions;
          }
          // If top-level 'actions' is missing or empty, check if 'response' might contain the nested structure
          else if (typeof data.response === 'string') {
              console.log('ℹ️ Champ "actions" de premier niveau absent ou vide. Tentative de parsing du champ "response".');
              try {
                  // Replace single quotes ONLY if it looks like a Python dict literal string
                  let potentialJsonString = data.response;
                  // Basic check if it looks like an object string
                  if (potentialJsonString.trim().startsWith('{') && potentialJsonString.trim().endsWith('}')) {
                     // WARNING: This replace is fragile and might corrupt content if the string contains single quotes.
                     console.log('Original string to parse:', potentialJsonString);
                     // Replace single quotes used for keys/values with double quotes
                     potentialJsonString = potentialJsonString.replace(/'/g, '"');
                     // Attempt to fix common issues like d" => d'
                     potentialJsonString = potentialJsonString.replace(/([a-zA-Z])"([a-zA-Z])/g, "$1'$2");
                     console.log('String after replace attempt:', potentialJsonString);
                  } else {
                      console.log('String does not look like dict literal, using as is.');
                  }

                  const parsedInnerData = JSON.parse(potentialJsonString);

                  // Check if the parsed object has the expected structure
                  if (parsedInnerData && typeof parsedInnerData.response === 'string') {
                      finalContent = parsedInnerData.response;
                      // Use inner actions. Ensure it's an array.
                      finalActions = Array.isArray(parsedInnerData.actions) ? parsedInnerData.actions : undefined;
                      console.log('✅ Données internes JSON parsées avec succès depuis le champ "response". Inner actions:', finalActions);
                  } else {
                      // Parsed object structure is unexpected. Use original 'response' string as content.
                      finalContent = data.response;
                      finalActions = undefined; // No valid actions found
                      console.warn('⚠️ Structure JSON interne inattendue après parsing. Utilisation de la chaîne "response" originale comme contenu.');
                  }
              } catch (e) {
                  // Parsing failed. Treat 'response' string as plain content.
                  finalContent = data.response;
                  finalActions = undefined; // No valid actions found
                  console.log('ℹ️ Échec du parsing JSON interne. Utilisation de la chaîne "response" originale comme contenu. Erreur:', e);
              }
          }
          // Default case: 'response' is not a string or 'actions' was missing/empty and parsing failed/not attempted
          else {
               finalContent = data.response ? JSON.stringify(data.response) : ''; // Ensure content is string, handle non-string response
               finalActions = undefined; // No actions available
               console.log('ℹ️ Cas par défaut: Utilisation du champ "response" comme contenu. Aucune action valide trouvée.');
          }

          // Créer le message de l'assistant
          const assistantMessage: ChatMessage = {
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
          
          console.log('💬 Message assistant créé:', assistantMessage);
          setMessages(prev => {
            console.log('Messages précédents:', prev);
            const newMessages = [...prev, assistantMessage];
            console.log('Nouveaux messages:', newMessages);
            return newMessages;
          });
          
          if (data.session_id) {
            console.log('🔑 Session ID reçu:', data.session_id);
          }
        } catch (error) {
          console.error('❌ Erreur lors de l\'envoi du message:', error);
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
      console.log('🚀 Envoi du message:', inputValue.trim());
      
      const newMessage: ChatMessage = {
        role: 'user',
        content: inputValue.trim()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');
      setIsConversationOpen(true);
      setIsLoading(true);
      
      try {
        console.log('📤 Requête API en cours...');
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
        console.log('📥 Réponse API reçue:', data);
        
        let finalContent: string = '';
        let finalActions: Action[] | undefined = undefined;

        // Prioritize top-level 'actions' if it exists and is a valid array
        if (Array.isArray(data.actions) && data.actions.length > 0) {
            console.log('ℹ️ Utilisation des champs "response" et "actions" de premier niveau.');
            finalContent = typeof data.response === 'string' ? data.response : JSON.stringify(data.response); // Ensure content is a string
            finalActions = data.actions;
        }
        // If top-level 'actions' is missing or empty, check if 'response' might contain the nested structure
        else if (typeof data.response === 'string') {
            console.log('ℹ️ Champ "actions" de premier niveau absent ou vide. Tentative de parsing du champ "response".');
            try {
                // Replace single quotes ONLY if it looks like a Python dict literal string
                let potentialJsonString = data.response;
                // Basic check if it looks like an object string
                if (potentialJsonString.trim().startsWith('{') && potentialJsonString.trim().endsWith('}')) {
                   // WARNING: This replace is fragile and might corrupt content if the string contains single quotes.
                   console.log('Original string to parse:', potentialJsonString);
                   // Replace single quotes used for keys/values with double quotes
                   potentialJsonString = potentialJsonString.replace(/'/g, '"');
                   // Attempt to fix common issues like d" => d'
                   potentialJsonString = potentialJsonString.replace(/([a-zA-Z])"([a-zA-Z])/g, "$1'$2");
                   console.log('String after replace attempt:', potentialJsonString);
                } else {
                    console.log('String does not look like dict literal, using as is.');
                }

                const parsedInnerData = JSON.parse(potentialJsonString);

                // Check if the parsed object has the expected structure
                if (parsedInnerData && typeof parsedInnerData.response === 'string') {
                    finalContent = parsedInnerData.response;
                    // Use inner actions. Ensure it's an array.
                    finalActions = Array.isArray(parsedInnerData.actions) ? parsedInnerData.actions : undefined;
                    console.log('✅ Données internes JSON parsées avec succès depuis le champ "response". Inner actions:', finalActions);
                } else {
                    // Parsed object structure is unexpected. Use original 'response' string as content.
                    finalContent = data.response;
                    finalActions = undefined; // No valid actions found
                    console.warn('⚠️ Structure JSON interne inattendue après parsing. Utilisation de la chaîne "response" originale comme contenu.');
                }
            } catch (e) {
                // Parsing failed. Treat 'response' string as plain content.
                finalContent = data.response;
                finalActions = undefined; // No valid actions found
                console.log('ℹ️ Échec du parsing JSON interne. Utilisation de la chaîne "response" originale comme contenu. Erreur:', e);
            }
        }
        // Default case: 'response' is not a string or 'actions' was missing/empty and parsing failed/not attempted
        else {
             finalContent = data.response ? JSON.stringify(data.response) : ''; // Ensure content is string, handle non-string response
             finalActions = undefined; // No actions available
             console.log('ℹ️ Cas par défaut: Utilisation du champ "response" comme contenu. Aucune action valide trouvée.');
        }

        // Créer le message de l'assistant
        const assistantMessage: ChatMessage = {
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
        
        console.log('💬 Message assistant créé:', assistantMessage);
        setMessages(prev => {
          console.log('Messages précédents:', prev);
          const newMessages = [...prev, assistantMessage];
          console.log('Nouveaux messages:', newMessages);
          return newMessages;
        });
        
        if (data.session_id) {
          console.log('🔑 Session ID reçu:', data.session_id);
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi du message:', error);
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
  const MessageComponent: React.FC<{ message: ChatMessage }> = ({ message }) => {
    console.log('🎯 Rendu du message:', message);
    console.log('Actions du message:', message.actions);
    
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
                    console.log('🔗 Clic sur l\'action:', action);
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
    );
  };

  return (
    <div className={`w-full mx-auto relative ${isMobile ? 'mb-6 mt-6' : 'mb-12 mt-16'} transition-all duration-300 rounded-2xl ${isMobile ? 'p-2' : 'p-6'} ${isConversationOpen && !isMobile ? 'conversation-container' : ''}`}>
      <div className={`${isMobile ? 'max-w-full px-2' : 'max-w-3xl px-6'} mx-auto`}>
        {/* En-tête aligné à gauche */}
        <div className={`${isMobile ? 'mb-4' : 'mb-10'} text-left`}>
          <div className={`${isMobile ? 'mb-1' : 'mb-3'}`}>
            <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-bold text-[#B82EAF]`}>Hi, I&apos;m 
              <span className="inline-flex items-center ml-2">
                <span className={`font-extrabold ${isMobile ? 'text-3xl' : 'text-4xl'} text-white`}>Lucas !</span>
              </span>
            </h1>
          </div>
          <div className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>
            <span className="text-gray-400 font-light">I&apos;m a</span> 
            <span className="font-bold mx-1 text-white">Lead IA Designer</span> 
            <div className={`flex ${isMobile ? 'flex-wrap' : ''} items-center ${isMobile ? 'gap-2 mt-2' : 'gap-4 mt-4'}`}>
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
        {(!isConversationOpen || isMobile) && (
          <div className="relative">
            <div className="w-full">
              <div className="relative rounded-2xl bg-[#252339] dark:bg-[#252339] overflow-hidden">
                <textarea
                  ref={textareaRef}
                  className={`w-full ${isMobile ? 'px-3 py-4' : 'px-5 py-6'} bg-transparent resize-none outline-none ${isMobile ? 'min-h-[60px] max-h-[150px]' : 'min-h-[90px] max-h-[200px]'} pr-24 text-white dark:text-white`}
                  placeholder={placeholderText}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={isMobile ? 2 : 3}
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
                  <MessageComponent key={index} message={message} />
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
                  placeholder={placeholderText}
                  value={inputValue}
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

        {/* Modale pour mobile */}
        {isConversationOpen && isMobile && (
          <div className="fixed inset-0 bg-black z-50 flex">
            <div className="w-full h-full flex flex-col bg-black">
              <div className="h-12 px-3 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Conversation</h3>
                <button 
                  onClick={closeConversation}
                  className="p-1.5 rounded-full hover:bg-gray-800 text-gray-300"
                  aria-label="Fermer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-3 space-y-3 overflow-y-auto flex-grow">
                {messages.map((message, index) => (
                  <MessageComponent key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-black p-3 rounded-lg rounded-bl-none">
                      <LoadingDots />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-700">
                <div className="relative">
                  <textarea
                    className="w-full px-3 py-2 bg-black border-0 rounded-2xl resize-none outline-none pr-20 text-white placeholder-gray-300"
                    placeholder={placeholderText}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={2}
                  />
                  <div className="absolute right-2 bottom-2 flex gap-1.5">
                    <button 
                      onClick={handleSendMessage}
                      className="p-1.5 rounded-full bg-[#252339] text-white hover:bg-blue-600 transition-colors"
                      aria-label="Envoyer"
                    >
                      <ArrowUp className="h-4 w-4" />
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