import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, radius } from '@/theme/tokens';

import { AppText, MAX_FONT_SCALE } from './AppText';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
}

export function TextField({ label, error, hint, style, ...rest }: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="caption" color={colors.text.secondary}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.text.tertiary}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        {...rest}
        style={[styles.input, !!error && styles.inputError, style]}
      />
      {error ? (
        <AppText variant="caption" color={colors.feedback.danger}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={colors.text.tertiary}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.card,
    paddingHorizontal: 14,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text.primary,
  },
  inputError: { borderColor: colors.feedback.danger },
});
