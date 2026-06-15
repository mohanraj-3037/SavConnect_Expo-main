import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Chip, Card, Button } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { sendJoinRequest } from '../lib/emailjs';
import { API_URL } from '../lib/api';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

function OpportunityCard({ item, onJoin, joining }) {
  const { colors } = useTheme();
  const skills = item.skills_required || [];
  const posterName = item.profiles?.full_name || 'Unknown';
  const dateStr = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            {item.match_score !== undefined && item.match_score >= 75 && (
              <Chip style={styles.topMatchBadge} textStyle={styles.topMatchText} compact>
                ⭐ Top Match
              </Chip>
            )}
          </View>
          <Text style={[styles.cardDate, { color: colors.textLight }]}>{dateStr}</Text>
        </View>
        {item.description ? (
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.chipRow}>
          {skills.map((skill) => (
            <Chip
              key={skill}
              style={[styles.chip, { backgroundColor: colors.surfaceVariant }]}
              textStyle={[styles.chipText, { color: colors.accent }]}
              compact
            >
              {skill}
            </Chip>
          ))}
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>📍 {item.location}</Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>👤 {posterName}</Text>
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button
          mode="contained"
          compact
          buttonColor={colors.accent}
          textColor="#FFFFFF"
          style={styles.joinButton}
          labelStyle={styles.joinLabel}
          loading={joining}
          disabled={joining}
          onPress={() => onJoin(item)}
        >
          {joining ? 'Sending…' : 'Request to Join'}
        </Button>
      </Card.Actions>
    </Card>
  );
}

export default function FeedScreen({ navigation }) {
  const { colors } = useTheme();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  // Fetch opportunities from Backend API or Supabase fallback
  const fetchOpportunities = useCallback(async (userId) => {
    setConnectionError(null);
    // Create a 10-second timeout for the fetch call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      if (userId) {
        const response = await fetch(`${API_URL}/recommendations/${userId}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`Backend error ${response.status}`);
        const data = await response.json();
        setOpportunities(data || []);
      } else {
        clearTimeout(timeoutId);
        const { data, error } = await supabase
          .from('opportunities')
          .select('*, profiles(full_name, personal_email)')
          .order('created_at', { ascending: false });

        if (error) {
          Alert.alert('Fetch Error', error.message);
        } else {
          setOpportunities(data || []);
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError';
      const msg = isTimeout
        ? 'The backend did not respond within 10 seconds. Check that FastAPI is running and your IP is correct.'
        : err.message || 'Failed to load opportunities.';
      setConnectionError(msg);
    }
  }, []);

  // Load current user's profile for join requests
  const loadCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, skills')
          .eq('id', user.id)
          .single();
        if (data) {
          setCurrentUser(data);
          return data.id;
        }
      }
    } catch {
      // silently fail
    }
    return null;
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const userId = await loadCurrentUser();
      await fetchOpportunities(userId);
      setLoading(false);
    };
    init();
  }, [fetchOpportunities, loadCurrentUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOpportunities(currentUser?.id);
    setRefreshing(false);
  };

  const handleJoin = (opportunity) => {
    if (!currentUser) {
      Alert.alert('Profile Missing', 'Please complete your profile before sending requests.');
      return;
    }

    const posterEmail = opportunity.profiles?.personal_email;

    if (!posterEmail) {
      Alert.alert('Error', 'Could not find the poster\'s contact email.');
      return;
    }

    navigation.getParent()?.navigate('RequestModal', {
      opportunity,
      currentUser
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading opportunities…</Text>
      </View>
    );
  }

  // Show connection error state instead of an infinite spinner
  if (connectionError) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.background }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Connection Error</Text>
        <Text style={[styles.errorMsg, { color: colors.textSecondary }]}>{connectionError}</Text>
        <Button
          mode="contained"
          buttonColor={colors.accent}
          textColor="#FFFFFF"
          style={{ marginTop: 16, borderRadius: 8 }}
          onPress={() => {
            setLoading(true);
            const reinit = async () => {
              const userId = await loadCurrentUser();
              await fetchOpportunities(userId);
              setLoading(false);
            };
            reinit();
          }}
        >
          Retry Connection
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Opportunities</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {opportunities.length} available near you
        </Text>
      </View>
      <FlatList
        data={opportunities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <OpportunityCard
            item={item}
            onJoin={handleJoin}
            joining={joiningId === item.id}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Opportunities Yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Be the first! Head to Dashboard → Post Opportunity
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBar: {
    paddingTop: 52,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
  },
  headerTitle: { ...TYPOGRAPHY.h2 },
  headerSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: 2,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  card: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginRight: SPACING.sm,
  },
  cardTitle: {
    ...TYPOGRAPHY.subtitle,
    marginRight: SPACING.xs,
  },
  topMatchBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: BORDER_RADIUS.sm,
    height: 24,
  },
  topMatchText: {
    ...TYPOGRAPHY.caption,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  cardDate: {
    ...TYPOGRAPHY.caption,
  },
  cardDesc: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SPACING.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  chip: {
    borderRadius: BORDER_RADIUS.full,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaText: {
    ...TYPOGRAPHY.bodySmall,
  },
  cardActions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  joinButton: {
    borderRadius: BORDER_RADIUS.sm,
  },
  joinLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: SPACING.sm,
  },
  errorIcon: { fontSize: 48, marginBottom: SPACING.sm },
  errorTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.xs,
  },
  errorMsg: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});
