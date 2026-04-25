import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenContainer, Pill, Button } from '../../src/components/ui';
import { colors, radius } from '../../src/lib/theme';
import { PatientData, loadPatient, getBMICategory, getCKDStage } from '../../src/lib/patient-data';
import { generateMedRecommendations, getCategoryLabel, getDrugClassLabel, AlgorithmPriority, getHypoProtocol, getLipidTargets } from '../../src/lib/med-logic';
import { generate7DayPlan, DayPlan } from '../../src/lib/diet-generator';

export default function Summary() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [openMed, setOpenMed] = useState<Set<number>>(new Set());
  const [openDay, setOpenDay] = useState(0);
  const [diet, setDiet] = useState<DayPlan[]>([]);

  useEffect(() => { loadPatient().then(p => { if (p && p.name) { setPatient(p); setDiet(generate7DayPlan(p)); } }); }, []);

  const meds = useMemo(() => (patient ? generateMedRecommendations(patient) : []), [patient]);
  const hypo = patient ? getHypoProtocol(patient) : null;
  const lipids = patient ? getLipidTargets(patient) : null;

  const grouped = useMemo(() => {
    const order: AlgorithmPriority[] = ['cvkd-risk', 'weight-management', 'glycemic-control', 'lipid', 'current-med-review'];
    return order.map(c => ({ category: c, label: getCategoryLabel(c), meds: meds.filter(m => m.category === c) })).filter(g => g.meds.length > 0);
  }, [meds]);

  if (!patient) {
    return <ScreenContainer><Card><Text style={{ color: colors.textMuted, textAlign: 'center', padding: 16 }}>Load patient data first.</Text><Button label="Enter Patient" onPress={() => router.push('/patient')} /></Card></ScreenContainer>;
  }

  const bmiCat = getBMICategory(patient.bmi);
  const comorbidities = [
    patient.hasASCVD && 'ASCVD', patient.hasPostStroke && 'Post-Stroke',
    patient.hasCKD && `CKD (${getCKDStage(patient.eGFR)})`, patient.hfNYHA > 0 && `HF NYHA ${patient.hfNYHA}`,
    patient.hasHypertension && 'Hypertension', patient.hasObesity && 'Obesity',
    patient.hasRetinopathy && 'Retinopathy', patient.hasNeuropathy && 'Neuropathy',
    patient.hasPAD && 'PAD', patient.postStrokeDysphagia && `Dysphagia (${patient.dysphagiaLevel})`,
    patient.hasNAFLD && 'NAFLD', patient.hasOSA && 'OSA',
  ].filter(Boolean) as string[];

  let medIdx = 0;

  return (
    <ScreenContainer testID="summary">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View>
          <Text style={styles.h1}>Complete Prescription</Text>
          <Text style={styles.muted}>ADA 2026 · LAI Lipid · Kerala Diet</Text>
        </View>
        <Button label="Edit" variant="outline" size="sm" onPress={() => router.push('/patient')} testID="edit-patient" />
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroName}>{patient.name || 'Unnamed Patient'}</Text>
        <Text style={styles.heroSub}>{patient.age}y · {patient.gender === 'F' ? 'Female' : 'Male'} · {patient.hasT2DM ? 'Type 2 DM' : 'Non-DM'}</Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}><Text style={styles.heroStatLabel}>BMI</Text><Text style={styles.heroStatVal}>{patient.bmi || '—'}</Text><Text style={styles.heroStatSub}>{bmiCat.label}</Text></View>
          <View style={styles.heroStat}><Text style={styles.heroStatLabel}>eGFR</Text><Text style={styles.heroStatVal}>{patient.eGFR || '—'}</Text><Text style={styles.heroStatSub}>mL/min</Text></View>
          <View style={styles.heroStat}><Text style={styles.heroStatLabel}>HbA1c</Text><Text style={styles.heroStatVal}>{patient.hba1c || '—'}%</Text></View>
          <View style={styles.heroStat}><Text style={styles.heroStatLabel}>FBS/RBS</Text><Text style={styles.heroStatVal}>{patient.fbs || '—'}/{patient.rbs || '—'}</Text></View>
        </View>
        {comorbidities.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
            {comorbidities.map((c, i) => <Pill key={i} label={c} bg={colors.cardElevated} color={colors.text} />)}
          </View>
        )}
        {patient.currentMeds.length > 0 && (
          <View style={{ marginTop: 6 }}>
            <Text style={[styles.muted, { fontSize: 10, marginBottom: 4 }]}>Current Medications:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {patient.currentMeds.map((m, i) => <Pill key={i} label={m} bg={colors.cardElevated} color={colors.text} />)}
            </View>
          </View>
        )}
      </View>

      <View style={styles.sectionHead}>
        <Ionicons name="medkit" size={18} color={colors.primary} />
        <Text style={styles.h2}>A. Medication Prescription</Text>
        <Text style={[styles.muted, { marginLeft: 'auto' }]}>{meds.length} meds</Text>
      </View>

      {grouped.map(g => (
        <View key={g.category}>
          <Text style={styles.catLabel}>{g.label}</Text>
          {g.meds.map(m => {
            const idx = medIdx++;
            const isOpen = openMed.has(idx);
            return (
              <Card key={idx} style={{ padding: 10 }}>
                <TouchableOpacity onPress={() => setOpenMed(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; })}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medTitle}>{m.drug}</Text>
                      <Text style={styles.muted}>{getDrugClassLabel(m.drugClass)} · <Text style={{ color: colors.text, fontWeight: '700' }}>{m.dose}</Text> {m.frequency}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.priBadge}>{m.priority}</Text>
                      <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
                    </View>
                  </View>
                </TouchableOpacity>
                {isOpen && (
                  <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <Text style={styles.muted}>{m.reason}</Text>
                    <Text style={[styles.muted, { fontSize: 10, marginTop: 6, fontStyle: 'italic' }]}>{m.adaReference}</Text>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      ))}

      {lipids && lipids.ldlGap > 0 && (
        <Card>
          <Text style={[styles.h3, { color: colors.destructive }]}>LDL-C Gap</Text>
          <Text style={styles.muted}>Current: {lipids.ldlCurrent} → Target: &lt;{lipids.ldlTarget} mg/dL · Gap: {lipids.ldlGap}</Text>
        </Card>
      )}

      {hypo && (
        <Card accent={colors.warning}>
          <Text style={[styles.h3, { color: colors.warning }]}>Hypoglycemia Protocol (BG &lt;70)</Text>
          {hypo.immediate.map((s, i) => <Text key={i} style={{ color: colors.text, fontSize: 12, marginVertical: 2 }}>{i + 1}. {s}</Text>)}
        </Card>
      )}

      <View style={styles.sectionHead}>
        <Ionicons name="restaurant" size={18} color={colors.primary} />
        <Text style={styles.h2}>B. 7-Day Kerala Diet</Text>
      </View>

      {diet.map((day, di) => (
        <Card key={di} style={{ padding: 10 }}>
          <TouchableOpacity onPress={() => setOpenDay(openDay === di ? -1 : di)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.medTitle}>{day.day}</Text>
              <Text style={styles.muted}>{day.totalCalories} kcal · {day.totalCarbs}g carbs</Text>
            </View>
            <Ionicons name={openDay === di ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
          </TouchableOpacity>
          {openDay === di && (
            <View style={{ marginTop: 8, gap: 8 }}>
              {day.meals.map((meal, mi) => (
                <View key={mi}>
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{meal.name} · <Text style={styles.muted}>{meal.time}</Text></Text>
                  {meal.foods.map((f, fi) => (
                    <Text key={fi} style={{ color: colors.textMuted, fontSize: 11, paddingLeft: 8 }}>• {f.food.name}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </Card>
      ))}

      <Card style={{ backgroundColor: colors.cardElevated }}>
        <Text style={{ color: colors.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 14 }}>
          Diabetes Buddy · ADA Standards 2026 · LAI Lipid Guidelines{'\n'}
          Clinical decision support tool — physician review required.
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 20, fontWeight: '800' },
  h2: { color: colors.text, fontSize: 16, fontWeight: '700' },
  h3: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  muted: { color: colors.textMuted, fontSize: 11 },
  hero: { backgroundColor: colors.heroBg, borderRadius: radius.lg, padding: 14, marginVertical: 10, borderWidth: 1, borderColor: colors.heroBgAccent },
  heroName: { color: colors.text, fontSize: 17, fontWeight: '800' },
  heroSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  heroStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  heroStat: { flex: 1, minWidth: '47%', backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: 8, borderRadius: radius.sm },
  heroStatLabel: { color: colors.textMuted, fontSize: 10 },
  heroStatVal: { color: colors.text, fontSize: 16, fontWeight: '800' },
  heroStatSub: { color: colors.textMuted, fontSize: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, marginBottom: 8 },
  catLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600', marginVertical: 6, paddingHorizontal: 4 },
  medTitle: { color: colors.text, fontSize: 13, fontWeight: '600' },
  priBadge: { color: colors.primary, backgroundColor: colors.primarySoft, fontSize: 9, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, fontWeight: '700' },
});
