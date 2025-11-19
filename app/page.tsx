'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Refrigerator, CheckCircle2, Award, Sparkles, Users, TrendingUp, Camera, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { RecipeCard } from '@/components/recipe-card';
import { CheffyCharacter } from '@/components/cheffy-character';

// Dummy recipe data
const dummyRecipes = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
    title: 'Tomato Pasta',
    cookTime: '30 min',
    category: 'Italian',
    href: '/recipes/1',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
    title: 'Kimchi Fried Rice',
    cookTime: '15 min',
    category: 'Korean',
    href: '/recipes/2',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    title: 'Green Salad',
    cookTime: '10 min',
    category: 'Salad',
    href: '/recipes/3',
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop',
    title: 'Chicken Steak',
    cookTime: '45 min',
    category: 'Western',
    href: '/recipes/4',
  },
];

// Recipes that can be made with fridge ingredients (dummy)
const fridgeRecipes = [
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1556910103-2c027eb9f8e8?w=800&h=600&fit=crop',
    title: 'Egg Fried Rice',
    cookTime: '10 min',
    category: 'Korean',
    href: '/recipes/5',
  },
  {
    id: 6,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop',
    title: 'Onion Steak',
    cookTime: '20 min',
    category: 'Western',
    href: '/recipes/6',
  },
];

// Popular community posts (dummy)
const communityPosts = [
  {
    id: 1,
    title: 'Pasta Recipe for Beginners',
    author: 'Chef Kim',
    likes: 42,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'Simple Fried Rice in 5 Minutes',
    author: 'Chef Lee',
    likes: 38,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  },
];

