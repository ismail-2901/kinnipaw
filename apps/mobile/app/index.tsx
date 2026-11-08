import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const navigationCards = [
    {
      title: 'Community Feed',
      desc: 'Stories, updates, and photos from guardians',
      icon: '📰',
      route: '/(tabs)/feed',
    },
    {
      title: 'Lawful Adoption',
      desc: 'Screened animals ready for responsible adoption',
      icon: '🐾',
      route: '/(tabs)/adoption',
    },
    {
      title: 'Lost & Found',
      desc: 'Community search and sighting reports',
      icon: '🔍',
      route: '/(tabs)/lost-found',
    },
    {
      title: 'Rescue Coordination',
      desc: 'Triage and emergency support for animals in distress',
      icon: '🚨',
      route: '/(tabs)/rescue',
    },
    {
      title: 'Care Providers',
      desc: 'Verified veterinarians, trainers, and groomers',
      icon: '🩺',
      route: '/(tabs)/providers',
    },
    {
      title: 'AI Care Assistant',
      desc: 'Non-diagnostic wellness and nutrition advice',
      icon: '🤖',
      route: '/care-assistant',
    },
    {
      title: 'My Profile & Animals',
      desc: 'Manage your care records and account',
      icon: '👤',
      route: '/profile',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Animal Welfare & Care Ecosystem • Bangladesh</Text>
        </View>
        <Text style={styles.title}>KINNIPAW</Text>
        <Text style={styles.tagline}>One Platform. Every Animal. One Connected Ecosystem.</Text>
        <Text style={styles.description}>
          Responsible care, lawful adoption, lost-and-found matching, rescue coordination, and
          welfare services across Bangladesh.
        </Text>
      </View>

      <View style={styles.grid}>
        {navigationCards.map((card, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => router.push(card.route as any)}
            accessibilityRole="button"
            accessibilityLabel={`Navigate to ${card.title}`}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>{card.icon}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.desc}</Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  hero: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E6E0',
  },
  badge: {
    backgroundColor: '#E0EDE6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 12,
  },
  badgeText: {
    color: '#245B45',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#245B45',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#66856C',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#252A27',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
  grid: {
    padding: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E0EDE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#252A27',
  },
  cardDesc: {
    fontSize: 12,
    color: '#66856C',
    marginTop: 2,
    lineHeight: 16,
  },
  cardArrow: {
    fontSize: 18,
    color: '#66856C',
    marginLeft: 8,
  },
});
