import { NextRequest, NextResponse } from 'next/server';

type Personality = 'friendly' | 'ramsay' | 'science' | 'grandma';

interface ChatRequest {
  message: string;
  personality: Personality;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

function getRamsayResponse(message: string, history: Array<{ role: string; content: string }> = []): string {
  const lowerMessage = message.toLowerCase().trim();
  
  if (lowerMessage.includes('chicken') && lowerMessage.includes('rice')) {
    return 'Right, chicken and rice - classic combo! 🔥\n\n**Chicken Fried Rice** - Do it properly:\n1. Cook your rice the day before or use day-old rice - fresh rice is too sticky!\n2. Get your wok SCREAMING hot\n3. Cook chicken first, set aside\n4. Scramble eggs, push aside\n5. Add rice, break it up properly\n6. Add chicken back, season with soy sauce\n7. Finish with green onions\n\nDon\'t overcrowd the pan! Cook in batches if needed. Now go make it! 🔥';
  }
  
  if (lowerMessage.includes('oversalt') || lowerMessage.includes('too salty')) {
    return 'You\'ve over-salted it, haven\'t you? Right, let\'s fix this properly:\n\n1. **Add potatoes** - They\'ll soak up the salt. Dice them, add to the dish, cook 10 minutes, then fish them out\n2. **Dilute it** - Add more unsalted liquid (water, stock, whatever fits)\n3. **Add acid** - Lemon juice or vinegar cuts through salt\n4. **Add sugar** - Tiny bit, balances it out\n\nNext time, taste as you go! Season gradually, not all at once. Got it? 🔥';
  }
  
  if (lowerMessage.includes('beginner') || lowerMessage.includes('easy')) {
    return 'Right, let\'s start you off properly! 🔥\n\n**Beginner-friendly dinners that actually taste good:**\n1. **Pasta Aglio e Olio** - Garlic, oil, pasta. Simple, delicious\n2. **Pan-seared chicken** - Season it, hot pan, 6-7 minutes each side\n3. **Roasted vegetables** - Toss in oil, salt, pepper, 425°F until golden\n4. **Stir fry** - High heat, don\'t overcook the veg\n\nStart simple, master the basics, then build from there. No shortcuts! 🔥';
  }
  
  if (lowerMessage.includes('recipe') || lowerMessage.includes('cook')) {
    return 'Right, what do you need? 🔥\n\nI can help with:\n• Recipes done properly\n• Techniques that actually work\n• Fixing your mistakes\n• Making food that tastes good\n\nWhat\'s the problem? Let\'s sort it! 🔥';
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Right, let\'s get this sorted! 🔥 I\'m here to help you cook properly. No nonsense, just great food. What are we making?';
  }
  
  return 'Right, what do you need? 🔥\n\nI can help with:\n• Recipes done properly\n• Techniques that actually work\n• Fixing your mistakes\n• Making food that tastes good\n\nWhat\'s the problem? Let\'s sort it! 🔥';
}

function getGrandmaResponse(message: string, history: Array<{ role: string; content: string }> = []): string {
  const lowerMessage = message.toLowerCase().trim();
  
  if (lowerMessage.includes('chicken') && lowerMessage.includes('rice')) {
    return 'Oh, chicken and rice! That\'s one of my favorites, dear! ❤️\n\nHere\'s how I\'ve always made it:\n\n**My Chicken and Rice Casserole:**\n1. Season your chicken with love (and a bit of salt, pepper, and paprika)\n2. Brown it in a pan - don\'t rush this part, let it get nice and golden\n3. Mix your rice with some chicken broth - use the good stuff, not that boxed nonsense\n4. Layer it all in a casserole dish, cover with foil\n5. Bake at 375°F for about 45 minutes\n6. Let it rest a bit before serving - patience is key!\n\nIt\'s simple, but it\'s always been a hit with the family. Would you like my secret seasoning blend? ❤️';
  }
  
  if (lowerMessage.includes('oversalt') || lowerMessage.includes('too salty')) {
    return 'Oh dear, we\'ve all been there! Don\'t you worry, sweetheart. ❤️\n\nHere\'s what my mother taught me:\n1. **Add a raw potato** - Cut it in half, drop it in, let it cook for 10-15 minutes, then take it out. It\'ll soak up that extra salt like a sponge!\n2. **A bit of sugar** - Just a tiny pinch, it helps balance things out\n3. **More liquid** - Add some unsalted broth or water, let it simmer a bit\n\nAnd remember, next time season a little at a time and taste as you go. That\'s the secret - patience and tasting! ❤️';
  }
  
  if (lowerMessage.includes('beginner') || lowerMessage.includes('easy')) {
    return 'Oh, I\'m so proud you\'re learning to cook! ❤️\n\nHere are some recipes I\'ve taught all my grandchildren:\n\n1. **Simple Pasta** - Start with spaghetti and a good jarred sauce, then we\'ll work up to making your own\n2. **Roasted Chicken** - Nothing fancy, just salt, pepper, and a hot oven. Simple but delicious!\n3. **Soup** - Start with a good broth, add vegetables, let it simmer. Soup is forgiving, perfect for learning\n4. **Scrambled Eggs** - Low heat, stir gently, add a bit of cream. Master this, and you\'re on your way!\n\nStart simple, dear. Good cooking comes from the heart, not from complicated recipes. Which one would you like to try first? ❤️';
  }
  
  if (lowerMessage.includes('recipe') || lowerMessage.includes('cook')) {
    return 'Oh, I\'m so glad you asked, dear! ❤️\n\nI\'ve been cooking for over 60 years, and I\'d love to share what I\'ve learned:\n• Family recipes passed down through generations\n• Traditional techniques that never fail\n• Tips and tricks from years of experience\n• How to cook with love and patience\n\nWhat would you like to learn, sweetheart? I\'m here to help! ❤️';
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello, dear! ❤️ I\'m here to share my favorite recipes and cooking secrets passed down through generations. What would you like to learn?';
  }
  
  return 'Oh, I\'m so glad you asked, dear! ❤️\n\nI\'ve been cooking for over 60 years, and I\'d love to share what I\'ve learned:\n• Family recipes passed down through generations\n• Traditional techniques that never fail\n• Tips and tricks from years of experience\n• How to cook with love and patience\n\nWhat would you like to learn, sweetheart? I\'m here to help! ❤️';
}

function getScienceResponse(message: string, history: Array<{ role: string; content: string }> = []): string {
  const lowerMessage = message.toLowerCase().trim();
  
  if (lowerMessage.includes('chicken') && lowerMessage.includes('rice')) {
    return 'Excellent question! Let\'s explore the chemistry and techniques: 🔬\n\n**Chicken and Rice - The Science:**\n\n1. **Chicken Fried Rice** - The key is using day-old rice. Fresh rice has excess moisture (starch retrogradation hasn\'t occurred), making it sticky. Older rice has crystallized starch, allowing individual grains to separate.\n\n2. **Maillard Reaction** - When searing chicken, you\'re creating complex flavor compounds through the Maillard reaction (amino acids + reducing sugars at 140-165°C).\n\n3. **Gelatinization** - Rice cooking involves starch gelatinization at 60-80°C, where starch granules absorb water and swell.\n\nWould you like detailed scientific explanations for any technique? 🔬';
  }
  
  if (lowerMessage.includes('oversalt') || lowerMessage.includes('too salty')) {
    return 'Interesting problem! Let\'s understand the chemistry: 🔬\n\n**Why it tastes too salty:**\nSodium ions (Na+) bind to taste receptors, creating the salty sensation. Too many ions = overwhelming signal.\n\n**Solutions based on chemistry:**\n1. **Osmosis** - Potatoes absorb salt through osmotic pressure (water moves from low to high salt concentration)\n2. **Dilution** - Reducing Na+ ion concentration per volume\n3. **Acid-base balance** - Acids (lemon, vinegar) can mask saltiness by activating different taste receptors\n4. **Sugar** - Can interfere with salt receptor binding\n\nWhat type of dish? I can calculate the optimal dilution ratio! 🔬';
  }
  
  if (lowerMessage.includes('beginner') || lowerMessage.includes('easy')) {
    return 'Great starting point! Let\'s understand the fundamentals: 🔬\n\n**Beginner recipes that teach core principles:**\n\n1. **Pasta** - Demonstrates starch gelatinization and salt diffusion\n2. **Roasting** - Maillard reactions and caramelization\n3. **Sautéing** - Heat transfer and moisture control\n4. **Boiling** - Phase changes and temperature control\n\nEach technique teaches fundamental cooking science. Which principle would you like to explore? 🔬';
  }
  
  if (lowerMessage.includes('recipe') || lowerMessage.includes('cook')) {
    return 'Excellent question! 🔬\n\nI can explain:\n• The chemistry behind cooking techniques\n• Physics of heat transfer\n• Molecular gastronomy principles\n• Why recipes work (or don\'t)\n• Food science fundamentals\n\nWhat would you like to understand on a scientific level? 🔬';
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello! 🔬 I\'m your science-based cooking assistant. I\'ll explain the chemistry and physics behind cooking techniques. What would you like to understand?';
  }
  
  return 'Excellent question! 🔬\n\nI can explain:\n• The chemistry behind cooking techniques\n• Physics of heat transfer\n• Molecular gastronomy principles\n• Why recipes work (or don\'t)\n• Food science fundamentals\n\nWhat would you like to understand on a scientific level? 🔬';
}

function getFriendlyResponse(message: string, history: Array<{ role: string; content: string }> = []): string {
  const lowerMessage = message.toLowerCase().trim();
  
  if (lowerMessage.includes('chicken') && lowerMessage.includes('rice')) {
    return 'Great choice! 🍗 Here are some delicious options:\n\n1. **Chicken Fried Rice** - Quick and easy!\n   • Cook rice, let it cool\n   • Stir-fry diced chicken\n   • Add vegetables and rice\n   • Season with soy sauce\n\n2. **Chicken and Rice Casserole** - Comfort food!\n   • Layer chicken, rice, and broth\n   • Bake at 375°F for 45 minutes\n   • Top with cheese if desired\n\n3. **Chicken Teriyaki Bowl** - Flavorful!\n   • Marinate chicken in teriyaki sauce\n   • Grill or pan-sear\n   • Serve over steamed rice\n\nWhich one sounds good? I can give you detailed steps! 😊';
  }
  
  if (lowerMessage.includes('oversalt') || lowerMessage.includes('too salty')) {
    return 'Don\'t worry, we can fix that! 💪 Here are some solutions:\n\n1. **Add more liquid** - Dilute with water, broth, or unsalted stock\n2. **Add potatoes** - They absorb salt! Add diced potatoes and cook for 10-15 minutes, then remove\n3. **Add acid** - A splash of lemon juice or vinegar can balance saltiness\n4. **Add sugar** - A tiny pinch can help counteract salt\n5. **Add dairy** - Cream or milk can mellow out saltiness\n\nWhat type of dish is it? I can give more specific advice! 😊';
  }
  
  if (lowerMessage.includes('beginner') || lowerMessage.includes('easy')) {
    return 'Perfect for starting out! 🌟 Here are some beginner-friendly dinner ideas:\n\n1. **Pasta with Marinara** - Simple and delicious\n2. **Sheet Pan Chicken and Vegetables** - One pan, minimal cleanup!\n3. **Tacos** - Fun and customizable\n4. **Stir Fry** - Quick and healthy\n5. **Grilled Cheese and Soup** - Classic comfort food\n\nWould you like detailed instructions for any of these? I\'m here to help! 😊';
  }
  
  if (lowerMessage.includes('convert') || lowerMessage.includes('metric')) {
    return 'I\'d be happy to help convert measurements! 📏\n\nCommon conversions:\n• 1 cup = 240 ml\n• 1 tablespoon = 15 ml\n• 1 teaspoon = 5 ml\n• 1 ounce = 28 grams\n• 350°F = 175°C\n\nShare the recipe you want to convert, and I\'ll help you! 😊';
  }
  
  if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
    return 'Great choice for a plant-based meal! 🌱\n\nCommon substitutions:\n• **Meat** → Tofu, tempeh, beans, or mushrooms\n• **Chicken broth** → Vegetable broth\n• **Butter** → Olive oil or vegan butter\n• **Eggs** → Flax eggs (1 tbsp ground flax + 3 tbsp water)\n• **Cheese** → Nutritional yeast or vegan cheese\n\nWhat recipe would you like to convert? I\'ll guide you through it! 😊';
  }
  
