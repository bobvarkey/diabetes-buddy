import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenContainer, InputField, Button, SectionTitle } from '../../src/components/ui';
import { colors, radius } from '../../src/lib/theme';
import { PatientData, loadPatient } from '../../src/lib/patient-data';

type Protocol = 'simple' | 'treat-to-target' | 'conservative';
const PROTOCOLS: Record<Protocol, { label: string; desc: string; target: [number, number]; rules: { range: [number, number]; adj: number; label: string }[] }> = {
  simple: { label: 'ADA Simple (±2U q3d)', desc: 'Increase 2U q3d if FBG>130. Decrease 2U if <70.', target: [80, 130],
    rules: [
      { range: [0, 54], adj: -4, label: 'Severe hypo — reduce 4U + contact MD' },
      { range: [54, 70], adj: -2, label: 'Hypoglycemia — reduce 2U' },
      { range: [70, 80], adj: -1, label: 'Near-low — reduce 1U' },
      { range: [80, 130], adj: 0, label: 'At target — no change' },
      { range: [130, 180], adj: 2, label: 'Above target — increase 2U' },
      { range: [180, 9999], adj: 2, label: 'High — increase 2U' },
    ] },
  'treat-to-target': { label: 'Treat-to-Target (Riddle)', desc: '3-day FBG average. Target 70-130.', target: [70, 130],
    rules: [
      { range: [0, 56], adj: -4, label: 'Severe hypo — reduce 4U immediately' },
      { range: [56, 70], adj: -2, label: 'Hypoglycemia — reduce 2U' },
      { range: [70, 130], adj: 0, label: 'At target — maintain' },
      { range: [130, 160], adj: 2, label: 'Mildly elevated — increase 2U' },
      { range: [160, 200], adj: 4, label: 'Elevated — increase 4U' },
      { range: [200, 9999], adj: 6, label: 'Very high — increase 6U' },
    ] },
  conservative: { label: 'Conservative (Elderly/CKD)', desc: 'Target 100-150. Slower titration.', target: [100, 150],
    rules: [
      { range: [0, 70], adj: -4, label: 'Hypoglycemia — reduce 4U + alert MD' },
      { range: [70, 100], adj: -2, label: 'Below target — reduce 2U' },
      { range: [100, 150], adj: 0, label: 'At target — maintain' },
      { range: [150, 200], adj: 2, label: 'Above target — increase 2U' },
      { range: [200, 9999], adj: 2, label: 'High — increase 2U (max)' },
    ] },
};

