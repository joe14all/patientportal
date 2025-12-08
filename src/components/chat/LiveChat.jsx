import React, { useState, useRef, useEffect } from 'react';
import { useCoreData } from '../../contexts';
import styles from './LiveChat.module.css';

/**
 * Live Chat Component with AI Assistant
 * Instant messaging with smart AI responses and seamless handoff to staff
 */
const LiveChat = ({ isOpen, onClose }) => {
  // const { createNewThread, sendMessage } = useEngagementData(); // Future use for message persistence
  const { offices } = useCoreData();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState('ai'); // 'ai' or 'human'
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMsg = {
        id: 'welcome',
        sender: 'ai',
        text: "Hi! 👋 I'm your dental assistant. I can help you with:\n\n• Appointment scheduling\n• Office hours and location\n• Pre-visit preparation\n• Insurance questions\n• General dental health\n\nWhat can I help you with today?",
        timestamp: new Date(),
        isAI: true
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, messages.length]);

  const getAIResponse = async (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Office hours
    if (lowerMsg.includes('hour') || lowerMsg.includes('open') || lowerMsg.includes('close')) {
      return {
        text: `We're open:\n\n📅 Monday - Friday: 8:00 AM - 5:00 PM\n📅 Saturday: 9:00 AM - 2:00 PM\n📅 Sunday: Closed\n\nWould you like to schedule an appointment?`,
        quickReplies: ['Yes, book appointment', 'No, just checking']
      };
    }
    
    // Location
    if (lowerMsg.includes('location') || lowerMsg.includes('address') || lowerMsg.includes('where')) {
      const mainOffice = offices[0];
      return {
        text: `📍 We're located at:\n\n${mainOffice.name}\n${mainOffice.contact.address.line[0]}\n${mainOffice.contact.address.city}, ${mainOffice.contact.address.state}\n\n[Get Directions](${mainOffice.contact.address.googleMapsUrl})`,
        quickReplies: ['Get directions', 'Call office']
      };
    }
    
    // Appointment prep
    if (lowerMsg.includes('prepare') || lowerMsg.includes('bring') || lowerMsg.includes('before appointment')) {
      return {
        text: `For your appointment, please:\n\n📋 Complete any required forms online\n💳 Bring your insurance card\n🪪 Bring a photo ID\n🕐 Arrive 10 minutes early\n\nIs there a specific type of appointment you're preparing for?`,
        quickReplies: ['Cleaning', 'Consultation', 'Surgery']
      };
    }
    
    // Insurance
    if (lowerMsg.includes('insurance') || lowerMsg.includes('coverage') || lowerMsg.includes('cost')) {
      return {
        text: `We accept most major dental insurance plans. For specific coverage questions, I can connect you with our billing team.\n\nWould you like me to:\n\n1️⃣ Check if we accept your insurance\n2️⃣ Get a cost estimate\n3️⃣ Speak with billing specialist`,
        quickReplies: ['Check insurance', 'Cost estimate', 'Talk to billing'],
        suggestHuman: true
      };
    }
    
    // Pain/Emergency
    if (lowerMsg.includes('pain') || lowerMsg.includes('hurt') || lowerMsg.includes('emergency') || lowerMsg.includes('urgent')) {
      return {
        text: `I'm sorry you're experiencing discomfort. 😔\n\nFor dental emergencies or severe pain, please call us immediately at ${offices[0].contact.phone}.\n\nIf it's after hours, we have an emergency line available.\n\nWould you like me to connect you with our team right now?`,
        quickReplies: ['Yes, connect me', 'Just needed info'],
        urgent: true,
        suggestHuman: true
      };
    }
    
    // Rescheduling
    if (lowerMsg.includes('reschedule') || lowerMsg.includes('cancel') || lowerMsg.includes('change appointment')) {
      return {
        text: `I can help you reschedule! You can:\n\n1️⃣ Manage your appointments in the Appointments page\n2️⃣ Chat with our scheduling team\n3️⃣ Call us at ${offices[0].contact.phone}\n\nWhich would you prefer?`,
        quickReplies: ['Go to appointments', 'Chat with scheduler', 'I\'ll call']
      };
    }
    
    // Default - offer to connect
    return {
      text: `I want to make sure you get the best answer. Would you like me to connect you with a team member who can help with that?`,
      quickReplies: ['Yes, connect me', 'No, I\'m good'],
      suggestHuman: true
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
      isAI: false
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(async () => {
      if (mode === 'ai') {
        const aiResponse = await getAIResponse(input);
        
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiResponse.text,
          timestamp: new Date(),
          isAI: true,
          quickReplies: aiResponse.quickReplies,
          urgent: aiResponse.urgent,
          suggestHuman: aiResponse.suggestHuman
        };
        
        setMessages(prev => [...prev, aiMsg]);
      } else {
        // Human mode - would integrate with real messaging system
        const staffMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'staff',
          senderName: 'Sarah (Reception)',
          text: 'I\'m here to help! Let me look into that for you...',
          timestamp: new Date(),
          isAI: false
        };
        setMessages(prev => [...prev, staffMsg]);
      }
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply) => {
    setInput(reply);
    setTimeout(() => handleSend(), 100);
  };

  const switchToHuman = () => {
    setMode('human');
    const handoffMsg = {
      id: 'handoff',
      sender: 'system',
      text: '🤝 Connecting you with a team member... They\'ll be with you shortly!',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, handoffMsg]);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.chatOverlay}>
      <div className={styles.chatWindow}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              {mode === 'ai' ? '🤖' : '👤'}
            </div>
            <div className={styles.headerText}>
              <h3>{mode === 'ai' ? 'AI Assistant' : 'Live Support'}</h3>
              <span className={styles.status}>
                <span className={styles.statusDot}></span>
                {mode === 'ai' ? 'Always available' : 'Online now'}
              </span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${
                msg.sender === 'user' ? styles.userMessage : styles.otherMessage
              } ${msg.sender === 'system' ? styles.systemMessage : ''}`}
            >
              {msg.sender !== 'user' && msg.sender !== 'system' && (
                <div className={styles.messageAvatar}>
                  {msg.isAI ? '🤖' : '👤'}
                </div>
              )}
              
              <div className={styles.messageContent}>
                {msg.senderName && (
                  <div className={styles.senderName}>{msg.senderName}</div>
                )}
                <div className={styles.messageBubble}>
                  <div className={styles.messageText}>{msg.text}</div>
                  <div className={styles.messageTime}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {msg.quickReplies && (
                  <div className={styles.quickReplies}>
                    {msg.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        className={styles.quickReply}
                        onClick={() => handleQuickReply(reply)}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
                
                {msg.suggestHuman && mode === 'ai' && (
                  <button
                    className={styles.connectButton}
                    onClick={switchToHuman}
                  >
                    💬 Connect with team member
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className={`${styles.message} ${styles.otherMessage}`}>
              <div className={styles.messageAvatar}>
                {mode === 'ai' ? '🤖' : '👤'}
              </div>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className={styles.input}
          />
          <button
            onClick={handleSend}
            className={styles.sendButton}
            disabled={!input.trim()}
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
