'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';

export default function FloatingChatButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Observer pour détecter quand ChatInput n'est plus visible
  useEffect(() => {
    const chatInputElement = document.querySelector('.chat-input-container');
    
    if (!chatInputElement) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Le bouton est visible seulement quand ChatInput n'est pas visible ET qu'aucune conversation n'est ouverte
        if (!isConversationActive) {
          setIsVisible(!entry.isIntersecting);
        }
      },
      { threshold: 0.1 } // Déclencher quand au moins 10% est visible/invisible
    );
    
    observer.observe(chatInputElement);
    
    return () => {
      observer.disconnect();
    };
  }, [isConversationActive]);
  
  // Écouter l'événement de changement d'état de la conversation
  useEffect(() => {
    // Vérifier si une conversation est déjà ouverte (classe sur le body)
    const checkIfConversationActive = () => {
      setIsConversationActive(document.body.classList.contains('conversation-open'));
    };
    
    // Vérification initiale
    checkIfConversationActive();
    
    // Écouter l'événement d'ouverture/fermeture de conversation
    const handleConversationStateChanged = (event: CustomEvent) => {
      setIsConversationActive(event.detail?.isOpen || false);
      
      // Si la conversation est ouverte, on cache le bouton flottant
      if (event.detail?.isOpen) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('conversationStateChanged', handleConversationStateChanged as EventListener);
    
    // Observer les changements de classes sur le body également
    const bodyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkIfConversationActive();
        }
      });
    });
    
    bodyObserver.observe(document.body, { attributes: true });
    
    return () => {
      document.removeEventListener('conversationStateChanged', handleConversationStateChanged as EventListener);
      bodyObserver.disconnect();
    };
  }, []);
  
  // Gestion du clic à l'extérieur pour contracter la barre
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) && 
        isExpanded && 
        !inputValue.trim()
      ) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, inputValue]);
  
  const activateChatInput = () => {
    if (!inputValue.trim()) return;
    
    // On sauvegarde la valeur saisie dans le localStorage pour que ChatInput puisse la récupérer
    localStorage.setItem('floatingChatInput', inputValue);
    // On indique qu'il faut ouvrir le volet de conversation
    localStorage.setItem('openChatConversation', 'true');
    
    // On déclenche un événement personnalisé pour indiquer au ChatInput d'envoyer la question
    const event = new CustomEvent('floatingChatSubmit', { 
      detail: { question: inputValue.trim() } 
    });
    document.dispatchEvent(event);
    
    // On réinitialise l'input et on cache la barre flottante
    setInputValue('');
    setIsVisible(false);
    setIsExpanded(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      activateChatInput();
    } else if (e.key === 'Escape') {
      if (!inputValue.trim()) {
        setIsExpanded(false);
      }
    }
  };
  
  const handleFocus = () => {
    setIsExpanded(true);
  };
  
  const handleBlur = () => {
    // On contracte la barre si elle perd le focus et qu'il n'y a pas de texte
    if (!inputValue.trim()) {
      // Léger délai pour permettre de détecter d'abord si le clic était sur un autre élément de la barre
      setTimeout(() => {
        if (document.activeElement !== inputRef.current) {
          setIsExpanded(false);
        }
      }, 100);
    }
  };
  
  const handleBarClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };
  
  // Ne pas afficher si le bouton n'est pas visible OU si une conversation est déjà active
  if (!isVisible || isConversationActive) return null;
  
  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 px-4 slide-up-animation">
      <div 
        ref={containerRef}
        className={`rounded-full shadow-lg overflow-hidden flex items-center transition-all duration-300 ease-in-out cursor-pointer relative ${isExpanded ? 'expanded-bar' : 'contracted-bar'}`} 
        style={{ width: isExpanded ? '450px' : '250px' }}
        onClick={handleBarClick}
      >
        {/* Fond avec effet de flou */}
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundColor: 'rgba(26, 26, 26, 0.85)',
            borderRadius: 'inherit',
            border: '1px solid rgba(184, 46, 175, 0.7)'
          }}
        ></div>
        
        {!isExpanded && (
          <div className="flex items-center ml-3 z-10 relative">
            <MessageCircle className="h-5 w-5 text-[#B82EAF]" />
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="flex-grow bg-transparent border-none outline-none px-4 py-2.5 text-white placeholder-[#888888] relative z-10"
          placeholder={isExpanded ? "Posez une question..." : "Poser une question..."}
          autoFocus={isExpanded}
        />
        {isExpanded && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                activateChatInput();
              }}
              className={`p-1.5 rounded-full bg-[#B82EAF] hover:bg-[#9e2794] transition-colors ${!inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Envoyer"
              disabled={!inputValue.trim()}
            >
              <ArrowUp className="h-5 w-5 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 