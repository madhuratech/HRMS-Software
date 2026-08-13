import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES } from './theme';

export const HRMSCard = ({ children, style, noPadding = false }) => {
  return (
    <View style={[styles.card, noPadding && styles.noPadding, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // for Android
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noPadding: {
    padding: 0,
  }
});
