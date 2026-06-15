import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { getEmailError } from '../components/DomainValidator';
import { supabase } from '../lib/supabase';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const emailError = emailTouched ? getEmailError(email) : null;
  const isFormValid = !getEmailError(email) && password.length >= 6;

  const handleLogin = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        Alert.alert('Auth Error', error.message);
      }
      // On success, RootNavigator detects the session change and switches automatically
    } catch (err) {
      Alert.alert('Auth Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Gradient Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.brandIcon}>🎓</Text>
          <Text style={styles.brandName}>SavConnect</Text>
          <Text style={styles.brandTagline}>Campus Networking Hub</Text>
        </View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      {/* Form Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>
              Sign in with your Saveetha email
            </Text>

            {/* Email */}
            <TextInput
              label="College Email"
              value={email}
              onChangeText={setEmail}
              onBlur={() => setEmailTouched(true)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              left={<TextInput.Icon icon="email-outline" />}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={emailError ? COLORS.error : COLORS.accent}
              outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
              style={styles.input}
              error={!!emailError}
            />
            <HelperText type="error" visible={!!emailError} style={styles.helper}>
              {emailError}
            </HelperText>

            {/* Password */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.accent}
              outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
              style={styles.input}
            />

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={!isFormValid || loading}
              buttonColor={COLORS.accent}
              textColor={COLORS.white}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
              style={styles.button}
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </Button>

            {/* Sign Up Link */}
            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },

  /* ── Header ────────────────────────────── */
  header: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  headerContent: { alignItems: 'center', zIndex: 2 },
  brandIcon: { fontSize: 48, marginBottom: SPACING.sm },
  brandName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    fontSize: 32,
  },
  brandTagline: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.75)',
    marginTop: SPACING.xs,
  },
  headerCurve: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  /* ── Form Card ─────────────────────────── */
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: -SPACING.md,
    ...SHADOWS.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginBottom: 2,
  },
  helper: {
    marginBottom: SPACING.sm,
    paddingHorizontal: 0,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  forgotText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
    fontWeight: '600',
  },
  button: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  buttonContent: { height: 50 },
  buttonLabel: { ...TYPOGRAPHY.button },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  signUpLink: {
    ...TYPOGRAPHY.body,
    color: COLORS.accent,
    fontWeight: '700',
  },
});
