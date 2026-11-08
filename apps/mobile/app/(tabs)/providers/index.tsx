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

interface ProviderItem {
  id: string;
  business_name: string;
  provider_type: string;
  description: string;
  rating_average: number;
  rating_count: number;
  is_verified: boolean;
  district: string;
  thana: string;
}

export default function MobileProvidersScreen() {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    async function loadProviders() {
      setLoading(true);
      let query = supabase
        .from('provider_profiles')
        .select(`
          id,
          business_name,
          provider_type,
          description,
          rating_average,
          rating_count,
          is_verified,
          district,
          thana
        `)
        .order('rating_average', { ascending: false });

      if (typeFilter !== 'all') {
        query = query.eq('provider_type', typeFilter);
      }

      const { data } = await query;
      setProviders(data || []);
      setLoading(false);
    }
    loadProviders();
  }, [typeFilter]);

  const providerTypes = [
    { key: 'all', label: 'All Services' },
    { key: 'veterinary_clinic', label: 'Veterinary' },
    { key: 'trainer', label: 'Trainers' },
    { key: 'groomer', label: 'Grooming' },
    { key: 'shelter', label: 'Shelters' },
    { key: 'boarding', label: 'Boarding' },
  ];

  return (
    <View style={styles.container}>
      {/* Category Filter Bar */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {providerTypes.map((pt) => (
            <TouchableOpacity
              key={pt.key}
              style={[
                styles.chip,
                typeFilter === pt.key && styles.chipActive,
              ]}
              onPress={() => setTypeFilter(pt.key)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${pt.label}`}
            >
              <Text
                style={[
                  styles.chipText,
                  typeFilter === pt.key && styles.chipTextActive,
                ]}
              >
                {pt.label}
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
          data={providers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🩺</Text>
              <Text style={styles.emptyTitle}>No care providers found</Text>
              <Text style={styles.emptySubtitle}>
                No verified professionals currently listed in this category.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card} accessible={true}>
              <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                  <Text style={styles.businessName}>{item.business_name}</Text>
                  {item.is_verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓ Verified</Text>
                    </View>
                  )}
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>
                    ⭐ {item.rating_average ? item.rating_average.toFixed(1) : 'New'}
                  </Text>
                </View>
              </View>

              <Text style={styles.providerType}>
                {item.provider_type.replace('_', ' ').toUpperCase()}
              </Text>

              <Text style={styles.description} numberOfLines={2}>
                {item.description || 'Dedicated pet care and professional welfare provider.'}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.locationText}>
                  📍 {item.thana ? `${item.thana}, ` : ''}{item.district || 'Dhaka'}
                </Text>
                <TouchableOpacity
                  style={styles.bookButton}
                  accessibilityRole="button"
                  accessibilityLabel={`Book appointment with ${item.business_name}`}
                >
                  <Text style={styles.bookButtonText}>Book Appointment</Text>
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
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginRight: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#252A27',
  },
  verifiedBadge: {
    backgroundColor: '#E0EDE6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#245B45',
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  providerType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#66856C',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#66856C',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#245B45',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bookButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FAF9F6',
  },
});
