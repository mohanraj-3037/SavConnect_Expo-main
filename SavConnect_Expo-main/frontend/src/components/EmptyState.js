import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * Global empty state component for lists — theme-aware.
 * @param {object} props
 * @param {string} props.icon     - MaterialCommunityIcons name
 * @param {string} props.title    - Main title
 * @param {string} props.message  - Descriptive message
 */
export default function EmptyState({ icon, title, message }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={56} color={colors.textLight} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xxl * 1.5,
  },
  icon: { marginBottom: SPACING.md },
  title: { ...TYPOGRAPHY.h3, marginBottom: SPACING.sm, textAlign: 'center' },
  message: { ...TYPOGRAPHY.body, textAlign: 'center' },
});
