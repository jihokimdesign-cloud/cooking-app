'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChefHat, MessageCircle, Ruler, BookOpen, Youtube, Camera, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/recipes', label: 'Recipes', icon: ChefHat },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/measure', label: 'Measure', icon: Ruler },
  { href: '/youtube', label: 'YouTube', icon: Youtube },
  { href: '/scan', label: 'Scan', icon: Camera },
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/cookbook', label: 'Cookbook', icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-zinc-800 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around md:justify-center md:gap-8 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors',
                  'text-sm font-medium',
                  isActive
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
          <div className="md:ml-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

