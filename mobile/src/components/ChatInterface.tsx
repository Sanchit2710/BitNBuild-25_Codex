import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, MapPin, Clock, Package, Camera, Smile, ThumbsUp, Heart, Navigation } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner@2.0.3';

interface Message {
  id: string;
  sender: 'user' | 'driver' | 'system';
  message: string;
  timestamp: Date;
  type?: 'text' | 'location' | 'eta' | 'photo' | 'reaction';
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  reaction?: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  driverStatus: string;
  eta: string;
}

export function ChatInterface({ isOpen, onClose, driverName, driverStatus, eta }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'system',
      message: `${driverName} is your delivery partner for today's order`,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      status: 'read'
    },
    {
      id: '2',
      sender: 'driver',
      message: 'Hello! I have picked up your order and am on my way 🚗',
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
      status: 'read'
    },
    {
      id: '3',
      sender: 'driver',
      message: 'Current ETA is about 15 minutes. I\'ll keep you updated!',
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
      status: 'read'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageStatus, setMessageStatus] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate driver responses
  useEffect(() => {
    if (!isOpen) return;

    const responses = [
      "Thanks for your patience! 😊",
      "I'm about 5 minutes away now",
      "Just delivered to the previous customer, heading to you next!",
      "Traffic is a bit heavy, might be 2-3 minutes late",
      "I'm in your area now, looking for parking",
      "I can see your building, will be there shortly!"
    ];

    const simulateDriverMessage = () => {
      if (Math.random() < 0.3) { // 30% chance
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setIsTyping(true);
        
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'driver',
            message: randomResponse,
            timestamp: new Date(),
          }]);
        }, 2000 + Math.random() * 2000); // 2-4 seconds typing
      }
    };

    const interval = setInterval(simulateDriverMessage, 30000 + Math.random() * 60000); // 30-90 seconds
    return () => clearInterval(interval);
  }, [isOpen]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: newMessage,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    toast.success('Message sent');

    // Simulate message status progression
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'read' } : msg
      ));
    }, 2000);

    // Simulate driver typing and contextual response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        
        // Contextual responses based on user message
        let response = "Got it! 👍";
        const msg = newMessage.toLowerCase();
        
        if (msg.includes('waiting') || msg.includes('outside')) {
          response = "I can see you! Coming down now 🚶‍♂️";
        } else if (msg.includes('gate') || msg.includes('code') || msg.includes('door')) {
          response = "Thanks for the gate code! On my way up 🏢";
        } else if (msg.includes('hurry') || msg.includes('fast') || msg.includes('quick')) {
          response = "Almost there! Just 2 minutes away 🏃‍♂️";
        } else if (msg.includes('where') || msg.includes('location')) {
          response = "I'm on Main Street, turning into your building now 📍";
        } else if (msg.includes('thanks') || msg.includes('thank')) {
          response = "You're welcome! Happy to help 😊";
        }
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'driver',
          message: response,
          timestamp: new Date(),
          status: 'read'
        }]);
      }, 1500 + Math.random() * 1500);
    }, 500);
  };

  const sendQuickMessage = (message: string) => {
    setNewMessage(message);
    setTimeout(() => sendMessage(), 100);
  };

  const shareLocation = () => {
    const locationMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: '📍 My current location',
      timestamp: new Date(),
      type: 'location',
      status: 'sending'
    };

    setMessages(prev => [...prev, locationMessage]);
    toast.success('Location shared with driver');

    // Simulate status updates
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === locationMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    // Driver response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'driver',
          message: 'Perfect! I can see your exact location now. Be there in 3 minutes! 🎯',
          timestamp: new Date(),
          status: 'read'
        }]);
      }, 2000);
    }, 1500);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, reaction: emoji } : msg
    ));
    toast.success('Reaction added');
  };

  const simulatePhotoShare = () => {
    const photoMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: '📷 Photo of my building entrance',
      timestamp: new Date(),
      type: 'photo',
      status: 'sending'
    };

    setMessages(prev => [...prev, photoMessage]);
    toast.success('Photo sent to driver');

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === photoMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickMessages = [
    "I'm waiting outside",
    "Please call when you arrive", 
    "Gate code is #1234",
    "Ring the doorbell",
    "Leave at the door please",
    "I'll come down to meet you"
  ];

  const emojis = ['👍', '❤️', '😊', '🙏', '⚡', '🔥'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                {driverName}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {driverStatus}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ETA: {eta}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 relative group ${
                    message.sender === 'user'
                      ? 'bg-[#059669] text-white'
                      : message.sender === 'driver'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-blue-50 text-blue-800 text-center text-xs'
                  } ${message.type === 'location' ? 'bg-blue-100 border border-blue-300' : ''}
                  ${message.type === 'photo' ? 'bg-purple-100 border border-purple-300' : ''}`}
                >
                  <p className="text-sm">{message.message}</p>
                  
                  {/* Message Status for user messages */}
                  {message.sender === 'user' && message.status && (
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs text-green-100">
                        {message.status === 'sending' && '⏳'}
                        {message.status === 'sent' && '✓'}
                        {message.status === 'delivered' && '✓✓'}
                        {message.status === 'read' && '👁️'}
                      </span>
                    </div>
                  )}
                  
                  {/* Reaction */}
                  {message.reaction && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 border border-gray-200 text-sm">
                      {message.reaction}
                    </div>
                  )}
                  
                  {/* Quick Reaction Buttons (show on hover for driver messages) */}
                  {message.sender === 'driver' && (
                    <div className="absolute -top-8 right-0 hidden group-hover:flex bg-white rounded-lg shadow-lg border p-1 space-x-1">
                      {emojis.slice(0, 3).map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(message.id, emoji)}
                          className="hover:bg-gray-100 rounded p-1 text-sm transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user'
                        ? 'text-green-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex-shrink-0 border-t pt-3">
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={shareLocation}
              className="flex-1 text-xs h-8"
            >
              <MapPin className="w-3 h-3 mr-1" />
              Share Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={simulatePhotoShare}
              className="flex-1 text-xs h-8"
            >
              <Camera className="w-3 h-3 mr-1" />
              Send Photo
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mb-2">Quick messages:</p>
          <div className="grid grid-cols-2 gap-1 mb-3">
            {quickMessages.slice(0, 4).map((msg, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8 justify-start hover:bg-green-50 hover:border-green-300 transition-colors"
                onClick={() => sendQuickMessage(msg)}
              >
                {msg}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mb-2 p-2 bg-gray-50 rounded-lg border">
              <div className="flex flex-wrap gap-2">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setNewMessage(newMessage + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="hover:bg-gray-200 rounded p-1 text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="px-2"
            >
              <Smile className="w-4 h-4" />
            </Button>
            
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            
            <Button
              onClick={sendMessage}
              size="sm"
              className={`bg-[#059669] hover:bg-[#048556] transition-all duration-200 ${
                newMessage.trim() ? 'scale-100' : 'scale-95 opacity-50'
              }`}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}