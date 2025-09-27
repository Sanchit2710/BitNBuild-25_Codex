import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Calendar, Users, Utensils, Trophy, Star, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Plan {
  id: string;
  name: string;
  price: number;
  meals: number;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  color: string;
}

export function SubscriptionManagement() {
  const [currentPlan, setCurrentPlan] = useState('premium');
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [mealsUsed, setMealsUsed] = useState(22);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 1999,
      meals: 20,
      features: ['20 meals per month', 'Basic menu selection', 'Email support'],
      icon: <Utensils className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 2999,
      meals: 30,
      features: ['30 meals per month', 'Premium menu access', 'Priority support', 'Custom meal requests'],
      icon: <Star className="w-5 h-5" />,
      popular: true,
      color: 'bg-[#059669]'
    },
    {
      id: 'family',
      name: 'Family Plan',
      price: 4999,
      meals: 50,
      features: ['50 meals per month', 'Family portions', '24/7 support', 'Custom nutrition plans', 'Free desserts'],
      icon: <Crown className="w-5 h-5" />,
      color: 'bg-purple-500'
    }
  ];

  const currentPlanData = plans.find(p => p.id === currentPlan)!;
  const usagePercentage = (mealsUsed / currentPlanData.meals) * 100;

  const handlePlanChange = (planId: string) => {
    setIsChanging(true);
    setSelectedPlan(planId);
    
    setTimeout(() => {
      setCurrentPlan(planId);
      setIsChanging(false);
      setShowPlanDialog(false);
      toast.success(`Successfully switched to ${plans.find(p => p.id === planId)?.name}!`);
    }, 1500);
  };

  const renewPlan = () => {
    toast.success('Plan renewed successfully! Next billing: Nov 27, 2025');
  };

  const pausePlan = () => {
    toast.info('Plan paused. You can resume anytime from settings.');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4">
      <div className="bg-[#4338CA] text-white px-4 py-4 -mx-4 -mt-4 mb-4">
        <h1 className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Subscription Plan
        </h1>
        <p className="text-sm opacity-90">Manage your meal plan</p>
      </div>

      {/* Current Plan Status */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2">
            {currentPlanData.icon}
            Current Plan
          </h3>
          <Badge className="bg-[#059669] text-white animate-pulse">Active</Badge>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">{currentPlanData.name}</p>
            <p className="text-lg">₹{currentPlanData.price.toLocaleString()}/month</p>
          </div>
          
          {/* Meal Usage Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Meals Used</span>
              <span>{mealsUsed}/{currentPlanData.meals}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {currentPlanData.meals - mealsUsed} meals remaining this month
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-[#4338CA] hover:bg-[#3730A3]"
            onClick={renewPlan}
          >
            <Zap className="w-4 h-4 mr-2" />
            Renew Now
          </Button>
          <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Change Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Choose Your Plan</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedPlan === plan.id 
                        ? 'border-[#059669] bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.popular ? 'ring-2 ring-orange-200' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-2 left-4 bg-orange-500">
                        Most Popular
                      </Badge>
                    )}
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${plan.color} text-white`}>
                          {plan.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{plan.name}</h4>
                          <p className="text-lg text-[#059669]">₹{plan.price.toLocaleString()}/month</p>
                        </div>
                      </div>
                      {selectedPlan === plan.id && (
                        <div className="w-5 h-5 bg-[#059669] rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <p className="font-medium mb-2">{plan.meals} meals per month</p>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-[#059669] rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPlanDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#059669] hover:bg-[#048556]"
                  onClick={() => handlePlanChange(selectedPlan)}
                  disabled={isChanging || selectedPlan === currentPlan}
                >
                  {isChanging ? 'Switching...' : selectedPlan === currentPlan ? 'Current Plan' : 'Switch Plan'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4 mb-4">
        <h3 className="mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center gap-1 hover:bg-blue-50"
            onClick={() => toast.info('Delivery preferences updated!')}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Schedule</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center gap-1 hover:bg-red-50"
            onClick={pausePlan}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Pause Plan</span>
          </Button>
        </div>
      </Card>

      {/* Subscription Stats */}
      <Card className="p-4">
        <h3 className="mb-3">This Month's Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl text-[#059669]">{mealsUsed}</p>
            <p className="text-xs text-gray-600">Meals Delivered</p>
          </div>
          <div>
            <p className="text-2xl text-orange-500">4.8</p>
            <p className="text-xs text-gray-600">Avg Rating</p>
          </div>
          <div>
            <p className="text-2xl text-blue-500">₹{Math.round(currentPlanData.price / currentPlanData.meals)}</p>
            <p className="text-xs text-gray-600">Per Meal</p>
          </div>
        </div>
      </Card>
    </div>
  );
}