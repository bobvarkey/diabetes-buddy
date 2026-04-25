import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenContainer, Button, Pill } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/lib/theme';
import { PatientData, loadPatient } from '../../src/lib/patient-data';
import {
  generateMedRecommendations, getAlgorithmPathway, getPathwayLabel,
  getHypoProtocol, getLipidTargets, getCategoryLabel, getDrugClassLabel,
  AlgorithmPriority, MedRecommendation,
} from '../../src/lib/med-logic';

const catColor: Record<AlgorithmPriority, string> = {
  'cvkd-risk': colors.destructive,
  'weight-management': colors.warning,
  'glycemic-control': colors.primary,
  lipid: colors.info,
  'current-med-review': colors.textMuted,
};

const priColor = (p: string) => {
  if (p === 'first-line') return { bg: colors.primarySoft, fg: colors.primary };
  if (p === 'adjustment') return { bg: colors.warningSoft, fg: colors.warning };
  if (p === 'add-on') return { bg: colors.infoSoft, fg: colors.info };
  if (p === 'intensification') return { bg: colors.destructiveSoft, fg: colors.destructive };
  if (p === 'de-escalate') return { bg: colors.cardElevated, fg: colors.textMuted };
  return { bg: colors.cardElevated, fg: colors.textMuted };
};

