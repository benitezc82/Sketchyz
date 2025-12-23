import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  className = '', 
  ...props 
}) => {
  // Base styles: thick border, bold font, flex layout, transition
  const baseStyles = "relative font-bold text-lg md:text-xl py-4 px-8 rounded-2xl hand-border hand-shadow hand-shadow-active transition-all flex items-center justify-center gap-3 active:scale-[0.98]";
  
  // Colors inspired by the reference image
  const variants = {
    primary: "bg-[#FF66C4] text-white", // Pink
    secondary: "bg-[#4DE1C1] text-white", // Teal
    success: "bg-[#FFD93D] text-black", // Yellow
    danger: "bg-[#FF6B6B] text-white" // Red/Coral
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {/* Icon wrapper to ensure alignment */}
      {icon && <span className="transform -rotate-6">{icon}</span>}
      <span className="drop-shadow-sm">{children}</span>
    </button>
  );
};