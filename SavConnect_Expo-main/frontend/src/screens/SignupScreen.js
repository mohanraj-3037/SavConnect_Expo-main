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

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

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
  const passwordsMatch = password === confirmPassword;
  const confirmError =
    confirmTouched && !passwordsMatch ? 'Passwords do not match.' : null;
  const isFormValid =
    !getEmailError(email) && password.length >= 6 && passwordsMatch;

  const handleSignup = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Supabase may return explicit "User already registered" in some configs
        const msg = error.message || '';
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
          Alert.alert(
            'User Already Exists',
            'An account with this email already exists. Please try logging in instead.',
            [
              { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
              { text: 'OK', style: 'cancel' },
            ]
          );
        } else {
          Alert.alert('Signup Failed', msg);
        }
      } else if (data?.user?.identities?.length === 0) {
        // Supabase leak-protection OFF: returns user with empty identities
        Alert.alert(
          'User Already Exists',
          'An account with this email already exists. Please try logging in instead.',
          [
            { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
            { text: 'OK', style: 'cancel' },
          ]
        );
      } else {
        // Signup succeeded — email confirmation is disabled,
        // so we always get a session immediately.
        const session = data?.session;
        const userId = data?.user?.id;

        if (userId) {
          navigation.navigate('Onboarding', { userId: userId, session: session });
        } else {
          navigation.navigate('Login');
        }
      }
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
          <Text style={styles.brandIcon}>🚀</Text>
          <Text style={styles.brandName}>Create Account</Text>
          <Text style={styles.brandTagline}>Join the Saveetha network</Text>
        </View>
        <View style={styles.headerCurve} />
      </LinearGradient>

      {/* Form */}
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
            <Text style={styles.cardTitle}>Sign Up</Text>
            <Text style={styles.cardSubtitle}>
              Use your official Saveetha email
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
            <HelperText
              type="info"
              visible={password.length > 0 && password.length < 6}
              style={styles.helper}
            >
              Password must be at least 6 characters.
            </HelperText>

            {/* Confirm Password */}
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={() => setConfirmTouched(true)}
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock-check-outline" />}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={confirmError ? COLORS.error : COLORS.accent}
              outlineStyle={{ borderRadius: BORDER_RADIUS.md }}
              style={styles.input}
              error={!!confirmError}
            />
            <HelperText type="error" visible={!!confirmError} style={styles.helper}>
              {confirmError}
            </HelperText>

            {/* Submit */}
            <Button
              mode="contained"
              onPress={handleSignup}
              loading={loading}
              disabled={!isFormValid || loading}
              buttonColor={COLORS.accent}
              textColor={COLORS.white}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
              style={styles.button}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </Button>

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
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
  header: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 36,
  },
  headerContent: { alignItems: 'center', zIndex: 2 },
  brandIcon: { fontSize: 44, marginBottom: SPACING.sm },
  brandName: { ...TYPOGRAPHY.h2, color: COLORS.white },
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
    height: 36,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  scrollContent: {
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
  input: { backgroundColor: COLORS.surface, marginBottom: 2 },
  helper: { marginBottom: SPACING.sm, paddingHorizontal: 0 },
  button: { borderRadius: BORDER_RADIUS.md, marginTop: SPACING.sm, marginBottom: SPACING.lg },
  buttonContent: { height: 50 },
  buttonLabel: { ...TYPOGRAPHY.button },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  loginLink: { ...TYPOGRAPHY.body, color: COLORS.accent, fontWeight: '700' },
});
