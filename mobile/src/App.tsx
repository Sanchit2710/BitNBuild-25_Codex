import React, { useState, useEffect } from 'react';
import { Home, User, CreditCard, Bell, Settings, Wifi, WifiOff, Battery } from 'lucide-react';
import { LiveTracker } from './components/LiveTracker';
import { SubscriptionManagement } from './components/SubscriptionManagement';
import { MealPreferences } from './components/MealPreferences';
import { BillingPayments } from './components/BillingPayments';
import { NotificationsInbox } from './components/NotificationsInbox';
import { Toaster } from './components/ui/sonner';
import { Badge } from './components/ui/badge';
import { toast } from 'sonner@2.0.3';

type Screen = 'home' | 'subscription' | 'preferences' | 'billing' | 'notifications';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount, setNotificationCount] = useState(3);
  const [screenTransition, setScreenTransition] = useState(false);

  // Simulate network status changes
  useEffect(() => {
    const networkInterval = setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance to toggle network
        setIsOnline(prev => {
          const newStatus = !prev;
          toast[newStatus ? 'success' : 'error'](
            newStatus ? 'Connection restored' : 'Connection lost'
          );
          return newStatus;
        });
      }
    }, 5000);

    return () => clearInterval(networkInterval);
  }, []);

  // Update time every minute
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Simulate battery drain
  useEffect(() => {
    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => {
        const newLevel = Math.max(0, prev - Math.random() * 2);
        if (newLevel <= 20 && prev > 20) {
          toast.warning('Low battery! Consider charging your device.');
        }
        return newLevel;
      });
    }, 30000);

    return () => clearInterval(batteryInterval);
  }, []);

  const handleScreenChange = (screen: Screen) => {
    if (screen === activeScreen) return;
    
    setScreenTransition(true);
    setTimeout(() => {
      setActiveScreen(screen);
      setScreenTransition(false);
      
      // Clear notification badge when visiting notifications
      if (screen === 'notifications') {
        setNotificationCount(0);
      }
      
      // Haptic feedback simulation
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      toast.success(`Switched to ${screen === 'home' ? 'Home' : 
                                  screen === 'subscription' ? 'Plan' :
                                  screen === 'preferences' ? 'Meals' :
                                  screen === 'billing' ? 'Billing' : 'Alerts'}`);
    }, 150);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <LiveTracker />;
      case 'subscription':
        return <SubscriptionManagement />;
      case 'preferences':
        return <MealPreferences />;
      case 'billing':
        return <BillingPayments />;
      case 'notifications':
        return <NotificationsInbox />;
      default:
        return <LiveTracker />;
    }
  };

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'home': return 'Live Tracking';
      case 'subscription': return 'Subscription';
      case 'preferences': return 'Meal Settings';
      case 'billing': return 'Billing';
      case 'notifications': return 'Notifications';
      default: return 'NourishNet';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto shadow-2xl">
      {/* Status Bar */}
      <div className="h-11 bg-[#4338CA] flex items-center justify-between px-4 text-white text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {!isOnline && <WifiOff className="w-3 h-3 text-red-300 animate-pulse" />}
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <span className="text-white text-sm ml-2 font-semibold">NourishNet</span>
        </div>
        
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-300" />
          )}
          <div className="flex items-center gap-1">
            <Battery className={`w-3 h-3 ${batteryLevel <= 20 ? 'text-red-300' : ''}`} />
            <span className={`text-xs ${batteryLevel <= 20 ? 'text-red-300' : ''}`}>
              {Math.round(batteryLevel)}%
            </span>
          </div>
        </div>
      </div>

      {/* Screen Title Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-gray-900">{getScreenTitle()}</h2>
          {activeScreen === 'home' && (
            <Badge className={`${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} animate-pulse`}>
              {isOnline ? 'Live' : 'Offline'}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${
        screenTransition ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      }`}>
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-2 py-2 shadow-lg">
        <div className="flex justify-around">
          <button
            onClick={() => handleScreenChange('home')}
            className={`relative flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              activeScreen === 'home' 
                ? 'bg-[#059669] text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home size={20} className={activeScreen === 'home' ? 'animate-pulse' : ''} />
            <span className="text-xs mt-1">Home</span>
            {activeScreen === 'home' && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-bounce"></div>
            )}
          </button>
          
          <button
            onClick={() => handleScreenChange('subscription')}
            className={`relative flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              activeScreen === 'subscription' 
                ? 'bg-[#059669] text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User size={20} className={activeScreen === 'subscription' ? 'animate-pulse' : ''} />
            <span className="text-xs mt-1">Plan</span>
            {activeScreen === 'subscription' && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-bounce"></div>
            )}
          </button>
          
          <button
            onClick={() => handleScreenChange('preferences')}
            className={`relative flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              activeScreen === 'preferences' 
                ? 'bg-[#059669] text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings size={20} className={activeScreen === 'preferences' ? 'animate-pulse' : ''} />
            <span className="text-xs mt-1">Meals</span>
            {activeScreen === 'preferences' && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-bounce"></div>
            )}
          </button>
          
          <button
            onClick={() => handleScreenChange('billing')}
            className={`relative flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              activeScreen === 'billing' 
                ? 'bg-[#059669] text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CreditCard size={20} className={activeScreen === 'billing' ? 'animate-pulse' : ''} />
            <span className="text-xs mt-1">Billing</span>
            {activeScreen === 'billing' && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-bounce"></div>
            )}
          </button>
          
          <button
            onClick={() => handleScreenChange('notifications')}
            className={`relative flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              activeScreen === 'notifications' 
                ? 'bg-[#059669] text-white shadow-lg' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell size={20} className={activeScreen === 'notifications' ? 'animate-pulse' : ''} />
            <span className="text-xs mt-1">Alerts</span>
            {notificationCount > 0 && activeScreen !== 'notifications' && (
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center animate-bounce">
                {notificationCount}
              </Badge>
            )}
            {activeScreen === 'notifications' && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-bounce"></div>
            )}
          </button>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        richColors
        closeButton
        expand={true}
        duration={3000}
      />
      
      {/* Network Status Overlay */}
      {!isOnline && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-16 left-4 right-4">
            <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm animate-pulse">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4" />
                <span>No internet connection</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}