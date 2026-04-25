import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenContainer, InputField, ToggleRow, SectionTitle } from '../../src/components/ui';
import { colors, radius } from '../../src/lib/theme';
import { loadPatient, getCKDStage } from '../../src/lib/patient-data';

interface Factor { id: string; label: string; desc: string; points: number; active: boolean; cat: string; }

const INPUT_DRIVEN = new Set(['age65', 'age75', 'lowBMI', 'ckd3', 'ckd4', 'insulin', 'priorHypo', 'severeHypo']);

const initialFactors: Factor[] = [
  { id: 'age65', label: 'Age ≥ 65', desc: 'Impaired counter-regulation', points: 2, active: false, cat: 'demographic' },
  { id: 'age75', label: 'Age ≥ 75', desc: 'Cognitive decline, fall risk', points: 3, active: false, cat: 'demographic' },
  { id: 'lowBMI', label: 'BMI < 20', desc: 'Reduced glycogen stores', points: 1, active: false, cat: 'demographic' },
  { id: 'ckd3', label: 'CKD Stage 3 (eGFR 30-59)', desc: 'Reduced insulin clearance', points: 2, active: false, cat: 'clinical' },
  { id: 'ckd4', label: 'CKD Stage 4-5 (eGFR <30)', desc: 'Severely reduced clearance', points: 4, active: false, cat: 'clinical' },
  { id: 'hf', label: 'Heart failure NYHA ≥II', desc: 'Hepatic congestion', points: 2, active: false, cat: 'clinical' },
  { id: 'liver', label: 'Hepatic impairment', desc: 'Reduced glycogen storage', points: 3, active: false, cat: 'clinical' },
  { id: 'cognitive', label: 'Cognitive impairment', desc: 'Cannot recognize hypo', points: 3, active: false, cat: 'clinical' },
  { id: 'neuropathy', label: 'Autonomic neuropathy', desc: 'Hypo unawareness', points: 3, active: false, cat: 'clinical' },
  { id: 'malnutrition', label: 'Poor oral intake', desc: 'Inadequate carb substrate', points: 2, active: false, cat: 'clinical' },
  { id: 'dysphagia', label: 'Dysphagia', desc: 'Cannot self-treat', points: 2, active: false, cat: 'clinical' },
  { id: 'insulin', label: 'On insulin', desc: 'Dose-dependent risk', points: 3, active: false, cat: 'medication' },
  { id: 'su', label: 'On sulfonylurea', desc: 'Glimepiride/gliclazide', points: 3, active: false, cat: 'medication' },
  { id: 'meglitinide', label: 'On meglitinide', desc: 'Meal-time hypo risk', points: 1, active: false, cat: 'medication' },
  { id: 'insulinSU', label: 'Insulin + SU', desc: 'Synergistic hypo risk', points: 2, active: false, cat: 'medication' },
  { id: 'polypharm', label: '≥5 medications', desc: 'Drug interactions', points: 1, active: false, cat: 'medication' },
  { id: 'priorHypo', label: 'Prior hypo episode', desc: 'Strongest predictor', points: 4, active: false, cat: 'history' },
  { id: 'severeHypo', label: 'Prior severe hypo', desc: 'Recurrence risk', points: 5, active: false, cat: 'history' },
  { id: 'unawareness', label: 'Hypo unawareness', desc: 'Life-threatening', points: 5, active: false, cat: 'history' },
  { id: 'recentHospital', label: 'Recent hospitalization', desc: '<3 months', points: 2, active: false, cat: 'history' },
  { id: 'longDM', label: 'DM duration >10y', desc: 'Beta-cell failure', points: 1, active: false, cat: 'history' },
];

