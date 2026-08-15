import { Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface GoogleButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GoogleButton({ onPress, title, disabled, style }: GoogleButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { borderColor: theme.backgroundElement, backgroundColor: theme.background },
        pressed && !disabled && { opacity: 0.8, backgroundColor: theme.backgroundElement },
        disabled && { opacity: 0.5, backgroundColor: theme.backgroundElement },
        style,
      ]}>
      <View style={styles.content}>
        {/* We can use the actual Google G logo here, but for simplicity, an image works. */}
        <Image 
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
          style={styles.icon}
          contentFit="contain"
        />
        <ThemedText style={[styles.text, { color: theme.text }]}>{title}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
