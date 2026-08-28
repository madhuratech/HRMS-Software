import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, FONTS } from './theme';

export const HRMSAvatar = ({ name, photoUrl, size = 40, style }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: COLORS.info, // fallback color
  };

  if (photoUrl && photoUrl.trim() !== '') {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={[styles.container, containerStyle, style]}
      />
    );
  }

  return (
    <View style={[styles.container, containerStyle, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
  },
});
