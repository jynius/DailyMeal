'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  actions?: React.ReactNode;
  variant?: 'default' | 'home';
  children?: React.ReactNode;
}

export function Header({
  title,
  showBackButton = false,
  actions,
  variant = 'default',
  children,
}: HeaderProps) {
  const router = useRouter();

  const baseHeaderClasses = 'sticky top-0 z-20 pt-safe';
  const variantClasses = {
    default: 'bg-white border-b',
    home: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg',
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <header className={`${baseHeaderClasses} ${variantClasses[variant]}`}>
      <div className="max-w-md mx-auto px-4 h-14 flex items-center relative">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="absolute left-2 p-2 rounded-full hover:bg-gray-100/20 transition-colors"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-lg font-bold text-center flex-1 truncate px-12">
          {title}
        </h1>
        {actions && (
          <div className="absolute right-2 flex items-center">{actions}</div>
        )}
      </div>
      {children && <div className="max-w-md mx-auto px-4 pb-3">{children}</div>}
    </header>
  );
}
