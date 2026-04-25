import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenContainer, Button } from '../../src/components/ui';
import { colors, radius } from '../../src/lib/theme';
import { PatientData, loadPatient } from '../../src/lib/patient-data';
import { generatePrediabetesRecommendations } from '../../src/lib/med-logic';

const catColor: Record<string, string> = {
  lifestyle: colors.success,
  'cv-risk': colors.destructive,
  'weight-loss-med': colors.warning,
  'dysglycemia-med': colors.primary,
  surgery: colors.textMuted,
  monitoring: colors.info,
};

const catIcon: Record<string, string> = {
  lifestyle: 'leaf-outline',
  'cv-risk': 'heart-outline',
  'weight-loss-med': 'scale-outline',
  'dysglycemia-med': 'pulse-outline',
  surgery: 'medkit-outline',
  monitoring: 'eye-outline',
};

export default function Prediabetes() {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  useEffect(() => { loadPatient().then(p => p && p.name && p.age > 0 && setPatient(p)); }, []);
  const result = useMemo(() => patient ? generatePrediabetesRecommendations(patient) : null, [patient]);

  if (!patient) {
    return <ScreenContainer><Card><View style={{ alignItems: 'center', padding: 24 }}><Ionicons name="person-remove-outline" size={40} color={colors.textMuted} /><Text style={{ color: colors.text, fontSize: 16, marginTop: 12 }}>No Patient Data</Text><Text style={{ color: colors.textMuted, fontSize: 12, marginVertical: 8, textAlign: 'center' }}>Enter FBS, HbA1c, BMI first.</Text><Button label="Enter Patient" onPress={() => router.push('/patient')} /></View></Card></ScreenContainer>;
  }

  if (!result || !result.isPrediabetic) {
    const overt = patient.hba1c >= 6.5 || patient.fbs >= 126;
    return (
      <ScreenContainer testID="prediabetes">
        <Text style={styles.h1}>Prediabetes Algorithm</Text>
        <Card>
          <View style={{ alignItems: 'center', padding: 24 }}>
            <Ionicons name={overt ? 'warning' : 'checkmark-circle'} size={48} color={overt ? colors.destructive : colors.success} />
            <Text style={[styles.h2, { marginTop: 12 }]}>{overt ? 'Overt Diabetes' : 'Not Prediabetic'}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginVertical: 8, textAlign: 'center' }}>
              {overt ? `HbA1c ${patient.hba1c}% / FBS ${patient.fbs} indicates overt diabetes.` : `HbA1c ${patient.hba1c}% / FBS ${patient.fbs} within normal range.`}
            </Text>
            {overt && <Button label="Go to Medication Optimizer" onPress={() => router.push('/medications')} />}
          </View>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer testID="prediabetes">
      <Text style={styles.h1}>Prediabetes Algorithm</Text>
      <Text style={styles.muted}>AACE 2023 Management Flowchart</Text>

      <Card accent={colors.warning}>
        <Text style={[styles.h3, { color: colors.warning }]}>Prediabetes Criteria Met</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {patient.fbs >= 100 && patient.fbs <= 125 && <Text style={[styles.tag, { color: colors.warning, backgroundColor: colors.warningSoft }]}>IFG: FPG {patient.fbs}</Text>}
          {patient.hba1c >= 5.7 && patient.hba1c <= 6.4 && <Text style={[styles.tag, { color: colors.warning, backgroundColor: colors.warningSoft }]}>A1C: {patient.hba1c}%</Text>}
          <Text style={[styles.tag, { backgroundColor: colors.cardElevated, color: colors.text }]}>BMI: {patient.bmi} ({result.isOverweight ? 'Overweight' : 'Normal'})</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.h3}>Goals</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {result.goals.map((g, i) => <Text key={i} style={[styles.tag, { backgroundColor: colors.cardElevated, color: colors.text }]}>{g}</Text>)}
        </View>
      </Card>

      <Text style={[styles.h2, { marginTop: 12, marginBottom: 8 }]}>Recommendations</Text>
      {result.recommendations.map((rec, i) => (
        <Card key={i} accent={catColor[rec.category]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <Ionicons name={catIcon[rec.category] as any} size={18} color={catColor[rec.category]} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                {rec.isActive && <Ionicons name="checkmark-circle" size={14} color={colors.success} />}
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{rec.detail}</Text>
              {rec.medications && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>Medications:</Text>
                  {rec.medications.map((m, j) => (
                    <View key={j} style={{ flexDirection: 'row', gap: 4, marginTop: 2 }}>
                      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6 }} />
                      <Text style={{ color: colors.text, fontSize: 11 }}>{m}</Text>
                    </View>
                  ))}
                </View>
              )}
              {rec.footnote && <Text style={{ color: colors.textMuted, fontSize: 10, fontStyle: 'italic', marginTop: 6 }}>{rec.footnote}</Text>}
            </View>
          </View>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  h2: { color: colors.text, fontSize: 16, fontWeight: '700' },
  h3: { color: colors.text, fontSize: 14, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 11 },
  tag: { fontSize: 11, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  recTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
});
