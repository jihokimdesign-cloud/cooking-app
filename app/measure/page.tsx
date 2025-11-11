'use client';

import { useState, useEffect, useRef } from 'react';
import { Calculator, ArrowLeftRight, Timer, Play, Pause, Square, Plus, X, Info, TrendingUp, TrendingDown } from 'lucide-react';

type UnitType = 'volume' | 'weight' | 'temperature';
type IngredientType = 'water' | 'flour' | 'sugar' | 'butter' | 'oil' | 'milk';

interface Conversion {
  from: string;
  to: string;
  factor: number;
  offset?: number;
}

interface TimerState {
  id: string;
  name: string;
  seconds: number;
  remaining: number;
  isRunning: boolean;
  isComplete: boolean;
}

interface IngredientDensity {
  name: string;
  density: number; // grams per ml
  emoji: string;
}

const ingredientDensities: Record<IngredientType, IngredientDensity> = {
  water: { name: 'Water', density: 1.0, emoji: '💧' },
  flour: { name: 'Flour', density: 0.59, emoji: '🌾' },
  sugar: { name: 'Sugar', density: 0.85, emoji: '🍬' },
  butter: { name: 'Butter', density: 0.91, emoji: '🧈' },
  oil: { name: 'Oil', density: 0.92, emoji: '🫒' },
  milk: { name: 'Milk', density: 1.03, emoji: '🥛' },
};

const conversions: Record<UnitType, Conversion[]> = {
  volume: [
    { from: 'cups', to: 'ml', factor: 236.588 },
    { from: 'cups', to: 'fl oz', factor: 8 },
    { from: 'cups', to: 'tablespoons', factor: 16 },
    { from: 'cups', to: 'teaspoons', factor: 48 },
    { from: 'tablespoons', to: 'ml', factor: 14.7868 },
    { from: 'tablespoons', to: 'teaspoons', factor: 3 },
    { from: 'teaspoons', to: 'ml', factor: 4.92892 },
    { from: 'liters', to: 'cups', factor: 4.22675 },
    { from: 'liters', to: 'ml', factor: 1000 },
    { from: 'ml', to: 'fl oz', factor: 0.033814 },
  ],
  weight: [
    { from: 'grams', to: 'ounces', factor: 0.035274 },
    { from: 'grams', to: 'pounds', factor: 0.00220462 },
    { from: 'ounces', to: 'grams', factor: 28.3495 },
    { from: 'pounds', to: 'grams', factor: 453.592 },
    { from: 'kilograms', to: 'pounds', factor: 2.20462 },
    { from: 'kilograms', to: 'grams', factor: 1000 },
  ],
  temperature: [
    { from: 'Celsius', to: 'Fahrenheit', factor: 1.8, offset: 32 },
    { from: 'Fahrenheit', to: 'Celsius', factor: 0.555556, offset: -32 },
  ],
};

const commonConversions = [
  { label: '1 cup = 240ml = 16 tbsp', emoji: '🥛' },
  { label: '1 tbsp = 15ml = 3 tsp', emoji: '🥄' },
  { label: '1 stick butter = 113g = 1/2 cup', emoji: '🧈' },
  { label: '1 cup flour = 120g', emoji: '🌾' },
  { label: '1 cup sugar = 200g', emoji: '🍬' },
  { label: '350°F = 175°C (baking)', emoji: '🌡️' },
];

const commonSubstitutions = [
  { from: '1 egg', to: '1/4 cup applesauce (vegan)', emoji: '🥚' },
  { from: '1 cup butter', to: '3/4 cup oil', emoji: '🧈' },
  { from: '1 cup buttermilk', to: '1 cup milk + 1 tbsp lemon juice', emoji: '🥛' },
  { from: '1 cup heavy cream', to: '3/4 cup milk + 1/4 cup butter', emoji: '🥛' },
  { from: '1 cup all-purpose flour', to: '1 cup + 2 tbsp cake flour', emoji: '🌾' },
];

