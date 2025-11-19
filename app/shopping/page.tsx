'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, Plus, Check, X, AlertCircle,
  Sparkles, ArrowLeft, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  category: string;
  checked: boolean;
}

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  // localStorage에서 장보기 리스트 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('shoppingList');
    if (saved) {
      setItems(JSON.parse(saved));
    }

    // URL 파라미터에서 재료 추가
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const addIngredients = params.get('add');
      if (addIngredients) {
        const ingredientList = addIngredients.split(',').map(i => i.trim()).filter(Boolean);
        const newItems: ShoppingItem[] = ingredientList.map(ing => ({
          id: Date.now().toString() + Math.random(),
          name: ing,
          category: '기타',
          checked: false,
        }));
        const existing = saved ? JSON.parse(saved) : [];
        const combined = [...existing, ...newItems];
        // 중복 제거
        const unique = combined.filter((item: ShoppingItem, index: number, self: ShoppingItem[]) =>
          index === self.findIndex((t: ShoppingItem) => t.name.toLowerCase() === item.name.toLowerCase())
        );
        saveItems(unique);
        // URL 정리
        window.history.replaceState({}, '', '/shopping');
      }
    }
  }, []);

  // 장보기 리스트 저장
  const saveItems = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    localStorage.setItem('shoppingList', JSON.stringify(newItems));
  };

  // 아이템 추가
  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    const item: ShoppingItem = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: newItem.quantity || undefined,
      category: '기타',
      checked: false,
    };

    saveItems([...items, item]);
    setNewItem({ name: '', quantity: '' });
    setShowAddModal(false);
  };

  // 아이템 삭제
  const handleRemoveItem = (id: string) => {
    saveItems(items.filter(item => item.id !== id));
  };

  // 체크 토글
  const handleToggleCheck = (id: string) => {
    saveItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // 체크된 아이템 삭제
  const handleRemoveChecked = () => {
    saveItems(items.filter(item => !item.checked));
  };

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">스마트 장보기</h1>
              <p className="text-gray-600 dark:text-gray-400">구매할 재료를 관리하세요</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">추가</span>
            </button>
          </div>
        </div>

        {/* 진행 상황 */}
        {totalCount > 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-md mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                구매 진행도
              </span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {checkedCount} / {totalCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
              />
            </div>
            {checkedCount > 0 && (
              <button
                onClick={handleRemoveChecked}
                className="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                구매 완료한 항목 삭제
              </button>
            )}
          </div>
        )}

        {/* 빈 리스트 */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg"
          >
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              장보기 리스트가 비어있어요
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              레시피에서 재료를 추가하거나 직접 입력해보세요!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              재료 추가하기
            </button>
          </motion.div>
        )}

        {/* 장보기 리스트 */}
        {items.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-md transition-all ${
                    item.checked ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleCheck(item.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        item.checked
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 dark:border-zinc-600'
                      }`}
                    >
                      {item.checked && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-gray-900 dark:text-white ${
                        item.checked ? 'line-through' : ''
                      }`}>
                        {item.name}
                      </h3>
                      {item.quantity && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          수량: {item.quantity}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Cheffy 팁 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-bold">Cheffy 팁</h3>
          </div>
          <p className="text-orange-50">
            유통기한 임박한 재료도 함께 구매하시면 음식 낭비를 줄일 수 있어요!
          </p>
        </motion.div>

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
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="예: 양파, 계란, 토마토..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      수량 (선택)
                    </label>
                    <input
                      type="text"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      placeholder="예: 2개, 500g..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
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
                    onClick={handleAddItem}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
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