export default function HypoRisk() {
  const [factors, setFactors] = useState<Factor[]>(initialFactors);
  const [age, setAge] = useState(''); const [bmi, setBmi] = useState(''); const [eGFR, setEgfr] = useState('');
  const [onIns, setOnIns] = useState(false); const [prior, setPrior] = useState(false); const [severe, setSevere] = useState(false);
  const [patientName, setPatientName] = useState('');

  useEffect(() => { loadPatient().then(p => {
    if (p && p.name) {
      setPatientName(p.name);
      if (p.age) setAge(String(p.age));
      if (p.bmi) setBmi(String(p.bmi));
      if (p.eGFR) setEgfr(String(p.eGFR));
      const ins = p.currentMeds.some(m => /insulin/i.test(m));
      setOnIns(ins);
    }
  }); }, []);

  useEffect(() => {
    const a = Number(age), b = Number(bmi), e = Number(eGFR);
    setFactors(prev => prev.map(f => {
      if (f.id === 'age65') return { ...f, active: !!age && a >= 65 };
      if (f.id === 'age75') return { ...f, active: !!age && a >= 75 };
      if (f.id === 'lowBMI') return { ...f, active: !!bmi && b < 20 };
      if (f.id === 'ckd3') return { ...f, active: !!eGFR && e >= 30 && e < 60 };
      if (f.id === 'ckd4') return { ...f, active: !!eGFR && e < 30 };
      if (f.id === 'insulin') return { ...f, active: onIns };
      if (f.id === 'priorHypo') return { ...f, active: prior };
      if (f.id === 'severeHypo') return { ...f, active: severe };
      return f;
    }));
  }, [age, bmi, eGFR, onIns, prior, severe]);

  const toggle = (id: string) => {
    if (INPUT_DRIVEN.has(id)) return;
    setFactors(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  const result = useMemo(() => {
    const active = factors.filter(f => f.active);
    const total = active.reduce((s, f) => s + f.points, 0);
    let level: string, rec: string, target: string, color: string;
    if (total <= 3) { level = 'low'; rec = 'Standard glycemic targets. Routine monitoring.'; target = '< 7.0%'; color = colors.success; }
    else if (total <= 8) { level = 'moderate'; rec = 'Consider relaxed targets. Avoid SU. Prefer GLP-1 RA, SGLT2i, DPP-4i.'; target = '< 7.5%'; color = colors.warning; }
    else if (total <= 15) { level = 'high'; rec = 'Relaxed HbA1c. De-escalate SU/insulin. Hypo kit. Consider CGM.'; target = '< 8.0%'; color = colors.destructive; }
    else { level = 'very-high'; rec = 'Avoid hypo-causing agents. Safety > tight control. CGM recommended. Endocrinology referral.'; target = '< 8.5%'; color = colors.destructive; }
    return { total, level, rec, target, color, count: active.length };
  }, [factors]);

  const cats = ['demographic', 'clinical', 'medication', 'history'];
  const catLabels: Record<string, string> = { demographic: 'Demographics', clinical: 'Clinical', medication: 'Medications', history: 'History' };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScreenContainer testID="hypo-risk">
        <Text style={styles.h1}>Hypoglycemia Risk Score</Text>
        <Text style={styles.muted}>Multi-factor ADA 2026 + clinical evidence</Text>

        {patientName ? <Card style={{ backgroundColor: colors.cardElevated }}>
          <Text style={{ color: colors.text, fontSize: 13 }}>{patientName} {eGFR ? `· eGFR ${eGFR} (${getCKDStage(Number(eGFR))})` : ''}</Text>
        </Card> : null}

        <Card>
          <SectionTitle>Manual Inputs</SectionTitle>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><InputField label="Age" value={age} onChangeText={setAge} keyboardType="numeric" testID="hypo-age" /></View>
            <View style={{ flex: 1 }}><InputField label="BMI" value={bmi} onChangeText={setBmi} keyboardType="decimal-pad" testID="hypo-bmi" /></View>
            <View style={{ flex: 1 }}><InputField label="eGFR" value={eGFR} onChangeText={setEgfr} keyboardType="numeric" testID="hypo-egfr" /></View>
          </View>
          <ToggleRow label="On insulin therapy" value={onIns} onValueChange={setOnIns} testID="t-insulin" />
          <ToggleRow label="Prior hypoglycemia" value={prior} onValueChange={setPrior} testID="t-prior" />
          <ToggleRow label="Prior severe hypo" value={severe} onValueChange={setSevere} testID="t-severe" />
        </Card>

        <Card accent={result.color}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[styles.bigTitle, { color: result.color, textTransform: 'capitalize' }]}>{result.level.replace('-', ' ')} Risk</Text>
              <Text style={styles.muted}>{result.count} active factors</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.bigVal, { color: result.color }]}>{result.total}</Text>
              <Text style={styles.muted}>points</Text>
            </View>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${Math.min((result.total / 40) * 100, 100)}%`, backgroundColor: result.color }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={styles.tinyMuted}>Low (0-3)</Text>
            <Text style={styles.tinyMuted}>Moderate (4-8)</Text>
            <Text style={styles.tinyMuted}>High (9-15)</Text>
            <Text style={styles.tinyMuted}>V.High (16+)</Text>
          </View>
          <View style={{ marginTop: 12, padding: 12, borderRadius: radius.md, backgroundColor: colors.cardElevated }}>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>Recommended HbA1c</Text>
            <Text style={[styles.bigVal, { color: result.color, fontSize: 18 }]}>{result.target}</Text>
          </View>
          <View style={{ marginTop: 8, padding: 10, borderRadius: radius.md, backgroundColor: result.color + '22' }}>
            <Text style={{ color: colors.text, fontSize: 12 }}>{result.rec}</Text>
          </View>
        </Card>

        {cats.map(cat => {
          const list = factors.filter(f => f.cat === cat);
          const activeC = list.filter(f => f.active).length;
          return (
            <Card key={cat}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Text style={styles.h3}>{catLabels[cat]}</Text>
                {activeC > 0 && <Text style={{ color: colors.warning, fontSize: 10, backgroundColor: colors.warningSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, fontWeight: '700' }}>{activeC} active</Text>}
              </View>
              {list.map(f => {
                const driven = INPUT_DRIVEN.has(f.id);
                return (
                  <TouchableOpacity key={f.id} onPress={() => toggle(f.id)} disabled={driven} style={[styles.factorRow, f.active && { backgroundColor: colors.warningSoft, borderColor: colors.warning + '33' }]}>
                    <View style={[styles.checkbox, f.active && { backgroundColor: colors.warning }]}>
                      {f.active && <Text style={{ color: colors.primaryFg, fontSize: 11, fontWeight: '900' }}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>{f.label}</Text>
                        <Text style={{ color: f.points >= 4 ? colors.destructive : f.points >= 2 ? colors.warning : colors.textMuted, fontSize: 10, backgroundColor: f.points >= 4 ? colors.destructiveSoft : f.points >= 2 ? colors.warningSoft : colors.cardElevated, paddingHorizontal: 5, borderRadius: 999 }}>+{f.points}</Text>
                        {driven && <Text style={{ fontSize: 9, color: colors.textDim }}>auto</Text>}
                      </View>
                      <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>{f.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Card>
          );
        })}
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  h3: { color: colors.text, fontSize: 14, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 11 },
  tinyMuted: { color: colors.textMuted, fontSize: 9 },
  bigTitle: { fontSize: 18, fontWeight: '800' },
  bigVal: { fontSize: 28, fontWeight: '900' },
  barBg: { height: 8, backgroundColor: colors.cardElevated, borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  factorRow: { flexDirection: 'row', gap: 10, padding: 8, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent', marginVertical: 2 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
});
