import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Bangladesh-First Animal Ecosystem</Text>
        </View>
        <Text style={styles.title}>KINNIPAW</Text>
        <Text style={styles.tagline}>One Platform. Every Animal. One Connected Ecosystem.</Text>
        <Text style={styles.description}>
          Responsible care, lawful adoption, lost-and-found matching, rescue coordination, and
          welfare services.
        </Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>Foundation M1 Active</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  badge: {
    backgroundColor: '#E0EDE6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  badgeText: {
    color: '#245B45',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#245B45',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#66856C',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#252A27',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 24,
  },
  statusBox: {
    backgroundColor: '#245B45',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
