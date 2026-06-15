import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Switch,
  TouchableOpacity,
  TextInput as RNTextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, Button, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { updateProfile } from '../lib/api';

const PREDEFINED_SKILLS = [
  'React Native', 'JavaScript', 'Python', 'Java', 'C++',
  'Node.js', 'UI/UX', 'Machine Learning', 'Flutter', 'Firebase',
  'AWS', 'Docker', 'Git', 'MongoDB', 'SQL',
];

export default function ProfileScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();

  // Derive high-contrast text color per spec:
  // Dark mode → white, Light mode → deep navy
  const strongText = isDarkMode ? '#FFFFFF' : '#1A237E';
  const mutedText  = isDarkMode ? '#AAAAAA' : '#6B7280';

  // ─── Profile state ────────────────────────────────────────────────────────
  const [name, setName]                   = useState('');
  const [year, setYear]                   = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [available, setAvailable]         = useState(true);
  const [isEditMode, setIsEditMode]       = useState(false);
  const [saving, setSaving]               = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // ─── Add-custom-skill state ───────────────────────────────────────────────
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [showCustomInput, setShowCustomInput]   = useState(false);

  // ─── Load profile ─────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.warn('[Profile] Auth error:', authError?.message);
        setProfileLoading(false);
        return;
      }
      const userId = authData.user.id;

      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('full_name, year_of_study, skills, availability')
        .eq('id', userId)
        .single();

      if (dbError) {
        if (dbError.code !== 'PGRST116') {
          console.warn('[Profile] DB error:', dbError.message);
        }
      } else if (data) {
        setName(data.full_name || '');
        setYear(data.year_of_study != null ? String(data.year_of_study) : '');
        setSelectedSkills(Array.isArray(data.skills) ? data.skills : []);
        setAvailable(data.availability ?? true);
      }
    } catch (err) {
      console.warn('[Profile] Load error:', err?.message);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useFocusEffect(useCallback(() => { loadProfile(); }, [loadProfile]));

  const allSkills = [
    ...PREDEFINED_SKILLS,
    ...selectedSkills.filter((s) => !PREDEFINED_SKILLS.includes(s)),
  ];

  const toggleSkill = (skill) => {
    if (!isEditMode) return;
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
    }
    setCustomSkillInput('');
    setShowCustomInput(false);
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const { data: sessionData } = await supabase.auth.getSession();

      if (authError || !authData?.user) {
        Alert.alert('Session Expired', 'Please log in again.');
        await supabase.auth.signOut();
        return;
      }

      const profilePayload = {
        id: authData.user.id,
        full_name: name,
        year_of_study: year,
        skills: selectedSkills,
        availability: available,
      };

      try {
        await updateProfile(profilePayload, sessionData?.session?.access_token);
      } catch (backendErr) {
        // Backend unreachable — write directly to Supabase
        const { error: dbError } = await supabase.from('profiles').upsert(profilePayload);
        if (dbError) throw dbError;
      }

      Alert.alert('Saved ✅', 'Profile saved successfully!');
      setIsEditMode(false);
    } catch (error) {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Shared TextInput theme ───────────────────────────────────────────────
  const inputTheme = {
    colors: {
      onSurface: strongText,
      onSurfaceVariant: mutedText,
      primary: colors.accent,
      placeholder: '#888888',
      background: colors.surface,
      surface: colors.surface,
    },
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* ── Hero banner: name in bold white on teal gradient ── */}
      <LinearGradient
        colors={['#1B1F3B', '#00BFA5']}
        style={styles.heroBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.heroInner}>
          <View style={styles.heroRow}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>
                {name ? name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              {profileLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.heroName} numberOfLines={1}>
                    {name || 'Set your name'}
                  </Text>
                  <Text style={styles.heroYear}>
                    {year ? `Year ${year}` : 'Year of Study not set'} •{' '}
                    <Text style={{ color: available ? '#A5D6A7' : '#EF9A9A' }}>
                      {available ? '✓ Available' : '✗ Busy'}
                    </Text>
                  </Text>
                </>
              )}
            </View>
            {/* Pencil edit toggle */}
            <TouchableOpacity
              style={[
                styles.editToggleBtn,
                { backgroundColor: isEditMode ? colors.accent : 'rgba(255,255,255,0.2)' },
              ]}
              onPress={() => {
                if (isEditMode) {
                  Alert.alert('Discard Changes?', 'Exit without saving?', [
                    { text: 'Keep Editing', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => setIsEditMode(false) },
                  ]);
                } else {
                  setIsEditMode(true);
                }
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={isEditMode ? 'close' : 'pencil-outline'}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {profileLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: mutedText }]}>
            Loading your profile…
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
        >
          {/* ─── Basic Info ─────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: strongText }]}>Basic Information</Text>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={isEditMode ? setName : undefined}
              mode="outlined"
              outlineColor={isEditMode ? colors.border : 'transparent'}
              activeOutlineColor={colors.accent}
              outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
              left={<TextInput.Icon icon="account-outline" />}
              textColor={strongText}
              style={[styles.input, { backgroundColor: isEditMode ? colors.surface : colors.surfaceVariant }]}
              theme={inputTheme}
            />
            <TextInput
              label="Year of Study"
              value={year}
              onChangeText={isEditMode ? setYear : undefined}
              mode="outlined"
              outlineColor={isEditMode ? colors.border : 'transparent'}
              activeOutlineColor={colors.accent}
              outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
              left={<TextInput.Icon icon="school-outline" />}
              keyboardType="number-pad"
              placeholder="e.g. 2"
              textColor={strongText}
              style={[styles.input, { backgroundColor: isEditMode ? colors.surface : colors.surfaceVariant }]}
              theme={inputTheme}
            />
          </View>

          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* ─── Skills ─────────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: strongText }]}>Skills</Text>
            {isEditMode && (
              <Text style={[styles.sectionHint, { color: mutedText }]}>
                Tap to select / deselect ({selectedSkills.length} selected)
              </Text>
            )}
            <View style={styles.chipGrid}>
              {allSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <Chip
                    key={skill}
                    selected={isSelected}
                    onPress={() => toggleSkill(skill)}
                    style={[
                      styles.skillChip,
                      {
                        backgroundColor: isSelected ? colors.accent : colors.surfaceVariant,
                        opacity: !isEditMode && !isSelected ? 0.55 : 1,
                      },
                    ]}
                    textStyle={{ color: isSelected ? '#FFFFFF' : strongText, ...TYPOGRAPHY.caption }}
                    showSelectedOverlay={false}
                  >
                    {skill}
                  </Chip>
                );
              })}
              {isEditMode && !showCustomInput && (
                <TouchableOpacity
                  style={[styles.addSkillChip, { borderColor: colors.accent }]}
                  onPress={() => setShowCustomInput(true)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="plus" size={14} color={colors.accent} />
                  <Text style={[styles.addSkillText, { color: colors.accent }]}>Add Skill</Text>
                </TouchableOpacity>
              )}
            </View>
            {isEditMode && showCustomInput && (
              <View style={[styles.customSkillRow, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <RNTextInput
                  value={customSkillInput}
                  onChangeText={setCustomSkillInput}
                  placeholder="Type a skill…"
                  placeholderTextColor="#888888"
                  style={[styles.customSkillInput, { color: strongText }]}
                  autoFocus
                  onSubmitEditing={addCustomSkill}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={addCustomSkill} style={[styles.customSkillAdd, { backgroundColor: colors.accent }]}>
                  <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowCustomInput(false); setCustomSkillInput(''); }}>
                  <MaterialCommunityIcons name="close" size={18} color={mutedText} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* ─── Availability ────────────────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: strongText }]}>Availability</Text>
            <View style={styles.availRow}>
              <Chip
                selected={available}
                onPress={() => isEditMode && setAvailable(true)}
                style={[styles.availChip, { backgroundColor: available ? '#43A047' : colors.surfaceVariant }]}
                textStyle={{ color: available ? '#FFFFFF' : strongText, ...TYPOGRAPHY.caption }}
                showSelectedOverlay={false}
              >
                ✅ Available
              </Chip>
              <Chip
                selected={!available}
                onPress={() => isEditMode && setAvailable(false)}
                style={[styles.availChip, { backgroundColor: !available ? '#E53935' : colors.surfaceVariant }]}
                textStyle={{ color: !available ? '#FFFFFF' : strongText, ...TYPOGRAPHY.caption }}
                showSelectedOverlay={false}
              >
                🚫 Busy
              </Chip>
            </View>
          </View>

          {isEditMode && (
            <Button
              mode="contained"
              buttonColor={colors.accent}
              textColor="#FFFFFF"
              style={styles.saveButton}
              contentStyle={styles.btnContent}
              labelStyle={TYPOGRAPHY.button}
              loading={saving}
              disabled={saving}
              onPress={handleSave}
            >
              Save Profile
            </Button>
          )}

          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* ─── Preferences (Dark Mode) ─────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: strongText }]}>Preferences</Text>
            <View style={[styles.preferenceRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.preferenceLeft}>
                <Text style={styles.preferenceIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
                <View>
                  <Text style={[styles.preferenceLabel, { color: strongText }]}>Dark Mode</Text>
                  <Text style={[styles.preferenceDesc, { color: mutedText }]}>
                    {isDarkMode ? 'Currently dark theme' : 'Currently light theme'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D5DB', true: colors.accent }}
                thumbColor={isDarkMode ? '#FFFFFF' : '#F5F7FA'}
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          </View>

          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* ─── Sign Out ────────────────────────────────────────────────── */}
          <Button
            mode="outlined"
            textColor="#E53935"
            style={[styles.signOutButton, { borderColor: '#E53935' }]}
            contentStyle={styles.btnContent}
            labelStyle={TYPOGRAPHY.button}
            icon="logout"
            onPress={() => {
              Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: async () => { await supabase.auth.signOut(); },
                },
              ]);
            }}
          >
            Sign Out
          </Button>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ─── Hero banner ──────────────────────────────────────────────────────────
  heroBanner: { paddingBottom: SPACING.lg },
  heroInner: { paddingTop: 8 },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: SPACING.md,
  },
  heroAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroName: {
    ...TYPOGRAPHY.h3,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroYear: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  editToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Loading ──────────────────────────────────────────────────────────────
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: { ...TYPOGRAPHY.bodySmall, marginTop: SPACING.sm },

  // ─── Scroll content ───────────────────────────────────────────────────────
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  section: { marginBottom: SPACING.md },
  sectionTitle: { ...TYPOGRAPHY.subtitle, marginBottom: SPACING.sm, fontWeight: '700' },
  sectionHint: { ...TYPOGRAPHY.bodySmall, marginBottom: SPACING.sm },
  input: { marginBottom: SPACING.sm },
  divider: { marginVertical: SPACING.md },

  // ─── Skill chips ──────────────────────────────────────────────────────────
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  skillChip: { borderRadius: BORDER_RADIUS.full },
  addSkillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  addSkillText: { ...TYPOGRAPHY.caption, fontWeight: '600' },
  customSkillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  customSkillInput: { flex: 1, ...TYPOGRAPHY.body, paddingVertical: 4 },
  customSkillAdd: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },

  // ─── Availability ─────────────────────────────────────────────────────────
  availRow: { flexDirection: 'row', gap: SPACING.sm },
  availChip: { borderRadius: BORDER_RADIUS.full },

  // ─── Buttons ──────────────────────────────────────────────────────────────
  saveButton: { borderRadius: BORDER_RADIUS.md, marginTop: SPACING.md, marginBottom: SPACING.sm },
  signOutButton: { borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.xl },
  btnContent: { height: 50 },

  // ─── Preferences ──────────────────────────────────────────────────────────
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    ...SHADOWS.sm,
  },
  preferenceLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  preferenceIcon: { fontSize: 24 },
  preferenceLabel: { ...TYPOGRAPHY.subtitle, marginBottom: 2, fontWeight: '600' },
  preferenceDesc: { ...TYPOGRAPHY.bodySmall },
});
