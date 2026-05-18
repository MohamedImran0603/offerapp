import { Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, className = '', ...props }: ButtonProps) {
  const baseStyles = 'rounded-full py-4 px-6 flex-row justify-center items-center';
  
  const variantStyles = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'border-2 border-primary bg-transparent',
  };

  const textStyles = {
    primary: 'text-white font-inter font-bold text-base',
    secondary: 'text-white font-inter font-bold text-base',
    outline: 'text-primary font-inter font-bold text-base',
  };

  return (
    <TouchableOpacity
      className={`${baseStyles} ${variantStyles[variant]} ${loading ? 'opacity-70' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#ff4757' : '#fff'} />
      ) : (
        <Text className={textStyles[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
