import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenContainer } from '../../src/components/ui';
import { colors, radius } from '../../src/lib/theme';
import { PatientData, loadPatient } from '../../src/lib/patient-data';

type Stage = 'none' | 'micro' | 'macro' | 't2d-ckd' | 'cvd' | 'advanced';

function classify(p: PatientData | null): Stage {
  if (!p) return 'none';
  if (p.eGFR < 15 && p.eGFR > 0) return 'advanced';
  if (p.hasASCVD || p.hasPostStroke || p.hasPAD) return 'cvd';
  if (p.hasCKD && p.eGFR < 60) return 't2d-ckd';
  if (p.eGFR < 45 && p.eGFR > 0) return 'macro';
  if (p.eGFR < 60 && p.eGFR > 0) return 'micro';
  return 'none';
}

const STAGES: { id: Stage; label: string; monitoring: string; treatments: string[]; refer: string }[] = [
  { id: 'none', label: 'No Complications', monitoring: 'eGFR/ACR yearly', treatments: ['Lifestyle'], refer: '—' },
  { id: 'micro', label: 'Microalbuminuria (ACR 3–70)', monitoring: '6-monthly', treatments: ['ACEi/ARB', 'SGLT2i if T2D', 'BP <130/80'], refer: 'eGFR drop >5/yr' },
  { id: 'macro', label: 'Macroalbuminuria (ACR >70)', monitoring: 'Quarterly', treatments: ['Maximize ACEi/ARB', 'SGLT2i (eGFR ≥20)', 'GLP-1 RA'], refer: 'ACR persistent >70' },
  { id: 't2d-ckd', label: 'T2D + CKD Stage 3-5', monitoring: 'Per stage', treatments: ['SGLT2i first-line (dapagliflozin)', 'ACEi/ARB', 'Statin'], refer: 'Stage 4-5' },
  { id: 'cvd', label: 'CVD After Treatment', monitoring: 'Lipid + risk', treatments: ['Atorvastatin 20mg', 'Antiplatelet', 'BP <130/80'], refer: 'Complications' },
  { id: 'advanced', label: 'Advanced CKD (eGFR <15)', monitoring: 'Monthly', treatments: ['Dialysis/transplant prep', 'Renal specialist'], refer: 'eGFR <15' },
];

const FLOW = [
  { label: 'Annual Monitoring', detail: 'eGFR + ACR with lifestyle advice', color: colors.primary },
  { label: 'Microalbuminuria?', detail: 'ACR 3-70 → ACEi/ARB, BP <130/80', color: colors.warning },
  { label: 'Macroalbuminuria?', detail: 'ACR >70 → max RAAS, SGLT2i', color: colors.warning },
  { label: 'T2D + CKD?', detail: 'Add SGLT2i if eGFR ≥20', color: colors.success },
  { label: 'CVD Present?', detail: 'Statins, antiplatelets, specialist', color: colors.warning },
  { label: 'Post-Treatment CVD', detail: 'Full lipid, 10y risk, atorvastatin 20', color: colors.success },
  { label: 'End-Stage CKD', detail: 'Renal replacement planning', color: colors.destructive },
];

export default function CKDGuideline() {
  const [patient, setPatient] = useState<PatientData | null>(null);
  useEffect(() => { loadPatient().then(p => p && p.name && setPatient(p)); }, []);
  const stage = useMemo(() => classify(patient), [patient]);
  const active = STAGES.find(s => s.id === stage);

  return (
    <ScreenContainer testID="ckd-guideline">
      <Text style={styles.h1}>NICE CKD Guideline</Text>
      <Text style={styles.muted}>CKD management in T2D — NICE 2026</Text>

      {patient && active && (
        <Card accent={colors.primary}>
          <Text style={styles.muted}>Patient CKD Classification</Text>
          <Text style={[styles.h3, { color: colors.primary }]}>{active.label}</Text>
          <Text style={styles.muted}>eGFR: {patient.eGFR} mL/min/1.73m² · {active.monitoring}</Text>
        </Card>
      )}

      <Card>
        <Text style={styles.h3}>NICE Decision Tree</Text>
        <View style={{ alignItems: 'center', gap: 4 }}>
          {FLOW.map((n, i) => (
            <View key={i} style={{ alignItems: 'center', width: '100%' }}>
              {i > 0 && <Ionicons name="arrow-down" size={14} color={colors.textMuted} />}
              <View style={[styles.flowNode, { borderColor: n.color, backgroundColor: n.color + '15' }]}>
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{n.label}</Text>
                <Text style={styles.muted}>{n.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.h3}>Management Table</Text>
        {STAGES.map(s => (
          <View key={s.id} style={[styles.stageRow, s.id === stage && { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {s.id === stage && <Ionicons name="checkmark-circle" size={14} color={colors.success} />}
              <Text style={[styles.stageLabel, s.id === stage && { color: colors.primary }]}>{s.label}</Text>
            </View>
            <Text style={styles.muted}>📋 {s.monitoring}</Text>
            {s.treatments.map((t, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 4, marginTop: 2 }}>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>•</Text>
                <Text style={{ color: colors.text, fontSize: 11, flex: 1 }}>{t}</Text>
              </View>
            ))}
            {s.refer !== '—' && <Text style={{ color: colors.warning, fontSize: 10, marginTop: 4 }}>⚠ Refer: {s.refer}</Text>}
          </View>
        ))}
      </Card>

      <Card accent={colors.destructive}>
        <Text style={styles.h3}>Post-Treatment CVD Focus</Text>
        {[
          'Full lipid profile and 10-year CVD risk.',
          'Atorvastatin 20mg if needed.',
          'Antiplatelet if prior CVD.',
          'Ongoing BP <130/80, lifestyle.',
        ].map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8, marginVertical: 4 }}>
            <View style={[styles.numCircle, { backgroundColor: colors.destructiveSoft }]}><Text style={{ color: colors.destructive, fontWeight: '700' }}>{i + 1}</Text></View>
            <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>{s}</Text>
          </View>
        ))}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  h3: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  muted: { color: colors.textMuted, fontSize: 11 },
  flowNode: { borderWidth: 2, padding: 10, borderRadius: radius.md, width: '100%', marginVertical: 2 },
  stageRow: { padding: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: 6 },
  stageLabel: { color: colors.text, fontSize: 12, fontWeight: '600', flex: 1 },
  numCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
