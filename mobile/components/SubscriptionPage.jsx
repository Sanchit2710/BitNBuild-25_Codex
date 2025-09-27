import React, { useState } from 'react';
import { ArrowLeft, Menu, Pause, CheckCircle, RotateCcw } from 'lucide-react';

/**
 * SubscriptionPage Component
 */
const SubscriptionPage = ({ setView }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [plan, setPlan] = useState('Monthly Veg Standard');
    const [message, setMessage] = useState(''); // State for custom non-blocking message

    const handlePause = () => {
        const newState = !isPaused;
        setIsPaused(newState);
        setMessage(newState ? 'Delivery successfully paused!' : 'Delivery successfully resumed!');
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
    };

    const handlePlanChange = (newPlan) => {
        setPlan(newPlan);
        setMessage(`Plan updated to: ${newPlan}`);
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
        // console.log(`Plan updated to: ${newPlan}`); // Use console.log for debugging
    };

    return (
        <div className="flex flex-col h-full w-full max-w-lg mx-auto bg-gray-100 shadow-2xl rounded-xl overflow-hidden">
            <header className="bg-emerald-600 text-white p-4 flex justify-between items-center shadow-lg">
                <button onClick={() => setView('tracker')} className="p-1 rounded hover:bg-emerald-700 transition">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Manage Subscription</h1>
                <Menu className="w-6 h-6 opacity-0" /> {/* Spacer */}
            </header>

            <div className="flex-grow p-4 space-y-6 overflow-y-auto">
                
                {/* Custom Message Box */}
                {message && (
                    <div className="bg-indigo-100 border border-indigo-400 text-indigo-700 px-4 py-3 rounded-lg relative transition-opacity duration-300">
                        <p className="font-semibold text-center">{message}</p>
                    </div>
                )}
                
                {/* Current Plan Card */}
                <div className="bg-white p-5 rounded-xl shadow-lg border-t-4 border-indigo-500">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                        <CheckCircle className="w-6 h-6 mr-2 text-indigo-600" /> Current Plan
                    </h2>
                    <p className="text-lg font-semibold text-gray-700 mb-2">{plan}</p>
                    <p className="text-sm text-gray-500">
                        Billed monthly, next renewal on **Oct 25, 2025**.
                    </p>
                </div>

                {/* Pause/Resume Card */}
                <div className="bg-white p-5 rounded-xl shadow-lg border-t-4 border-yellow-500">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                        <Pause className="w-6 h-6 mr-2 text-yellow-600" /> Pause Management
                    </h2>
                    
                    {isPaused ? (
                        <div className="text-center p-4 bg-yellow-50 rounded-lg mb-4">
                            <p className="font-semibold text-yellow-700">Delivery is currently **PAUSED**.</p>
                            <p className="text-sm text-gray-600">Resume any time to restart the service.</p>
                        </div>
                    ) : (
                        <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                            <p className="font-semibold text-emerald-700">Service is **ACTIVE**.</p>
                        </div>
                    )}

                    <button 
                        onClick={handlePause} 
                        className={`w-full py-3 text-white font-bold rounded-lg transition shadow-md ${isPaused ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        {isPaused ? (
                            <span className="flex items-center justify-center"><RotateCcw className="w-5 h-5 mr-2" /> Resume Service</span>
                        ) : (
                            <span className="flex items-center justify-center"><Pause className="w-5 h-5 mr-2" /> Pause Delivery for 3 Days</span>
                        )}
                    </button>
                </div>

                {/* Upgrade/Change Plan Mock */}
                <div className="bg-white p-5 rounded-xl shadow-lg border-t-4 border-gray-400">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Upgrade / Change Plan</h2>
                    
                    <div className="space-y-3">
                        {['Monthly Veg Premium', 'Weekly Non-Veg Trial'].map(p => (
                            <div 
                                key={p} 
                                onClick={() => handlePlanChange(p)}
                                className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-indigo-50 transition flex justify-between items-center"
                            >
                                <span className="font-medium">{p}</span>
                                <button className="text-indigo-600 text-sm font-semibold">Select</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;