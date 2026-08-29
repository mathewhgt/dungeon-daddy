import React, { useState } from 'react';
import { 
  Skull, 
  Flame, 
  Shield, 
  Sparkles, 
  User, 
  Sword, 
  Eye, 
  Ghost,
  X
} from 'lucide-react';

interface TokenAvatarProps {
  name: string;
  imageUrl?: string;
  tokenUrl?: string;
  type?: 'monster' | 'player' | 'item' | 'spell' | 'npc';
  monsterType?: string;
  characterClass?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  borderColor?: string;
  className?: string;
  allowZoom?: boolean;
}

export const TokenAvatar: React.FC<TokenAvatarProps> = ({
  name,
  imageUrl,
  tokenUrl,
  type = 'monster',
  monsterType = '',
  characterClass = '',
  size = 'md',
  borderColor,
  className = '',
  allowZoom = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const displaySrc = tokenUrl || imageUrl;

  const sizeClasses: Record<string, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl',
    hero: 'w-28 h-28 text-3xl',
  };

  // Ring border colors based on type or prop
  const getRingColor = () => {
    if (borderColor) return borderColor;
    if (type === 'player') return 'border-emerald-500 ring-emerald-500/30';
    if (type === 'spell') return 'border-indigo-500 ring-indigo-500/30';
    if (type === 'item') return 'border-amber-500 ring-amber-500/30';
    
    // Monster types
    const mType = monsterType.toLowerCase();
    if (mType.includes('dragon')) return 'border-red-500 ring-red-500/30';
    if (mType.includes('undead')) return 'border-purple-500 ring-purple-500/30';
    if (mType.includes('fiend')) return 'border-red-600 ring-red-600/40';
    if (mType.includes('aberration')) return 'border-pink-500 ring-pink-500/30';
    return 'border-amber-600 ring-amber-600/30';
  };

  // Fallback icon based on type
  const renderFallbackIcon = () => {
    const iconSize = size === 'xs' || size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-7 h-7';
    const mType = monsterType.toLowerCase();

    if (type === 'player') {
      return <User className={iconSize} />;
    }
    if (mType.includes('undead')) {
      return <Skull className={iconSize} />;
    }
    if (mType.includes('dragon')) {
      return <Flame className={iconSize} />;
    }
    if (mType.includes('aberration')) {
      return <Eye className={iconSize} />;
    }
    if (type === 'spell') {
      return <Sparkles className={iconSize} />;
    }
    if (type === 'item') {
      return <Sword className={iconSize} />;
    }

    return <Shield className={iconSize} />;
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <div
        onClick={() => allowZoom && displaySrc && setIsZoomed(true)}
        className={`relative rounded-full shrink-0 flex items-center justify-center font-serif font-black select-none overflow-hidden border-2 shadow-lg ring-2 bg-gradient-to-br from-surface-100 to-surface-50 text-slate-200 transition-transform ${
          allowZoom && displaySrc ? 'cursor-pointer hover:scale-105' : ''
        } ${sizeClasses[size] || sizeClasses.md} ${getRingColor()} ${className}`}
        title={name}
      >
        {displaySrc && !imageError ? (
          <img
            src={displaySrc}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-slate-300">
            {renderFallbackIcon()}
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomed && displaySrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative max-w-lg max-h-[80vh] flex flex-col items-center bg-[#121720] p-4 rounded-2xl border border-surface-border shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-3 right-3 p-1 rounded-full bg-surface-50 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif font-bold text-slate-100 text-lg">{name}</h3>
            <img
              src={displaySrc}
              alt={name}
              className="max-h-[60vh] rounded-xl object-contain shadow-md border border-surface-border"
            />
          </div>
        </div>
      )}
    </>
  );
};
