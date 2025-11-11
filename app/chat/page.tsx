'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Download, Sparkles, ChefHat, FlaskConical, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Personality = 'friendly' | 'ramsay' | 'science' | 'grandma';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PersonalityConfig {
  name: string;
  emoji: string;
  icon: React.ReactNode;
  description: string;
  greeting: string;
}

const personalities: Record<Personality, PersonalityConfig> = {
  friendly: {
    name: 'Friendly Chef',
    emoji: '👨‍🍳',
    icon: <ChefHat className="w-5 h-5" />,
    description: 'Encouraging and helpful',
    greeting: 'Hello! 👋 I\'m your friendly cooking assistant! I\'m here to help you create amazing dishes with confidence. What would you like to cook today?',
  },
  ramsay: {
    name: 'Gordon Ramsay Mode',
    emoji: '🔥',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Direct and passionate',
    greeting: 'Right, let\'s get this sorted! 🔥 I\'m here to help you cook properly. No nonsense, just great food. What are we making?',
  },
  science: {
    name: 'Science Cook',
    emoji: '🔬',
    icon: <FlaskConical className="w-5 h-5" />,
    description: 'Explains the science',
    greeting: 'Hello! 🔬 I\'m your science-based cooking assistant. I\'ll explain the chemistry and physics behind cooking techniques. What would you like to understand?',
  },
  grandma: {
    name: 'Grandma Style',
    emoji: '❤️',
    icon: <Heart className="w-5 h-5" />,
    description: 'Warm and traditional',
    greeting: 'Hello, dear! ❤️ I\'m here to share my favorite recipes and cooking secrets passed down through generations. What would you like to learn?',
  },
};

const quickPrompts = [
  "What can I make with chicken and rice?",
  "How do I fix oversalted soup?",
  "Beginner-friendly dinner ideas",
  "Convert this recipe to metric",
  "Make this recipe vegetarian",
];

