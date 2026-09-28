import { Suspense, use, useRef, useState } from 'react';
import { Button, Text, View, StyleSheet as NativeStyleSheet } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

const themes = { light: { markerWidth: 80 }, dark: { markerWidth: 180 } };
type Themes = typeof themes;
declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends Themes {}
}
StyleSheet.configure({ themes, settings: { initialTheme: 'light' } });

const ready = Promise.resolve();
function Gate({ promise }: { promise: Promise<void> }) {
  use(promise);
  return null;
}

export function ThemeRegression({ onBack }: { onBack: () => void }) {
  const [promise, setPromise] = useState(ready);
  const resolve = useRef<(() => void) | null>(null);
  const [phase, setPhase] = useState(0);
  const [fresh, setFresh] = useState<typeof themed.marker | null>(null);
  // Keep the same element and style prop so restore does not read the stylesheet.
  const [retained] = useState(() => (
    <View accessible accessibilityLabel="Retained marker" style={themed.marker} />
  ));

  return (
    <View style={layout.screen}>
      <Text style={layout.heading}>Theme cache regression</Text>
      <Text>Light width: 80. Dark width: 180.</Text>
      <Button title="1. Suspend" disabled={phase !== 0} onPress={() => {
        setPromise(new Promise<void>((done) => { resolve.current = done; }));
        setPhase(1);
      }} />
      <Button title="2. Change to dark" disabled={phase !== 1} onPress={() => {
        UnistylesRuntime.setTheme('dark');
        setPhase(2);
      }} />
      <Button title="3. Restore" disabled={phase !== 2} onPress={() => {
        resolve.current?.();
        setPhase(3);
      }} />
      <Button title="4. Read and mount" disabled={phase !== 3} onPress={() => {
        setFresh(themed.marker);
        setPhase(4);
      }} />
      <Suspense fallback={<Text>Marker hidden</Text>}>
        {retained}
        <Gate promise={promise} />
      </Suspense>
      {fresh && <>
        <Text>Fresh width: {fresh.width}</Text>
        <View accessible accessibilityLabel="Fresh marker" style={fresh} />
      </>}
      <Button title="Back to rows" onPress={onBack} />
    </View>
  );
}

const themed = StyleSheet.create((theme) => ({
  marker: { width: theme.markerWidth, height: 32, backgroundColor: '#406744', marginVertical: 8 },
}));
const layout = NativeStyleSheet.create({
  screen: { flex: 1, paddingTop: 80, paddingHorizontal: 24, backgroundColor: '#f4f1e9', gap: 12 },
  heading: { fontSize: 24, fontWeight: '600' },
});
