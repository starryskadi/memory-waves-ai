import { createSignal, For, onCleanup, createEffect, Show } from 'solid-js'
import './App.css'

// Logo component for the chat app
const MemoryLogo = () => {
  return (
    <svg class="brain-logo" viewBox="0 0 100 100" width="40" height="40" aria-hidden="true">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0ea5e9" />
          <stop offset="100%" stop-color="#0369a1" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Main circular shape */}
      <circle cx="50" cy="50" r="35" fill="#e0f2fe" stroke="url(#logoGradient)" stroke-width="2.5" />
      
      {/* Water wave patterns representing memory/fluidity */}
      <path 
        d="M25,50 Q35,40 45,50 Q55,60 65,50 Q75,40 85,50" 
        fill="none" 
        stroke="url(#logoGradient)" 
        stroke-width="2.5" 
        stroke-linecap="round"
        opacity="0.8"
      />
      <path 
        d="M25,60 Q35,50 45,60 Q55,70 65,60 Q75,50 85,60" 
        fill="none" 
        stroke="url(#logoGradient)" 
        stroke-width="2.5" 
        stroke-linecap="round"
        opacity="0.6"
      />
      
      {/* Ripple effect */}
      <circle cx="50" cy="40" r="5" fill="#0ea5e9" filter="url(#glow)" opacity="0.7" />
      
      {/* Light reflections */}
      <circle cx="40" cy="35" r="2" fill="white" opacity="0.8" />
      <circle cx="60" cy="37" r="1.5" fill="white" opacity="0.6" />
    </svg>
  );
}

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

function App() {
  const [messages, setMessages] = createSignal<Message[]>([])
  const [inputValue, setInputValue] = createSignal('')
  const [isLoading, setIsLoading] = createSignal(false)
  let nextId = 0
  let messagesEndRef: HTMLDivElement | undefined;
  let inputRef: HTMLInputElement | undefined;

  // Auto-scroll to bottom when messages change
  createEffect(() => {
    if (messages().length && messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    
    const userInput = inputValue().trim()
    if (!userInput) return
    
    // Add user message
    const userMessage: Message = {
      id: nextId++,
      text: userInput,
      sender: 'user'
    }
    setMessages([...messages(), userMessage])
    
    // Clear input
    setInputValue('')
    
    // Calculate loading time based on input length
    const loadingTime = userInput.length * 200 // 0.2 seconds per letter
    
    // Show loading state
    setIsLoading(true)
    
    // Create timeout for bot response
    const timeoutId = setTimeout(() => {
      const botMessage: Message = {
        id: nextId++,
        text: "What do you say? I forget, when I'm doing your request.",
        sender: 'bot'
      }
      setMessages([...messages(), botMessage])
      setIsLoading(false)
      
      // Focus input field after response
      if (inputRef) inputRef.focus();
    }, loadingTime)
    
    // Clean up timeout if component unmounts
    onCleanup(() => clearTimeout(timeoutId))
  }

  return (
    <div class="chat-container">
      <header class="app-header">
        <MemoryLogo />
        <h1>Memory Waves</h1>
      </header>
      
      <div class="messages-container">
        <Show when={messages().length === 0}>
          <div class="empty-chat animate-fade-in">
            <MemoryLogo />
            <p>Your messages flow like water, but I tend to forget them. Start a conversation below.</p>
          </div>
        </Show>
        
        <For each={messages()}>
          {(message) => (
            <div class={`message ${message.sender}-message animate-fade-in`}>
              <div class="message-bubble">
                {message.text}
              </div>
            </div>
          )}
        </For>
        
        {isLoading() && (
          <div class="message bot-message animate-fade-in">
            <div class="message-bubble loading-message">
              I'm now processing your request, please wait.
            </div>
          </div>
        )}
        <div ref={el => messagesEndRef = el}></div>
      </div>
      
      <form onSubmit={handleSubmit} class="input-form">
        <input
          ref={el => inputRef = el}
          type="text"
          value={inputValue()}
          onInput={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          aria-label="Message"
          disabled={isLoading()}
        />
        <button type="submit" disabled={isLoading() || !inputValue().trim()}>
          <span>Send</span>
        </button>
      </form>
    </div>
  )
}

export default App
