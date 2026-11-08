import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { supabase } from '../../../lib/supabase';

interface RescueCaseItem {
  id: string;
  species: { common_name: string } | null;
  urgency_level: 'critical' | 'high' | 'moderate' | 'low';
  title: string;
  description: string;
  status: string;
  last_seen_area_label: string;
  created_at: string;
}

export default function MobileRescueScreen() {
  const [cases, setCases] = useState<RescueCaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  useEffect(() => {
    async function loadRescueCases() {
      setLoading(true);
      let query = supabase
        .from('rescue_cases')
        .select(`
          id,
          urgency_level,
          title,
          description,
          status,
          last_seen_area_label,
          created_at,
          species:species(common_name)
        `)
        .order('created_at', { ascending: false });

      if (urgencyFilter !== 'all') {
        query = query.eq('urgency_level', urgencyFilter);
      }

      const { data } = await query;
      // Handle Supabase join array or object format
      const formatted = (data || []).map((item: any) => ({
        ...item,
        species: Array.isArray(item.species) ? item.species[0] : item.species,
      }));

      setCases(formatted);
      setLoading(false);
    }
    loadRescueCases();
  }, [urgencyFilter]);

  const getUrgencyBadgeStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return { bg: '#FEE2E2', text: '#991B1B', label: 'CRITICAL' };
      case 'high':
        return { bg: '#FEF3C7', text: '#92400E', label: 'HIGH URGENCY' };
      case 'moderate':
        return { bg: '#E0EDE6', text: '#245B45', label: 'MODERATE' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: 'ROUTINE' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Emergency Hotline Alert Banner */}
      <View style={styles.emergencyBanner} accessibilityRole="alert">
        <Text style={styles.bannerTitle}>🚨 Wildlife & Animal Emergency</Text>
        <Text style={styles.bannerText}>
          For wild or endangered animals, please notify Bangladesh Forest Department immediately:
          Hotline 10603.
        </Text>
      </View>

      {/* Urgency Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['all', 'critical', 'high', 'moderate'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.chip,
                urgencyFilter === level && styles.chipActive,
              ]}
              onPress={() => setUrgencyFilter(level)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by urgency ${level}`}
            >
              <Text
                style={[
                  styles.chipText,
                  urgencyFilter === level && styles.chipTextActive,
                ]}
              >
                {level.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#245B45" />
        </View>
      ) : (
        <FlatList
          data={cases}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛡️</Text>
              <Text style={styles.emptyTitle}>No active rescue cases</Text>
              <Text style={styles.emptySubtitle}>
                No incidents reported under this filter. All animals are safe.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const urgency = getUrgencyBadgeStyle(item.urgency_level);
            return (
              <View style={styles.card} accessible={true}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={[styles.badge, { backgroundColor: urgency.bg }]}>
                    <Text style={[styles.badgeText, { color: urgency.text }]}>
                      {urgency.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.speciesText}>
                  Species: {item.species?.common_name || 'Animal in Distress'}
                </Text>

                <Text style={styles.description} numberOfLines={3}>
                  {item.description}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.locationText}>
                    📍 {item.last_seen_area_label || 'Area reported'}
                  </Text>
                  <Text style={styles.statusText}>
                    Status: {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            );
          }}
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
  emergencyBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderBottomWidth: 1,
    padding: 14,
  },
  bannerTitle: {
    color: '#991B1B',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  bannerText: {
    color: '#7F1D1D',
    fontSize: 12,
    lineHeight: 18,
  },
  filterContainer: {
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#245B45',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#FAF9F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 36,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#252A27',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#66856C',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#252A27',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  speciesText: {
    fontSize: 13,
    color: '#245B45',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#66856C',
    fontWeight: '500',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#245B45',
  },
});
