'use client';

import { cn } from '@/lib/utils';
import { getRatingStars } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onClick?: (value: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  max = 5,
  size = 20,
  interactive = false,
  onClick,
  className
}: StarRatingProps) {
  const { fullStars, hasHalfStar, emptyStars } = getRatingStars(rating);

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[...Array(fullStars)].map((_, i) => (
        <svg
          key={i}
          className={cn('text-amber-400 drop-shadow-sm', interactive && 'cursor-pointer hover:scale-110 transition-transform')}
          width={size}
          height={size}
          fill="currentColor"
          viewBox="0 0 24 24"
          onClick={() => interactive && onClick?.(i + 1)}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {hasHalfStar && (
        <svg
          className={cn('text-amber-400 drop-shadow-sm', interactive && 'cursor-pointer hover:scale-110 transition-transform')}
          width={size}
          height={size}
          fill="currentColor"
          viewBox="0 0 24 24"
          onClick={() => interactive && onClick?.(fullStars + 0.5)}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={i}
          className={cn('text-slate-200', interactive && 'cursor-pointer hover:scale-110 transition-transform')}
          width={size}
          height={size}
          fill="currentColor"
          viewBox="0 0 24 24"
          onClick={() => interactive && onClick?.(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}