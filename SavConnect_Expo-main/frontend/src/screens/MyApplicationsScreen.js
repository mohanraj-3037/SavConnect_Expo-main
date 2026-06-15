import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { API_URL, deleteApplication } from '../lib/api';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import EmptyState from '../components/EmptyState';

// ─── Status badge config — solid bg + border for dark mode visibility ────────
const STATUS_CONFIG = {
  pending:  { bg: '#FFF8E1', border: '#F9A825', text: '#E65100', label: 'Pending' },
  accepted: { bg: '#E8F5E9', border: '#43A047', text: '#1B5E20', label: 'Accepted' },
  rejected: { bg: '#FFEBEE', border: '#E53935', text: '#B71C1C', label: 'Rejected' },
};

function ApplicationCard({ item, onDelete, isDeleting }) {
  const { colors } = useTheme();
  const title = item.opportunities?.title || 'Unknown Project';
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
  const dateStr = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : '';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Teal trash delete icon — top right */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(item.id)}
        disabled={isDeleting}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        activeOpacity={0.7}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.accent} />
        )}
      </TouchableOpacity>

      <View style={styles.cardBody}>
        {/* Status badge */}
      <View style={[
        styles.statusBadge,
        {
          backgroundColor: cfg.bg,
          borderWidth: 1,
          borderColor: cfg.border,
        },
      ]}>
        <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
      </View>

        <Text style={[styles.projectTitle, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="calendar-outline" size={13} color={colors.textLight} />
          <Text style={[styles.dateText, { color: colors.textLight }]}>{dateStr}</Text>
        </View>

        {item.message ? (
          <Text style={[styles.messageText, { color: colors.textSecondary, borderLeftColor: colors.border }]} numberOfLines={2}>
            {item.message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function MyApplicationsScreen() {
  const { colors } = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchApplications = useCallback(async (userId) => {
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(`${API_URL}/my-applications/${userId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setApplications(data || []);
    } catch (err) {
      clearTimeout(timeoutId);
      setError(
        err.name === 'AbortError'
          ? 'Request timed out. Is FastAPI running?'
          : err.message || 'Failed to load applications.'
      );
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setCurrentUserId(user.id);
      await fetchApplications(user.id);
    } catch {
      setError('Could not authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchApplications]);

  useFocusEffect(
    useCallback(() => { loadData(); }, [loadData])
  );

  const onRefresh = async () => {
    if (!currentUserId) return;
    setRefreshing(true);
    await fetchApplications(currentUserId);
    setRefreshing(false);
  };

  // ─── Optimistic deletion ─────────────────────────────────────────────────
  const handleDelete = (applicationId) => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            // Optimistic: remove immediately from UI
            setApplications((prev) => prev.filter((a) => a.id !== applicationId));
            setDeletingId(applicationId);
            try {
              await deleteApplication(applicationId, currentUserId);
            } catch (err) {
              // Rollback: re-fetch on failure
              Alert.alert('Error', err.message || 'Failed to withdraw application.');
              await fetchApplications(currentUserId);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  const renderCard = ({ item }) => (
    <ApplicationCard
      item={item}
      onDelete={handleDelete}
      isDeleting={deletingId === item.id}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} />

      {/* Header */}
      <SafeAreaView style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Applications</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {applications.length} total
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
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={[
            styles.listContent,
            applications.length === 0 && styles.listEmpty,
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
              icon="clipboard-text-off-outline"
              title="No Applications Yet"
              message="You haven't applied to any projects. Head to the Feed to discover opportunities!"
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
  headerTitle: { ...TYPOGRAPHY.h2 },
  headerSubtitle: { ...TYPOGRAPHY.bodySmall, marginTop: 2 },

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
    position: 'relative',
  },
  deleteBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 10,
    padding: 4,
  },
  cardBody: {
    paddingRight: SPACING.xl,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xs,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  projectTitle: {
    ...TYPOGRAPHY.subtitle,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  dateText: { ...TYPOGRAPHY.caption },
  messageText: {
    ...TYPOGRAPHY.bodySmall,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
    paddingLeft: SPACING.sm,
    borderLeftWidth: 2,
  },
});
