import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text className="text-sm font-inter text-gray-700 dark:text-gray-300 mb-1 ml-1">{label}</Text>}
      <TextInput
        className={`bg-white dark:bg-gray-800 border ${
          error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
        } rounded-xl px-4 py-3 text-base font-inter text-gray-900 dark:text-white`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <Text className="text-sm text-red-500 mt-1 ml-1">{error}</Text>}
    </View>
  );
}
