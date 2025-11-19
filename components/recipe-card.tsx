'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  imageUrl: string;
  title: string;
  cookTime: string;
  category: string;
  href?: string;
  onBookmark?: (isBookmarked: boolean) => void;
  className?: string;
}

export function RecipeCard({
  imageUrl,
  title,
  cookTime,
  category,
  href,
  onBookmark,
  className,
}: RecipeCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    onBookmark?.(newBookmarkState);
  };

  const cardContent = (
    <div
      className={cn(
        'bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1',
        'border border-[#E5E5E5]',
        href && 'cursor-pointer',
        className
      )}
    >
      {/* 이미지 영역 */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* 북마크 아이콘 - 우측 상단 */}
        <button
          onClick={handleBookmark}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full transition-all z-10',
            'bg-white/90 hover:bg-white shadow-md hover:shadow-lg',
            'flex items-center justify-center',
            isBookmarked && 'bg-[#7C9D86] hover:bg-[#6B8E7A]'
          )}
          aria-label={isBookmarked ? '북마크 제거' : '북마크 추가'}
        >
          <Bookmark
            className={cn(
              'w-5 h-5 transition-colors',
              isBookmarked
                ? 'text-white fill-white'
                : 'text-[#888888] hover:text-[#7C9D86]'
            )}
          />
        </button>
      </div>

      {/* 카드 하단 정보 */}
      <div className="p-4">
        {/* 제목 */}
        <h3
          className="font-bold text-[#4A4A4A] mb-2 line-clamp-2"
          style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
        >
          {title}
        </h3>

        {/* 카테고리 및 조리 시간 */}
        <div className="flex items-center justify-between text-sm text-[#888888]">
          <span className="px-2 py-1 bg-[#7C9D86]/10 text-[#7C9D86] rounded-full text-xs font-medium">
            {category}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {cookTime}
          </span>
        </div>
      </div>
    </div>
  );

  // href가 제공되면 Link로 감싸기
  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

