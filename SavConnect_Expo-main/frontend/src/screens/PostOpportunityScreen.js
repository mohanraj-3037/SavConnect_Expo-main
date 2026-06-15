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
import { TextInput, Button, Chip, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { postOpportunity } from '../lib/api';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const SKILL_OPTIONS = [
  'React Native', 'JavaScript', 'Python', 'Java', 'C++',
  'Node.js', 'UI/UX', 'Machine Learning', 'Flutter', 'Firebase',
  'AWS', 'Docker', 'Git', 'MongoDB', 'SQL',
  'Leadership', 'Communication', 'Event Planning', 'Testing',
];

export default function PostOpportunityScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const isFormValid =
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    selectedSkills.length > 0 &&
    location.trim().length >= 2;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      // Get the current user's session (includes the access token for FastAPI auth)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      if (sessionError || !user) {
        Alert.alert('Auth Error', 'You must be logged in to post an opportunity.');
        setLoading(false);
        return;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        skills_required: selectedSkills,
        location: location.trim(),
        posted_by: user.id,
      };

      try {
        // Primary path: route through FastAPI backend for server-side validation
        await postOpportunity(payload, session?.access_token);
      } catch (backendErr) {
        console.warn('[PostOpportunity] FastAPI unavailable, falling back to Supabase direct insert:', backendErr.message);
        // Fallback: write directly to Supabase if backend is down
        const { error: dbError } = await supabase.from('opportunities').insert(payload);
        if (dbError) throw dbError;
      }

      Alert.alert('Success', 'Post is live!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Main', { screen: 'Feed' }),
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong.');
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
        <View style={styles.headerRow}>
          <IconButton
            icon="arrow-left"
            iconColor={COLORS.white}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Post Opportunity</Text>
            <Text style={styles.headerSubtitle}>Find the right teammates</Text>
          </View>
        </View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Project Name */}
            <TextInput
              label="Project / Event Name"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.accent}
              outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
              left={<TextInput.Icon icon="briefcase-outline" />}
              style={styles.input}
              placeholder="e.g. Hackathon Team Needed"
            />

            {/* Description */}
            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.accent}
              outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
              left={<TextInput.Icon icon="text-box-outline" />}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.multiline]}
              placeholder="Describe what you're looking for…"
            />

            {/* Skills Required */}
            <Text style={styles.label}>
              Skills Required ({selectedSkills.length} selected)
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

            {/* Location */}
            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.accent}
              outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
              left={<TextInput.Icon icon="map-marker-outline" />}
              style={styles.input}
              placeholder="e.g. Lab Block 3 or Virtual"
            />

            {/* Submit */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={!isFormValid || loading}
              buttonColor={COLORS.accent}
              textColor={COLORS.white}
              labelStyle={TYPOGRAPHY.button}
              contentStyle={styles.buttonContent}
              style={styles.button}
            >
              {loading ? 'Posting…' : 'Post Opportunity'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  header: {
    paddingTop: 44,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.md,
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.white },
  headerSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  headerCurve: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 28,
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
  input: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  label: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
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
  button: {
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  buttonContent: { height: 50 },
});
