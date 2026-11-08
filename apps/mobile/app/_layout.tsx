import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#245B45',
          },
          headerTintColor: '#FAF9F6',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'KINNIPAW',
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)/login"
          options={{
            title: 'Sign In',
          }}
        />
        <Stack.Screen
          name="care-assistant"
          options={{
            title: 'AI Care Companion',
          }}
        />
        <Stack.Screen
          name="profile/index"
          options={{
            title: 'My Profile & Animals',
          }}
        />
        <Stack.Screen
          name="animal/[id]"
          options={{
            title: 'Animal Profile',
          }}
        />
      </Stack>
    </>
  );
}
