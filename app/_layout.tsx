import { JSX } from 'react';

import { Stack } from 'expo-router';

export default function RootLayout(): JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />;
}