function getResponse(userMessage: string, personality: Personality, conversationHistory: Message[]): string {
  const lowerMessage = userMessage.toLowerCase().trim();
  const lastUserMessage = conversationHistory.filter(m => m.role === 'user').slice(-1)[0]?.content.toLowerCase() || '';
  
  // Personality-specific responses
  const responses: Record<Personality, (msg: string, history: Message[]) => string> = {
    friendly: (msg, history) => {
      if (msg.includes('chicken') && msg.includes('rice')) {
        return 'Great choice! 🍗 Here are some delicious options:\n\n1. **Chicken Fried Rice** - Quick and easy!\n   • Cook rice, let it cool\n   • Stir-fry diced chicken\n   • Add vegetables and rice\n   • Season with soy sauce\n\n2. **Chicken and Rice Casserole** - Comfort food!\n   • Layer chicken, rice, and broth\n   • Bake at 375°F for 45 minutes\n   • Top with cheese if desired\n\n3. **Chicken Teriyaki Bowl** - Flavorful!\n   • Marinate chicken in teriyaki sauce\n   • Grill or pan-sear\n   • Serve over steamed rice\n\nWhich one sounds good? I can give you detailed steps! 😊';
      }
      if (msg.includes('oversalt') || msg.includes('too salty')) {
        return 'Don\'t worry, we can fix that! 💪 Here are some solutions:\n\n1. **Add more liquid** - Dilute with water, broth, or unsalted stock\n2. **Add potatoes** - They absorb salt! Add diced potatoes and cook for 10-15 minutes, then remove\n3. **Add acid** - A splash of lemon juice or vinegar can balance saltiness\n4. **Add sugar** - A tiny pinch can help counteract salt\n5. **Add dairy** - Cream or milk can mellow out saltiness\n\nWhat type of dish is it? I can give more specific advice! 😊';
      }
      if (msg.includes('beginner') || msg.includes('easy')) {
        return 'Perfect for starting out! 🌟 Here are some beginner-friendly dinner ideas:\n\n1. **Pasta with Marinara** - Simple and delicious\n2. **Sheet Pan Chicken and Vegetables** - One pan, minimal cleanup!\n3. **Tacos** - Fun and customizable\n4. **Stir Fry** - Quick and healthy\n5. **Grilled Cheese and Soup** - Classic comfort food\n\nWould you like detailed instructions for any of these? I\'m here to help! 😊';
      }
      if (msg.includes('convert') || msg.includes('metric')) {
        return 'I\'d be happy to help convert measurements! 📏\n\nCommon conversions:\n• 1 cup = 240 ml\n• 1 tablespoon = 15 ml\n• 1 teaspoon = 5 ml\n• 1 ounce = 28 grams\n• 350°F = 175°C\n\nShare the recipe you want to convert, and I\'ll help you! 😊';
      }
      if (msg.includes('vegetarian') || msg.includes('vegan')) {
        return 'Great choice for a plant-based meal! 🌱\n\nCommon substitutions:\n• **Meat** → Tofu, tempeh, beans, or mushrooms\n• **Chicken broth** → Vegetable broth\n• **Butter** → Olive oil or vegan butter\n• **Eggs** → Flax eggs (1 tbsp ground flax + 3 tbsp water)\n• **Cheese** → Nutritional yeast or vegan cheese\n\nWhat recipe would you like to convert? I\'ll guide you through it! 😊';
      }
      if (msg.includes('hello') || msg.includes('hi')) {
        return 'Hello! 👋 So glad you\'re here! I\'m excited to help you cook something amazing. What would you like to make today?';
      }
      if (msg.includes('recipe') || msg.includes('cook')) {
        return 'I\'d love to help you with a recipe! 🍳\n\nYou can also check out the Recipe Finder page to search by ingredients. Or tell me what you\'re in the mood for, and I\'ll suggest something perfect! 😊';
      }
      return 'That\'s a great question! 🤔\n\nI can help you with:\n• Recipe suggestions and modifications\n• Cooking techniques and tips\n• Ingredient substitutions\n• Troubleshooting cooking problems\n• Step-by-step guidance\n\nWhat would you like to know more about? I\'m here to help! 😊';
    },
    
    ramsay: (msg, history) => {
      if (msg.includes('chicken') && msg.includes('rice')) {
        return 'Right, chicken and rice - classic combo! 🔥\n\n**Chicken Fried Rice** - Do it properly:\n1. Cook your rice the day before or use day-old rice - fresh rice is too sticky!\n2. Get your wok SCREAMING hot\n3. Cook chicken first, set aside\n4. Scramble eggs, push aside\n5. Add rice, break it up properly\n6. Add chicken back, season with soy sauce\n7. Finish with green onions\n\nDon\'t overcrowd the pan! Cook in batches if needed. Now go make it! 🔥';
      }
      if (msg.includes('oversalt') || msg.includes('too salty')) {
        return 'You\'ve over-salted it, haven\'t you? Right, let\'s fix this properly:\n\n1. **Add potatoes** - They\'ll soak up the salt. Dice them, add to the dish, cook 10 minutes, then fish them out\n2. **Dilute it** - Add more unsalted liquid (water, stock, whatever fits)\n3. **Add acid** - Lemon juice or vinegar cuts through salt\n4. **Add sugar** - Tiny bit, balances it out\n\nNext time, taste as you go! Season gradually, not all at once. Got it? 🔥';
      }
      if (msg.includes('beginner') || msg.includes('easy')) {
        return 'Right, let\'s start you off properly! 🔥\n\n**Beginner-friendly dinners that actually taste good:**\n1. **Pasta Aglio e Olio** - Garlic, oil, pasta. Simple, delicious\n2. **Pan-seared chicken** - Season it, hot pan, 6-7 minutes each side\n3. **Roasted vegetables** - Toss in oil, salt, pepper, 425°F until golden\n4. **Stir fry** - High heat, don\'t overcook the veg\n\nStart simple, master the basics, then build from there. No shortcuts! 🔥';
      }
      if (msg.includes('convert') || msg.includes('metric')) {
        return 'Right, metric conversions:\n\n• 1 cup = 240ml\n• 1 tbsp = 15ml\n• 1 tsp = 5ml\n• 1 oz = 28g\n• 350°F = 175°C\n\nGive me the recipe, I\'ll convert it properly. No guesswork! 🔥';
      }
      if (msg.includes('vegetarian') || msg.includes('vegan')) {
        return 'Plant-based? Right, here\'s how to do it properly:\n\n**Substitutions that actually work:**\n• Meat → Mushrooms (portobello, shiitake), tofu, or lentils\n• Chicken stock → Vegetable stock (make your own, don\'t buy that rubbish)\n• Butter → Good olive oil\n• Eggs → Flax eggs or aquafaba\n\nWhat recipe are we converting? Let\'s make it taste good, not just "healthy"! 🔥';
      }
      return 'Right, what do you need? 🔥\n\nI can help with:\n• Recipes done properly\n• Techniques that actually work\n• Fixing your mistakes\n• Making food that tastes good\n\nWhat\'s the problem? Let\'s sort it! 🔥';
    },
    
    science: (msg, history) => {
      if (msg.includes('chicken') && msg.includes('rice')) {
        return 'Excellent question! Let\'s explore the chemistry and techniques: 🔬\n\n**Chicken and Rice - The Science:**\n\n1. **Chicken Fried Rice** - The key is using day-old rice. Fresh rice has excess moisture (starch retrogradation hasn\'t occurred), making it sticky. Older rice has crystallized starch, allowing individual grains to separate.\n\n2. **Maillard Reaction** - When searing chicken, you\'re creating complex flavor compounds through the Maillard reaction (amino acids + reducing sugars at 140-165°C).\n\n3. **Gelatinization** - Rice cooking involves starch gelatinization at 60-80°C, where starch granules absorb water and swell.\n\nWould you like detailed scientific explanations for any technique? 🔬';
      }
      if (msg.includes('oversalt') || msg.includes('too salty')) {
        return 'Interesting problem! Let\'s understand the chemistry: 🔬\n\n**Why it tastes too salty:**\nSodium ions (Na+) bind to taste receptors, creating the salty sensation. Too many ions = overwhelming signal.\n\n**Solutions based on chemistry:**\n1. **Osmosis** - Potatoes absorb salt through osmotic pressure (water moves from low to high salt concentration)\n2. **Dilution** - Reducing Na+ ion concentration per volume\n3. **Acid-base balance** - Acids (lemon, vinegar) can mask saltiness by activating different taste receptors\n4. **Sugar** - Can interfere with salt receptor binding\n\nWhat type of dish? I can calculate the optimal dilution ratio! 🔬';
      }
      if (msg.includes('beginner') || msg.includes('easy')) {
        return 'Great starting point! Let\'s understand the fundamentals: 🔬\n\n**Beginner recipes that teach core principles:**\n\n1. **Pasta** - Demonstrates starch gelatinization and salt diffusion\n2. **Roasting** - Maillard reactions and caramelization\n3. **Sautéing** - Heat transfer and moisture control\n4. **Boiling** - Phase changes and temperature control\n\nEach technique teaches fundamental cooking science. Which principle would you like to explore? 🔬';
      }
      if (msg.includes('convert') || msg.includes('metric')) {
        return 'Precise conversions based on standard measurements: 🔬\n\n**Volume (based on water density at 4°C):**\n• 1 cup = 236.588 ml (exact)\n• 1 tbsp = 14.7868 ml\n• 1 tsp = 4.92892 ml\n\n**Mass:**\n• 1 oz = 28.3495 g\n• 1 lb = 453.592 g\n\n**Temperature (linear conversion):**\n• °C = (°F - 32) × 5/9\n• 350°F = 176.67°C\n\nShare your recipe for precise conversion! 🔬';
      }
      if (msg.includes('vegetarian') || msg.includes('vegan')) {
        return 'Fascinating! Plant-based substitutions involve understanding protein structure and flavor compounds: 🔬\n\n**Scientific substitutions:**\n• **Meat proteins** → Plant proteins (tofu, tempeh) - Different amino acid profiles, similar texture through denaturation\n• **Umami** → Mushrooms contain glutamate (MSG naturally)\n• **Binding** → Flax eggs work through mucilage (soluble fiber) creating gel-like structure\n• **Maillard reaction** → Works with plant proteins too, but at different temperatures\n\nWhat recipe? I\'ll explain the molecular changes! 🔬';
      }
      return 'Excellent question! 🔬\n\nI can explain:\n• The chemistry behind cooking techniques\n• Physics of heat transfer\n• Molecular gastronomy principles\n• Why recipes work (or don\'t)\n• Food science fundamentals\n\nWhat would you like to understand on a scientific level? 🔬';
    },
    
    grandma: (msg, history) => {
      if (msg.includes('chicken') && msg.includes('rice')) {
        return 'Oh, chicken and rice! That\'s one of my favorites, dear! ❤️\n\nHere\'s how I\'ve always made it:\n\n**My Chicken and Rice Casserole:**\n1. Season your chicken with love (and a bit of salt, pepper, and paprika)\n2. Brown it in a pan - don\'t rush this part, let it get nice and golden\n3. Mix your rice with some chicken broth - use the good stuff, not that boxed nonsense\n4. Layer it all in a casserole dish, cover with foil\n5. Bake at 375°F for about 45 minutes\n6. Let it rest a bit before serving - patience is key!\n\nIt\'s simple, but it\'s always been a hit with the family. Would you like my secret seasoning blend? ❤️';
      }
      if (msg.includes('oversalt') || msg.includes('too salty')) {
        return 'Oh dear, we\'ve all been there! Don\'t you worry, sweetheart. ❤️\n\nHere\'s what my mother taught me:\n1. **Add a raw potato** - Cut it in half, drop it in, let it cook for 10-15 minutes, then take it out. It\'ll soak up that extra salt like a sponge!\n2. **A bit of sugar** - Just a tiny pinch, it helps balance things out\n3. **More liquid** - Add some unsalted broth or water, let it simmer a bit\n\nAnd remember, next time season a little at a time and taste as you go. That\'s the secret - patience and tasting! ❤️';
      }
      if (msg.includes('beginner') || msg.includes('easy')) {
        return 'Oh, I\'m so proud you\'re learning to cook! ❤️\n\nHere are some recipes I\'ve taught all my grandchildren:\n\n1. **Simple Pasta** - Start with spaghetti and a good jarred sauce, then we\'ll work up to making your own\n2. **Roasted Chicken** - Nothing fancy, just salt, pepper, and a hot oven. Simple but delicious!\n3. **Soup** - Start with a good broth, add vegetables, let it simmer. Soup is forgiving, perfect for learning\n4. **Scrambled Eggs** - Low heat, stir gently, add a bit of cream. Master this, and you\'re on your way!\n\nStart simple, dear. Good cooking comes from the heart, not from complicated recipes. Which one would you like to try first? ❤️';
      }
      if (msg.includes('convert') || msg.includes('metric')) {
        return 'Oh, those metric measurements! Let me help you, dear. ❤️\n\nHere\'s what I remember:\n• 1 cup = about 240 ml (I always say "a bit less than 250")\n• 1 tablespoon = 15 ml\n• 1 teaspoon = 5 ml\n• 1 ounce = about 28 grams\n• For temperature, 350°F is about 175°C\n\nBut you know what? The best recipes don\'t need to be exact. A pinch here, a dash there - that\'s how real cooking works! What recipe are you trying to convert, sweetheart? ❤️';
      }
      if (msg.includes('vegetarian') || msg.includes('vegan')) {
        return 'Oh, that\'s wonderful, dear! My granddaughter is vegetarian too. ❤️\n\nHere\'s what I\'ve learned:\n• Instead of meat, try **mushrooms** - they have such a nice, meaty texture when cooked right\n• **Beans and lentils** - I\'ve always loved them, so filling and good for you\n• **Vegetable broth** instead of chicken - make your own if you can, it\'s so much better\n• For eggs, you can use **flaxseed** mixed with water - my granddaughter showed me that one!\n\nWhat recipe are you trying to make? I\'ll help you adapt it with love! ❤️';
      }
      return 'Oh, I\'m so glad you asked, dear! ❤️\n\nI\'ve been cooking for over 60 years, and I\'d love to share what I\'ve learned:\n• Family recipes passed down through generations\n• Traditional techniques that never fail\n• Tips and tricks from years of experience\n• How to cook with love and patience\n\nWhat would you like to learn, sweetheart? I\'m here to help! ❤️';
    },
  };
  
  return responses[personality](lowerMessage, conversationHistory);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function exportChatAsRecipe(messages: Message[]): string {
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const userMessages = messages.filter(m => m.role === 'user');
  
  let recipe = '# Recipe from Chat\n\n';
  recipe += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  
  if (userMessages.length > 0) {
    recipe += '## Request\n';
    recipe += userMessages.map(m => m.content).join('\n') + '\n\n';
  }
  
  recipe += '## Instructions\n';
  assistantMessages.forEach((msg, idx) => {
    recipe += `\n### Step ${idx + 1}\n`;
    recipe += msg.content + '\n';
  });
  
  return recipe;
}

export default function ChatPage() {
  const [personality, setPersonality] = useState<Personality>('friendly');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: personalities.friendly.greeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Update greeting when personality changes
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: personalities[personality].greeting,
        timestamp: new Date(),
      }]);
    }
  }, [personality]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time (varies by personality)
    const thinkingTime = personality === 'ramsay' ? 800 : personality === 'science' ? 1500 : 1000;
    
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getResponse(currentInput, personality, messages),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, thinkingTime);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: personalities[personality].greeting,
        timestamp: new Date(),
      }]);
    }
  };

  const handleExportRecipe = () => {
    const recipe = exportChatAsRecipe(messages);
    const blob = new Blob([recipe], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipe-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const currentPersonality = personalities[personality];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                AI Cooking Assistant {currentPersonality.emoji}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {currentPersonality.name} - {currentPersonality.description}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearChat}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleExportRecipe}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                title="Export as recipe"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Personality Selector */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(personalities) as Personality[]).map((p) => {
              const config = personalities[p];
              return (
                <button
                  key={p}
                  onClick={() => setPersonality(p)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    personality === p
                      ? 'bg-green-500 text-white shadow-md scale-105'
                      : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  <span>{config.emoji}</span>
                  <span className="hidden sm:inline">{config.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick starters:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-zinc-700 hover:border-green-300 dark:hover:border-green-700 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Container - WhatsApp Style */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-280px)] md:h-[calc(100vh-240px)]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-800">
            <AnimatePresence initial={false}>
              {messages.map((message, idx) => {
                const isUser = message.role === 'user';
                const showAvatar = idx === 0 || messages[idx - 1].role !== message.role;
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    className={`flex gap-2 items-end ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                  {!isUser && (
                    <div className={`flex-shrink-0 ${showAvatar ? 'w-8 h-8' : 'w-8'} flex items-center justify-center`}>
                      {showAvatar ? (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold">
                          {currentPersonality.emoji}
                        </div>
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}
                  
                  <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-sm ${
                        isUser
                          ? 'bg-green-500 text-white rounded-br-sm'
                          : 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-zinc-600'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  {isUser && (
                    <div className={`flex-shrink-0 ${showAvatar ? 'w-8 h-8' : 'w-8'} flex items-center justify-center`}>
                      {showAvatar ? (
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}
                </motion.div>
                );
              })}
            
            {isTyping && (
              <div className="flex gap-2 items-end justify-start animate-in fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                  {currentPersonality.emoji}
                </div>
                <div className="bg-white dark:bg-zinc-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-zinc-600">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>

          {/* Input Area - WhatsApp Style */}
          <div className="border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2.5 rounded-full border border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] shadow-md hover:shadow-lg disabled:shadow-none"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
