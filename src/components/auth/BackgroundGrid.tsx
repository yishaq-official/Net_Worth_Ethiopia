import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import Svg, { Defs, Pattern, Rect, Line } from 'react-native-svg';

export function BackgroundGrid() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  // Using an estimated height for the header background (e.g. 35% of common mobile heights or a fixed size)
  const height = 300; 

  return (
    <View style={[styles.container, { backgroundColor: theme.primary, width, height }]}>
      <Svg height="100%" width="100%">
        <Defs>
          <Pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <Line x1="30" y1="0" x2="30" y2="30" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="1" />
            <Line x1="0" y1="30" x2="30" y2="30" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="1" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grid)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});