export default function Medications() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0, 1]));

  useEffect(() => { loadPatient().then(p => { if (p && p.name) setPatient(p); }); }, []);

  const meds = useMemo(() => (patient ? generateMedRecommendations(patient) : []), [patient]);
  const pathway = patient ? getAlgorithmPathway(patient) : null;
  const hypo = patient ? getHypoProtocol(patient) : null;
  const lipids = patient ? getLipidTargets(patient) : null;

  const grouped = useMemo(() => {
    if (!meds.length) return [];
    const order: AlgorithmPriority[] = ['cvkd-risk', 'weight-management', 'glycemic-control', 'lipid', 'current-med-review'];
    return order
      .map(c => ({ category: c, label: getCategoryLabel(c), meds: meds.filter(m => m.category === c) }))
      .filter(g => g.meds.length > 0);
  }, [meds]);

  if (!patient) {
    return (
      <ScreenContainer testID="medications">
        <Card>
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Ionicons name="person-remove-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.h2, { marginTop: 12 }]}>No Patient Data</Text>
            <Text style={[styles.muted, { textAlign: 'center', marginVertical: 8 }]}>
              Enter patient demographics, comorbidities, and lab values first.
            </Text>
            <Button label="Enter Patient Data" onPress={() => router.push('/patient')} testID="goto-patient" />
          </View>
        </Card>
      </ScreenContainer>
    );
  }

  let medIdx = 0;

  return (
    <ScreenContainer testID="medications">
      <Text style={styles.h1}>Medication Optimizer</Text>
      <Text style={styles.muted}>ADA 2026 Priorities-First Algorithm</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroName}>{patient.name} · {patient.age}y {patient.gender}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          <Text style={styles.heroStat}>BMI {patient.bmi}</Text>
          <Text style={styles.heroStat}>eGFR {patient.eGFR}</Text>
          <Text style={styles.heroStat}>HF NYHA {patient.hfNYHA}</Text>
          <Text style={styles.heroStat}>HbA1c {patient.hba1c}%</Text>
          <Text style={styles.heroStat}>RBS {patient.rbs}</Text>
          <Text style={styles.heroStat}>LDL {patient.ldl}</Text>
        </View>
      </View>

      {pathway && (
        <Card accent={colors.primary}>
          <Text style={styles.muted}>ADA 2026 Pathway</Text>
          <Text style={[styles.h3, { color: colors.primary }]}>{getPathwayLabel(pathway)}</Text>
          <Text style={[styles.muted, { marginTop: 4 }]}>
            First-line: Metformin + lifestyle. {meds.length} recommendations across {grouped.length} priorities.
          </Text>
        </Card>
      )}

      {grouped.map(group => (
        <View key={group.category}>
          <View style={styles.catHeader}>
            <View style={[styles.catDot, { backgroundColor: catColor[group.category] }]} />
            <Text style={styles.catLabel}>{group.label}</Text>
            <Text style={styles.catCount}>{group.meds.length}</Text>
          </View>
          {group.meds.map(m => {
            const idx = medIdx++;
            const open = expanded.has(idx);
            const pri = priColor(m.priority);
            return (
              <Card key={idx} accent={catColor[group.category]} style={{ padding: 12 }}>
                <TouchableOpacity onPress={() => setExpanded(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; })} testID={`med-${idx}`}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.medTitle}>{m.drug}</Text>
                      <Text style={styles.medClass}>{getDrugClassLabel(m.drugClass)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: pri.bg }}>
                        <Text style={{ color: pri.fg, fontSize: 10, fontWeight: '700' }}>{m.priority}</Text>
                      </View>
                      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                    </View>
                  </View>
                  <View style={styles.doseRow}>
                    <Text style={styles.doseText}><Text style={styles.doseLabel}>Dose: </Text>{m.dose}</Text>
                    <Text style={styles.doseText}><Text style={styles.doseLabel}>Freq: </Text>{m.frequency}</Text>
                  </View>
                </TouchableOpacity>

                {open && (
                  <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Text style={styles.reason}>{m.reason}</Text>
                    <View style={styles.statTriple}>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>HbA1c ↓</Text>
                        <Text style={styles.statVal}>{m.hba1cReduction}</Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>Weight</Text>
                        <Text style={[styles.statVal, { color: m.weightEffect === 'loss' ? colors.success : m.weightEffect === 'gain' ? colors.destructive : colors.textMuted }]}>
                          {m.weightEffect === 'loss' ? '↓ Loss' : m.weightEffect === 'gain' ? '↑ Gain' : '→ Neutral'}
                        </Text>
                      </View>
                      <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>CV</Text>
                        <Text style={[styles.statVal, { color: m.cvBenefit ? colors.success : colors.textMuted }]}>{m.cvBenefit ? '✓ Proven' : '— Neutral'}</Text>
                      </View>
                    </View>
                    {m.warnings.map((w, i) => (
                      <View key={i} style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <Ionicons name="warning-outline" size={12} color={colors.warning} style={{ marginTop: 2 }} />
                        <Text style={{ color: colors.text, fontSize: 11, flex: 1 }}>{w}</Text>
                      </View>
                    ))}
                    {m.contraindications.length > 0 && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={{ color: colors.destructive, fontSize: 10, fontWeight: '700' }}>Contraindications:</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                          {m.contraindications.map((c, i) => (
                            <Pill key={i} label={c} bg={colors.destructiveSoft} color={colors.destructive} />
                          ))}
                        </View>
                      </View>
                    )}
                    <Text style={[styles.muted, { marginTop: 8, fontSize: 10, fontStyle: 'italic' }]}>{m.adaReference}</Text>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      ))}

      {lipids && lipids.ldlGap > 0 && (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Ionicons name="heart" size={16} color={colors.destructive} />
            <Text style={styles.h3}>LAI Lipid Targets</Text>
          </View>
          <Text style={styles.muted}>Risk: {lipids.riskCategory}</Text>
          <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontSize: 13 }}>LDL-C</Text>
              <Text style={{ color: lipids.ldlCurrent > lipids.ldlTarget ? colors.destructive : colors.success, fontSize: 12 }}>
                {lipids.ldlCurrent} → Target &lt;{lipids.ldlTarget} mg/dL
              </Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${Math.min((lipids.ldlCurrent / 200) * 100, 100)}%`, backgroundColor: colors.destructive }]} />
            </View>
            <Text style={{ color: colors.destructive, fontSize: 11, marginTop: 4 }}>Gap: {lipids.ldlGap} mg/dL to target</Text>
          </View>
        </Card>
      )}

      {hypo && (
        <Card accent={colors.warning}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Ionicons name="shield-half-outline" size={16} color={colors.warning} />
            <Text style={styles.h3}>Hypoglycemia Protocol</Text>
          </View>
          <Text style={styles.muted}>Trigger: {hypo.trigger}</Text>
          <Text style={[styles.h4, { color: colors.destructive, marginTop: 8 }]}>Immediate Actions</Text>
          {hypo.immediate.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: colors.destructiveSoft }]}><Text style={{ color: colors.destructive, fontSize: 11, fontWeight: '700' }}>{i + 1}</Text></View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
          <Text style={[styles.h4, { color: colors.warning, marginTop: 8 }]}>Follow-up</Text>
          {hypo.followUp.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: colors.warningSoft }]}><Text style={{ color: colors.warning, fontSize: 11, fontWeight: '700' }}>{i + 1}</Text></View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  h2: { color: colors.text, fontSize: 18, fontWeight: '700' },
  h3: { color: colors.text, fontSize: 14, fontWeight: '700' },
  h4: { fontSize: 12, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 12 },
  heroCard: {
    backgroundColor: colors.heroBg, borderRadius: radius.lg, padding: 14,
    marginVertical: spacing.md, borderWidth: 1, borderColor: colors.heroBgAccent,
  },
  heroName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  heroStat: { color: colors.primary, fontSize: 11, backgroundColor: colors.cardElevated, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catLabel: { color: colors.text, fontSize: 13, fontWeight: '700', flex: 1 },
  catCount: { color: colors.textMuted, fontSize: 11 },
  medTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  medClass: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  doseRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.cardElevated, padding: 8, borderRadius: radius.sm, marginTop: 8 },
  doseLabel: { color: colors.textMuted, fontSize: 10 },
  doseText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  reason: { color: colors.textMuted, fontSize: 12, marginBottom: 8 },
  statTriple: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  statBlock: { flex: 1, padding: 6, backgroundColor: colors.cardElevated, borderRadius: radius.sm, alignItems: 'center' },
  statLabel: { color: colors.textMuted, fontSize: 9 },
  statVal: { color: colors.text, fontSize: 11, fontWeight: '600', marginTop: 2 },
  barBg: { height: 6, backgroundColor: colors.cardElevated, borderRadius: 3, marginTop: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  stepRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  stepNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.text, fontSize: 12, flex: 1 },
});
