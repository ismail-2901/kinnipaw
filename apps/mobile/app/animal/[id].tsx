import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AnimalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [animal, setAnimal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnimal() {
      if (!id) return;
      const { data } = await supabase
        .from('animals')
        .select('*, species(name), breeds(name)')
        .eq('id', id)
        .single();

      setAnimal(data);
      setLoading(false);
    }
    loadAnimal();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#245B45" />
      </View>
    );
  }

  if (!animal) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Animal profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{animal.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{animal.visibility}</Text>
          </View>
        </View>
        <Text style={styles.species}>
          {animal.species?.name || 'Animal'} {animal.breeds?.name ? `• ${animal.breeds.name}` : ''}
        </Text>
        {animal.bio && <Text style={styles.bio}>{animal.bio}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    color: '#252A27',
    fontSize: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#245B45',
  },
  badge: {
    backgroundColor: '#E0EDE6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#245B45',
    fontSize: 12,
    fontWeight: '700',
  },
  species: {
    fontSize: 14,
    color: '#66856C',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#252A27',
    marginTop: 12,
    lineHeight: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F6F3',
    paddingTop: 12,
  },
});
