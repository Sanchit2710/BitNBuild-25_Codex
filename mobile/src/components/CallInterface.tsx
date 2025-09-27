import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Vibrate, Signal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface CallInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  driverPhone: string;
}

export function CallInterface({ isOpen, onClose, driverName, driverPhone }: CallInterfaceProps) {
  const [callState, setCallState] = useState<'dialing' | 'ringing' | 'connected' | 'ended'>('dialing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callQuality, setCallQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [isQuickMessageSent, setIsQuickMessageSent] = useState<string | null>(null);
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCallState('dialing');
      setCallDuration(0);
      return;
    }

    // Simulate call progression
    const progressCall = async () => {
      // Dialing phase
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (isOpen) setCallState('ringing');
      
      // Ringing phase (2-4 seconds)
      const ringDuration = 2000 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, ringDuration));
      if (isOpen) setCallState('connected');
    };

    progressCall();
  }, [isOpen]);

  useEffect(() => {
    if (callState === 'connected') {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
        
        // Simulate call quality changes
        if (Math.random() < 0.1) { // 10% chance
          const qualities: ('excellent' | 'good' | 'poor')[] = ['excellent', 'good', 'poor'];
          setCallQuality(qualities[Math.floor(Math.random() * qualities.length)]);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [callState]);

  // Simulate haptic feedback
  const simulateHaptic = (type: 'light' | 'medium' | 'heavy') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [50],
        medium: [100],
        heavy: [200]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    simulateHaptic('medium');
    setCallState('ended');
    toast.success(`Call ended • Duration: ${formatDuration(callDuration)}`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const toggleMute = () => {
    simulateHaptic('light');
    setIsMuted(!isMuted);
    setButtonPressed('mute');
    setTimeout(() => setButtonPressed(null), 200);
    toast.info(isMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const toggleSpeaker = () => {
    simulateHaptic('light');
    setIsSpeaker(!isSpeaker);
    setButtonPressed('speaker');
    setTimeout(() => setButtonPressed(null), 200);
    toast.info(isSpeaker ? 'Speaker off' : 'Speaker on');
  };

  const sendQuickMessage = (message: string) => {
    simulateHaptic('medium');
    setIsQuickMessageSent(message);
    toast.success('Message sent to driver');
    setTimeout(() => setIsQuickMessageSent(null), 3000);
  };

  const getCallStateText = () => {
    switch (callState) {
      case 'dialing': return 'Dialing...';
      case 'ringing': return 'Ringing...';
      case 'connected': return formatDuration(callDuration);
      case 'ended': return 'Call Ended';
    }
  };

  const getCallStateColor = () => {
    switch (callState) {
      case 'dialing': return 'text-yellow-600';
      case 'ringing': return 'text-blue-600';
      case 'connected': return 'text-green-600';
      case 'ended': return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Calling Driver</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Driver Info */}
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
              <Phone className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg">{driverName}</h3>
            <p className="text-sm text-gray-600">{driverPhone}</p>
          </div>

          {/* Call Status */}
          <div className="text-center">
            <Badge variant="outline" className={`${getCallStateColor()} border-current`}>
              {getCallStateText()}
            </Badge>
            
            {/* Call Quality Indicator */}
            {callState === 'connected' && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <Signal className={`w-3 h-3 ${
                  callQuality === 'excellent' ? 'text-green-500' :
                  callQuality === 'good' ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <span className="text-xs text-gray-500 capitalize">{callQuality} quality</span>
              </div>
            )}
            
            {callState === 'ringing' && (
              <div className="mt-2">
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          {callState === 'connected' && (
            <div className="flex space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                className={`transition-all duration-200 ${
                  isMuted ? 'bg-red-100 border-red-300 text-red-600' : 'hover:bg-gray-100'
                } ${buttonPressed === 'mute' ? 'scale-95' : ''}`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSpeaker}
                className={`transition-all duration-200 ${
                  isSpeaker ? 'bg-blue-100 border-blue-300 text-blue-600' : 'hover:bg-gray-100'
                } ${buttonPressed === 'speaker' ? 'scale-95' : ''}`}
              >
                {isSpeaker ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  simulateHaptic('light');
                  toast.info('Vibration sent to driver');
                }}
                className="hover:bg-purple-50 hover:border-purple-300"
              >
                <Vibrate className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* End Call Button */}
          <Button
            onClick={endCall}
            className={`bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 transition-all duration-200 ${
              callState === 'ended' ? 'opacity-50 scale-95' : 'hover:scale-105 active:scale-95'
            }`}
            disabled={callState === 'ended'}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          {/* Quick Messages during call */}
          {callState === 'connected' && (
            <div className="w-full space-y-2">
              <p className="text-xs text-gray-500 text-center mb-2">Quick messages:</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "I'm waiting outside",
                  "Call me when you arrive", 
                  "Need gate code: #1234"
                ].map((message, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="sm" 
                    className={`text-xs transition-all duration-200 hover:bg-green-50 hover:border-green-300 ${
                      isQuickMessageSent === message ? 'bg-green-100 border-green-300 text-green-700' : ''
                    }`}
                    onClick={() => sendQuickMessage(message)}
                    disabled={isQuickMessageSent === message}
                  >
                    {isQuickMessageSent === message ? '✓ Sent' : `"${message}"`}
                  </Button>
                ))}
              </div>
              
              {isQuickMessageSent && (
                <div className="text-center mt-3">
                  <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                    Message delivered to driver
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}