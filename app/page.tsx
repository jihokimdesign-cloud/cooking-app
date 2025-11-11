import Link from 'next/link';
import { ChefHat, MessageCircle, Ruler, BookOpen, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="text-6xl md:text-8xl mb-6">👨‍🍳</div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Your Cooking Assistant
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8">
            Your friendly kitchen helper for beginners! 🍳✨
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-500 mb-12">
            Discover recipes, get cooking tips, convert measurements, and save your favorites
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/recipes"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Explore Recipes
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-full font-semibold text-lg transition-colors border-2 border-gray-200 dark:border-zinc-700"
            >
              Ask the AI Chef
              <MessageCircle className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Everything You Need to Cook 🎯
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Recipe Finder */}
          <Link
            href="/recipes"
            className="group bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">🔍</div>
            <ChefHat className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Recipe Finder
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Search recipes by ingredients and cooking time. Find the perfect dish for any occasion!
            </p>
          </Link>

          {/* AI Chat */}
          <Link
            href="/chat"
            className="group bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">💬</div>
            <MessageCircle className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              AI Cooking Assistant
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get instant answers to cooking questions, recipe suggestions, and helpful tips!
            </p>
          </Link>

          {/* Measurement Converter */}
          <Link
            href="/measure"
            className="group bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">📏</div>
            <Ruler className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Measurement Converter
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Convert between cups, grams, ounces, and more. Never guess measurements again!
            </p>
          </Link>

          {/* Cookbook */}
          <Link
            href="/cookbook"
            className="group bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">📚</div>
            <BookOpen className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              My Cookbook
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Save your favorite recipes and build your personal collection!
            </p>
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Start Your Cooking Journey 🚀
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">10+</div>
              <div className="text-gray-600 dark:text-gray-400">International Recipes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">AI Assistant Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-400">Beginner Friendly</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
