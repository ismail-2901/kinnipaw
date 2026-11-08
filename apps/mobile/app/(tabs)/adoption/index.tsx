import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function MobileAdoptionScreen() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState('all');

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      const { data } = await supabase
        .from('adoption_listings')
        .select(`
          id,
          description,
          fee_description,
          listing_status,
          created_at,
          lister:profiles(display_name, city, area_label),
          animal:animals(
            id,
            name,
            sex,
            size_category,
            species:species(common_name),
            breed:breeds(name)
          )
        `)
        .eq('listing_status', 'active')
        .order('created_at', { ascending: false });

      setListings(data || []);
      setLoading(false);
    }
    loadListings();
  }, []);

  const filtered = listings.filter((l) => {
    if (selectedSpecies === 'all') return true;
    return l.animal?.species?.common_name?.toLowerCase() === selectedSpecies;
  });

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Dogs', value: 'dog' },
    { label: 'Cats', value: 'cat' },
    { label: 'Birds', value: 'bird' },
    { label: 'Rabbits', value: 'rabbit' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Adopt a Companion</Text>
        <Text style={styles.headerSubtitle}>Ethical, non-commercial animal rehoming</Text>
      </View>

      {/* Filter bar */}
      <View style={styles.filterRow}>
        {filterOptions.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setSelectedSpecies(opt.value)}
            style={[
              styles.filterPill,
              selectedSpecies === opt.value && styles.activeFilterPill,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedSpecies === opt.value && styles.activeFilterText,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#245B45" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🐾</Text>
              <Text style={styles.emptyTitle}>No animals listed</Text>
              <Text style={styles.emptySubtitle}>
                No active adoption listings found for the selected species.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.animalName}>{item.animal?.name || 'Companion'}</Text>
                  <Text style={styles.metaText}>
                    {item.animal?.breed?.name || 'Mixed Breed'} • {item.animal?.sex || 'Unknown'}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.animal?.species?.common_name || 'Pet'}</Text>
                </View>
              </View>

              {item.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.locationText}>
                  📍 {item.lister?.area_label || item.lister?.city || 'Bangladesh'}
                </Text>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>View Details</Text>
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
    color: '#245B45',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#66856C',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F5F2',
  },
  activeFilterPill: {
    backgroundColor: '#245B45',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#252A27',
  },
  activeFilterText: {
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
  animalName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#252A27',
  },
  metaText: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#245B45',
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
  locationText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  actionButton: {
    backgroundColor: '#245B45',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
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
