import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from './theme';

export const HRMSTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  icon,
  error,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    color: COLORS.text,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.card,
    height: 48,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  iconContainer: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontFamily: FONTS.regular,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.xs,
    marginTop: 4,
    fontFamily: FONTS.regular,
  }
});
