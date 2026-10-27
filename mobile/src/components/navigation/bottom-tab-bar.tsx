import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { useBidrStore } from '@/store/bidr-store';

export interface BottomTabBarProps {
  state: {
    routes: { key: string; name: string }[];
    index: number;
  };
  descriptors: Record<string, any>;
  navigation: {
    emit: (event: any) => any;
    navigate: (routeName: string) => void;
  };
}

// =================================================================
// Pure React Native Icons (100% native, zero ViewManager crashes)
// =================================================================

interface IconProps {
  focused: boolean;
  color: string;
}

function DashboardIcon({ focused, color }: IconProps) {
  return (
    <View style={iconStyles.dashboardContainer}>
      <View
        style={[
          iconStyles.dashboardTile,
          { width: 8, height: 8, borderRadius: 2 },
          focused
            ? { backgroundColor: color }
            : { borderWidth: 1.8, borderColor: color },
        ]}
      />
      <View
        style={[
          iconStyles.dashboardTile,
          { width: 8, height: 5, borderRadius: 1.8 },
          focused
            ? { backgroundColor: color }
            : { borderWidth: 1.8, borderColor: color },
        ]}
      />
      <View
        style={[
          iconStyles.dashboardTile,
          { width: 8, height: 9, borderRadius: 2 },
          focused
            ? { backgroundColor: color }
            : { borderWidth: 1.8, borderColor: color },
        ]}
      />
      <View
        style={[
          iconStyles.dashboardTile,
          { width: 8, height: 6, borderRadius: 1.8 },
          focused
            ? { backgroundColor: color }
            : { borderWidth: 1.8, borderColor: color },
        ]}
      />
    </View>
  );
}

