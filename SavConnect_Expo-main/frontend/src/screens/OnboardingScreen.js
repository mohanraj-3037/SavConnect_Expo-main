import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const SKILL_OPTIONS = [
  'React Native', 'JavaScript', 'Python', 'Java', 'C++',
  'Node.js', 'UI/UX', 'Machine Learning', 'Flutter', 'Firebase',
  'AWS', 'Docker', 'Git', 'MongoDB', 'SQL',
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function OnboardingScreen({ route, navigation }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [personalEmail, setPersonalEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const isFormValid =
    name.trim().length >= 2 &&
    year.length > 0 &&
    selectedSkills.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail.trim());

  const handleContinue = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      let currentUserId = route?.params?.userId;

      // Fallback 1: check local session state
      if (!currentUserId) {
         const { data: { session } } = await supabase.auth.getSession();
         currentUserId = session?.user?.id;
      }

      // Fallback 2: network request to get user
      if (!currentUserId) {
         const { data: { user } } = await supabase.auth.getUser();
         currentUserId = user?.id;
      }

      if (!currentUserId) {
        Alert.alert('Auth Error', `Could not get your user ID. Session missing. Please sign in again.`);
        await supabase.auth.signOut();
        navigation.navigate('Login');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: currentUserId,
        full_name: name.trim(),
        year_of_study: year,
        skills: selectedSkills,
        personal_email: personalEmail.trim().toLowerCase(),
      });

      if (error) {
        Alert.alert('Save Failed', error.message);
      } else {
        // Profile saved — jump into the main app
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerIcon}>✨</Text>
        <Text style={styles.headerTitle}>Set Up Your Profile</Text>
        <Text style={styles.headerSubtitle}>Tell us about yourself</Text>
        <View style={styles.headerCurve} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.card}>
          {/* Name */}
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.accent}
            outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
            left={<TextInput.Icon icon="account-outline" />}
            style={styles.input}
          />

          {/* Year */}
          <Text style={styles.label}>Year of Study</Text>
          <View style={styles.yearRow}>
            {YEAR_OPTIONS.map((y) => (
              <Chip
                key={y}
                selected={year === y}
                onPress={() => setYear(y)}
                style={[styles.yearChip, year === y && styles.yearChipSelected]}
                textStyle={[styles.yearText, year === y && styles.yearTextSelected]}
                showSelectedOverlay={false}
              >
                {y}
              </Chip>
            ))}
          </View>

          {/* Skills */}
          <Text style={styles.label}>
            Your Skills ({selectedSkills.length} selected)
          </Text>
          <View style={styles.chipGrid}>
            {SKILL_OPTIONS.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <Chip
                  key={skill}
                  selected={active}
                  onPress={() => toggleSkill(skill)}
                  style={[styles.skillChip, active && styles.skillChipActive]}
                  textStyle={[styles.skillText, active && styles.skillTextActive]}
                  showSelectedOverlay={false}
                >
                  {skill}
                </Chip>
              );
            })}
          </View>

          {/* Personal Email */}
          <TextInput
            label="Personal Email"
            value={personalEmail}
            onChangeText={setPersonalEmail}
            mode="outlined"
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.accent}
            outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
            left={<TextInput.Icon icon="email-heart-outline" />}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Your personal (non-college) email"
            style={styles.input}
          />
          <Text style={styles.hint}>
            We'll use this to send you join-request notifications.
          </Text>

          {/* Continue */}
          <Button
            mode="contained"
            onPress={handleContinue}
            loading={loading}
            disabled={!isFormValid || loading}
            buttonColor={COLORS.accent}
            textColor={COLORS.white}
            labelStyle={TYPOGRAPHY.button}
            contentStyle={styles.buttonContent}
            style={styles.button}
          >
            {loading ? 'Saving…' : 'Continue'}
          </Button>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 56,
    paddingBottom: 44,
    alignItems: 'center',
  },
  headerIcon: { fontSize: 40, marginBottom: SPACING.sm },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.white },
  headerSubtitle: { ...TYPOGRAPHY.bodySmall, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  headerCurve: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: -SPACING.sm,
    ...SHADOWS.md,
  },
  input: { backgroundColor: COLORS.surface, marginBottom: SPACING.md },
  label: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  yearRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  yearChip: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: BORDER_RADIUS.full,
  },
  yearChipSelected: { backgroundColor: COLORS.primary },
  yearText: { ...TYPOGRAPHY.caption, color: COLORS.text },
  yearTextSelected: { color: COLORS.white },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  skillChip: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: BORDER_RADIUS.full,
  },
  skillChipActive: { backgroundColor: COLORS.accent },
  skillText: { ...TYPOGRAPHY.caption, color: COLORS.text },
  skillTextActive: { color: COLORS.white },
  hint: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textLight,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.lg,
  },
  button: { borderRadius: BORDER_RADIUS.md, marginTop: SPACING.sm },
  buttonContent: { height: 50 },
});