const presetTimes = [
  { name: 'Pasta', seconds: 600, emoji: '🍝' },
  { name: 'Rice', seconds: 1200, emoji: '🍚' },
  { name: 'Hard Boiled Egg', seconds: 600, emoji: '🥚' },
  { name: 'Soft Boiled Egg', seconds: 300, emoji: '🥚' },
  { name: 'Baking (cookies)', seconds: 660, emoji: '🍪' },
  { name: 'Roasting (chicken)', seconds: 3600, emoji: '🍗' },
];

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function MeasurePage() {
  const [activeTab, setActiveTab] = useState<'converter' | 'timer' | 'scaling'>('converter');
  const [unitType, setUnitType] = useState<UnitType>('volume');
  const [ingredient, setIngredient] = useState<IngredientType>('water');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [measuringCupLevel, setMeasuringCupLevel] = useState(0);
  const [servings, setServings] = useState(4);
  const [targetServings, setTargetServings] = useState(4);
  const [recipeValue, setRecipeValue] = useState('');
  const [scaledValue, setScaledValue] = useState<number | null>(null);
  const [timers, setTimers] = useState<TimerState[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const availableUnits = conversions[unitType].reduce((acc, conv) => {
    if (!acc.includes(conv.from)) acc.push(conv.from);
    if (!acc.includes(conv.to)) acc.push(conv.to);
    return acc;
  }, [] as string[]);

  // Timer effect
  useEffect(() => {
    if (timers.some(t => t.isRunning)) {
      timerIntervalRef.current = setInterval(() => {
        setTimers(prev => prev.map(timer => {
          if (timer.isRunning && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            if (newRemaining === 0) {
              // Timer complete - play sound
              playAlertSound();
              return { ...timer, remaining: 0, isRunning: false, isComplete: true };
            }
            return { ...timer, remaining: newRemaining };
          }
          return timer;
        }));
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timers]);

  const playAlertSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleConvert = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || !fromUnit || !toUnit) {
      setResult(null);
      return;
    }

    if (fromUnit === toUnit) {
      setResult(numValue);
      updateMeasuringCup(numValue, fromUnit);
      return;
    }

    // Smart conversion with ingredient density
    let convertedValue = numValue;
    
    // Convert to ml first if dealing with volume
    if (unitType === 'volume') {
      let mlValue = numValue;
      
      // Convert from unit to ml
      if (fromUnit !== 'ml') {
        const toMl = conversions.volume.find(c => c.from === fromUnit && c.to === 'ml');
        if (toMl) {
          mlValue = numValue * toMl.factor;
        }
      }
      
      // If converting to weight, use density
      if (toUnit === 'grams' || toUnit === 'ounces' || toUnit === 'pounds') {
        const density = ingredientDensities[ingredient].density;
        const grams = mlValue * density;
        
        // Convert to target weight unit
        if (toUnit === 'grams') {
          convertedValue = grams;
        } else if (toUnit === 'ounces') {
          convertedValue = grams * 0.035274;
        } else if (toUnit === 'pounds') {
          convertedValue = grams * 0.00220462;
        }
      } else {
        // Volume to volume conversion
        const conversion = conversions.volume.find(c => c.from === fromUnit && c.to === toUnit);
        if (!conversion) {
          // Try reverse
          const reverse = conversions.volume.find(c => c.from === toUnit && c.to === fromUnit);
          if (reverse) {
            convertedValue = numValue / reverse.factor;
          }
        } else {
          convertedValue = numValue * conversion.factor;
        }
      }
    } else if (unitType === 'weight') {
      // Weight conversions
      const conversion = conversions.weight.find(c => c.from === fromUnit && c.to === toUnit);
      if (!conversion) {
        const reverse = conversions.weight.find(c => c.from === toUnit && c.to === fromUnit);
        if (reverse) {
          convertedValue = numValue / reverse.factor;
        }
      } else {
        convertedValue = numValue * conversion.factor;
      }
    } else if (unitType === 'temperature') {
      // Temperature conversion
      const conversion = conversions.temperature.find(c => c.from === fromUnit && c.to === toUnit);
      if (conversion) {
        const offset = conversion.offset || 0;
        convertedValue = numValue * conversion.factor + offset;
      } else {
        const reverse = conversions.temperature.find(c => c.from === toUnit && c.to === fromUnit);
        if (reverse) {
          const offset = reverse.offset || 0;
          convertedValue = (numValue - offset) / reverse.factor;
        }
      }
    }

    setResult(convertedValue);
    
    // Update measuring cup visualization
    if (unitType === 'volume' && (toUnit === 'cups' || toUnit === 'ml')) {
      updateMeasuringCup(convertedValue, toUnit);
    }
  };

  const updateMeasuringCup = (val: number, unit: string) => {
    let cups = val;
    if (unit === 'ml') {
      cups = val / 236.588;
    } else if (unit === 'tablespoons') {
      cups = val / 16;
    } else if (unit === 'teaspoons') {
      cups = val / 48;
    }
    const percentage = Math.min(100, Math.max(0, (cups / 4) * 100)); // 4 cups max
    setMeasuringCupLevel(percentage);
  };

  const handleScaleRecipe = () => {
    const numValue = parseFloat(recipeValue);
    if (isNaN(numValue) || servings <= 0 || targetServings <= 0) {
      setScaledValue(null);
      return;
    }
    const scale = targetServings / servings;
    setScaledValue(numValue * scale);
  };

  const addTimer = (name: string, seconds: number) => {
    const newTimer: TimerState = {
      id: Date.now().toString(),
      name,
      seconds,
      remaining: seconds,
      isRunning: false,
      isComplete: false,
    };
    setTimers([...timers, newTimer]);
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.id === id) {
        return { ...timer, isRunning: !timer.isRunning, isComplete: false };
      }
      return timer;
    }));
  };

  const resetTimer = (id: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.id === id) {
        return { ...timer, remaining: timer.seconds, isRunning: false, isComplete: false };
      }
      return timer;
    }));
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
  };

  useEffect(() => {
    if (value && fromUnit && toUnit) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        handleConvert();
      }
    } else {
      setResult(null);
    }
  }, [value, fromUnit, toUnit, ingredient, unitType]);

  useEffect(() => {
    if (recipeValue && servings && targetServings) {
      const numValue = parseFloat(recipeValue);
      if (!isNaN(numValue)) {
        handleScaleRecipe();
      }
    } else {
      setScaledValue(null);
    }
  }, [recipeValue, servings, targetServings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📏</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Advanced Measurement Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Convert, measure, and time your cooking perfectly! ⏱️
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          {(['converter', 'timer', 'scaling'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              {tab === 'converter' && 'Converter'}
              {tab === 'timer' && 'Kitchen Timer'}
              {tab === 'scaling' && 'Recipe Scaling'}
            </button>
          ))}
        </div>

        {/* Common Conversions Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Common Conversions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {commonConversions.map((conv, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-zinc-700 rounded-lg"
              >
                <span className="text-2xl">{conv.emoji}</span>
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  {conv.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Converter Tab */}
        {activeTab === 'converter' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Converter */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-blue-500" />
                Universal Converter
              </h2>

              {/* Ingredient Selector (for volume to weight) */}
              {unitType === 'volume' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Ingredient (for weight conversion)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(ingredientDensities) as IngredientType[]).map((ing) => (
                      <button
                        key={ing}
                        onClick={() => setIngredient(ing)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          ingredient === ing
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                        }`}
                      >
                        <span className="mr-1">{ingredientDensities[ing].emoji}</span>
                        {ingredientDensities[ing].name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Unit Type Selector */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Conversion Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['volume', 'weight', 'temperature'] as UnitType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setUnitType(type);
                        setFromUnit('');
                        setToUnit('');
                        setValue('');
                        setResult(null);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                        unitType === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    From
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Enter value"
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={fromUnit}
                      onChange={(e) => setFromUnit(e.target.value)}
                      className="px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Unit</option>
                      {availableUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowLeftRight className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    To
                  </label>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select unit</option>
                    {availableUnits
                      .filter((unit) => unit !== fromUnit)
                      .map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Result */}
                {result !== null && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Result</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {result.toFixed(2)} {toUnit}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Guides */}
            <div className="space-y-6">
              {/* Measuring Cup Animation */}
              {unitType === 'volume' && (
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Measuring Cup
                  </h3>
                  <div className="flex items-end justify-center h-64">
                    <div className="relative w-32 h-64 border-4 border-gray-300 dark:border-zinc-600 rounded-b-lg bg-gray-50 dark:bg-zinc-900">
                      {/* Fill */}
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-400 dark:bg-blue-500 rounded-b transition-all duration-500 ease-out"
                        style={{ height: `${measuringCupLevel}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent rounded-b"></div>
                      </div>
                      {/* Markings */}
                      {[0, 25, 50, 75, 100].map((mark) => (
                        <div
                          key={mark}
                          className="absolute left-0 right-0 border-t border-gray-400 dark:border-zinc-500"
                          style={{ bottom: `${mark}%` }}
                        >
                          <span className="absolute -left-8 text-xs text-gray-600 dark:text-gray-400">
                            {mark === 0 ? '0' : mark === 25 ? '1' : mark === 50 ? '2' : mark === 75 ? '3' : '4'}c
                          </span>
                        </div>
                      ))}
                      {/* Percentage */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                          {measuringCupLevel.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Substitutions */}
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Common Substitutions
                </h3>
                <div className="space-y-3">
                  {commonSubstitutions.map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg"
                    >
                      <span className="text-2xl">{sub.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {sub.from}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          → {sub.to}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="space-y-6">
            {/* Add Timer */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Timer className="w-6 h-6 text-blue-500" />
                Kitchen Timers
              </h2>
              
              {/* Preset Times */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Quick Start
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {presetTimes.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => addTimer(preset.name, preset.seconds)}
                      className="px-3 py-2 bg-blue-50 dark:bg-zinc-700 hover:bg-blue-100 dark:hover:bg-zinc-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <span className="mr-1">{preset.emoji}</span>
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Timer Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Timer name (e.g., pasta)"
                  id="timer-name"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Minutes"
                  id="timer-minutes"
                  className="w-24 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => {
                    const nameInput = document.getElementById('timer-name') as HTMLInputElement;
                    const minutesInput = document.getElementById('timer-minutes') as HTMLInputElement;
                    const name = nameInput.value || 'Timer';
                    const minutes = parseInt(minutesInput.value) || 0;
                    if (minutes > 0) {
                      addTimer(name, minutes * 60);
                      nameInput.value = '';
                      minutesInput.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Active Timers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timers.map((timer) => (
                <div
                  key={timer.id}
                  className={`bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 ${
                    timer.isComplete ? 'ring-4 ring-red-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {timer.name}
                    </h3>
                    <button
                      onClick={() => removeTimer(timer.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="text-4xl font-bold text-center mb-4 text-blue-600 dark:text-blue-400">
                    {formatTime(timer.remaining)}
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(timer.remaining / timer.seconds) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTimer(timer.id)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        timer.isRunning
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {timer.isRunning ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Start
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => resetTimer(timer.id)}
                      className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {timer.isComplete && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center text-red-600 dark:text-red-400 font-semibold">
                      ⏰ Time's up!
                    </div>
                  )}
                </div>
              ))}
            </div>

            {timers.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg">
                <Timer className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No timers yet. Add one to get started!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Scaling Tab */}
        {activeTab === 'scaling' && (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Recipe Scaling Calculator
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Original Amount
                  </label>
                  <input
                    type="number"
                    value={recipeValue}
                    onChange={(e) => setRecipeValue(e.target.value)}
                    placeholder="e.g., 2 cups"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Original Servings
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="px-3 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded-lg"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={servings}
                      onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-center"
                    />
                    <button
                      onClick={() => setServings(servings + 1)}
                      className="px-3 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Target Servings
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTargetServings(Math.max(1, targetServings - 1))}
                      className="px-3 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded-lg"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={targetServings}
                      onChange={(e) => setTargetServings(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white text-center"
                    />
                    <button
                      onClick={() => setTargetServings(targetServings + 1)}
                      className="px-3 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {scaledValue !== null && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Scaled Amount</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {scaledValue.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Scale: {(targetServings / servings).toFixed(2)}x
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
