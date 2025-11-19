'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, Heart, MessageCircle, Share2, TrendingUp,
  Award, Calendar, Search, Filter, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Post {
  id: number;
  title: string;
  author: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  date: string;
  category: string;
}

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', label: '전체', emoji: '📋' },
    { id: 'recipe', label: '레시피 공유', emoji: '🍳' },
    { id: 'challenge', label: '요리 챌린지', emoji: '🏆' },
    { id: 'qna', label: 'Q&A', emoji: '❓' },
    { id: 'tip', label: '요리 팁', emoji: '💡' },
  ];

  const posts: Post[] = [
    {
      id: 1,
      title: '초보자를 위한 파스타 레시피',
      author: '김요리',
      content: '처음 요리하는 분들도 쉽게 따라할 수 있는 간단한 파스타 레시피를 공유합니다!',
      likes: 42,
      comments: 8,
      date: '2시간 전',
      category: 'recipe',
    },
    {
      id: 2,
      title: '5분만에 만드는 간단한 볶음밥',
      author: '이셰프',
      content: '바쁜 아침에 빠르게 만들 수 있는 볶음밥 레시피입니다.',
      likes: 38,
      comments: 5,
      date: '5시간 전',
      category: 'recipe',
    },
    {
      id: 3,
      title: '이번 주 챌린지: 김치찌개 만들기',
      author: 'Cheffy',
      content: '이번 주 주제는 김치찌개입니다! 여러분의 작품을 공유해주세요.',
      likes: 56,
      comments: 12,
      date: '1일 전',
      category: 'challenge',
    },
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">커뮤니티</h1>
              <p className="text-gray-600 dark:text-gray-400">요리 팁과 레시피를 공유하고 함께 성장해요</p>
            </div>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">글쓰기</span>
            </button>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}
            >
              <span className="mr-2">{category.emoji}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* 인기 챌린지 */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-6 h-6" />
            <h2 className="text-2xl font-bold">이번 주 챌린지</h2>
          </div>
          <h3 className="text-xl font-semibold mb-2">김치찌개 만들기</h3>
          <p className="text-orange-50 mb-4">
            여러분의 김치찌개 작품을 공유하고 서로 격려해요!
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              마감: 3일 후
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              참여자: 24명
            </span>
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {post.author[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                      {categories.find(c => c.id === post.category)?.emoji} {categories.find(c => c.id === post.category)?.label}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span>공유</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

