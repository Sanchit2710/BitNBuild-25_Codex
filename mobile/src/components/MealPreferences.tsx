import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Leaf, Flame, Heart, Shield, Clock, ChefHat, Star, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DietaryPreference {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  color: string;
}

interface Allergen {
  id: string;
  name: string;
  selected: boolean;
}

export function MealPreferences() {
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>([
    {
      id: 'vegetarian',
      name: 'Vegetarian',
      description: 'Only vegetarian meals',
      icon: <Leaf className="w-4 h-4" />,
      enabled: true,
      color: 'bg-green-500'
    },
    {
      id: 'vegan',
      name: 'Vegan',
      description: 'Plant-based only',
      icon: <Heart className="w-4 h-4" />,
      enabled: false,
      color: 'bg-emerald-500'
    },
    {
      id: 'glutenfree',
      name: 'Gluten-Free',
      description: 'No gluten ingredients',
      icon: <Shield className="w-4 h-4" />,
      enabled: false,
      color: 'bg-blue-500'
    },
    {
      id: 'keto',
      name: 'Keto-Friendly',
      description: 'Low carb, high fat',
      icon: <Flame className="w-4 h-4" />,
      enabled: false,
      color: 'bg-orange-500'
    }
  ]);

  const [spiceLevel, setSpiceLevel] = useState(2); // 1=Mild, 2=Medium, 3=Spicy
  const [allergens, setAllergens] = useState<Allergen[]>([
    { id: 'nuts', name: 'Nuts', selected: false },
    { id: 'dairy', name: 'Dairy', selected: false },
    { id: 'eggs', name: 'Eggs', selected: false },
    { id: 'shellfish', name: 'Shellfish', selected: false },
    { id: 'soy', name: 'Soy', selected: false },
    { id: 'fish', name: 'Fish', selected: false },
    { id: 'sesame', name: 'Sesame', selected: false },
    { id: 'mustard', name: 'Mustard', selected: false }
  ]);

  const [mealTiming, setMealTiming] = useState([12, 19]); // Lunch at 12, Dinner at 7
  const [showCustomAllergen, setShowCustomAllergen] = useState(false);
  const [customAllergen, setCustomAllergen] = useState('');

  const toggleDietaryPref = (id: string) => {
    setDietaryPrefs(prev => prev.map(pref => 
      pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
    ));
    
    const pref = dietaryPrefs.find(p => p.id === id);
    toast.success(`${pref?.name} ${!pref?.enabled ? 'enabled' : 'disabled'}!`);
  };

  const setSpiceLevelWithFeedback = (level: number) => {
    setSpiceLevel(level);
    const levels = ['Mild', 'Medium', 'Spicy'];
    toast.success(`Spice level set to ${levels[level - 1]}!`);
  };

  const toggleAllergen = (id: string) => {
    setAllergens(prev => prev.map(allergen => 
      allergen.id === id ? { ...allergen, selected: !allergen.selected } : allergen
    ));
    
    const allergen = allergens.find(a => a.id === id);
    toast.info(`${allergen?.name} ${!allergen?.selected ? 'added to' : 'removed from'} avoid list`);
  };

  const addCustomAllergen = () => {
    if (customAllergen.trim()) {
      const newAllergen: Allergen = {
        id: customAllergen.toLowerCase().replace(/\s+/g, ''),
        name: customAllergen,
        selected: true
      };
      setAllergens(prev => [...prev, newAllergen]);
      setCustomAllergen('');
      setShowCustomAllergen(false);
      toast.success(`${customAllergen} added to avoid list!`);
    }
  };

  const savePreferences = () => {
    toast.success('Meal preferences saved successfully!');
  };

  const getSpiceLevelText = (level: number) => {
    const levels = ['Mild 🌶️', 'Medium 🌶️🌶️', 'Spicy 🌶️🌶️🌶️'];
    return levels[level - 1];
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4">
      <div className="bg-[#4338CA] text-white px-4 py-4 -mx-4 -mt-4 mb-4">
        <h1 className="flex items-center gap-2">
          <ChefHat className="w-5 h-5" />
          Meal Preferences
        </h1>
        <p className="text-sm opacity-90">Customize your perfect meal experience</p>
      </div>

      {/* Dietary Preferences */}
      <Card className="p-4 mb-4">
        <h3 className="mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-[#059669]" />
          Dietary Preferences
        </h3>
        <div className="space-y-3">
          {dietaryPrefs.map((pref) => (
            <div
              key={pref.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                pref.enabled ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${pref.enabled ? pref.color : 'bg-gray-300'} text-white transition-colors`}>
                  {pref.icon}
                </div>
                <div>
                  <p className={`${pref.enabled ? 'text-green-800' : 'text-gray-700'}`}>{pref.name}</p>
                  <p className="text-sm text-gray-600">{pref.description}</p>
                </div>
              </div>
              <Switch 
                checked={pref.enabled}
                onCheckedChange={() => toggleDietaryPref(pref.id)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Spice Level */}
      <Card className="p-4 mb-4">
        <h3 className="mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Spice Level
        </h3>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg mb-2">{getSpiceLevelText(spiceLevel)}</p>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    spiceLevel === level
                      ? 'bg-[#059669] text-white scale-110'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                  onClick={() => setSpiceLevelWithFeedback(level)}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Mild</span>
              <span>Spicy</span>
            </div>
            <Slider
              value={[spiceLevel]}
              onValueChange={(value) => setSpiceLevelWithFeedback(value[0])}
              max={3}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Meal Timing */}
      <Card className="p-4 mb-4">
        <h3 className="mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Preferred Meal Times
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Lunch Time: {mealTiming[0]}:00</label>
            <Slider
              value={[mealTiming[0]]}
              onValueChange={(value) => {
                setMealTiming([value[0], mealTiming[1]]);
                toast.info(`Lunch time set to ${value[0]}:00`);
              }}
              max={16}
              min={11}
              step={1}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Dinner Time: {mealTiming[1]}:00</label>
            <Slider
              value={[mealTiming[1]]}
              onValueChange={(value) => {
                setMealTiming([mealTiming[0], value[0]]);
                toast.info(`Dinner time set to ${value[0]}:00`);
              }}
              max={22}
              min={17}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Allergens */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" />
            Allergens to Avoid
          </h3>
          <Dialog open={showCustomAllergen} onOpenChange={setShowCustomAllergen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Custom
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Custom Allergen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <input
                  type="text"
                  value={customAllergen}
                  onChange={(e) => setCustomAllergen(e.target.value)}
                  placeholder="Enter allergen name..."
                  className="w-full p-2 border rounded-lg"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCustomAllergen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-[#059669]"
                    onClick={addCustomAllergen}
                    disabled={!customAllergen.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {allergens.map((allergen) => (
            <Badge
              key={allergen.id}
              variant={allergen.selected ? "default" : "outline"}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                allergen.selected 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleAllergen(allergen.id)}
            >
              {allergen.name}
              {allergen.selected && ' ✕'}
            </Badge>
          ))}
        </div>
        
        {allergens.some(a => a.selected) && (
          <p className="text-xs text-gray-500 mt-3">
            ✕ Selected allergens will be avoided in all meals
          </p>
        )}
      </Card>

      {/* Save Button */}
      <Card className="p-4">
        <Button 
          className="w-full bg-[#059669] hover:bg-[#048556]"
          onClick={savePreferences}
        >
          <Heart className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Changes will apply to future meal deliveries
        </p>
      </Card>
    </div>
  );
}