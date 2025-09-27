import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, MessageCircle, Clock, Navigation, Package, Truck, AlertTriangle, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CallInterface } from './CallInterface';
import { ChatInterface } from './ChatInterface';

// --- Constants & Mock Data ---

// Map size for visualization scaling
const MAP_SIZE = 1000; 

// The consumer's delivery target (Order O2)
const CONSUMER_TARGET = { id: 'O2', address: 'Apartment 3A, Tower 4, Mumbai', lat: 500, lng: 550 };
const KITCHEN_LOCATION = { lat: 800, lng: 800 }; 

// Mock route data for simulation with realistic stops
const MOCK_ROUTE_DATA = [
    { lat: 800, lng: 800, stop: 'Cloud Kitchen', duration: 180 }, // 3 min prep time
    { lat: 750, lng: 720, stop: 'Traffic Signal', duration: 45 }, // Traffic light
    { lat: 680, lng: 650, stop: 'Order #1 Delivery', duration: 120 }, // 2 min stop
    { lat: 620, lng: 580, stop: 'Main Road', duration: 0 }, // Just a waypoint
    { lat: 500, lng: 550, stop: 'Your Location', orderId: 'O2', duration: 60 }, // Consumer's location
    { lat: 450, lng: 480, stop: 'Order #4 Delivery', duration: 90 },
    { lat: 350, lng: 400, stop: 'Return to Hub', duration: 0 },
];

// Traffic and weather conditions that affect delivery
const TRAFFIC_CONDITIONS = ['light', 'moderate', 'heavy'];
const WEATHER_CONDITIONS = ['clear', 'light_rain', 'heavy_rain'];

const INITIAL_DELIVERY_STATE = {
    lat: KITCHEN_LOCATION.lat,
    lng: KITCHEN_LOCATION.lng,
    status: 'preparing', // preparing, dispatched, en_route, nearby, delivered
    currentRoute: MOCK_ROUTE_DATA,
    currentStopIndex: 0,
    speed: 0.8, // base speed multiplier
    traffic: 'light',
    weather: 'clear',
    delays: 0, // accumulated delays in seconds
};

// --- Utility Functions ---

/**
 * Calculates realistic ETA based on multiple factors
 */
const calculateDynamicEta = (driverState: any) => {
    if (driverState.status === 'delivered') return 'Delivered!';
    if (driverState.status === 'preparing') {
        const prepTime = Math.max(2, 8 - Math.floor(Date.now() / 60000) % 6); // 2-8 mins prep
        return `${prepTime} mins (preparing)`;
    }
    
    const { lat, lng, currentRoute, currentStopIndex, traffic, weather, speed, delays } = driverState;
    const targetIndex = currentRoute.findIndex((p: any) => p.orderId === CONSUMER_TARGET.id);
    
    if (targetIndex === -1 || currentStopIndex >= targetIndex) {
        const distanceToTarget = Math.hypot(lat - CONSUMER_TARGET.lat, lng - CONSUMER_TARGET.lng);
        if (distanceToTarget < 30) return 'Arriving now!';
        if (distanceToTarget < 80) return '2-3 mins';
        return '3-5 mins';
    }

    // Calculate remaining distance and stops
    let totalTime = 0;
    let remainingDistance = 0;
    
    // Add time for remaining stops before target
    for (let i = currentStopIndex; i < targetIndex; i++) {
        const stop = currentRoute[i];
        totalTime += stop.duration || 0;
        
        if (i < currentRoute.length - 1) {
            const nextStop = currentRoute[i + 1];
            const segmentDistance = Math.hypot(nextStop.lat - stop.lat, nextStop.lng - stop.lng);
            remainingDistance += segmentDistance;
        }
    }
    
    // Current position to next stop
    const nextStop = currentRoute[Math.min(currentStopIndex, currentRoute.length - 1)];
    const currentDistance = Math.hypot(lat - nextStop.lat, lng - nextStop.lng);
    remainingDistance += currentDistance;
    
    // Apply traffic and weather modifiers
    let speedMultiplier = speed;
    if (traffic === 'moderate') speedMultiplier *= 0.7;
    if (traffic === 'heavy') speedMultiplier *= 0.4;
    if (weather === 'light_rain') speedMultiplier *= 0.8;
    if (weather === 'heavy_rain') speedMultiplier *= 0.6;
    
    // Convert distance to time (approximate: 1 map unit = ~50 meters, avg speed = 25 km/h in city)
    const travelTime = (remainingDistance * 0.05) / speedMultiplier; // in minutes
    totalTime += travelTime + (delays / 60);
    
    // Add some randomness for realism
    const variance = (Math.random() - 0.5) * 3; // ±1.5 min variance
    totalTime += variance;
    
    const finalTime = Math.max(1, Math.round(totalTime));
    
    // Add contextual messages
    if (traffic === 'heavy') return `${finalTime}-${finalTime + 3} mins (heavy traffic)`;
    if (weather === 'heavy_rain') return `${finalTime}-${finalTime + 2} mins (rain delay)`;
    if (finalTime <= 3) return `${finalTime} mins (almost there!)`;
    
    return `${finalTime} mins`;
};

