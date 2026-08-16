import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#E5E7EB' } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}
