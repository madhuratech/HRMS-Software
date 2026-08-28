import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, FONTS } from './theme';

export const HRMSButton = ({ 
  title, 
  onPress, 
  variant = 'primary', // primary, secondary, danger
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.border;
    switch (variant) {
      case 'primary': return COLORS.primary;
      case 'secondary': return COLORS.card;
      case 'danger': return COLORS.danger;
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textLight;
    switch (variant) {
      case 'primary': return '#ffffff';
      case 'secondary': return COLORS.text;
      case 'danger': return '#ffffff';
      default: return '#ffffff';
    }
  };
  
  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'lg': return { paddingVertical: 14, paddingHorizontal: 24 };
      default: return { paddingVertical: 10, paddingHorizontal: 16 };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getPadding(),
        variant === 'secondary' && styles.secondaryBorder,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && icon}
          <Text style={[
            styles.text, 
            { color: getTextColor(), marginLeft: icon ? 8 : 0 },
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.sm,
    fontWeight: '500',
  }
});
