'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ChefHat, 
  Users, 
  BookOpen, 
  Plus,
  User,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheffyCharacter } from './cheffy-character';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const discoverItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/recipes', label: 'Browse', icon: ChefHat },
  { href: '/community', label: 'Community', icon: Users },
];

const libraryItems: NavItem[] = [
  { href: '/mypage', label: 'Journal', icon: BookOpen },
  { href: '/fridge', label: 'My Fridge', icon: ChefHat },
  { href: '/favorites', label: 'Favorites', icon: BookOpen },
];

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-[#E5E5E5] z-40 flex-col shadow-md">
      {/* 상단: 로고 및 사용자 프로필 */}
      <div className="p-6 border-b border-[#E5E5E5]">
        <Link href="/" className="flex items-center gap-3 mb-6">
          <CheffyCharacter size="sm" animated={false} />
          <div>
            <h1 
              className="text-xl font-bold text-[#7C9D86]" 
              style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
            >
              Cheffy's Kitchen
            </h1>
            <p className="text-xs text-[#888888]">요리 여정을 시작해요</p>
          </div>
        </Link>
        
        {/* 사용자 프로필 */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FBF7F0] hover:bg-[#7C9D86]/5 transition-colors cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-[#7C9D86] to-[#6B8E7A] rounded-full flex items-center justify-center text-white font-bold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#4A4A4A] text-sm truncate" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
              사용자님
            </p>
            <p className="text-xs text-[#888888] truncate">레벨 5 셰프</p>
          </div>
          <Link
            href="/mypage"
            className="p-1.5 hover:bg-white rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Settings className="w-4 h-4 text-[#888888]" />
          </Link>
        </div>
      </div>

      {/* 중간: 네비게이션 메뉴 */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* DISCOVER 섹션 */}
        <div className="px-6 mb-6">
          <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3 px-3">
            Discover
          </h2>
          <div className="space-y-1">
            {discoverItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                    'text-sm font-medium',
                    active
                      ? 'text-[#7C9D86] bg-[#7C9D86]/10'
                      : 'text-[#888888] hover:text-[#4A4A4A] hover:bg-[#FBF7F0]'
                  )}
                >
                  <Icon className={cn('w-5 h-5', active && 'text-[#7C9D86]')} />
                  <span style={{ fontFamily: active ? 'var(--font-nunito), sans-serif' : 'inherit' }}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* LIBRARY 섹션 */}
        <div className="px-6 mb-6">
          <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3 px-3">
            Library
          </h2>
          <div className="space-y-1">
            {libraryItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                    'text-sm font-medium',
                    active
                      ? 'text-[#7C9D86] bg-[#7C9D86]/10'
                      : 'text-[#888888] hover:text-[#4A4A4A] hover:bg-[#FBF7F0]'
                  )}
                >
                  <Icon className={cn('w-5 h-5', active && 'text-[#7C9D86]')} />
                  <span style={{ fontFamily: active ? 'var(--font-nunito), sans-serif' : 'inherit' }}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 하단: Add Recipe 버튼 */}
      <div className="p-6 border-t border-[#E5E5E5]">
        <Link
          href="/recipes?action=add"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#7C9D86] hover:bg-[#6B8E7A] text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>Add Recipe</span>
        </Link>
      </div>
    </aside>
  );
}

