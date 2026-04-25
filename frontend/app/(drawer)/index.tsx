import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenContainer } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/lib/theme';
import { PatientData, BLANK_PATIENT, loadPatient, getBMICategory } from '../../src/lib/patient-data';
import { generateMedRecommendations } from '../../src/lib/med-logic';

export default function Dashboard() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData>(BLANK_PATIENT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPatient().then(p => { if (p) setPatient(p); setLoaded(true); });
  }, []);

  const meds = useMemo(() => (patient.name ? generateMedRecommendations(patient) : []), [patient]);
  const bmiCat = getBMICategory(patient.bmi);

  if (!loaded) return null;

  if (!patient.name) {
    return (
      <ScreenContainer testID="dashboard">
        <Text style={styles.h1}>Welcome to Diabetes Buddy</Text>
        <Text style={styles.subtitle}>ADA 2026 clinical decision support tool</Text>
        <Card>
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Ionicons name="person-add-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.h3, { marginTop: 12 }]}>No Patient Profile</Text>
            <Text style={[styles.muted, { textAlign: 'center', marginTop: 6 }]}>
              Start by entering patient demographics, comorbidities, and lab values.
            </Text>
            <TouchableOpacity
              testID="enter-patient-btn"
              onPress={() => router.push('/patient')}
              style={[styles.primaryBtn, { marginTop: 16 }]}
            >
              <Text style={styles.primaryBtnText}>Enter Patient Data</Text>
            </TouchableOpacity>
          </View>
        </Card>
        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.h3}>Quick Tools</Text>
          <View style={styles.grid}>
            {QUICK_LINKS.map(l => (
              <TouchableOpacity key={l.path} style={styles.gridCard} onPress={() => router.push(l.path as any)} testID={`quick-${l.path.replace('/', '')}`}>
                <Ionicons name={l.icon as any} size={22} color={colors.primary} />
                <Text style={styles.gridLabel}>{l.label}</Text>
                <Text style={styles.gridDesc}>{l.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScreenContainer>
    );
  }

  const stats = [
    { label: 'BMI', value: patient.bmi || '—', sub: bmiCat.label, color: bmiCat.color, icon: 'fitness-outline' },
    { label: 'HbA1c', value: patient.hba1c ? `${patient.hba1c}%` : '—', sub: patient.hba1c > 7 ? 'Above target' : 'At target', color: patient.hba1c > 7 ? colors.destructive : colors.success, icon: 'analytics-outline' },
    { label: 'eGFR', value: patient.eGFR || '—', sub: patient.eGFR < 60 && patient.eGFR > 0 ? 'CKD Stage 3' : patient.eGFR ? 'Normal' : '—', color: patient.eGFR < 60 && patient.eGFR > 0 ? colors.warning : colors.success, icon: 'heart-outline' },
    { label: 'RBS', value: patient.rbs || '—', sub: patient.rbs > 250 ? '⚠ High' : patient.rbs ? 'Controlled' : '—', color: patient.rbs > 250 ? colors.destructive : colors.success, icon: 'alert-circle-outline' },
  ];

  return (
    <ScreenContainer testID="dashboard">
      <View style={styles.hero}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>Diabetes Med Optimizer</Text>
            <Text style={styles.heroTitle}>{patient.name}</Text>
            <Text style={styles.heroSub}>
              {patient.age}y {patient.gender === 'M' ? 'Male' : 'Female'}
              {patient.hasPostStroke ? ' · Post-Stroke' : ''}
              {patient.hfNYHA > 0 ? ` · HF NYHA ${patient.hfNYHA}` : ''}
              {patient.hasT2DM ? ' · T2DM' : ''}
            </Text>
          </View>
          <Ionicons name="medkit" size={32} color={colors.primary} style={{ opacity: 0.5 }} />
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map(s => (
          <View key={s.label} style={styles.statCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name={s.icon as any} size={14} color={s.color} />
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statSub}>{s.sub}</Text>
          </View>
        ))}
      </View>

      {patient.serialBG.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Recent BG Trend</Text>
          <View style={styles.chartRow}>
            {patient.serialBG.map((bg, i) => {
              const max = Math.max(...patient.serialBG, 200);
              const h = (bg / max) * 70;
              const color = bg > 180 ? colors.destructive : bg < 70 ? colors.warning : colors.primary;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barLabel}>{bg}</Text>
                  <View style={[styles.bar, { height: h, backgroundColor: color }]} />
                  <Text style={styles.barDay}>D{i + 1}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      {meds.length > 0 && (
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.cardTitle}>Medication Alerts</Text>
            <TouchableOpacity onPress={() => router.push('/medications')} testID="view-all-meds">
              <Text style={{ color: colors.primary, fontSize: 12 }}>View all →</Text>
            </TouchableOpacity>
          </View>
          {meds.slice(0, 3).map((m, i) => (
            <View key={i} style={styles.medItem}>
              <Ionicons name="medical-outline" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.medName} numberOfLines={1}>{m.drug}</Text>
                  <Text style={styles.medBadge}>{m.priority}</Text>
                </View>
                <Text style={styles.medDose}>{m.dose} {m.frequency}</Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      <Text style={[styles.h3, { marginTop: spacing.md, marginBottom: spacing.sm }]}>Quick Tools</Text>
      <View style={styles.grid}>
        {QUICK_LINKS.map(l => (
          <TouchableOpacity key={l.path} style={styles.gridCard} onPress={() => router.push(l.path as any)} testID={`quick-${l.path.replace('/', '')}`}>
            <Ionicons name={l.icon as any} size={22} color={colors.primary} />
            <Text style={styles.gridLabel}>{l.label}</Text>
            <Text style={styles.gridDesc}>{l.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
}

const QUICK_LINKS = [
  { path: '/patient', label: 'Patient', desc: 'Profile & labs', icon: 'person-outline' },
  { path: '/summary', label: 'Summary', desc: 'Full prescription', icon: 'document-text-outline' },
  { path: '/medications', label: 'Meds', desc: 'ADA optimizer', icon: 'medkit-outline' },
  { path: '/insulin-titration', label: 'Insulin', desc: 'Titration', icon: 'flask-outline' },
  { path: '/hypo-risk', label: 'Hypo Risk', desc: 'Score', icon: 'shield-half-outline' },
  { path: '/renal-dosing', label: 'Renal', desc: 'eGFR doses', icon: 'water-outline' },
  { path: '/foods', label: 'Foods', desc: 'Kerala DB', icon: 'restaurant-outline' },
  { path: '/diet-plan', label: '7-Day Plan', desc: 'Diet', icon: 'calendar-outline' },
];

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  h3: { color: colors.text, fontSize: 16, fontWeight: '700' },
  subtitle: { color: colors.textMuted, marginBottom: 16, fontSize: 13 },
  muted: { color: colors.textMuted, fontSize: 13 },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: radius.md },
  primaryBtnText: { color: colors.primaryFg, fontSize: 14, fontWeight: '700' },
  hero: {
    backgroundColor: colors.heroBg, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.heroBgAccent,
  },
  heroLabel: { color: colors.primary, fontSize: 11, marginBottom: 4, fontWeight: '600' },
  heroTitle: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: colors.textMuted, fontSize: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  statCard: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: 12,
    borderWidth: 1, borderColor: colors.border, flex: 1, minWidth: '47%',
  },
  statLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  statSub: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100 },
  barCol: { flex: 1, alignItems: 'center', gap: 2 },
  barLabel: { color: colors.textMuted, fontSize: 9 },
  bar: { width: '80%', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  barDay: { color: colors.textDim, fontSize: 9 },
  medItem: { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: colors.cardElevated, borderRadius: radius.md, marginBottom: 6 },
  medName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  medBadge: { color: colors.primary, backgroundColor: colors.primarySoft, fontSize: 9, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, fontWeight: '700' },
  medDose: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridCard: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: 12,
    borderWidth: 1, borderColor: colors.border, flex: 1, minWidth: '47%', gap: 4,
  },
  gridLabel: { color: colors.text, fontSize: 13, fontWeight: '600', marginTop: 4 },
  gridDesc: { color: colors.textMuted, fontSize: 10 },
});
