import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function MobileLostFoundScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      const { data } = await supabase
        .from('lost_found_posts')
        .select(`
          id,
          report_type,
          description,
          last_seen_area_label,
          incident_date,
          status,
          species:species(common_name),
          animal:animals(name)
        `)
        .eq('report_type', reportType)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setPosts(data || []);
      setLoading(false);
    }
    loadPosts();
  }, [reportType]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lost & Found Animals</Text>
        <Text style={styles.headerSubtitle}>Community reunion network across Bangladesh</Text>
      </View>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setReportType('lost')}
          style={[styles.toggleBtn, reportType === 'lost' && styles.activeLostBtn]}
        >
          <Text style={[styles.toggleText, reportType === 'lost' && styles.activeToggleText]}>
            Lost Pets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setReportType('found')}
          style={[styles.toggleBtn, reportType === 'found' && styles.activeFoundBtn]}
        >
          <Text style={[styles.toggleText, reportType === 'found' && styles.activeToggleText]}>
            Found Animals
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#245B45" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No active {reportType} reports</Text>
              <Text style={styles.emptySubtitle}>
                No reports found in this category at this moment.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.title}>
                    {item.animal?.name || `${item.species?.common_name || 'Animal'} Report`}
                  </Text>
                  <Text style={styles.metaText}>
                    📍 {item.last_seen_area_label || 'Coarse location'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.typeBadge,
                    item.report_type === 'lost' ? styles.lostBadge : styles.foundBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      item.report_type === 'lost' ? styles.lostBadgeText : styles.foundBadgeText,
                    ]}
                  >
                    {item.report_type.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.description} numberOfLines={3}>
                {item.description}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                  Date: {new Date(item.incident_date).toLocaleDateString()}
                </Text>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#252A27',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#66856C',
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F0F5F2',
  },
  activeLostBtn: {
    backgroundColor: '#D98769',
  },
  activeFoundBtn: {
    backgroundColor: '#245B45',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#252A27',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#252A27',
  },
  metaText: {
    fontSize: 12,
    color: '#66856C',
    marginTop: 2,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lostBadge: {
    backgroundColor: '#FEE2E2',
  },
  foundBadge: {
    backgroundColor: '#DCFCE7',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  lostBadgeText: {
    color: '#B91C1C',
  },
  foundBadgeText: {
    color: '#15803D',
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  actionBtn: {
    backgroundColor: '#245B45',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#252A27',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
    marginTop: 4,
  },
});
