'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Refrigerator, Plus, Camera, Search, X, 
  Clock, AlertCircle, ChefHat, ShoppingCart,
  ArrowRight, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  expiryDate?: string;
  category: string;
  emoji: string;
}

export default function FridgePage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: '', expiryDate: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // localStorage에서 재료 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('fridgeIngredients');
    if (saved) {
      setIngredients(JSON.parse(saved));
    }
  }, []);

  // 재료 저장
  const saveIngredients = (newIngredients: Ingredient[]) => {
    setIngredients(newIngredients);
    localStorage.setItem('fridgeIngredients', JSON.stringify(newIngredients));
  };

  // 재료 추가
  const handleAddIngredient = () => {
    if (!newIngredient.name.trim()) return;

    const ingredient: Ingredient = {
      id: Date.now().toString(),
      name: newIngredient.name,
      quantity: newIngredient.quantity || undefined,
      expiryDate: newIngredient.expiryDate || undefined,
      category: '기타',
      emoji: '🥬',
    };

    saveIngredients([...ingredients, ingredient]);
    setNewIngredient({ name: '', quantity: '', expiryDate: '' });
    setShowAddModal(false);
  };

  // 재료 삭제
  const handleRemoveIngredient = (id: string) => {
    saveIngredients(ingredients.filter(ing => ing.id !== id));
  };

  // 유통기한 임박 체크
  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  // 필터링된 재료
  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 유통기한 임박 재료
  const expiringSoon = ingredients.filter(ing => isExpiringSoon(ing.expiryDate));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Refrigerator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">내 냉장고</h1>
              <p className="text-gray-600 dark:text-gray-400">보유 재료를 관리하고 레시피를 찾아보세요</p>
            </div>
          </div>
        </div>

        {/* 유통기한 임박 알림 */}
        {expiringSoon.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="font-semibold text-orange-900 dark:text-orange-200">
                유통기한이 임박한 재료가 {expiringSoon.length}개 있어요
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {expiringSoon.map(ing => (
                <span
                  key={ing.id}
                  className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm"
                >
                  {ing.emoji} {ing.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* 검색 및 추가 버튼 */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="재료 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">재료 추가</span>
          </button>
          <Link
            href="/scan"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            <span className="hidden sm:inline">스캔</span>
          </Link>
        </div>

        {/* 빈 냉장고 상태 */}
        {ingredients.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg"
          >
            <div className="text-6xl mb-4">🧊</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              냉장고가 비어있어요
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              재료를 추가하면 만들 수 있는 레시피를 추천해드려요!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              재료 추가하기
            </button>
          </motion.div>
        )}

        {/* 재료 목록 */}
        {ingredients.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <AnimatePresence>
                {filteredIngredients.map((ingredient) => (
                  <motion.div
                    key={ingredient.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all relative"
                  >
                    <button
                      onClick={() => handleRemoveIngredient(ingredient.id)}
                      className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    <div className="text-4xl mb-2">{ingredient.emoji}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {ingredient.name}
                    </h3>
                    
                    {ingredient.quantity && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        수량: {ingredient.quantity}
                      </p>
                    )}
                    
                    {ingredient.expiryDate && (
                      <div className={`flex items-center gap-1 text-sm ${
                        isExpiringSoon(ingredient.expiryDate)
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        <Clock className="w-4 h-4" />
                        {new Date(ingredient.expiryDate).toLocaleDateString('ko-KR')}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 레시피 추천 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="text-xl font-bold">레시피 추천 받기</h3>
                  </div>
                  <p className="text-orange-50">
                    보유 재료로 만들 수 있는 레시피를 찾아드려요!
                  </p>
                </div>
                <Link
                  href={`/recipes?ingredients=${ingredients.map(i => i.name).join(',')}`}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                >
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </motion.div>
          </>
        )}

        {/* 재료 추가 모달 */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  재료 추가
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      재료 이름 *
                    </label>
                    <input
                      type="text"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                      placeholder="예: 양파, 계란, 토마토..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      수량 (선택)
                    </label>
                    <input
                      type="text"
                      value={newIngredient.quantity}
                      onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                      placeholder="예: 2개, 500g..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      유통기한 (선택)
                    </label>
                    <input
                      type="date"
                      value={newIngredient.expiryDate}
                      onChange={(e) => setNewIngredient({ ...newIngredient, expiryDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAddIngredient}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    추가
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

