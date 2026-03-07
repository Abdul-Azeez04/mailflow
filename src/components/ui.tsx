import React, { CSSProperties, ReactNode, MouseEventHandler } from 'react';

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const Card: React.FC<CardProps> = ({ children, style, className, onClick }) => (
  <div
    className={className}
    style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '24px',
      ...style,
    }}
    onClick={onClick}
  >
    {children}
  </div>
);

interface ButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  className,
  type = 'button',
}) => {
  const base: CSSProperties = {
    borderRadius: '8px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: 'none',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  };
  const sizes: Record<string, CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' },
  };
  const variants: Record<string, CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#fff' },
    secondary: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--text)' },
    danger: { background: '#ef4444', color: '#fff' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
};

interface BadgeProps {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'var(--accent)', style }) => (
  <span
    style={{
      background: color + '22',
      color,
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      ...style,
    }}
  >
    {children}
  </span>
);

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  style?: CSSProperties;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ value, onChange, placeholder, type = 'text', style, className }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={className}
    style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '10px 14px',
      color: 'var(--text)',
      fontSize: '14px',
      outline: 'none',
      width: '100%',
      ...style,
    }}
  />
);

interface TextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  style?: CSSProperties;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ value, onChange, placeholder, rows = 4, style, className }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={className}
    style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '10px 14px',
      color: 'var(--text)',
      fontSize: '14px',
      outline: 'none',
      width: '100%',
      resize: 'vertical',
      ...style,
    }}
  />
);

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, children, style, className }) => (
  <select
    value={value}
    onChange={onChange}
    className={className}
    style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '10px 14px',
      color: 'var(--text)',
      fontSize: '14px',
      outline: 'none',
      width: '100%',
      cursor: 'pointer',
      ...style,
    }}
  >
    {children}
  </select>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '32px', maxWidth: '600px',
          width: '100%', maxHeight: '80vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '24px', lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color = 'var(--accent)' }) => (
  <Card>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', margin: 0 }}>{label}</p>
        <p style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0 0', color }}>{value}</p>
        {trend !== undefined && (
          <p style={{ fontSize: '12px', color: trend >= 0 ? '#22c55e' : '#ef4444', margin: '4px 0 0' }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
      {icon && (
        <div style={{ fontSize: '28px', opacity: 0.8 }}>{icon}</div>
      )}
    </div>
  </Card>
);
