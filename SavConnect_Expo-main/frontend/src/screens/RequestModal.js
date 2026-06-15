import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../lib/api';

export default function RequestModal({ route, navigation }) {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactPreference, setContactPreference] = useState('email'); // 'email' | 'whatsapp'
  const [loading, setLoading] = useState(false);

  const opportunity = route?.params?.opportunity;
  const currentUser = route?.params?.currentUser;
  const opportunityTitle = opportunity?.title ?? 'this opportunity';

  // FastAPI 422 returns detail as an array [{loc, msg, type}], not a plain string.
  const parseError = (detail) => {
    if (!detail) return 'Failed to send request.';
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(e => `${e.loc?.slice(-1)[0] ?? 'field'}: ${e.msg}`).join('\n');
    }
    return JSON.stringify(detail);
  };

  const isFormValid =
    message.trim().length >= 10 &&
    contactEmail.trim().length > 3 &&
    contactEmail.includes('@') &&
    contactPhone.trim().length >= 7;

  const handleSend = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_URL}/request-to-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunity.id,
          applicant_id: currentUser.id,
          message: message.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim(),
          contact_preference: contactPreference,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(parseError(data.detail));
      }

      const posterName = opportunity?.profiles?.full_name || 'the organiser';
      Alert.alert('Request Sent 🎉', `Your join request has been sent to ${posterName}.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err.name === 'AbortError'
        ? 'Request timed out. Check your connection.'
        : err.message || 'Something went wrong.';
      Alert.alert('Send Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Contact Preference Toggle ───────────────────────────────────────────
  const ToggleOption = ({ value, icon, label }) => {
    const isActive = contactPreference === value;
    return (
      <TouchableOpacity
        style={[
          styles.toggleOption,
          {
            backgroundColor: isActive ? colors.accent : colors.surfaceVariant,
            borderColor: isActive ? colors.accent : colors.border,
          },
        ]}
        onPress={() => setContactPreference(value)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color={isActive ? '#FFFFFF' : colors.textSecondary}
        />
        <Text style={[styles.toggleLabel, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: colors.surface }]}>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text }]}>Request to Join</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Applying for "{opportunityTitle}"
            </Text>

            {/* ── Message ─────────────────────────────────────────────────── */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Your Message *</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.accent}
              outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
              multiline
              numberOfLines={4}
              placeholder="Introduce yourself and explain why you'd be a great fit…"
              style={[styles.input, styles.textArea, { backgroundColor: colors.surface }]}
              theme={{
                colors: {
                  text: colors.text,
                  onSurface: colors.text,
                  onSurfaceVariant: colors.textSecondary,
                  primary: colors.accent,
                  placeholder: '#888888',
                  background: colors.surface,
                  surface: colors.surface,
                },
              }}
            />
            <Text style={[styles.hint, { color: colors.textLight }]}>Minimum 10 characters</Text>

            {/* ── Contact Email ────────────────────────────────────────────── */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Contact Email *</Text>
            <TextInput
              value={contactEmail}
              onChangeText={setContactEmail}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.accent}
              outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="your@email.com"
              left={<TextInput.Icon icon="email-outline" />}
              style={[styles.input, { backgroundColor: colors.surface }]}
              theme={{
                colors: {
                  text: colors.text,
                  onSurface: colors.text,
                  onSurfaceVariant: colors.textSecondary,
                  primary: colors.accent,
                  placeholder: '#888888',
                  background: colors.surface,
                  surface: colors.surface,
                },
              }}
            />

            {/* ── Contact Phone ────────────────────────────────────────────── */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Contact Number *</Text>
            <TextInput
              value={contactPhone}
              onChangeText={setContactPhone}
              mode="outlined"
              outlineColor={colors.border}
              activeOutlineColor={colors.accent}
              outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
              keyboardType="phone-pad"
              placeholder="+91 98765 43210"
              left={<TextInput.Icon icon="phone-outline" />}
              style={[styles.input, { backgroundColor: colors.surface }]}
              theme={{
                colors: {
                  text: colors.text,
                  onSurface: colors.text,
                  onSurfaceVariant: colors.textSecondary,
                  primary: colors.accent,
                  placeholder: '#888888',
                  background: colors.surface,
                  surface: colors.surface,
                },
              }}
            />

            {/* ── Preferred Contact Method ─────────────────────────────────── */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Preferred Contact Method</Text>
            <View style={styles.toggleRow}>
              <ToggleOption value="email" icon="email-outline" label="Email" />
              <ToggleOption value="whatsapp" icon="whatsapp" label="WhatsApp" />
            </View>

            {/* ── Send Button ──────────────────────────────────────────────── */}
            <Button
              mode="contained"
              onPress={handleSend}
              loading={loading}
              disabled={!isFormValid || loading}
              buttonColor={colors.accent}
              textColor="#FFFFFF"
              labelStyle={TYPOGRAPHY.button}
              contentStyle={styles.buttonContent}
              style={[styles.sendButton, { opacity: isFormValid ? 1 : 0.6 }]}
            >
              {loading ? 'Sending…' : 'Send Request'}
            </Button>

            <Button
              mode="text"
              textColor={colors.textSecondary}
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    marginBottom: SPACING.xs,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SPACING.sm,
  },

  // ─── Preference toggle ────────────────────────────────────────────────────
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xs,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
  },
  toggleLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },

  sendButton: {
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  buttonContent: { height: 50 },
  cancelButton: { marginTop: SPACING.xs },
});
