import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Clock, ListChecks, ArrowLeft, Menu, Loader2, Package, MapPin, Pause } from 'lucide-react';
import SubscriptionPage from './components/SubscriptionPage';

// --- Constants & Mock Data ---

// Map size for visualization scaling
const MAP_SIZE = 1000; 

// The consumer's delivery target (Order O2)
const CONSUMER_TARGET = { id: 'O2', address: 'Apartment 3A, Tower 4, Mumbai', lat: 500, lng: 550 };
const KITCHEN_LOCATION = { lat: 800, lng: 800 }; 

// Mock route data for simulation
const MOCK_ROUTE_DATA = [
    { lat: 800, lng: 800, stop: 'Kitchen' },
    { lat: 750, lng: 700, stop: 'Order 1' },
    { lat: 600, lng: 650, stop: 'Order 3' },
    { lat: 500, lng: 550, stop: 'Order 2 (Target)', orderId: 'O2' }, // Consumer's location
    { lat: 450, lng: 400, stop: 'Order 4' },
    { lat: 300, lng: 350, stop: 'End of Route' },
];

const INITIAL_DELIVERY_STATE = {
    lat: KITCHEN_LOCATION.lat,
    lng: KITCHEN_LOCATION.lng,
    status: 'Idle',
    currentRoute: JSON.stringify(MOCK_ROUTE_DATA.filter(p => p.orderId)),
};

// --- Utility Functions ---

/**
 * Calculates a rough Estimated Time of Arrival (ETA).
 */
const calculateEta = (driverLat, driverLng, routeString, status) => {
    if (status === 'Completed') return 'Delivered!';
    if (status === 'Idle') return 'Route not started';
    
    let parsedRoute = [];
    try {
        parsedRoute = JSON.parse(routeString || '[]');
    } catch (e) {
        return 'Calculating...';
    }

    const targetIndex = MOCK_ROUTE_DATA.findIndex(p => p.orderId === CONSUMER_TARGET.id);
    if (targetIndex === -1) {
        return 'Route set, waiting for dispatch...';
    }

    // Simple distance check for proximity
    const distanceToTarget = Math.hypot(driverLat - CONSUMER_TARGET.lat, driverLng - CONSUMER_TARGET.lng);

    if (distanceToTarget < 50) {
        return '1-5 mins';
    }

    // Heuristic: Estimate based on stop count before target.
    const stopsBeforeTarget = targetIndex; 
    const timePerStop = 7; 
    let timeEstimate = stopsBeforeTarget * timePerStop;

    return `${Math.max(5, timeEstimate)} mins (approx)`;
};

// --- Components ---

/**
 * MapView Component
 */
const MapView = ({ driverState, targetStop, kitchenLocation, mapSize }) => {
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
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
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
                    <Package 
                        x={targetStop.lat - 12} 
                        y={targetStop.lng - 12} 
                        width="24" 
                        height="24" 
                        fill="#854D0E" 
                        className="text-white"
                    />

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
                        <p className="text-xl font-bold text-white p-4 rounded-lg bg-gray-800 bg-opacity-70">
                            Dispatch Pending
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};




/**
 * Deliveries Screen (Main Mobile View)
 */
