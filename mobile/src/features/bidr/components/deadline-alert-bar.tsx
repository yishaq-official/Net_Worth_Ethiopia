import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BellRingIcon, AlertCircleIcon, ArrowRightIcon } from '@/components/icons';
import type { DebtFilterStatus } from '@/types/bidr';

interface DeadlineAlertBarProps {
  insights: {
    overdueCount: number;
    overdueTotal: number;
    dueWithinWeekCount: number;
    dueWithinWeekTotal: number;
    hasAlerts: boolean;
  };
  onSelectFilter: (filter: DebtFilterStatus) => void;
}

export function DeadlineAlertBar({ insights, onSelectFilter }: DeadlineAlertBarProps) {

  if (!insights.hasAlerts) {
    return null;
  }

  const isOverdueUrgent = insights.overdueCount > 0;

  return (
    <View className="px-4 py-2">
      <View
        style={[
          styles.container,
          {
            backgroundColor: isOverdueUrgent ? 'rgba(239, 68, 68, 0.08)' : 'rgba(217, 119, 6, 0.08)',
            borderColor: isOverdueUrgent ? 'rgba(239, 68, 68, 0.25)' : 'rgba(217, 119, 6, 0.25)',
          },
        ]}
      >
        <View className="flex-row items-center gap-3 flex-1">
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isOverdueUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(217, 119, 6, 0.15)',
              },
            ]}
          >
            {isOverdueUrgent ? (
              <AlertCircleIcon size={18} color="#EF4444" />
            ) : (
              <BellRingIcon size={18} color="#D97706" />
            )}
          </View>

          <View className="flex-1">
            <ThemedText
              className="text-[13px] font-bold tracking-tight"
              style={{ color: isOverdueUrgent ? '#B91C1C' : '#B45309' }}
            >
              {isOverdueUrgent
                ? `${insights.overdueCount} Overdue Credit (${insights.overdueTotal.toLocaleString()} ETB)`
                : '1-Week Payment Deadlines'}
            </ThemedText>

            <ThemedText
              className="text-[11px] font-medium mt-0.5 leading-4"
              style={{ color: isOverdueUrgent ? '#991B1B' : '#92400E' }}
            >
              {insights.dueWithinWeekCount > 0
                ? `${insights.dueWithinWeekCount} customer${insights.dueWithinWeekCount > 1 ? 's' : ''} have payments maturing this week (${insights.dueWithinWeekTotal.toLocaleString()} ETB).`
                : 'Immediate collection follow-up recommended.'}
            </ThemedText>
          </View>
        </View>

        <Pressable
          onPress={() => onSelectFilter(isOverdueUrgent ? 'overdue' : 'due_soon')}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <ThemedText
            className="text-[12px] font-bold"
            style={{ color: isOverdueUrgent ? '#EF4444' : '#D97706' }}
          >
            Review
          </ThemedText>
          <ArrowRightIcon size={14} color={isOverdueUrgent ? '#EF4444' : '#D97706'} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});
