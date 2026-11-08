import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function MobileFeedScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      const { data } = await supabase
        .from('posts')
        .select('*, author:profiles(display_name, username)')
        .eq('is_published', true)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      setPosts(data || []);
      setLoading(false);
    }
    loadFeed();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#245B45" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No community posts yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to share an update with the ecosystem.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.headerRow}>
              <Text style={styles.authorName}>
                {item.author?.display_name || item.author?.username || 'Community Member'}
              </Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{item.post_type}</Text>
              </View>
            </View>
            <Text style={styles.postBody}>{item.body}</Text>
            <View style={styles.footerRow}>
              <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
              <Text style={styles.communityTag}>Safe Community</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  listContent: {
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
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
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E6E0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#252A27',
  },
  typeBadge: {
    backgroundColor: '#E0EDE6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#245B45',
    textTransform: 'capitalize',
  },
  postBody: {
    fontSize: 14,
    color: '#252A27',
    marginTop: 10,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F6F3',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#66856C',
  },
  communityTag: {
    fontSize: 11,
    color: '#245B45',
    fontWeight: '600',
  },
});
