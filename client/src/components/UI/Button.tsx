import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none focus:outline-none focus:ring-2 focus:ring-brand-500/50';

  const variantStyles = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/20 border border-brand-600/30',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow-sm',
    outline: 'border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 bg-white shadow-sm',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700'
  };

  const sizeStyles = {
    sm: 'h-10 px-3.5 text-xs gap-1.5',
    md: 'h-12 px-5 text-sm gap-2 min-h-[48px]', // Meets 48px touch target
    lg: 'h-14 px-6 text-base gap-2.5 min-h-[56px]' // Premium large touch target
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
