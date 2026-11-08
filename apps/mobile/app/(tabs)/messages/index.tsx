import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../../../lib/supabase';

export default function MobileMessagesScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: memberRows } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', user.id);

        if (memberRows && memberRows.length > 0) {
          const convIds = memberRows.map((m) => m.conversation_id);
          const { data } = await supabase
            .from('conversations')
            .select(`
              id,
              conversation_type,
              updated_at,
              members:conversation_members(
                user_id,
                profile:profiles(id, display_name, username)
              ),
              messages:messages(id, body, sent_at)
            `)
            .in('id', convIds)
            .order('updated_at', { ascending: false });

          setConversations(data || []);
        }
      }
      setLoading(false);
    }
    loadConversations();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Direct communication between community members</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#245B45" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                Your conversations with adopters and guardians will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const lastMsg = item.messages?.[item.messages.length - 1];
            return (
              <TouchableOpacity style={styles.card}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>🐾</Text>
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.name}>Conversation</Text>
                    {lastMsg && (
                      <Text style={styles.date}>
                        {new Date(lastMsg.sent_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.snippet} numberOfLines={1}>
                    {lastMsg?.body || 'No messages yet'}
                  </Text>
                </View>
              </TouchableOpacity>
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
  listContent: {
    padding: 16,
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E6E0',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#252A27',
  },
  date: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  snippet: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
