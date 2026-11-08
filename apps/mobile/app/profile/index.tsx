import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

interface ProfileData {
  id: string;
  display_name: string;
  username: string;
  bio: string;
  city: string;
  district: string;
}

interface PetItem {
  id: string;
  name: string;
  species: { common_name: string } | null;
  breed: string;
  gender: string;
  birth_date: string;
}

export default function MobileProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [pets, setPets] = useState<PetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, display_name, username, bio, city, district')
          .eq('id', user.id)
          .single();

        if (prof) setProfile(prof);

        // Fetch user's registered pets
        const { data: petData } = await supabase
          .from('animals')
          .select(`
            id,
            name,
            breed,
            gender,
            birth_date,
            species:species(common_name)
          `)
          .eq('owner_id', user.id);

        const formatted = (petData || []).map((p: any) => ({
          ...p,
          species: Array.isArray(p.species) ? p.species[0] : p.species,
        }));

        setPets(formatted);
      }
      setLoading(false);
    }
    loadUserData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#245B45" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>
          {profile?.display_name || profile?.username || 'Animal Guardian'}
        </Text>
        <Text style={styles.username}>@{profile?.username || 'guardian'}</Text>
        <Text style={styles.location}>
          📍 {profile?.city ? `${profile.city}, ` : ''}{profile?.district || 'Bangladesh'}
        </Text>
        {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      {/* Registered Pets Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Animals ({pets.length})</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/feed')}
          >
            <Text style={styles.addButtonText}>+ Register Pet</Text>
          </TouchableOpacity>
        </View>

        {pets.length === 0 ? (
          <View style={styles.emptyPets}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyText}>No animals registered yet</Text>
            <Text style={styles.emptySubtext}>
              Add your companion animals to track care records, vaccinations, and health reminders.
            </Text>
          </View>
        ) : (
          <FlatList
            data={pets}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.petCard}
                onPress={() => router.push(`/animal/${item.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`View ${item.name}'s profile`}
              >
                <View style={styles.petIcon}>
                  <Text style={styles.petIconText}>🐕</Text>
                </View>
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{item.name}</Text>
                  <Text style={styles.petMeta}>
                    {item.species?.common_name || 'Animal'} • {item.breed || 'Mixed'}
                  </Text>
                </View>
                <Text style={styles.arrowText}>→</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Account Settings / Actions */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/care-assistant')}
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>🤖 AI Care Assistant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out of account"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0EDE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#252A27',
  },
  username: {
    fontSize: 14,
    color: '#66856C',
    marginTop: 2,
  },
  location: {
    fontSize: 13,
    color: '#66856C',
    marginTop: 4,
  },
  bio: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#252A27',
  },
  addButton: {
    backgroundColor: '#245B45',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FAF9F6',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyPets: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#252A27',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#66856C',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  petIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF9F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  petIconText: {
    fontSize: 22,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#252A27',
  },
  petMeta: {
    fontSize: 12,
    color: '#66856C',
    marginTop: 2,
  },
  arrowText: {
    fontSize: 18,
    color: '#66856C',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#245B45',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#245B45',
    fontSize: 14,
    fontWeight: '700',
  },
  signOutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '700',
  },
});
