import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  PanResponder,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore, type ToastPayload, type ToastVariant } from '@/store/toast-store';
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  AwardIcon,
  InfoIcon,
  XIcon,
  ArrowRightIcon,
} from '@/components/icons';

interface VariantTheme {
  icon: (color: string) => React.ReactNode;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

const VARIANT_THEMES: Record<ToastVariant, VariantTheme> = {
  payment: {
    icon: (color) => <CheckCircleIcon size={20} color={color} strokeWidth={2.5} />,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    borderColor: '#86EFAC',
    accentColor: '#15803D',
    badgeBg: '#ECFDF5',
    badgeText: '#065F46',
  },
  warning: {
    icon: (color) => <AlertTriangleIcon size={20} color={color} strokeWidth={2.5} />,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    borderColor: '#FDE68A',
    accentColor: '#B45309',
    badgeBg: '#FFFBEB',
    badgeText: '#B45309',
  },
  milestone: {
    icon: (color) => <AwardIcon size={20} color={color} strokeWidth={2.2} />,
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
    borderColor: '#DDD6FE',
    accentColor: '#6D28D9',
    badgeBg: '#F5F3FF',
    badgeText: '#6D28D9',
  },
  info: {
    icon: (color) => <InfoIcon size={20} color={color} strokeWidth={2.2} />,
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    borderColor: '#BFDBFE',
    accentColor: '#1D4ED8',
    badgeBg: '#EFF6FF',
    badgeText: '#1D4ED8',
  },
};

/**
 * Floating in-app toast notification banner.
 * Positioned above navigation stack, supporting tactile action buttons,
 * swipe-up to dismiss, and rich banking/milestone metadata.
 */
export function InAppToast() {
  const insets = useSafeAreaInsets();
  const activeToast = useToastStore((state) => state.activeToast);
  const dismissToast = useToastStore((state) => state.dismissToast);

  // Keep a local reference to toast payload during exit animation
  const [displayedToast, setDisplayedToast] = useState<ToastPayload | null>(activeToast);

  const translateY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeToast) {
      setDisplayedToast(activeToast);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 75,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -160,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDisplayedToast(null);
      });
    }
  }, [activeToast, translateY, opacity]);

  // Swipe up gesture handler to dismiss toast
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -15 || gestureState.vy < -0.5) {
          dismissToast();
        }
      },
    })
  ).current;

  if (!displayedToast) {
    return null;
  }

  const variant: ToastVariant = displayedToast.variant || 'info';
  const theme = VARIANT_THEMES[variant] || VARIANT_THEMES.info;

  const topOffset = Math.max(insets.top + 8, Platform.OS === 'android' ? 36 : 12);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.overlayContainer,
        {
          top: topOffset,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.card, { borderColor: theme.borderColor }]}>
        {/* Accent indicator stripe on left edge */}
        <View style={[styles.accentStripe, { backgroundColor: theme.accentColor }]} />

        <View style={styles.contentWrapper}>
          {/* Top row: Icon badge, Title, Bank / Category Tag, and Dismiss X */}
          <View style={styles.headerRow}>
            <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
              {theme.icon(theme.iconColor)}
            </View>

            <View style={styles.titleArea}>
              <View style={styles.titleBadgeRow}>
                <Text style={styles.titleText} numberOfLines={1}>
                  {displayedToast.title}
                </Text>
                {displayedToast.bank ? (
                  <View style={[styles.metaBadge, { backgroundColor: theme.badgeBg }]}>
                    <Text style={[styles.metaBadgeText, { color: theme.badgeText }]}>
                      {displayedToast.bank}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.messageText} numberOfLines={2}>
                {displayedToast.message}
              </Text>
            </View>

            <Pressable
              onPress={dismissToast}
              style={styles.closeButton}
              hitSlop={12}
              accessibilityLabel="Dismiss toast"
              accessibilityRole="button"
            >
              <XIcon size={18} color="#94A3B8" />
            </Pressable>
          </View>

          {/* Amount or Reference Highlights */}
          {(displayedToast.amount || displayedToast.reference) && (
            <View style={styles.chipsRow}>
              {displayedToast.amount ? (
                <View style={[styles.amountChip, { backgroundColor: theme.badgeBg }]}>
                  <Text style={[styles.amountChipText, { color: theme.accentColor }]}>
                    {displayedToast.amount}
                  </Text>
                </View>
              ) : null}

              {displayedToast.reference ? (
                <View style={styles.refChip}>
                  <Text style={styles.refChipText} numberOfLines={1}>
                    {displayedToast.reference}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Action Button (e.g., "View & Book", "Review Debts") */}
          {displayedToast.action ? (
            <Pressable
              onPress={() => {
                displayedToast.action?.onPress();
                dismissToast();
              }}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.accentColor },
                pressed && styles.actionButtonPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.actionButtonText}>
                {displayedToast.action.label}
              </Text>
              <ArrowRightIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 14,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  accentStripe: {
    width: 5,
    height: '100%',
  },
  contentWrapper: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  titleText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 15,
    color: '#0F172A',
    lineHeight: 20,
  },
  metaBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginTop: 1,
  },
  closeButton: {
    padding: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingLeft: 48,
  },
  amountChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  amountChipText: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 13,
  },
  refChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  refChipText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    color: '#64748B',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'stretch',
  },
  actionButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  actionButtonText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
