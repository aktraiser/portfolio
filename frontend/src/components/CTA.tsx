import Link from 'next/link';

interface CTAProps {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withLed?: boolean;
  target?: string;
  rel?: string;
}

export default function CTA({ text, href, variant = 'primary', size = 'md', withLed = false, target, rel }: CTAProps) {
  const baseClasses = 'font-semibold shadow-sm rounded-full transition-colors';
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-transparent text-white border border-[#B82EAF] hover:bg-[#252339]'
  };
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-3.5 py-2.5 text-sm',
    xl: 'px-4 py-3 text-base'
  };
  
  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  
  return (
    <Link href={href} className={className} target={target} rel={rel}>
      {withLed && (
        <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 align-middle"></span>
      )}
      {text}
    </Link>
  );
} 