/**
 * Generates realistic movement with traffic and road conditions
 */
const generateRealisticMovement = (current: any, target: any, conditions: any) => {
    const baseSpeed = 0.02; // Base movement speed
    let actualSpeed = baseSpeed * conditions.speed;
    
    // Add traffic slow-downs
    if (conditions.traffic === 'moderate') actualSpeed *= 0.6;
    if (conditions.traffic === 'heavy') actualSpeed *= 0.3;
    
    // Weather effects
    if (conditions.weather === 'light_rain') actualSpeed *= 0.8;
    if (conditions.weather === 'heavy_rain') actualSpeed *= 0.5;
    
    // Add some randomness for realistic movement
    const jitter = (Math.random() - 0.5) * 0.005;
    actualSpeed += jitter;
    
    // Calculate direction with some path variation
    const directLat = target.lat - current.lat;
    const directLng = target.lng - current.lng;
    const distance = Math.hypot(directLat, directLng);
    
    if (distance < 5) return target; // Close enough, snap to target
    
    // Add slight road-following behavior (not perfectly direct)
    const roadVariation = Math.sin(Date.now() / 5000) * 10;
    const moveLat = current.lat + (directLat / distance) * actualSpeed + roadVariation * 0.1;
    const moveLng = current.lng + (directLng / distance) * actualSpeed;
    
    return { lat: moveLat, lng: moveLng };
};

// --- Components ---

/**
 * MapView Component
 */
interface MapViewProps {
    driverState: any;
    targetStop: any;
    kitchenLocation: any;
    mapSize: number;
}

