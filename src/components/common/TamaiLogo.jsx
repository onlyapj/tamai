import React from 'react';

export default function TamaiLogo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: { logo: 'w-8 h-8', text: 'text-lg' },
    md: { logo: 'w-10 h-10', text: 'text-xl' },
    lg: { logo: 'w-14 h-14', text: 'text-2xl' }
  };

  const { logo, text } = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${logo} bg-slate-900 rounded-full flex items-center justify-center relative`}>
        <div className="absolute inset-1 border-2 border-white rounded-full" />
        <span className="text-white font-bold text-lg" style={{ fontFamily: 'system-ui' }}>T</span>
      </div>
      {showText && (
        <span className={`${text} font-semibold tracking-wider text-slate-900`}>TAMAI</span>
      )}
    </div>
  );
}