const DeliveriesScreen = ({ driverState, etaText, isLoading, targetStop, kitchenLocation, mapSize, setView }) => {
    
    // Safely destructure driverState
    const { 
        lat, 
        lng, 
        status 
    } = driverState || { lat: 0, lng: 0, status: 'Idle' };
    
    const safeLat = lat || 0;
    const safeLng = lng || 0;

    const targetAddress = targetStop?.address || 'Loading Address...';
    
    let isNear = false;
    if (targetStop && targetStop.lat !== undefined && targetStop.lng !== undefined) {
        isNear = status !== 'Completed' && status !== 'Idle' && 
                 Math.hypot(safeLat - targetStop.lat, safeLng - targetStop.lng) < 150; 
    }

    return (
        <div className="flex flex-col h-full w-full max-w-lg mx-auto bg-gray-100 shadow-2xl rounded-xl overflow-hidden">
            
            {/* Header (Mobile Simulation) */}
            <header className="bg-emerald-600 text-white p-4 flex justify-between items-center shadow-lg">
                <ArrowLeft className="w-6 h-6 opacity-0" /> {/* Placeholder */}
                <h1 className="text-xl font-bold">NourishNet Tiffin Tracker</h1>
                <Menu className="w-6 h-6" />
            </header>

            {/* Content Area */}
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                
                {/* Status */}
                {isLoading && (
                     <div className="p-4 bg-white rounded-lg shadow-md flex items-center justify-center text-emerald-600">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        <p>Simulating Real-time Location...</p>
                    </div>
                )}

                {/* Tracking Card */}
                <div className="bg-white p-5 rounded-xl shadow-lg border-t-4 border-indigo-500">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                        <Truck className="w-6 h-6 mr-2 text-indigo-600" /> Your Daily Meal
                    </h2>

                    <div className="grid grid-cols-2 gap-4 text-center border-b pb-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Delivery Address</p>
                            <p className="text-lg font-semibold text-gray-700">{targetAddress}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Estimated Time</p>
                            <p className={`text-xl font-extrabold ${status === 'Idle' ? 'text-gray-500' : 'text-emerald-600'}`}>{etaText}</p>
                        </div>
                    </div>

                    {/* Proximity Alert */}
                    {isNear && (
                        <div className="p-3 mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 mr-2 animate-pulse" />
                            <p className="font-semibold text-sm">Your delivery is very close!</p>
                        </div>
                    )}
                    
                    {/* Map View Component */}
                    <MapView 
                        driverState={driverState} 
                        targetStop={targetStop} 
                        kitchenLocation={kitchenLocation} 
                        mapSize={mapSize}
                    />
                </div>
                
                {/* Subscription Management Button (Navigation) */}
                <div className="bg-white p-5 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                        <ListChecks className="w-5 h-5 mr-2 text-emerald-600" /> Subscription Actions
                    </h2>
                    <p className="text-gray-700 mb-4">
                        Manage your plan, pause, or resume delivery.
                    </p>
                    <button 
                        onClick={() => setView('subscription')}
                        className="w-full py-3 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 transition shadow-md flex items-center justify-center"
                    >
                        <Pause className="w-5 h-5 mr-2" /> Manage Subscription
                    </button>
                </div>

            </div>
        </div>
    );
};


/**
 * Main App Component (Root)
 * Handles view state and simulation logic.
 */
const App = () => {
    const [view, setView] = useState('tracker'); // 'tracker' or 'subscription'
    const [driverState, setDriverState] = useState(INITIAL_DELIVERY_STATE);
    const [loading, setLoading] = useState(true);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);

    // --- Local Polling Simulation (Replacing Firebase) ---
    useEffect(() => {
        setLoading(false); 
        
        // This simulates the driver moving between the stops every 2.5 seconds
        const intervalId = setInterval(() => {
            setCurrentStopIndex(prevIndex => {
                const newIndex = (prevIndex + 1);
                
                if (newIndex >= MOCK_ROUTE_DATA.length) {
                    clearInterval(intervalId);
                    setDriverState(prev => ({
                        ...prev, 
                        status: 'Completed',
                        lat: MOCK_ROUTE_DATA[MOCK_ROUTE_DATA.length - 1].lat,
                        lng: MOCK_ROUTE_DATA[MOCK_ROUTE_DATA.length - 1].lng,
                    }));
                    return MOCK_ROUTE_DATA.length - 1; 
                }

                // Update status and location to the next point
                const nextLocation = MOCK_ROUTE_DATA[newIndex];
                setDriverState(prev => ({
                    ...prev,
                    lat: nextLocation.lat,
                    lng: nextLocation.lng,
                    status: 'En Route',
                }));

                return newIndex;
            });
        }, 2500); // Update every 2.5 seconds

        return () => clearInterval(intervalId);
    }, []);

    const etaText = calculateEta(driverState.lat, driverState.lng, driverState.currentRoute, driverState.status);

    let CurrentViewComponent;
    if (view === 'subscription') {
        CurrentViewComponent = <SubscriptionPage setView={setView} />;
    } else {
        CurrentViewComponent = (
            <DeliveriesScreen 
                driverState={driverState} 
                etaText={etaText}
                isLoading={loading}
                targetStop={CONSUMER_TARGET}
                kitchenLocation={KITCHEN_LOCATION}
                mapSize={MAP_SIZE}
                setView={setView}
            />
        );
    }

    return (
        <div className="font-sans min-h-screen bg-gray-200 p-4 sm:p-8 flex items-center justify-center">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
                .font-sans {
                    font-family: 'Inter', sans-serif;
                }
                .max-w-lg {
                    min-height: 700px;
                }
                `}
            </style>
            {CurrentViewComponent}
        </div>
    );
};

export default App;