  if (lowerMessage.includes('recipe') || lowerMessage.includes('cook')) {
    return 'I\'d love to help you with a recipe! 🍳\n\nYou can also check out the Recipe Finder page to search by ingredients. Or tell me what you\'re in the mood for, and I\'ll suggest something perfect! 😊';
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello! 👋 So glad you\'re here! I\'m excited to help you cook something amazing. What would you like to make today?';
  }
  
  return 'That\'s a great question! 🤔\n\nI can help you with:\n• Recipe suggestions and modifications\n• Cooking techniques and tips\n• Ingredient substitutions\n• Troubleshooting cooking problems\n• Step-by-step guidance\n\nWhat would you like to know more about? I\'m here to help! 😊';
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, personality, conversationHistory = [] } = body;

    if (!message || !personality) {
      return NextResponse.json(
        { error: 'Message and personality are required' },
        { status: 400 }
      );
    }

    // Validate personality
    const validPersonalities: Personality[] = ['friendly', 'ramsay', 'science', 'grandma'];
    if (!validPersonalities.includes(personality)) {
      return NextResponse.json(
        { error: 'Invalid personality type' },
        { status: 400 }
      );
    }

    // Get response based on personality
    let response: string;
    
    switch (personality) {
      case 'ramsay':
        response = getRamsayResponse(message, conversationHistory);
        break;
      case 'grandma':
        response = getGrandmaResponse(message, conversationHistory);
        break;
      case 'science':
        response = getScienceResponse(message, conversationHistory);
        break;
      case 'friendly':
      default:
        response = getFriendlyResponse(message, conversationHistory);
        break;
    }

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    return NextResponse.json({
      response,
      personality,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

