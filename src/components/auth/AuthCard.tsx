import { View, StyleSheet, ViewProps } from 'react-native';

export function AuthCard({ children, style, ...rest }: ViewProps) {
  return (
    <View 
      style={[styles.card, style]} 
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
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