const MapView: React.FC<MapViewProps> = ({ driverState, targetStop, kitchenLocation, mapSize }) => {
    if (!driverState) {
        return (
            <div className="p-4 bg-white rounded-lg shadow-inner h-full flex flex-col">
                <p className="text-gray-500 text-center">Waiting for driver state...</p>
            </div>
        );
    }

    const { lat, lng, status } = driverState;
    const fullRoute = MOCK_ROUTE_DATA;
    const driverLocation = { lat, lng };

    return (
        <div className="p-4 bg-white rounded-lg shadow-inner h-full flex flex-col">
            <h3 className="flex items-center mb-3">
                <MapPin className="w-5 h-5 text-indigo-500 mr-2" /> Live Delivery Map
            </h3>
            
            <div 
                className="relative border-4 border-gray-200 bg-blue-50/50 rounded-lg overflow-hidden flex-grow"
                style={{ height: '300px', width: '100%' }}
            >
                <svg 
                    viewBox={`0 0 ${mapSize} ${mapSize}`} 
                    className="w-full h-full absolute top-0 left-0"
                >
                    {/* Route Line */}
                    {status !== 'Idle' && fullRoute.length > 0 && (
                        <polyline 
                            points={fullRoute.map(p => `${p.lat},${p.lng}`).join(' ')}
                            fill="none"
                            stroke="#4F46E5"
                            strokeWidth="5"
                            strokeDasharray="10 5"
                            strokeLinecap="round"
                            className="opacity-60"
                        />
                    )}
                    
                    {/* Target Location (Consumer's home - Gold) */}
                    <circle 
                        cx={targetStop.lat} 
                        cy={targetStop.lng} 
                        r="20" 
                        fill="#FBBF24" 
                        stroke="#D97706"
                        strokeWidth="3"
                    >
                        <title>Your Location</title>
                    </circle>
                    
                    {/* Package Icon at Target */}
                    <foreignObject 
                        x={targetStop.lat - 12} 
                        y={targetStop.lng - 12} 
                        width="24" 
                        height="24"
                    >
                        <Package 
                            className="w-6 h-6 text-amber-800"
                        />
                    </foreignObject>

                    {/* Start Location (Kitchen - Green) */}
                    <circle 
                        cx={kitchenLocation.lat} 
                        cy={kitchenLocation.lng} 
                        r="15" 
                        fill="#10B981" 
                        stroke="#059669"
                        strokeWidth="3"
                    >
                        <title>Kitchen / Start Point</title>
                    </circle>
                </svg>

                {/* Driver Icon */}
                {status !== 'Idle' && (
                    <div 
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
                        style={{ 
                            left: `${(driverLocation.lat / mapSize) * 100}%`, 
                            top: `${(driverLocation.lng / mapSize) * 100}%` 
                        }}
                    >
                        <Truck 
                            className={`w-8 h-8 p-1 rounded-full border-2 shadow-xl ${status === 'Completed' ? 'text-gray-600 bg-gray-200' : 'text-red-600 bg-white animate-pulse border-red-600'}`}
                        />
                    </div>
                )}
                
                {status === 'Idle' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-30">
                        <p className="p-4 rounded-lg bg-gray-800 bg-opacity-70 text-white">
                            Dispatch Pending
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export function LiveTracker() {
    const [driverState, setDriverState] = useState(INITIAL_DELIVERY_STATE);
    const [notifications, setNotifications] = useState<string[]>([]);
    const [isCallOpen, setIsCallOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateRef = useRef(Date.now());
    
    const driverInfo = {
        name: 'Rajesh Kumar',
        phone: '+91 98765 43210',
        vehicle: 'MH 02 AB 1234'
    };
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'preparing': return 'bg-yellow-500';
            case 'dispatched': return 'bg-orange-500';
            case 'en_route': return 'bg-[#059669]';
            case 'nearby': return 'bg-blue-500';
            case 'delivered': return 'bg-green-600';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'preparing': return 'Preparing Your Meal';
            case 'dispatched': return 'Driver Assigned';
            case 'en_route': return 'On the Way';
            case 'nearby': return 'Driver Nearby';
            case 'delivered': return 'Delivered';
            default: return 'Unknown Status';
        }
    };

    // Advanced driver simulation with realistic behavior
    useEffect(() => {
        const startTime = Date.now();
        
        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = (now - lastUpdateRef.current) / 1000; // seconds since last update
            
            setDriverState(prev => {
                // Status progression based on time
                const totalElapsed = (now - startTime) / 1000; // total seconds
                
                let newState = { ...prev };
                
                // Dynamic conditions that change over time
                if (Math.random() < 0.1) { // 10% chance to change conditions each update
                    newState.traffic = TRAFFIC_CONDITIONS[Math.floor(Math.random() * TRAFFIC_CONDITIONS.length)];
                    newState.weather = WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
                }
                
                // Status transitions
                if (prev.status === 'preparing' && totalElapsed > 120) { // 2 minutes prep
                    newState.status = 'dispatched';
                    setNotifications(n => [...n, 'Driver has been assigned to your order!']);
                } else if (prev.status === 'dispatched' && totalElapsed > 180) { // 3 minutes total
                    newState.status = 'en_route';
                    setNotifications(n => [...n, 'Driver is on the way!']);
                }
                
                // Movement simulation only when en_route or nearby
                if (newState.status === 'en_route' || newState.status === 'nearby') {
                    const currentRoute = newState.currentRoute;
                    const currentTarget = currentRoute[Math.min(newState.currentStopIndex, currentRoute.length - 1)];
                    
                    if (currentTarget) {
                        const newPosition = generateRealisticMovement(
                            { lat: newState.lat, lng: newState.lng },
                            currentTarget,
                            { speed: newState.speed, traffic: newState.traffic, weather: newState.weather }
                        );
                        
                        newState.lat = newPosition.lat;
                        newState.lng = newPosition.lng;
                        
                        // Check if reached current target
                        const distanceToTarget = Math.hypot(newState.lat - currentTarget.lat, newState.lng - currentTarget.lng);
                        
                        if (distanceToTarget < 25) {
                            // Reached current stop
                            if (currentTarget.orderId === CONSUMER_TARGET.id) {
                                newState.status = 'delivered';
                                setNotifications(n => [...n, 'Your order has been delivered! 🎉']);
                            } else {
                                // Move to next stop
                                newState.currentStopIndex = Math.min(newState.currentStopIndex + 1, currentRoute.length - 1);
                                
                                // Add delivery delay at stops
                                if (currentTarget.duration > 0) {
                                    newState.delays += currentTarget.duration;
                                }
                            }
                        }
                        
                        // Check if nearby consumer
                        const distanceToConsumer = Math.hypot(newState.lat - CONSUMER_TARGET.lat, newState.lng - CONSUMER_TARGET.lng);
                        if (distanceToConsumer < 80 && newState.status === 'en_route') {
                            newState.status = 'nearby';
                            setNotifications(n => [...n, 'Driver is nearby! Preparing for delivery.']);
                        }
                    }
                }
                
                // Occasional random delays (traffic lights, etc.)
                if (Math.random() < 0.02) { // 2% chance per update
                    newState.delays += Math.random() * 60; // Up to 1 minute delay
                }
                
                lastUpdateRef.current = now;
                return newState;
            });
        }, 1500 + Math.random() * 1000); // Variable update interval: 1.5-2.5 seconds

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const eta = calculateDynamicEta(driverState);
    const deliveryStatus = driverState.status;

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-[#4338CA] text-white px-4 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1>Today's Delivery</h1>
                        <p className="text-sm opacity-90">Saturday, Sept 27</p>
                    </div>
                    <Badge className={`${getStatusColor(deliveryStatus)} text-white border-none`}>
                        {getStatusText(deliveryStatus)}
                    </Badge>
                </div>
            </div>

            {/* Map Section */}
            <div className="relative h-80 bg-gray-200 mx-4 mt-4 rounded-lg overflow-hidden">
                <MapView 
                    driverState={driverState}
                    targetStop={CONSUMER_TARGET}
                    kitchenLocation={KITCHEN_LOCATION}
                    mapSize={MAP_SIZE}
                />
                
                {/* Dynamic Status Overlays */}
                <div className="absolute top-4 right-4 space-y-2">
                    {/* ETA */}
                    <div className={`text-white px-3 py-2 rounded-lg shadow-lg ${
                        driverState.status === 'nearby' ? 'bg-blue-500 animate-pulse' : 
                        driverState.status === 'delivered' ? 'bg-green-600' : 'bg-[#FBBF24]'
                    }`}>
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span className="text-sm">ETA: {eta}</span>
                        </div>
                    </div>
                    
                    {/* Traffic Conditions */}
                    {driverState.traffic === 'heavy' && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Heavy Traffic
                        </div>
                    )}
                    
                    {/* Weather Conditions */}
                    {driverState.weather !== 'clear' && (
                        <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs">
                            {driverState.weather === 'light_rain' ? '🌦️ Light Rain' : '🌧️ Heavy Rain'}
                        </div>
                    )}
                </div>
                
                {/* Live Notifications */}
                {notifications.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white border border-green-200 rounded-lg p-3 shadow-lg animate-in slide-in-from-bottom">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-800">{notifications[notifications.length - 1]}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delivery Info Card */}
            <Card className="mx-4 mt-4 p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden relative">
                        <ImageWithFallback 
                            src="https://images.unsplash.com/photo-1645597454210-c97f9701257a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwZGVsaXZlcnl8ZW58MXx8fHwxNzU5MDAzNDM2fDA&ixlib=rb-4.1.0&q=80&w=200"
                            alt="Driver photo"
                            className="w-full h-full object-cover"
                        />
                        {(driverState.status === 'en_route' || driverState.status === 'nearby') && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3>{driverInfo.name}</h3>
                        <p className="text-sm text-gray-600">Your delivery partner</p>
                        <p className="text-xs text-gray-500">Vehicle: {driverInfo.vehicle}</p>
                        {driverState.traffic === 'heavy' && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertTriangle size={10} />
                                Stuck in traffic
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            driverState.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                            driverState.status === 'en_route' ? 'bg-green-100 text-green-800' :
                            driverState.status === 'nearby' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                            driverState.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {driverState.status === 'preparing' && '👨‍🍳'}
                            {driverState.status === 'dispatched' && '🚗'}
                            {driverState.status === 'en_route' && '🛣️'}
                            {driverState.status === 'nearby' && '📍'}
                            {driverState.status === 'delivered' && '✅'}
                            <span className="ml-1">{getStatusText(driverState.status)}</span>
                        </div>
                    </div>
                </div>
                
                {/* Dynamic Driver Activity */}
                {driverState.status !== 'delivered' && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">
                            {driverState.status === 'preparing' && '🍳 Chef is preparing your fresh meal...'}
                            {driverState.status === 'dispatched' && '🚗 Driver is picking up your order...'}
                            {driverState.status === 'en_route' && `🛣️ On route via ${driverState.currentRoute[driverState.currentStopIndex]?.stop || 'Main Road'}`}
                            {driverState.status === 'nearby' && '📍 Driver has arrived in your area'}
                        </p>
                    </div>
                )}
                
                {/* Driver Contact Buttons */}
                <div className="flex gap-3">
                    <Button 
                        className="flex-1 bg-[#059669] hover:bg-[#048556] text-white"
                        disabled={driverState.status === 'preparing'}
                        onClick={() => setIsCallOpen(true)}
                    >
                        <Phone size={16} className="mr-2" />
                        Call Driver
                    </Button>
                    <Button 
                        variant="outline" 
                        className="flex-1 border-[#059669] text-[#059669] hover:bg-[#059669] hover:text-white"
                        disabled={driverState.status === 'preparing'}
                        onClick={() => setIsChatOpen(true)}
                    >
                        <MessageCircle size={16} className="mr-2" />
                        Chat
                    </Button>
                </div>
            </Card>

            {/* Today's Menu */}
            <Card className="mx-4 mt-4 mb-4 p-4">
                <h3 className="mb-3">Today's Menu</h3>
                <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <ImageWithFallback 
                            src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzcGljZXMlMjBjdXJyeXxlbnwxfHx8fDE3NTkwMDM0Mzd8MA&ixlib=rb-4.1.0&q=80&w=200"
                            alt="Today's curry"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm">Paneer Butter Masala</h4>
                        <p className="text-xs text-gray-600">Basmati Rice • Roti • Salad</p>
                        <p className="text-xs text-gray-500 mt-1">Mild spice • No nuts</p>
                    </div>
                    <div className="text-right">
                        <Badge variant="outline" className="text-xs border-[#059669] text-[#059669]">
                            Active
                        </Badge>
                    </div>
                </div>
            </Card>

            {/* Call Interface */}
            <CallInterface
                isOpen={isCallOpen}
                onClose={() => setIsCallOpen(false)}
                driverName={driverInfo.name}
                driverPhone={driverInfo.phone}
            />

            {/* Chat Interface */}
            <ChatInterface
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                driverName={driverInfo.name}
                driverStatus={getStatusText(driverState.status)}
                eta={eta}
            />
        </div>
    );
}