// Cheffy tips by AI mode
const cheffyTips = {
  'Friendly Chef': {
    text: 'Tears while cutting onions? Put them in the freezer for a bit and you\'ll be fine! 😊',
    emoji: '👨‍🍳',
  },
  'Gordon Ramsay Mode': {
    text: 'When grilling meat, flip it only once! Keep flipping and you\'ll lose all the moisture - be careful!',
    emoji: '🔥',
  },
  'Science Cook': {
    text: 'To achieve the Maillard reaction, you need to cook at high temperature quickly. Proteins and sugars react to create browning and flavor.',
    emoji: '🔬',
  },
  'Grandma Style': {
    text: 'Love is the best ingredient. You can measure roughly, but you must add lots of love to make it delicious~',
    emoji: '👵',
  },
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [fridgeIngredients, setFridgeIngredients] = useState<any[]>([]);
  const [userName, setUserName] = useState('User');
  const [userLevel, setUserLevel] = useState(5);
  const [userXP, setUserXP] = useState(60);
  const [nextBadge, setNextBadge] = useState('Make Your First Pasta');
  const [aiPersona, setAiPersona] = useState('Friendly Chef');
  const [weeklyChallenge, setWeeklyChallenge] = useState('Make 3 Dishes with Eggs');

  useEffect(() => {
    // Load fridge ingredients from localStorage
    if (typeof window !== 'undefined') {
      const storedFridge = localStorage.getItem('fridgeIngredients');
      if (storedFridge) {
        try {
          const parsed = JSON.parse(storedFridge);
          setFridgeIngredients(parsed);
        } catch (e) {
          console.error('Failed to parse fridgeIngredients', e);
        }
      }

      // Load user information
      const storedUser = localStorage.getItem('userName');
      if (storedUser) {
        setUserName(storedUser);
      }

      // Load growth information (temporarily from localStorage)
      const storedLevel = localStorage.getItem('userLevel');
      if (storedLevel) {
        setUserLevel(parseInt(storedLevel));
      }
      const storedXP = localStorage.getItem('userXP');
      if (storedXP) {
        setUserXP(parseInt(storedXP));
      }

      // Load AI settings
      const storedAISettings = localStorage.getItem('aiSettings');
      if (storedAISettings) {
        try {
          const settings = JSON.parse(storedAISettings);
          setAiPersona(settings.persona || 'Friendly Chef');
        } catch (e) {
          // Ignore
        }
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search logic
      console.log('Searching for:', searchQuery);
    }
  };

  const hasFridgeIngredients = fridgeIngredients.length > 0;
  const currentTip = cheffyTips[aiPersona as keyof typeof cheffyTips] || cheffyTips['Friendly Chef'];

  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-6 mb-8">
          {/* Cheffy 캐릭터 */}
          <CheffyCharacter size="lg" animated={true} />
          
          {/* 제목 */}
          <div className="flex-1">
            <h1
              className="text-4xl md:text-5xl font-bold text-[#4A4A4A] mb-2"
              style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
            >
              Discover Your Inner Chef
            </h1>
            <p className="text-lg text-[#888888]">
              Discover and create new dishes with Cheffy
            </p>
          </div>
        </div>

        {/* 통합 검색창 */}
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#888888]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for recipes, ingredients, cooking methods..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#E5E5E5] bg-white text-[#4A4A4A] placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#7C9D86] focus:border-transparent shadow-md"
            />
          </div>
          
          {/* 냉장고 아이콘 버튼 */}
          <Link
            href="/fridge"
            className="flex items-center justify-center w-14 h-14 bg-[#7C9D86] hover:bg-[#6B8E7A] text-white rounded-xl shadow-md hover:shadow-lg transition-all"
            title="Search by ingredients"
          >
            <Refrigerator className="w-6 h-6" />
          </Link>
        </form>
      </motion.section>

      {/* 1. 내 냉장고로 바로 만드는 요리 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl md:text-3xl font-bold text-[#4A4A4A] flex items-center gap-3"
            style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
          >
            <Refrigerator className="w-8 h-8 text-[#7C9D86]" />
            Recipes from My Fridge
          </h2>
        </div>

        {hasFridgeIngredients ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fridgeRecipes.map((recipe) => (
              <div key={recipe.id} className="relative">
                <RecipeCard
                  imageUrl={recipe.imageUrl}
                  title={recipe.title}
                  cookTime={recipe.cookTime}
                  category={recipe.category}
                  href={recipe.href}
                />
                {/* 바로 요리 가능 태그 */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready to Cook!
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Link
            href="/scan"
            className="block bg-gradient-to-r from-[#7C9D86]/10 to-[#6B8E7A]/10 rounded-xl p-12 text-center border-2 border-dashed border-[#7C9D86]/30 hover:border-[#7C9D86] transition-all"
          >
            <CheffyCharacter size="md" animated={true} className="mx-auto mb-4" />
            <h3
              className="text-xl font-bold text-[#4A4A4A] mb-2"
              style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
            >
              Scan your fridge and get personalized recipe recommendations!
            </h3>
            <p className="text-[#888888] mb-4">
              Register your ingredients and we'll recommend recipes you can make right away
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C9D86] hover:bg-[#6B8E7A] text-white rounded-xl font-semibold transition-colors shadow-md">
              <Camera className="w-5 h-5" />
              Scan Ingredients
            </div>
          </Link>
        )}
      </motion.section>

      {/* 2. Daily Best Recipes for You */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-12"
      >
        <h2
          className="text-2xl md:text-3xl font-bold text-[#4A4A4A] mb-6"
          style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
        >
          Daily Best Recipes for You
        </h2>
        
        {/* RecipeCard 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dummyRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              imageUrl={recipe.imageUrl}
              title={recipe.title}
              cookTime={recipe.cookTime}
              category={recipe.category}
              href={recipe.href}
              onBookmark={(isBookmarked) => {
                console.log(`Recipe ${recipe.id} bookmarked:`, isBookmarked);
              }}
            />
          ))}
        </div>
      </motion.section>

      {/* 3. 성장 일지 & 4. 오늘의 셰피's Tip (가로 배치) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* 성장 일지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="lg:col-span-2"
        >
          <Link
            href="/mypage"
            className="block bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border border-[#E5E5E5]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7C9D86] to-[#6B8E7A] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {userName.charAt(0)}
                </div>
                <div>
                  <h3
                    className="text-xl font-bold text-[#4A4A4A]"
                    style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                  >
                    {userName}, you're currently a Level {userLevel} Chef!
                  </h3>
                  <p className="text-sm text-[#888888]">{100 - userXP}% left until next level</p>
                </div>
              </div>
              <Award className="w-8 h-8 text-[#7C9D86]" />
            </div>

            {/* 경험치 바 */}
            <div className="w-full bg-[#E5E5E5] rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-[#7C9D86] to-[#6B8E7A] h-3 rounded-full transition-all duration-500"
                style={{ width: `${userXP}%` }}
              />
            </div>

            {/* 다음 목표 */}
            <div className="flex items-center gap-2 text-sm text-[#888888]">
              <Sparkles className="w-4 h-4 text-[#FFB3A1]" />
              <span>Next Badge: <span className="font-semibold text-[#7C9D86]">{nextBadge}</span></span>
            </div>
          </Link>
        </motion.div>

        {/* 오늘의 셰피's Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="bg-gradient-to-br from-[#FFB3A1]/10 to-[#FF9B85]/10 rounded-xl p-6 shadow-md border border-[#FFB3A1]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{currentTip.emoji}</div>
              <div>
                <h3
                  className="font-bold text-[#4A4A4A] text-sm"
                  style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                >
                  Today's Cheffy's Tip
                </h3>
                <p className="text-xs text-[#888888]">{aiPersona}</p>
              </div>
            </div>
            <p className="text-sm text-[#4A4A4A] mb-4 leading-relaxed">
              "{currentTip.text}"
            </p>
            <Link
              href="/chat"
              className="text-xs text-[#7C9D86] hover:text-[#6B8E7A] font-medium flex items-center gap-1"
            >
              Change Cheffy Mode <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 5. 지금 커뮤니티에서는? */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl md:text-3xl font-bold text-[#4A4A4A] flex items-center gap-3"
            style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
          >
            <Users className="w-8 h-8 text-[#7C9D86]" />
            What's Hot in Community?
          </h2>
          <Link
            href="/community"
            className="text-sm text-[#7C9D86] hover:text-[#6B8E7A] font-medium flex items-center gap-1"
          >
            See More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 주간 챌린지 배너 */}
        <div className="bg-gradient-to-r from-[#7C9D86] to-[#6B8E7A] rounded-xl p-6 mb-6 text-white shadow-md">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <p className="text-sm font-medium opacity-90">This Week's Challenge</p>
              <p className="text-lg font-bold">{weeklyChallenge}</p>
            </div>
          </div>
        </div>

        {/* 인기 레시피/게시글 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityPosts.map((post) => (
            <Link
              key={post.id}
              href="/community"
              className="block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-[#E5E5E5]"
            >
              <div className="relative h-40">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3
                  className="font-bold text-[#4A4A4A] mb-2 line-clamp-2"
                  style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
                >
                  {post.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-[#888888]">
                  <span>by {post.author}</span>
                  <span className="flex items-center gap-1 text-[#FFB3A1]">
                    <Sparkles className="w-4 h-4 fill-current" />
                    {post.likes}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
