import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isEmergency?: boolean;
}

export default function MobileCareAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your KINNIPAW Care Companion. I provide wellness tips, general care guidance, and animal welfare knowledge. Note: I cannot diagnose diseases or prescribe medications. In an emergency, please visit a licensed vet immediately.',
    },
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const emergencyKeywords = [
    'seizure',
    'convulsion',
    'poison',
    'toxic',
    'hit by car',
    'unconscious',
    'collapsed',
    'bleeding heavily',
    'cannot breathe',
    'respiratory distress',
    'severe trauma',
  ];

  const handleSend = () => {
    if (!query.trim()) return;

    const userText = query.trim();
    setQuery('');
    const newHistory: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newHistory);
    setLoading(true);

    // Guardrail Check
    const isEmergency = emergencyKeywords.some((kw) =>
      userText.toLowerCase().includes(kw)
    );

    setTimeout(() => {
      if (isEmergency) {
        setMessages([
          ...newHistory,
          {
            role: 'assistant',
            content:
              '⚠️ CRITICAL EMERGENCY DETECTED: Your animal may be experiencing a life-threatening medical crisis. Please transport your pet to the nearest emergency veterinary hospital immediately. Do not attempt home treatment.',
            isEmergency: true,
          },
        ]);
      } else {
        setMessages([
          ...newHistory,
          {
            role: 'assistant',
            content: `Thank you for your question about animal care. Regarding "${userText}": Please ensure your pet has clean drinking water, age-appropriate nutrition, and scheduled vaccination boosters. For diagnosis or medical symptoms, always consult a licensed veterinarian.`,
          },
        ]);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Non-Diagnostic Disclaimer Banner */}
      <View style={styles.disclaimerBanner} accessibilityRole="alert">
        <Text style={styles.disclaimerTitle}>🛡️ Non-Diagnostic Wellness Companion</Text>
        <Text style={styles.disclaimerText}>
          AI cannot diagnose illnesses or prescribe medication. Consult a certified veterinarian for medical needs.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.chatScroll}>
        {messages.map((m, idx) => (
          <View
            key={idx}
            style={[
              styles.messageBubble,
              m.role === 'user' ? styles.userBubble : styles.assistantBubble,
              m.isEmergency ? styles.emergencyBubble : null,
            ]}
          >
            {m.isEmergency && (
              <Text style={styles.emergencyLabel}>🚨 VETERINARY EMERGENCY</Text>
            )}
            <Text
              style={[
                styles.messageText,
                m.role === 'user' ? styles.userText : styles.assistantText,
                m.isEmergency ? styles.emergencyText : null,
              ]}
            >
              {m.content}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#245B45" />
            <Text style={styles.loadingText}>Care assistant is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask about pet diet, grooming, wellness..."
          placeholderTextColor="#66856C"
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Ask pet care assistant"
        />
        <TouchableOpacity
          style={[styles.sendButton, !query.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!query.trim() || loading}
          accessibilityRole="button"
          accessibilityLabel="Send care query"
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  disclaimerBanner: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    padding: 12,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },
  chatScroll: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#245B45',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E6E0',
    borderBottomLeftRadius: 4,
  },
  emergencyBubble: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  emergencyLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FAF9F6',
  },
  assistantText: {
    color: '#252A27',
  },
  emergencyText: {
    color: '#7F1D1D',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#66856C',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E6E0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E8E6E0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#252A27',
  },
  sendButton: {
    backgroundColor: '#245B45',
    borderRadius: 24,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0B2A6',
  },
  sendButtonText: {
    color: '#FAF9F6',
    fontWeight: '700',
    fontSize: 14,
  },
});
