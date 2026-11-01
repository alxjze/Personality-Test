import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft' | 'white' | 'outlineLight';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[13px] border font-bold transition duration-200 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';
const variants: Record<Variant, string> = {
  primary: 'border-transparent bg-gradient-to-br from-[#1686ff] to-[#0757d9] text-white shadow-glow hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(16,100,226,.29)]',
  secondary: 'border-[#cadcf8] bg-white text-navy hover:-translate-y-0.5 hover:text-primary',
  ghost: 'border-transparent text-navy hover:bg-primary-50',
  danger: 'border-transparent bg-red-600 text-white hover:bg-red-700',
  soft: 'border-[#b9d4fb] bg-white/80 text-primary-700 hover:-translate-y-0.5 hover:bg-primary-50',
  white: 'border-transparent bg-white text-primary shadow-sm hover:bg-primary-50',
  outlineLight: 'border border-white/40 text-white hover:bg-white/10',
};
const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'min-h-[44px] px-[18px] text-sm',
  lg: 'min-h-[49px] px-5 text-[15px]',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

interface LinkButtonProps {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function LinkButton({ to, variant = 'primary', size = 'md', className, children, icon }: LinkButtonProps) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)}>
      {icon}
      {children}
    </Link>
  );
}
