'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Award, BookOpen, Settings, Sparkles,
  TrendingUp, Calendar, Star, Target, Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';

interface JournalEntry {
  id: number;
  date: string;
  recipe: string;
  image?: string;
  rating: number;
  note: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  earnedDate?: string;
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<'journal' | 'growth' | 'settings'>('journal');
  const [level, setLevel] = useState(5);
  const [xp, setXp] = useState(120);
  const [nextLevelXp] = useState(200);

  const journalEntries: JournalEntry[] = [
    {
      id: 1,
      date: '2024-01-15',
      recipe: '파스타',
      rating: 5,
      note: '처음으로 완벽하게 만들었어요!',
    },
    {
      id: 2,
      date: '2024-01-14',
      recipe: '김치볶음밥',
      rating: 4,
      note: '좀 더 간을 조절하면 좋을 것 같아요',
    },
  ];

  const badges: Badge[] = [
    { id: 'first', name: '첫 요리', description: '첫 요리를 완성했어요', emoji: '🎉', earned: true, earnedDate: '2024-01-10' },
    { id: 'week', name: '일주일 챌린지', description: '일주일 연속 요리', emoji: '🔥', earned: true, earnedDate: '2024-01-15' },
    { id: 'master', name: '마스터 셰프', description: '레벨 10 달성', emoji: '👑', earned: false },
    { id: 'community', name: '커뮤니티 스타', description: '게시글 10개 작성', emoji: '⭐', earned: false },
  ];

  const earnedBadges = badges.filter(b => b.earned);
  const progress = (xp / nextLevelXp) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {/* 프로필 헤더 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              U
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                사용자님
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                레벨 {level} 셰프
              </p>
              <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                다음 레벨까지 {nextLevelXp - xp} XP
              </p>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'journal', label: '요리 일지', icon: BookOpen },
            { id: 'growth', label: '성장', icon: TrendingUp },
            { id: 'settings', label: '설정', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 요리 일지 탭 */}
        {activeTab === 'journal' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">요리 일지</h2>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors">
                + 새 기록
              </button>
            </div>
            
            {journalEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-zinc-700 rounded-xl flex items-center justify-center text-4xl">
                    🍳
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {entry.recipe}
                      </h3>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < entry.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {new Date(entry.date).toLocaleDateString('ko-KR')}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{entry.note}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 성장 탭 */}
        {activeTab === 'growth' && (
          <div className="space-y-6">
            {/* 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {journalEntries.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">총 요리 횟수</div>
              </div>
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {earnedBadges.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">획득한 뱃지</div>
              </div>
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {Math.round(journalEntries.reduce((sum, e) => sum + e.rating, 0) / journalEntries.length * 10) / 10}
                </div>
                <div className="text-gray-600 dark:text-gray-400">평균 평점</div>
              </div>
            </div>

            {/* 뱃지 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                뱃지
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-md ${
                      badge.earned ? '' : 'opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{badge.emoji}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {badge.description}
                    </p>
                    {badge.earned && badge.earnedDate && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">
                        획득: {new Date(badge.earnedDate).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                    {!badge.earned && (
                      <div className="text-xs text-gray-500">🔒 잠금</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI 에이전트 설정 */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI 셰피 모드</h2>
              </div>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
              >
                설정하기
                <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* 설정 탭 */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">설정</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-zinc-700">
                <span className="text-gray-900 dark:text-white">알림 설정</span>
                <button className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 rounded-lg">설정</button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-zinc-700">
                <span className="text-gray-900 dark:text-white">계정 관리</span>
                <button className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 rounded-lg">설정</button>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-900 dark:text-white">도움말</span>
                <button className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 rounded-lg">보기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

