import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenContainer, InputField, Button, SectionTitle } from '../../src/components/ui';
import { colors, radius } from '../../src/lib/theme';
import { PatientData, loadPatient } from '../../src/lib/patient-data';
import { storage } from '../../src/lib/storage';

type Entry = { date: string; weight: number; fbs: number; rbs: number };
const KEY = 'dmo_progress';

export default function Progress() {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState(''); const [fbs, setFbs] = useState(''); const [rbs, setRbs] = useState('');

  useEffect(() => {
    loadPatient().then(p => p && setPatient(p));
    storage.getItem(KEY).then(d => { if (d) try { setEntries(JSON.parse(d)); } catch {} });
  }, []);

  const targetWeight = patient ? patient.weightKg * 0.95 : 0;
  const lost = patient && entries.length > 0 ? patient.weightKg - entries[entries.length - 1].weight : 0;
  const pct = patient ? Math.min((lost / (patient.weightKg * 0.05)) * 100, 100) : 0;

  const add = async () => {
    const w = parseFloat(weight);
    if (!w) { Alert.alert('Required', 'Enter at least weight'); return; }
    const next = [...entries, { date, weight: w, fbs: parseInt(fbs) || 0, rbs: parseInt(rbs) || 0 }].sort((a, b) => a.date.localeCompare(b.date));
    setEntries(next);
    await storage.setItem(KEY, JSON.stringify(next));
    setWeight(''); setFbs(''); setRbs('');
  };

  if (!patient) {
    return <ScreenContainer><Card><Text style={{ color: colors.textMuted, textAlign: 'center', padding: 24 }}>Load patient data first.</Text></Card></ScreenContainer>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScreenContainer testID="progress">
        <Text style={styles.h1}>Progress Tracking</Text>
        <Text style={styles.muted}>5% weight loss goal + BG monitoring</Text>

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Ionicons name="flag" size={16} color={colors.primary} />
            <Text style={styles.h3}>5% Weight Loss Goal</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: colors.text, fontSize: 12 }}>Start: {patient.weightKg} kg</Text>
            <Text style={{ color: colors.text, fontSize: 12 }}>Target: {targetWeight.toFixed(1)} kg</Text>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.max(pct, 0)}%` }]} />
          </View>
          <Text style={[styles.muted, { marginTop: 4 }]}>
            {lost > 0 ? `${lost.toFixed(1)} kg lost (${pct.toFixed(0)}%)` : 'Record entries to track progress'}
          </Text>
        </Card>

        <Card>
          <SectionTitle>Add Today's Reading</SectionTitle>
          <InputField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" testID="date" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><InputField label="Weight" value={weight} onChangeText={setWeight} unit="kg" keyboardType="decimal-pad" testID="weight" /></View>
            <View style={{ flex: 1 }}><InputField label="FBS" value={fbs} onChangeText={setFbs} unit="mg/dL" keyboardType="numeric" testID="fbs" /></View>
            <View style={{ flex: 1 }}><InputField label="RBS" value={rbs} onChangeText={setRbs} unit="mg/dL" keyboardType="numeric" testID="rbs" /></View>
          </View>
          <Button label="+ Record" onPress={add} style={{ marginTop: 8 }} testID="record-btn" />
        </Card>

        {entries.length > 0 && (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Ionicons name="trending-down" size={16} color={colors.primary} />
              <Text style={styles.h3}>Progress Log</Text>
            </View>
            {[...entries].reverse().map((e, i) => (
              <View key={i} style={styles.entry}>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>{e.date}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Text style={styles.entryStat}>Wt: <Text style={{ fontWeight: '700' }}>{e.weight}</Text> kg</Text>
                  {e.fbs > 0 && <Text style={styles.entryStat}>FBS: <Text style={{ fontWeight: '700' }}>{e.fbs}</Text></Text>}
                  {e.rbs > 0 && <Text style={styles.entryStat}>RBS: <Text style={{ fontWeight: '700' }}>{e.rbs}</Text></Text>}
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  h3: { color: colors.text, fontSize: 14, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 11 },
  barBg: { height: 10, backgroundColor: colors.cardElevated, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 5 },
  entry: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: colors.cardElevated, borderRadius: radius.sm, marginVertical: 3 },
  entryStat: { color: colors.text, fontSize: 11 },
});
