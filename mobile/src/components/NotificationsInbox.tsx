import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Bell, Package, CreditCard, Calendar, Trash2, Settings, Star, ChefHat, Truck, Gift, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'delivery' | 'payment' | 'menu' | 'promotion' | 'alert' | 'achievement';
  isRead: boolean;
  isImportant: boolean;
  icon: React.ReactNode;
  color: string;
  actionable?: boolean;
}

interface NotificationSettings {
  deliveryUpdates: boolean;
  paymentAlerts: boolean;
  menuUpdates: boolean;
  promotions: boolean;
  orderReminders: boolean;
}

export function NotificationsInbox() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Delivery Update',
      message: 'Your meal is on the way! ETA: 12 minutes',
      time: '2 mins ago',
      type: 'delivery',
      isRead: false,
      isImportant: true,
      icon: <Truck className="w-4 h-4" />,
      color: 'bg-[#059669]',
      actionable: true
    },
    {
      id: '2',
      title: 'Achievement Unlocked! 🎉',
      message: 'You have ordered 50 meals! Enjoy 20% off your next order',
      time: '10 mins ago',
      type: 'achievement',
      isRead: false,
      isImportant: false,
      icon: <Star className="w-4 h-4" />,
      color: 'bg-yellow-500',
      actionable: true
    },
    {
      id: '3',
      title: 'Meal Preparation Started',
      message: 'Chef has started preparing your Paneer Butter Masala',
      time: '15 mins ago',
      type: 'delivery',
      isRead: true,
      isImportant: false,
      icon: <ChefHat className="w-4 h-4" />,
      color: 'bg-[#FBBF24]',
      actionable: false
    },
    {
      id: '4',
      title: 'Special Offer! 🔥',
      message: 'Weekend special: Buy 2 meals, get 1 free! Limited time offer',
      time: '1 hour ago',
      type: 'promotion',
      isRead: false,
      isImportant: false,
      icon: <Gift className="w-4 h-4" />,
      color: 'bg-red-500',
      actionable: true
    },
    {
      id: '5',
      title: 'Payment Successful',
      message: 'Monthly subscription renewed for ₹2,999',
      time: '1 day ago',
      type: 'payment',
      isRead: true,
      isImportant: false,
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-[#4338CA]',
      actionable: false
    },
    {
      id: '6',
      title: 'Menu Updated',
      message: 'New dishes added to this week\'s menu',
      time: '2 days ago',
      type: 'menu',
      isRead: true,
      isImportant: false,
      icon: <Calendar className="w-4 h-4" />,
      color: 'bg-gray-400',
      actionable: true
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    deliveryUpdates: true,
    paymentAlerts: true,
    menuUpdates: true,
    promotions: true,
    orderReminders: true
  });

  const [showSettings, setShowSettings] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
    toast.success('Marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const handleNotificationAction = (notification: Notification) => {
    switch (notification.type) {
      case 'delivery':
        toast.info('Opening live tracker...');
        break;
      case 'achievement':
        toast.success('Discount code copied: MEAL50OFF');
        break;
      case 'promotion':
        toast.info('Opening special offers...');
        break;
      case 'menu':
        toast.info('Opening weekly menu...');
        break;
      default:
        break;
    }
    markAsRead(notification.id);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notif.isRead;
    if (selectedFilter === 'important') return notif.isImportant;
    return notif.type === selectedFilter;
  });

  const getFilterCount = (filter: string) => {
    if (filter === 'unread') return unreadCount;
    if (filter === 'important') return notifications.filter(n => n.isImportant).length;
    return notifications.filter(n => n.type === filter).length;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4">
      <div className="bg-[#4338CA] text-white px-4 py-4 -mx-4 -mt-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white animate-bounce">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-sm opacity-90">Stay updated with your orders</p>
          </div>
          
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {Object.entries(settings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <Switch 
                      checked={value}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({ ...prev, [key]: checked }));
                        toast.success(`${key} ${checked ? 'enabled' : 'disabled'}`);
                      }}
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <Card className="p-3 mb-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex-1"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Mark All Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="flex-1 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          </div>
        </Card>
      )}

      {/* Filter Tabs */}
      <Card className="p-3 mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: getFilterCount('unread') },
            { key: 'important', label: 'Important', count: getFilterCount('important') },
            { key: 'delivery', label: 'Delivery', count: getFilterCount('delivery') },
            { key: 'promotion', label: 'Offers', count: getFilterCount('promotion') }
          ].map(filter => (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedFilter(filter.key)}
              className={`whitespace-nowrap ${
                selectedFilter === filter.key 
                  ? 'bg-[#059669] text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {filter.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications found</p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                !notification.isRead ? 'border-l-4 border-l-[#059669] bg-green-50' : ''
              } ${notification.isImportant ? 'ring-1 ring-orange-200' : ''}`}
              onClick={() => handleNotificationAction(notification)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 ${notification.color} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                  {notification.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                      {notification.title}
                      {notification.isImportant && (
                        <Star className="w-3 h-3 text-orange-500 inline ml-1" />
                      )}
                    </p>
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-[#059669] rounded-full animate-pulse"></div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 h-auto text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{notification.time}</p>
                    
                    {notification.actionable && (
                      <Badge 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-[#059669] hover:text-white transition-colors"
                      >
                        {notification.type === 'delivery' ? 'Track' : 
                         notification.type === 'achievement' ? 'Claim' :
                         notification.type === 'promotion' ? 'View Offer' : 'View'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}