export default function InsulinTitration() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [dose, setDose] = useState('10');
  const [insulinType, setInsulinType] = useState('Glargine (Lantus)');
  const [proto, setProto] = useState<Protocol>('treat-to-target');
  const [readings, setReadings] = useState<string[]>(['', '', '']);

  useEffect(() => {
    loadPatient().then(p => {
      if (p && p.name) {
        setPatient(p);
        if (p.age > 65 || p.eGFR < 30) setProto('conservative');
      }
    });
  }, []);

  const result = useMemo(() => {
    const vals = readings.map(r => parseInt(r)).filter(v => v > 0);
    if (vals.length < 3) return null;
    const last3 = vals.slice(-3);
    const avg = Math.round(last3.reduce((s, v) => s + v, 0) / 3);
    const proto_ = PROTOCOLS[proto];
    const rule = proto_.rules.find(r => avg >= r.range[0] && avg < r.range[1]);
    const adj = rule?.adj ?? 0;
    const cur = parseInt(dose) || 0;
    const newDose = Math.max(0, cur + adj);
    return {
      avg, adj, newDose, rule: rule?.label ?? '',
      hasHypo: last3.some(v => v < 70),
      hasSevere: last3.some(v => v < 54),
      atTarget: avg >= proto_.target[0] && avg <= proto_.target[1],
      target: proto_.target,
    };
  }, [readings, dose, proto]);

  if (!patient) {
    return <ScreenContainer><Card><View style={{ alignItems: 'center', padding: 24 }}><Text style={{ color: colors.text, fontSize: 16 }}>Enter patient data first</Text><Button label="Enter Patient" onPress={() => router.push('/patient')} style={{ marginTop: 16 }} /></View></Card></ScreenContainer>;
  }

  const cur = PROTOCOLS[proto];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScreenContainer testID="insulin-titration">
        <Text style={styles.h1}>Insulin Titration</Text>
        <Text style={styles.muted}>ADA basal insulin dose adjustment</Text>

        <Card style={{ backgroundColor: colors.cardElevated }}>
          <Text style={{ color: colors.text, fontSize: 13 }}>{patient.name} · {patient.age}y · eGFR {patient.eGFR} · HbA1c {patient.hba1c}%</Text>
          {(patient.age > 65 || patient.eGFR < 30) && <Text style={{ color: colors.warning, fontSize: 11, marginTop: 4 }}>⚠ Conservative protocol auto-selected</Text>}
        </Card>

        <Card>
          <SectionTitle>Setup</SectionTitle>
          <Text style={styles.label}>Insulin Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {['Glargine (Lantus)', 'Degludec (Tresiba)', 'Detemir (Levemir)', 'NPH (Humulin N)'].map(t => (
              <TouchableOpacity key={t} onPress={() => setInsulinType(t)} style={[styles.optBtn, insulinType === t && styles.optBtnActive]}>
                <Text style={[styles.optText, insulinType === t && { color: colors.primaryFg }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <InputField label="Current Dose (units)" value={dose} onChangeText={setDose} keyboardType="numeric" testID="current-dose" />
          <Text style={styles.label}>Protocol</Text>
          {(Object.keys(PROTOCOLS) as Protocol[]).map(k => (
            <TouchableOpacity key={k} onPress={() => setProto(k)} style={[styles.protoBtn, proto === k && styles.protoBtnActive]} testID={`proto-${k}`}>
              <Text style={[styles.optText, proto === k && { color: colors.primary, fontWeight: '700' }]}>{PROTOCOLS[k].label}</Text>
              <Text style={styles.muted}>{PROTOCOLS[k].desc}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <Card>
          <SectionTitle>Fasting BG Readings</SectionTitle>
          <Text style={styles.muted}>Enter last 3 fasting BG (mg/dL)</Text>
          {readings.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, width: 50 }}>Day {i + 1}</Text>
              <View style={{ flex: 1 }}>
                <InputField value={r} onChangeText={(t) => setReadings(readings.map((x, j) => j === i ? t : x))} placeholder="FBG" keyboardType="numeric" testID={`fbg-${i}`} />
              </View>
            </View>
          ))}
          <Button label="+ Add Day" variant="outline" size="sm" onPress={() => setReadings([...readings, ''])} style={{ marginTop: 6 }} />
        </Card>

        {result && (
          <Card accent={result.atTarget ? colors.success : result.hasHypo ? colors.warning : colors.primary}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Ionicons name="flask" size={16} color={colors.primary} />
              <Text style={styles.h3}>Recommendation</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <View style={styles.statBox}><Text style={styles.statLabel}>3-Day Avg</Text><Text style={[styles.bigVal, { color: result.atTarget ? colors.success : colors.destructive }]}>{result.avg}</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>Current</Text><Text style={styles.bigVal}>{dose}U</Text></View>
              <View style={styles.statBox}><Text style={styles.statLabel}>New Dose</Text><Text style={[styles.bigVal, { color: result.adj > 0 ? colors.primary : result.adj < 0 ? colors.warning : colors.success }]}>{result.newDose}U</Text></View>
            </View>
            <View style={{ padding: 12, borderRadius: radius.md, backgroundColor: result.atTarget ? colors.successSoft : result.adj < 0 ? colors.warningSoft : colors.primarySoft }}>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>
                {result.adj === 0 ? 'No dose change — at target' : result.adj > 0 ? `↑ Increase by ${result.adj}U → ${result.newDose}U` : `↓ Decrease by ${Math.abs(result.adj)}U → ${result.newDose}U`}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>{result.rule}</Text>
            </View>
            {result.hasSevere && <View style={[styles.warnBox, { backgroundColor: colors.destructiveSoft }]}><Text style={{ color: colors.destructive, fontWeight: '700' }}>⚠ SEVERE HYPO (&lt;54). Contact physician immediately.</Text></View>}
            <View style={{ marginTop: 12, padding: 10, backgroundColor: colors.cardElevated, borderRadius: radius.md }}>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>Prescription</Text>
              <Text style={{ color: colors.text, fontSize: 12, marginTop: 2 }}>Insulin {insulinType} — <Text style={{ fontWeight: '700' }}>{result.newDose} units</Text> SC {insulinType.includes('NPH') ? 'at bedtime' : 'OD same time'}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 4 }}>Re-check FBG in 3 days. Repeat until target {result.target[0]}–{result.target[1]} mg/dL.</Text>
            </View>
          </Card>
        )}

        <Card>
          <SectionTitle>Rules — {cur.label}</SectionTitle>
          {cur.rules.map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <Text style={{ color: rule.adj < 0 ? colors.warning : rule.adj === 0 ? colors.success : colors.primary, fontSize: 11, width: 80 }}>
                {rule.range[0]}–{rule.range[1] >= 9999 ? '∞' : rule.range[1]}
              </Text>
              <Text style={{ color: rule.adj < 0 ? colors.warning : rule.adj === 0 ? colors.success : colors.primary, fontSize: 11, fontWeight: '700', width: 60 }}>
                {rule.adj > 0 ? `+${rule.adj}U` : rule.adj < 0 ? `${rule.adj}U` : 'No Δ'}
              </Text>
              <Text style={[styles.muted, { flex: 1 }]}>{rule.label}</Text>
            </View>
          ))}
        </Card>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  h3: { color: colors.text, fontSize: 14, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 11 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '600', marginBottom: 6, marginTop: 6 },
  optBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardElevated },
  optBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optText: { color: colors.text, fontSize: 11 },
  protoBtn: { padding: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardElevated, marginBottom: 6 },
  protoBtnActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  statBox: { flex: 1, padding: 10, backgroundColor: colors.cardElevated, borderRadius: radius.md, alignItems: 'center' },
  statLabel: { color: colors.textMuted, fontSize: 10 },
  bigVal: { color: colors.text, fontSize: 22, fontWeight: '800' },
  warnBox: { padding: 12, borderRadius: radius.md, marginTop: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
});
