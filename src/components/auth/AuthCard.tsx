import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export function AuthCard({ children, style, ...rest }: ViewProps) {
  const theme = useTheme();
  
  return (
    <View 
      style={[
        styles.card, 
        { backgroundColor: theme.background },
        style
      ]} 
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 5,
    marginTop: 10,
    width: '100%',
  },
});