function SalesIcon({ focused, color }: IconProps) {
  return (
    <View style={iconStyles.salesContainer}>
      {/* Handle */}
      <View
        style={[
          iconStyles.salesHandle,
          { borderColor: color },
        ]}
      />
      {/* Bag body */}
      <View
        style={[
          iconStyles.salesBody,
          {
            borderColor: color,
            backgroundColor: focused ? `${color}25` : 'transparent',
          },
        ]}
      >
        <View style={[iconStyles.salesDash, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function BidrIcon({ focused, color }: IconProps) {
  return (
    <View style={iconStyles.bidrContainer}>
      <View
        style={[
          iconStyles.bidrBody,
          {
            borderColor: color,
            backgroundColor: focused ? `${color}25` : 'transparent',
          },
        ]}
      >
        <View style={[iconStyles.bidrLine, { width: 8, backgroundColor: color }]} />
        <View style={[iconStyles.bidrLine, { width: 11, backgroundColor: color }]} />
        <View style={[iconStyles.bidrLine, { width: 6, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function ProfileIcon({ focused, color }: IconProps) {
  return (
    <View style={iconStyles.profileContainer}>
      {/* Head */}
      <View
        style={[
          iconStyles.profileHead,
          {
            borderColor: color,
            backgroundColor: focused ? color : 'transparent',
          },
        ]}
      />
      {/* Body */}
      <View
        style={[
          iconStyles.profileBody,
          {
            borderColor: color,
            backgroundColor: focused ? `${color}25` : 'transparent',
          },
        ]}
      />
    </View>
  );
}

function TextFetchingIcon({ focused, color }: IconProps) {
  return (
    <View style={iconStyles.textFetchingContainer}>
      <View
        style={[
          iconStyles.textFetchingBubble,
          {
            borderColor: color,
            backgroundColor: focused ? `${color}25` : 'transparent',
          },
        ]}
      >
        <View style={[iconStyles.textFetchingLine, { width: 9, backgroundColor: color }]} />
        <View style={[iconStyles.textFetchingLine, { width: 6, backgroundColor: color }]} />
      </View>
      <View style={[iconStyles.textFetchingTail, { borderTopColor: color }]} />
    </View>
  );
}

const iconStyles = StyleSheet.create({
  dashboardContainer: {
    width: 20,
    height: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  dashboardTile: {
    margin: 0.5,
  },
  salesContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salesHandle: {
    width: 9,
    height: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderWidth: 1.8,
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  salesBody: {
    width: 17,
    height: 14,
    borderRadius: 3.5,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salesDash: {
    width: 5,
    height: 1.8,
    borderRadius: 1,
  },
  bidrContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidrBody: {
    width: 16,
    height: 19,
    borderRadius: 3,
    borderWidth: 1.8,
    paddingHorizontal: 2,
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
  },
  bidrLine: {
    height: 1.8,
    borderRadius: 1,
  },
  profileContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHead: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.8,
    marginBottom: 1,
  },
  profileBody: {
    width: 17,
    height: 8,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderWidth: 1.8,
    borderBottomWidth: 0,
  },
  textFetchingContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textFetchingBubble: {
    width: 17,
    height: 13,
    borderRadius: 4,
    borderWidth: 1.8,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 2.5,
    gap: 2,
  },
  textFetchingLine: {
    height: 1.8,
    borderRadius: 1,
  },
  textFetchingTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'flex-start',
    marginLeft: 4,
    marginTop: -0.5,
  },
});

// ==========================================
// Bottom Tab Bar Component
// ==========================================

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useTheme();

  // Dynamic debt alert counts from Bidr store
  const bidrSummary = useBidrStore((state) => state.summary);
  const overdueCount = bidrSummary?.overdueCount ?? 0;
  const dueSoonCount = bidrSummary?.dueSoonCount ?? 0;
  const bidrAlertCount = overdueCount + dueSoonCount;

  // Ethiopian Forest Emerald primary brand color
  const activeColor = colors.primary;
  const inactiveColor = '#9CA3AF';
  const activeBg = 'rgba(6, 95, 70, 0.1)';

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 12),
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
        },
      ]}
    >
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event?.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const renderIcon = () => {
            const iconColor = isFocused ? activeColor : inactiveColor;
            switch (route.name) {
              case 'index':
                return <DashboardIcon focused={isFocused} color={iconColor} />;
              case 'sales':
                return <SalesIcon focused={isFocused} color={iconColor} />;
              case 'text-fetching':
                return <TextFetchingIcon focused={isFocused} color={iconColor} />;
              case 'bidr':
                return <BidrIcon focused={isFocused} color={iconColor} />;
              case 'profile':
                return <ProfileIcon focused={isFocused} color={iconColor} />;
              default:
                return <DashboardIcon focused={isFocused} color={iconColor} />;
            }
          };

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name === 'index'
              ? 'Dashboard'
              : route.name === 'sales'
              ? 'Sales'
              : route.name === 'text-fetching'
              ? 'SMS Fetch'
              : route.name === 'bidr'
              ? 'Debt / Bidr'
              : 'Profile';

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <View
                style={[
                  styles.iconBadgeContainer,
                  isFocused && { backgroundColor: activeBg },
                ]}
              >
                {renderIcon()}
                {route.name === 'bidr' && bidrAlertCount > 0 ? (
                  <View
                    style={[
                      styles.tabBadge,
                      overdueCount > 0 ? styles.tabBadgeOverdue : styles.tabBadgeDueSoon,
                    ]}
                  >
                    <Text style={styles.tabBadgeText}>
                      {bidrAlertCount > 99 ? '99+' : bidrAlertCount}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    fontFamily: isFocused ? 'Lexend_700Bold' : 'Lexend_500Medium',
                    color: isFocused ? activeColor : inactiveColor,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {String(label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    paddingTop: 8,
    borderTopWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconBadgeContainer: {
    position: 'relative',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  tabBadge: {
    position: 'absolute',
    top: 1,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  tabBadgeOverdue: {
    backgroundColor: '#DC2626',
  },
  tabBadgeDueSoon: {
    backgroundColor: '#D97706',
  },
  tabBadgeText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
    lineHeight: 11,
    textAlign: 'center',
  },
  tabLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
