import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// ─── Quick-action card (navigates to a tab or stack screen) ──────────────────
function QuickCard({ icon, emoji, title, desc, onPress, scale, gradient }) {
  const { colors } = useTheme();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.bigCard}
      >
        <LinearGradient
          colors={gradient}
          style={styles.bigCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.bigCardEmoji}>{emoji}</Text>
          <Text style={styles.bigCardTitle}>{title}</Text>
          <Text style={styles.bigCardDesc}>{desc}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Shortcut tile (small card row) ──────────────────────────────────────────
function ShortcutTile({ icon, label, onPress, colors }) {
  return (
    <TouchableOpacity
      style={[styles.shortcutTile, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.shortcutIconWrap, { backgroundColor: colors.accent + '22' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={colors.accent} />
      </View>
      <Text style={[styles.shortcutLabel, { color: colors.text }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textLight} />
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const scaleFind = useRef(new Animated.Value(1)).current;
  const scalePost = useRef(new Animated.Value(1)).current;

  const animatePress = (scale) => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Gradient header */}
      <LinearGradient
        colors={['#1B1F3B', '#2A3060']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.greeting}>Welcome, Savanite! 👋</Text>
        <Text style={styles.headerSub}>Your collaboration hub</Text>
        <View style={[styles.headerCurve, { backgroundColor: colors.background }]} />
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Main action cards ─────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>QUICK ACTIONS</Text>

        <QuickCard
          scale={scaleFind}
          emoji="🔍"
          title="Find Opportunities"
          desc="Discover projects & events matching your skills"
          gradient={[colors.accent, '#009B8D']}
          onPress={() => {
            animatePress(scaleFind);
            navigation.navigate('Feed');
          }}
        />

        <QuickCard
          scale={scalePost}
          emoji="📢"
          title="Post Opportunity"
          desc="Create a project and recruit the perfect team"
          gradient={['#1B1F3B', '#2A3060']}
          onPress={() => {
            animatePress(scalePost);
            navigation.getParent()?.navigate('PostOpportunity');
          }}
        />

        {/* ── Shortcuts row ────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: SPACING.sm }]}>
          MANAGE
        </Text>

        <ShortcutTile
          icon="file-document-outline"
          label="My Applications"
          onPress={() => navigation.navigate('MyApps')}
          colors={colors}
        />
        <ShortcutTile
          icon="inbox-multiple-outline"
          label="Incoming Requests"
          onPress={() => navigation.navigate('Requests')}
          colors={colors}
        />

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 44,
    paddingHorizontal: SPACING.lg,
  },
  greeting: { ...TYPOGRAPHY.h1, color: '#FFFFFF', marginBottom: SPACING.xs },
  headerSub: { ...TYPOGRAPHY.body, color: 'rgba(255,255,255,0.75)' },
  headerCurve: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 32,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },

  sectionLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: -SPACING.xs,
  },

  // ─── Big cards ────────────────────────────────────────────────────────────
  bigCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  bigCardGradient: {
    padding: SPACING.xl,
    minHeight: 160,
    justifyContent: 'center',
  },
  bigCardEmoji: { fontSize: 38, marginBottom: SPACING.sm },
  bigCardTitle: { ...TYPOGRAPHY.h2, color: '#FFFFFF', marginBottom: SPACING.xs },
  bigCardDesc: { ...TYPOGRAPHY.body, color: 'rgba(255,255,255,0.82)' },

  // ─── Shortcut tiles ───────────────────────────────────────────────────────
  shortcutTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  shortcutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: { ...TYPOGRAPHY.subtitle, flex: 1 },
});
