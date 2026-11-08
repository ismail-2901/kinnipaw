import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#245B45',
        tabBarInactiveTintColor: '#66856C',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTintColor: '#FAF9F6',
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tabs.Screen
        name="feed/index"
        options={{
          title: 'Community Feed',
          tabBarLabel: 'Feed',
          tabBarIcon: () => <Text style={styles.tabIcon}>📰</Text>,
        }}
      />
      <Tabs.Screen
        name="adoption/index"
        options={{
          title: 'Lawful Adoption',
          tabBarLabel: 'Adopt',
          tabBarIcon: () => <Text style={styles.tabIcon}>🐾</Text>,
        }}
      />
      <Tabs.Screen
        name="lost-found/index"
        options={{
          title: 'Lost & Found',
          tabBarLabel: 'Lost/Found',
          tabBarIcon: () => <Text style={styles.tabIcon}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="rescue/index"
        options={{
          title: 'Rescue Coordination',
          tabBarLabel: 'Rescue',
          tabBarIcon: () => <Text style={styles.tabIcon}>🚨</Text>,
        }}
      />
      <Tabs.Screen
        name="providers/index"
        options={{
          title: 'Care Providers',
          tabBarLabel: 'Providers',
          tabBarIcon: () => <Text style={styles.tabIcon}>🩺</Text>,
        }}
      />
      <Tabs.Screen
        name="messages/index"
        options={{
          title: 'Messages',
          tabBarLabel: 'Messages',
          tabBarIcon: () => <Text style={styles.tabIcon}>💬</Text>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FAF9F6',
    borderTopColor: '#E8E6E0',
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 18,
  },
  header: {
    backgroundColor: '#245B45',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
