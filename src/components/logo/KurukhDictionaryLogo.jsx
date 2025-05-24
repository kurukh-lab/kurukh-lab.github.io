import React from 'react';

const KurukhDictionaryLogo = ({ size = 'md' }) => {
  // Size variants
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20',
  };

  return (
    <div className={`flex items-center ${sizeClasses[size] || sizeClasses.md}`}>
      <div className="mr-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full"
        >
          <path
            d="M6.5 2H20V22H6.5C5.11929 22 4 20.8807 4 19.5V4.5C4 3.11929 5.11929 2 6.5 2Z"
            fill="#F59E0B"
            stroke="#78350F"
            strokeWidth="1.5"
          />
          <path
            d="M8 7H16M8 12H13M8 17H16"
            stroke="#78350F"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M4 6.5V4.5C4 3.11929 5.11929 2 6.5 2H20V6.5H4Z"
            fill="#FBBF24"
            stroke="#78350F"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <div className="font-bold tracking-tight text-amber-800 leading-none">
        <div className={size === 'sm' ? 'text-lg' : 'text-2xl'}>Kurukh</div>
        <div className={size === 'sm' ? 'text-md' : 'text-xl'}>Dictionary</div>
      </div>
    </div>
  );
};

export default KurukhDictionaryLogo;
