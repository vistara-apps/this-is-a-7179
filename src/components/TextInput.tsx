import React from 'react';

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'area';
  className?: string;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  variant = 'default',
  className = '',
  required = false
}) => {
  const baseClasses = `
    w-full px-4 py-3 rounded-lg border border-white/20 
    bg-white/5 text-white placeholder-gray-400
    focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20
    transition-all duration-200
  `;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {variant === 'area' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={4}
          className={`${baseClasses} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={baseClasses}
        />
      )}
    </div>
  );
};