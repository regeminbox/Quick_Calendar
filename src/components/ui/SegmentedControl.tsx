import { Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, radius } from '@/theme/tokens';

import { AppText } from './AppText';

export interface SegmentOption<T extends string> {
  key: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && styles.active]}>
            <AppText style={styles.label} color={active ? colors.text.primary : colors.text.secondary}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: colors.surface.muted, borderRadius: radius.pill, padding: 3 },
  item: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  active: { backgroundColor: colors.surface.card, borderWidth: 1, borderColor: colors.surface.border },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18 },
});
