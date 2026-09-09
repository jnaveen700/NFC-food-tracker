import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightElement,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full h-12 bg-dark-card border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500
            focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all
            ${icon ? 'pl-10' : 'pl-3.5'}
            ${rightElement ? 'pr-12' : 'pr-3.5'}
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 text-zinc-400 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
    </div>
  );
};
