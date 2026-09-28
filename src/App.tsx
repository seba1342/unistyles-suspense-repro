import { Suspense, use, useState } from 'react';
import { Button, Text, View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ThemeRegression } from './ThemeRegression';

const ready = Promise.resolve();
const entries = [['Books', '3'], ['Pages read', '42'], ['Next chapter', 'The Garden']];

type LayoutProps = ViewProps & { horizontal?: boolean; end?: boolean; grow?: boolean };

function Layout({ horizontal = false, end = false, grow = false, style, ...props }: LayoutProps) {
  return <View {...props} style={[styles.layout(horizontal, end, grow), style]} />;
}

function Gate({ promise }: { promise: Promise<void> }) {
  use(promise);
  return null;
}

export default function App() {
  const [promise, setPromise] = useState(ready);
  const [restores, setRestores] = useState(0);
  const [version, setVersion] = useState(0);
  const [showTheme, setShowTheme] = useState(false);

  function suspend() {
    setPromise(new Promise<void>((resolve) => setTimeout(resolve, 1000)));
    setRestores((value) => value + 1);
  }

  if (showTheme) return <ThemeRegression onBack={() => setShowTheme(false)} />;

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Reading list</Text>
      <Button title="Theme regression" onPress={() => setShowTheme(true)} />
      <Text style={styles.hint}>Labels belong on the left. Values belong on the right.</Text>
      <Button title="Hide and restore" onPress={suspend} />
      <Button title="Reset rows" onPress={() => setVersion((value) => value + 1)} />
      <Text style={styles.hint}>Restores: {restores}</Text>
      <Suspense key={version} fallback={<Text style={styles.hint}>Loading...</Text>}>
        <View style={styles.card}>
          {entries.map(([label, value]) => (
            <Layout key={label} horizontal style={styles.row}>
              <Text style={styles.text}>{label}</Text>
              <Layout end grow>
                <Text style={styles.text}>{value}</Text>
              </Layout>
            </Layout>
          ))}
        </View>
        <Gate promise={promise} />
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 80, paddingHorizontal: 24, backgroundColor: '#f4f1e9' },
  heading: { fontSize: 28, fontWeight: '600', color: '#253426', marginBottom: 12 },
  hint: { fontSize: 16, color: '#4b554c', marginVertical: 12 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden' },
  row: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e7e0' },
  text: { fontSize: 18, color: '#253426' },
  layout: (horizontal: boolean, end: boolean, grow: boolean) => ({
    flexDirection: horizontal ? 'row' : 'column',
    alignItems: end ? 'flex-end' : 'stretch',
    justifyContent: 'space-between',
    flexGrow: grow ? 1 : 0,
  }),
});
