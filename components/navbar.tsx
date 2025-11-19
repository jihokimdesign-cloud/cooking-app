'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChefHat, Refrigerator, Users, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

// 메인 내비게이션 (하단 탭바 / 웹 헤더)
const mainNavItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/recipes', label: '레시피', icon: ChefHat },
  { href: '/fridge', label: '냉장고', icon: Refrigerator },
  { href: '/community', label: '커뮤니티', icon: Users },
  { href: '/mypage', label: '마이페이지', icon: User },
];

// 보조 메뉴 (웹 헤더에만 표시)
const secondaryNavItems = [
  { href: '/chat', label: 'AI 셰피', icon: Menu },
  { href: '/youtube', label: '유튜브', icon: Menu },
  { href: '/measure', label: '계량', icon: Menu },
  { href: '/scan', label: '스캔', icon: Menu },
  { href: '/shopping', label: '장보기', icon: Menu },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* 모바일: 하단 탭바 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-[#E5E5E5] md:hidden shadow-md">
        <div className="flex items-center justify-around h-16 safe-area-bottom">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all',
                  'text-xs font-medium min-w-[60px]',
                  isActive
                    ? 'text-[#7C9D86] bg-[#7C9D86]/10'
                    : 'text-[#888888]'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 웹: 상단 헤더 */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E5E5] shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl">👨‍🍳</div>
              <span className="text-xl font-bold text-[#7C9D86]" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
                Cheffy's Kitchen
              </span>
            </Link>

            {/* 메인 내비게이션 */}
            <div className="flex items-center gap-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                      'text-sm font-medium',
                      isActive
                        ? 'text-[#7C9D86] bg-[#7C9D86]/10'
                        : 'text-[#888888] hover:text-[#4A4A4A]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* 보조 메뉴 및 테마 토글 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border-l border-gray-200 dark:border-zinc-700 pl-4 ml-4">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        isActive
                          ? 'text-[#7C9D86] bg-[#7C9D86]/10'
                          : 'text-[#888888] hover:text-[#4A4A4A]'
                      )}
                      title={item.label}
                    >
                      <Icon className="w-4 h-4" />
                    </Link>
                  );
                })}
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

