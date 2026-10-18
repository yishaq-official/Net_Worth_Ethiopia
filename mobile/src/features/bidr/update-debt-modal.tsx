import React, { useState, useEffect } from 'react';
import {
  View,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import {
  Edit3Icon,
  XIcon,
  CalendarIcon,
} from '@/components/icons';
import { BIDR_DUE_PRESETS } from '@/constants/bidr';
import type { DebtItem, UpdateDebtPayload } from '@/types/bidr';
import type { SaleStatus } from '@/types/sales';

interface UpdateDebtModalProps {
  visible: boolean;
  debt: DebtItem | null;
  onClose: () => void;
  onConfirm: (id: string, payload: UpdateDebtPayload) => Promise<any>;
}

const getDueRelativeText = (dateStr: string): string => {
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return 'Promised pay date';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays > 1) return `Pay in ${diffDays} days`;
  if (diffDays === -1) return 'Due yesterday (overdue)';
  return `${Math.abs(diffDays)} days overdue`;
};

export function UpdateDebtModal({
  visible,
  debt,
  onClose,
  onConfirm,
}: UpdateDebtModalProps) {
  const colors = useTheme();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<SaleStatus>('pending');
  const [dueDateStr, setDueDateStr] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(7);
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (debt) {
      setCustomerName(debt.customerName || '');
      setCustomerPhone(debt.customerPhone || '');
      setNotes(debt.notes || '');
      setStatus(debt.status);
      if (debt.dueDate) {
        const d = new Date(debt.dueDate);
        setDueDateStr(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      } else {
        setDueDateStr('');
      }
    }
  }, [debt]);

  if (!debt) return null;

  const handleSelectPreset = (days: number) => {
    setSelectedPreset(days);
    setIsCustomDate(false);
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDateStr(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  };

  const handleSelectCustom = () => {
    setSelectedPreset('custom');
    setIsCustomDate(true);
  };

  const adjustDueDateDays = (delta: number) => {
    const parsed = new Date(dueDateStr);
    const baseDate = isNaN(parsed.getTime()) ? new Date() : parsed;
    baseDate.setDate(baseDate.getDate() + delta);
    setDueDateStr(baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    setSelectedPreset('custom');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const parsedDueDate = dueDateStr ? new Date(dueDateStr).toISOString() : null;

      await onConfirm(debt.id, {
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
        dueDate: parsedDueDate,
      });

      onClose();
      Alert.alert('Updated successfully', 'Customer debt record has been updated.');
    } catch (err: any) {
      Alert.alert('Update failed', err?.message || 'Could not update debt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.handleBar} />

          <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <View className="flex-row items-center gap-2">
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(217, 119, 6, 0.08)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Edit3Icon size={16} color="#D97706" />
              </View>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>
                Edit credit record
              </Text>
            </View>

            <Pressable onPress={onClose} hitSlop={8}>
              <XIcon size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Customer Name */}
            <Text style={styles.inputLabel}>Customer name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.backgroundSelected }]}
              placeholder="Customer name"
              placeholderTextColor={colors.textSecondary}
              value={customerName}
              onChangeText={setCustomerName}
            />

            {/* Customer Phone */}
            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.backgroundSelected }]}
              placeholder="e.g. 0912345678"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              value={customerPhone}
              onChangeText={setCustomerPhone}
            />

            {/* Promised Payment Date */}
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.inputLabel}>Promised payment date</Text>
              <View style={styles.duePresetsRow}>
                {BIDR_DUE_PRESETS.map((p) => {
                  const isSelected = selectedPreset === p.days;
                  return (
                    <Pressable
                      key={p.days}
                      onPress={() => handleSelectPreset(p.days)}
                      style={[
                        styles.duePresetChip,
                        {
                          borderColor: isSelected ? '#065F46' : colors.backgroundSelected,
                          backgroundColor: isSelected ? 'rgba(6, 95, 70, 0.08)' : colors.background,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? '#065F46' : colors.textSecondary }}>
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={handleSelectCustom}
                  style={[
                    styles.duePresetChip,
                    {
                      borderColor: selectedPreset === 'custom' ? '#065F46' : colors.backgroundSelected,
                      backgroundColor: selectedPreset === 'custom' ? 'rgba(6, 95, 70, 0.08)' : colors.background,
                    },
                  ]}
                >
                  <View className="flex-row items-center gap-1">
                    <Edit3Icon size={12} color={selectedPreset === 'custom' ? '#065F46' : colors.textSecondary} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: selectedPreset === 'custom' ? '#065F46' : colors.textSecondary }}>
                      Other
                    </Text>
                  </View>
                </Pressable>
              </View>

              <View style={[styles.dueDateCard, { backgroundColor: colors.background, borderColor: colors.backgroundSelected }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CalendarIcon size={15} color="#065F46" />
                    {isCustomDate ? (
                      <TextInput
                        style={[styles.dueDateInput, { color: colors.text }]}
                        value={dueDateStr}
                        onChangeText={(val) => {
                          setDueDateStr(val);
                          setSelectedPreset('custom');
                        }}
                        placeholder="e.g. Sep 25, 2026"
                        placeholderTextColor={colors.textSecondary}
                        autoFocus={selectedPreset === 'custom'}
                      />
                    ) : (
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{dueDateStr || 'Select date'}</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textSecondary, marginTop: 3, marginLeft: 21 }}>
                    {getDueRelativeText(dueDateStr)}
                  </Text>
                </View>

                <View style={styles.dueStepperRow}>
                  <Pressable onPress={() => adjustDueDateDays(-1)} style={[styles.dueStepBtn, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>−</Text>
                  </Pressable>
                  <Pressable onPress={() => adjustDueDateDays(1)} style={[styles.dueStepBtn, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Status Selector */}
            <Text style={styles.inputLabel}>Record status</Text>
            <View style={styles.statusRow}>
              {(['pending', 'settled', 'voided'] as SaleStatus[]).map((s) => {
                const isSelected = status === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setStatus(s)}
                    style={[
                      styles.statusBtn,
                      {
                        borderColor: isSelected
                          ? s === 'settled'
                            ? '#065F46'
                            : s === 'voided'
                            ? '#64748B'
                            : '#D97706'
                          : colors.backgroundSelected,
                        backgroundColor: isSelected
                          ? s === 'settled'
                            ? 'rgba(6, 95, 70, 0.08)'
                            : s === 'voided'
                            ? 'rgba(100, 116, 139, 0.08)'
                            : 'rgba(217, 119, 6, 0.08)'
                          : colors.background,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        textTransform: 'capitalize',
                        color: isSelected
                          ? s === 'settled'
                            ? '#065F46'
                            : s === 'voided'
                            ? '#64748B'
                            : '#D97706'
                          : colors.textSecondary,
                      }}
                    >
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Notes */}
            <Text style={styles.inputLabel}>Terms & notes (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.backgroundSelected, minHeight: 64 }]}
              placeholder="Agreements or repayment notes..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Pressable style={[styles.cancelBtn, { borderColor: colors.backgroundSelected }]} onPress={onClose}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary }}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.submitBtn, { backgroundColor: '#065F46', opacity: isSubmitting ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFF' }}>Save changes</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
  },
  duePresetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  duePresetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  dueDateInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 0,
  },
  dueStepperRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dueStepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
