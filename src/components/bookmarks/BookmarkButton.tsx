import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BookmarkType } from '../../types/bookmark';

interface BookmarkButtonProps {
  type: BookmarkType;
  targetId: string;
  title: string;
  subtitle?: string;
  category?: string;
  imageUrl?: string;
  campaignId?: string | null;
  sessionTag?: string;
  notes?: string;
  metadata?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  text?: string;
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  type,
  targetId,
  title,
  subtitle,
  category,
  imageUrl,
  campaignId,
  sessionTag,
  notes,
  metadata,
  size = 'md',
  showText = false,
  text,
  className = '',
}) => {
  const { isBookmarked, toggleBookmark, activeCampaignId } = useApp();

  const bookmarked = isBookmarked(targetId, type);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleBookmark({
      type,
      targetId,
      title,
      subtitle,
      category,
      imageUrl,
      campaignId: campaignId !== undefined ? campaignId : activeCampaignId,
      sessionTag,
      notes,
      metadata,
    });
  };

  const sizeClasses = {
    sm: 'p-1 text-xs gap-1',
    md: 'p-1.5 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={bookmarked ? `Bookmarked: ${title} (Click to remove)` : `Bookmark "${title}" for quick session access`}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ${
        bookmarked
          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/10 hover:bg-amber-500/30'
          : 'bg-surface-50/80 hover:bg-surface-hover text-slate-400 hover:text-slate-200 border border-surface-border'
      } ${sizeClasses[size]} ${className}`}
    >
      {bookmarked ? (
        <BookmarkCheck className={`${iconSizes[size]} text-amber-400 fill-amber-400/30 animate-scaleIn`} />
      ) : (
        <Bookmark className={`${iconSizes[size]} transition-transform duration-200 hover:scale-110`} />
      )}
      {showText && (
        <span>{text || (bookmarked ? 'Bookmarked' : 'Bookmark')}</span>
      )}
    </button>
  );
};
