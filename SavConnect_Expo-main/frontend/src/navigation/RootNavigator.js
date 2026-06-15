import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import OnboardingScreen from '../screens/OnboardingScreen';
import RequestModal from '../screens/RequestModal';
import PostOpportunityScreen from '../screens/PostOpportunityScreen';
import { supabase } from '../lib/supabase';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    // Hard timeout — if auth state never resolves or hangs, unlock the UI after 5 seconds.
    const fallbackTimeout = setTimeout(() => {
      setIsLoading((prev) => {
        if (prev) console.warn('[Auth] Timed out waiting for session/profile — unlocking UI.');
        return false;
      });
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await checkProfile(session.user.id);
        } else {
          setIsOnboarded(false);
          setIsLoading(false);
          clearTimeout(fallbackTimeout);
        }
      }
    );

    return () => {
      clearTimeout(fallbackTimeout);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Check if the user already has a profile row in Supabase
  const checkProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      setIsOnboarded(!error && !!data);
    } catch {
      setIsOnboarded(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show a loading spinner while we check the session
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // Not signed in → show Auth screens
  if (!session) {
    return <AuthStack />;
  }

  // Signed in → show Main app (with Onboarding first if no profile yet)
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {!isOnboarded && (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
      <Stack.Screen name="Main" component={MainStack} />
      <Stack.Screen
        name="RequestModal"
        component={RequestModal}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="PostOpportunity"
        component={PostOpportunityScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
