import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ViewStyle, TextStyle, ScrollView,
} from 'react-native';
import { colors, radius, spacing, typography } from '../lib/theme';

export const Card: React.FC<{ children: React.ReactNode; style?: ViewStyle; accent?: string }> = ({ children, style, accent }) => (
  <View style={[styles.card, accent ? { borderLeftWidth: 4, borderLeftColor: accent } : null, style]}>{children}</View>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({ children, style }) => (
  <Text style={[styles.sectionTitle, style]}>{children}</Text>
);

export const Badge: React.FC<{ label: string; color?: string; bg?: string }> = ({ label, color = colors.text, bg = colors.cardElevated }) => (
  <View style={[styles.badge, { backgroundColor: bg }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

export const Button: React.FC<{
  label: string; onPress?: () => void; variant?: 'primary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg'; style?: ViewStyle; testID?: string; disabled?: boolean;
}> = ({ label, onPress, variant = 'primary', size = 'md', style, testID, disabled }) => {
  const padV = size === 'sm' ? 8 : size === 'lg' ? 14 : 11;
  const padH = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;
  const fs = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;
  let bg: string = colors.primary, fg: string = colors.primaryFg, border: string = colors.primary;
  if (variant === 'outline') { bg = 'transparent'; fg = colors.text; border = colors.borderStrong; }
  if (variant === 'ghost') { bg = 'transparent'; fg = colors.primary; border = 'transparent'; }
  if (variant === 'destructive') { bg = colors.destructive; fg = '#1a0a0a'; border = colors.destructive; }
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        { paddingVertical: padV, paddingHorizontal: padH, backgroundColor: bg, borderColor: border, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text style={{ color: fg, fontSize: fs, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
};

export const InputField: React.FC<{
  label?: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  unit?: string; testID?: string;
}> = ({ label, value, onChangeText, placeholder, keyboardType = 'default', unit, testID }) => (
  <View style={{ marginBottom: spacing.sm }}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        keyboardType={keyboardType}
        style={[styles.input, { flex: 1 }]}
      />
      {unit && <Text style={[styles.unit]}>{unit}</Text>}
    </View>
  </View>
);

export const ToggleRow: React.FC<{
  label: string; value: boolean; onValueChange: (v: boolean) => void; testID?: string;
}> = ({ label, value, onValueChange, testID }) => (
  <TouchableOpacity
    testID={testID}
    onPress={() => onValueChange(!value)}
    style={[styles.toggle, value ? { backgroundColor: colors.primarySoft, borderColor: colors.primary } : null]}
    activeOpacity={0.7}
  >
    <View style={[styles.checkbox, value ? { backgroundColor: colors.primary, borderColor: colors.primary } : null]}>
      {value && <Text style={{ color: colors.primaryFg, fontSize: 11, fontWeight: '900' }}>✓</Text>}
    </View>
    <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>{label}</Text>
  </TouchableOpacity>
);

export const Pill: React.FC<{ label: string; color?: string; bg?: string; onRemove?: () => void }> = ({ label, color = colors.text, bg = colors.cardElevated, onRemove }) => (
  <View style={[styles.pill, { backgroundColor: bg }]}>
    <Text style={{ color, fontSize: 11 }}>{label}</Text>
    {onRemove && (
      <TouchableOpacity onPress={onRemove} style={{ marginLeft: 6 }}>
        <Text style={{ color, fontSize: 12 }}>×</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const ScreenContainer: React.FC<{ children: React.ReactNode; testID?: string }> = ({ children, testID }) => (
  <ScrollView
    testID={testID}
    style={{ flex: 1, backgroundColor: colors.background }}
    contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >
    {children}
  </ScrollView>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '600' },
  btn: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: { ...typography.caption, marginBottom: 4 },
  input: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: colors.text,
    fontSize: 14,
  },
  unit: { color: colors.textMuted, fontSize: 12, marginLeft: 8 },
  toggle: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 9, paddingHorizontal: 10, borderRadius: radius.md,
    backgroundColor: colors.cardElevated, borderWidth: 1, borderColor: colors.border,
    marginBottom: 6,
  },
  checkbox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
    borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, marginRight: 6, marginBottom: 6,
  },
});
