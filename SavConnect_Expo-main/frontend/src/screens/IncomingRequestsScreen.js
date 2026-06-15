import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { fetchIncomingRequests, updateApplicationStatus } from '../lib/api';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import EmptyState from '../components/EmptyState';

// ─── Individual Request Card ─────────────────────────────────────────────────
function RequestCard({ item, onDecision, decidingId }) {
  const { colors, isDarkMode } = useTheme();
  const applicant = item.profiles || {};
  const applicantName = applicant.full_name || 'Unknown Applicant';
  const applicantSkills = applicant.skills || [];
  const projectTitle = item.opportunities?.title || 'Unknown Project';
  const isDeciding = decidingId === item.id;

  const dateStr = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Project + date */}
      <View style={styles.cardHeader}>
        <View style={[
          styles.projectBadge,
          {
            backgroundColor: isDarkMode ? colors.surfaceVariant : colors.accent + '18',
            borderWidth: 1,
            borderColor: colors.accent,
          },
        ]}>
          <MaterialCommunityIcons name="briefcase-outline" size={13} color={colors.accent} />
          <Text style={[styles.projectLabel, { color: colors.accent }]} numberOfLines={1}>
            {projectTitle}
          </Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textLight }]}>{dateStr}</Text>
      </View>

      {/* Applicant row */}
      <View style={styles.applicantRow}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarText}>{applicantName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.applicantName, { color: colors.text }]}>{applicantName}</Text>
          {applicantSkills.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
              contentContainerStyle={styles.chipScrollContent}
            >
              {applicantSkills.map((skill) => (
                <View
                  key={skill}
                  style={[styles.skillTag, { backgroundColor: colors.surfaceVariant }]}
                >
                  <Text style={[styles.skillTagText, { color: colors.text }]}>{skill}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Message */}
      {item.message ? (
        <Text
          style={[styles.message, { color: colors.textSecondary, borderLeftColor: colors.accent }]}
          numberOfLines={3}
        >
          {item.message}
        </Text>
      ) : null}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: isDarkMode ? '#1B3A1F' : '#E8F5E9' },
          ]}
          onPress={() => onDecision(item.id, 'accepted')}
          disabled={isDeciding}
          activeOpacity={0.8}
        >
          {isDeciding ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <>
              <MaterialCommunityIcons name="check-circle-outline" size={16} color={isDarkMode ? '#81C784' : '#2E7D32'} />
              <Text style={[styles.acceptText, { color: isDarkMode ? '#81C784' : '#2E7D32' }]}>Accept</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: isDarkMode ? '#3A1A1A' : '#FFEBEE' },
          ]}
          onPress={() => onDecision(item.id, 'rejected')}
          disabled={isDeciding}
          activeOpacity={0.8}
        >
          {isDeciding ? (
            <ActivityIndicator size="small" color="#EF9A9A" />
          ) : (
            <>
              <MaterialCommunityIcons name="close-circle-outline" size={16} color={isDarkMode ? '#EF9A9A' : '#C62828'} />
              <Text style={[styles.rejectText, { color: isDarkMode ? '#EF9A9A' : '#C62828' }]}>Reject</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function IncomingRequestsScreen() {
  const { colors } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [decidingId, setDecidingId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const loadRequests = useCallback(async (userId) => {
    setError(null);
    try {
      const data = await fetchIncomingRequests(userId);
      setRequests(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load incoming requests.');
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setCurrentUserId(user.id);
      await loadRequests(user.id);
    } catch {
      setError('Could not authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loadRequests]);

  useFocusEffect(
    useCallback(() => { loadData(); }, [loadData])
  );

  const onRefresh = async () => {
    if (!currentUserId) return;
    setRefreshing(true);
    await loadRequests(currentUserId);
    setRefreshing(false);
  };

  // ─── Accept / Reject ─────────────────────────────────────────────────────
  const handleDecision = async (applicationId, status) => {
    setDecidingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      // Remove card immediately after decision
      setRequests((prev) => prev.filter((r) => r.id !== applicationId));
      Alert.alert(
        status === 'accepted' ? 'Accepted ✅' : 'Rejected ❌',
        `Application has been ${status}.`
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update status.');
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} />

      {/* Header — SafeAreaView prevents status-bar overlap */}
      <SafeAreaView style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Incoming Requests</Text>
          {requests.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: '#E53935' }]}>
              <Text style={styles.countText}>{requests.length}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Pending applicants for your projects
        </Text>
      </SafeAreaView>

      {loading ? (
        <View style={styles.centeredWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading…</Text>
        </View>
      ) : error ? (
        <View style={styles.centeredWrap}>
          <MaterialCommunityIcons name="wifi-alert" size={48} color={colors.accent} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Checking Campus Network…</Text>
          <Text style={[styles.errorMsg, { color: colors.textSecondary }]}>
            {error.includes('timed out') || error.includes('Network')
              ? 'Make sure FastAPI is running on port 8000.'
              : error}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            onPress={loadData}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              onDecision={handleDecision}
              decidingId={decidingId}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            requests.length === 0 && styles.listEmpty,
          ]}
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
            <EmptyState
              icon="inbox-outline"
              title="No Incoming Requests"
              message="No one has applied to your projects yet. Post an opportunity to attract applicants!"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    paddingTop: 52,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: { ...TYPOGRAPHY.h2 },
  headerSubtitle: { ...TYPOGRAPHY.bodySmall, marginTop: 2 },
  countBadge: {
    borderRadius: BORDER_RADIUS.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },

  listContent: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
    flexGrow: 1,
  },
  listEmpty: { flex: 1 },

  centeredWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  loadingText: { ...TYPOGRAPHY.bodySmall, marginTop: SPACING.sm },
  errorTitle: { ...TYPOGRAPHY.h3, textAlign: 'center' },
  errorMsg: { ...TYPOGRAPHY.bodySmall, textAlign: 'center' },
  retryBtn: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  retryBtnText: { ...TYPOGRAPHY.caption, color: '#FFFFFF', fontWeight: '700' },

  // ─── Card ────────────────────────────────────────────────────────────────
  card: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    flex: 1,
    marginRight: SPACING.sm,
  },
  projectLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    flex: 1,
  },
  dateText: { ...TYPOGRAPHY.caption },

  applicantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...TYPOGRAPHY.subtitle,
    color: '#FFFFFF',
    fontSize: 18,
  },
  applicantName: {
    ...TYPOGRAPHY.subtitle,
    marginBottom: 4,
  },
  chipScroll: {
    marginTop: 2,
  },
  chipScrollContent: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  skillTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
  },

  message: {
    ...TYPOGRAPHY.bodySmall,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
    borderLeftWidth: 2,
  },

  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.sm,
  },
  acceptBtn: { backgroundColor: '#E8F5E9' },
  rejectBtn: { backgroundColor: '#FFEBEE' },
  acceptText: { ...TYPOGRAPHY.caption, fontWeight: '700', color: '#2E7D32', fontSize: 14 },
  rejectText: { ...TYPOGRAPHY.caption, fontWeight: '700', color: '#C62828', fontSize: 14 },
});
