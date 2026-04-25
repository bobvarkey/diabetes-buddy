import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenContainer, InputField, ToggleRow, Button, Pill, SectionTitle } from '../../src/components/ui';
import { colors, spacing, radius } from '../../src/lib/theme';
import {
  PatientData, BLANK_PATIENT, EXAMPLE_PATIENT, loadPatient, savePatient, clearPatient,
  calculateBMI, calculateEGFR, getBMICategory, getCKDStage,
} from '../../src/lib/patient-data';

const COMMON_MEDS = [
  'Metformin 500mg BD', 'Metformin 1000mg BD',
  'Glimepiride 1mg OD', 'Glimepiride 2mg OD',
  'Gliclazide MR 30mg OD', 'Gliclazide MR 60mg OD',
  'Sitagliptin 100mg OD', 'Linagliptin 5mg OD', 'Vildagliptin 50mg BD',
  'Empagliflozin 10mg OD', 'Empagliflozin 25mg OD', 'Dapagliflozin 10mg OD',
  'Pioglitazone 15mg OD', 'Pioglitazone 30mg OD',
  'Voglibose 0.2mg TDS', 'Voglibose 0.3mg TDS',
  'Insulin Glargine 10U HS', 'Insulin Degludec 10U OD', 'Insulin Aspart before meals',
  'Semaglutide 0.25mg weekly', 'Semaglutide 0.5mg weekly',
  'Liraglutide 1.2mg daily', 'Dulaglutide 1.5mg weekly',
  'Tirzepatide 5mg weekly',
  'Rosuvastatin 10mg OD', 'Atorvastatin 40mg OD',
  'Telmisartan 40mg OD', 'Amlodipine 5mg OD', 'Aspirin 75mg OD',
];

export default function PatientForm() {
  const router = useRouter();
  const [p, setP] = useState<PatientData>(BLANK_PATIENT);
  const [newMed, setNewMed] = useState('');
  const [newBG, setNewBG] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => { loadPatient().then(saved => { if (saved) setP(saved); }); }, []);

  const update = (field: keyof PatientData, value: any) => {
    setP(prev => {
      const next: any = { ...prev, [field]: value };
      if (field === 'heightCm' || field === 'weightKg') {
        next.bmi = calculateBMI(field === 'heightCm' ? value : next.heightCm, field === 'weightKg' ? value : next.weightKg);
        next.hasObesity = next.bmi >= 25;
      }
      if (field === 'creatinine' && value > 0 && next.age > 0) {
        next.eGFR = calculateEGFR(value, next.age, next.gender);
        next.hasCKD = next.eGFR < 60;
      }
      if ((field === 'age' || field === 'gender') && next.creatinine > 0 && next.age > 0) {
        next.eGFR = calculateEGFR(next.creatinine, field === 'age' ? value : next.age, field === 'gender' ? value : next.gender);
        next.hasCKD = next.eGFR < 60;
      }
      if (field === 'hasPostStroke' && value) next.hasASCVD = true;
      if (field === 'hasHF') {
        if (!value) next.hfNYHA = 0;
        else if (next.hfNYHA === 0) next.hfNYHA = 2;
      }
      return next;
    });
  };

  const numStr = (n: number) => (n ? String(n) : '');
  const setNum = (field: keyof PatientData) => (s: string) => update(field, s === '' ? 0 : parseFloat(s));

  const addMed = (med?: string) => {
    const m = (med || newMed).trim();
    if (!m) return;
    if (!p.currentMeds.includes(m)) update('currentMeds', [...p.currentMeds, m]);
    setNewMed(''); setShowPicker(false);
  };

  const handleSave = async () => { await savePatient(p); Alert.alert('Saved', 'Patient data saved'); };
  const handleReset = async () => { await clearPatient(); setP(BLANK_PATIENT); };
  const handleExample = async () => { setP(EXAMPLE_PATIENT); await savePatient(EXAMPLE_PATIENT); };

  const handleGenerate = async () => {
    if (!p.name || !p.age || !p.weightKg) {
      Alert.alert('Required', 'Please enter at least name, age, and weight');
      return;
    }
    await savePatient(p);
    router.push('/summary');
  };

  const bmiCat = getBMICategory(p.bmi);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScreenContainer testID="patient-form">
        <Text style={styles.h1}>Patient Profile</Text>
        <Text style={styles.muted}>ADA 2026 assessment</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginVertical: 12, flexWrap: 'wrap' }}>
          <Button label="Load Example" variant="outline" size="sm" onPress={handleExample} testID="load-example-btn" />
          <Button label="Clear" variant="outline" size="sm" onPress={handleReset} testID="clear-btn" />
          <Button label="Save" variant="outline" size="sm" onPress={handleSave} testID="save-btn" />
        </View>

        <Card>
          <SectionTitle>Demographics</SectionTitle>
          <InputField label="Name" value={p.name} onChangeText={(t) => update('name', t)} placeholder="Patient name" testID="patient-name" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <InputField label="Age" value={numStr(p.age)} onChangeText={setNum('age')} unit="yrs" keyboardType="numeric" testID="patient-age" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Gender</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(['M', 'F'] as const).map(g => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => update('gender', g)}
                    style={[styles.segBtn, p.gender === g && styles.segBtnActive]}
                  >
                    <Text style={[styles.segText, p.gender === g && { color: colors.primaryFg }]}>{g === 'M' ? 'Male' : 'Female'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <ToggleRow label="Type 2 Diabetes" value={p.hasT2DM} onValueChange={(v) => update('hasT2DM', v)} />
        </Card>

        <Card>
          <SectionTitle>Anthropometrics</SectionTitle>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <InputField label="Height" value={numStr(p.heightCm)} onChangeText={setNum('heightCm')} unit="cm" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="Weight" value={numStr(p.weightKg)} onChangeText={setNum('weightKg')} unit="kg" keyboardType="decimal-pad" />
            </View>
          </View>
          <Text style={styles.label}>BMI</Text>
          <Text style={[styles.bigVal, { color: bmiCat.color }]}>{p.bmi || '—'} <Text style={styles.bmiCat}>{bmiCat.label}</Text></Text>
        </Card>

        <Card>
          <SectionTitle>Renal Function</SectionTitle>
          <Text style={styles.muted}>CKD-EPI 2021 race-free auto-calculation</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <InputField label="Creatinine" value={numStr(p.creatinine)} onChangeText={setNum('creatinine')} unit="mg/dL" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="eGFR" value={numStr(p.eGFR)} onChangeText={setNum('eGFR')} unit="mL/min" keyboardType="numeric" />
            </View>
          </View>
          {p.eGFR > 0 && (
            <View style={[styles.alertBox, p.eGFR < 60 ? { borderColor: colors.warning, backgroundColor: colors.warningSoft } : { borderColor: colors.success, backgroundColor: colors.successSoft }]}>
              <Text style={{ color: p.eGFR < 60 ? colors.warning : colors.success, fontSize: 12 }}>
                {p.eGFR < 60 ? '⚠ ' : '✓ '}{getCKDStage(p.eGFR)}
              </Text>
            </View>
          )}
        </Card>

        <Card>
          <SectionTitle>Comorbidities</SectionTitle>
          {[
            { key: 'hasASCVD', label: 'ASCVD (atherosclerotic CVD)' },
            { key: 'hasPostStroke', label: 'Post-Stroke' },
            { key: 'hasCKD', label: 'CKD (eGFR <60)' },
            { key: 'hasHF', label: 'Heart Failure' },
            { key: 'hasHypertension', label: 'Hypertension' },
            { key: 'hasRetinopathy', label: 'Diabetic Retinopathy' },
            { key: 'hasNeuropathy', label: 'Diabetic Neuropathy' },
            { key: 'hasPAD', label: 'Peripheral Arterial Disease' },
            { key: 'hasObesity', label: 'Obesity (BMI ≥25)' },
            { key: 'hasNAFLD', label: 'NAFLD' },
            { key: 'hasOSA', label: 'Obstructive Sleep Apnea' },
          ].map(c => (
            <ToggleRow key={c.key} label={c.label} value={(p as any)[c.key]} onValueChange={(v) => update(c.key as keyof PatientData, v)} />
          ))}
          {p.hasHF && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>HF NYHA Class</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[1, 2, 3, 4].map(n => (
                  <TouchableOpacity key={n} onPress={() => update('hfNYHA', n)} style={[styles.segBtn, p.hfNYHA === n && styles.segBtnActive]}>
                    <Text style={[styles.segText, p.hfNYHA === n && { color: colors.primaryFg }]}>NYHA {n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Card>

        <Card>
          <SectionTitle>Post-Stroke</SectionTitle>
          <ToggleRow label="Post-stroke dysphagia" value={p.postStrokeDysphagia} onValueChange={(v) => update('postStrokeDysphagia', v)} />
          {p.postStrokeDysphagia && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Dysphagia Level</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(['mild', 'moderate', 'severe'] as const).map(lvl => (
                  <TouchableOpacity key={lvl} onPress={() => update('dysphagiaLevel', lvl)} style={[styles.segBtn, p.dysphagiaLevel === lvl && styles.segBtnActive]}>
                    <Text style={[styles.segText, p.dysphagiaLevel === lvl && { color: colors.primaryFg }]}>{lvl}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Card>

        <Card>
          <SectionTitle>Glucose & Lipids</SectionTitle>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><InputField label="FBS" value={numStr(p.fbs)} onChangeText={setNum('fbs')} unit="mg/dL" keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><InputField label="RBS" value={numStr(p.rbs)} onChangeText={setNum('rbs')} unit="mg/dL" keyboardType="numeric" /></View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><InputField label="HbA1c" value={numStr(p.hba1c)} onChangeText={setNum('hba1c')} unit="%" keyboardType="decimal-pad" /></View>
            <View style={{ flex: 1 }}><InputField label="LDL" value={numStr(p.ldl)} onChangeText={setNum('ldl')} unit="mg/dL" keyboardType="numeric" /></View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><InputField label="HDL" value={numStr(p.hdl || 0)} onChangeText={setNum('hdl' as any)} unit="mg/dL" keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><InputField label="Triglycerides" value={numStr(p.triglycerides || 0)} onChangeText={setNum('triglycerides' as any)} unit="mg/dL" keyboardType="numeric" /></View>
          </View>
        </Card>

        <Card>
          <SectionTitle>Serial BG Readings</SectionTitle>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <InputField value={newBG} onChangeText={setNewBG} placeholder="BG mg/dL" keyboardType="numeric" testID="new-bg" />
            </View>
            <Button label="Add" size="sm" onPress={() => {
              const v = parseInt(newBG);
              if (v > 0) { update('serialBG', [...p.serialBG, v]); setNewBG(''); }
            }} testID="add-bg-btn" />
          </View>
          {p.serialBG.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {p.serialBG.map((v, i) => (
                <Pill key={i} label={String(v)} bg={v > 180 ? colors.destructiveSoft : v < 70 ? colors.warningSoft : colors.primarySoft} color={v > 180 ? colors.destructive : v < 70 ? colors.warning : colors.primary} onRemove={() => update('serialBG', p.serialBG.filter((_, idx) => idx !== i))} />
              ))}
            </View>
          )}
        </Card>

        <Card>
          <SectionTitle>Current Medications</SectionTitle>
          {p.currentMeds.length === 0 && <Text style={styles.muted}>No medications added yet</Text>}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 6 }}>
            {p.currentMeds.map((m, i) => (
              <Pill key={i} label={m} onRemove={() => update('currentMeds', p.currentMeds.filter((_, idx) => idx !== i))} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <InputField value={newMed} onChangeText={setNewMed} placeholder="Type med name & dose..." testID="new-med" />
            </View>
            <Button label="Add" size="sm" onPress={() => addMed()} testID="add-med-btn" />
          </View>
          <TouchableOpacity onPress={() => setShowPicker(!showPicker)} style={{ marginTop: 6 }}>
            <Text style={{ color: colors.primary, fontSize: 12 }}>{showPicker ? 'Hide' : 'Show'} common medications ▾</Text>
          </TouchableOpacity>
          {showPicker && (
            <View style={{ marginTop: 8, padding: 10, backgroundColor: colors.cardElevated, borderRadius: radius.md, maxHeight: 240 }}>
              {COMMON_MEDS.filter(m => !p.currentMeds.includes(m)).slice(0, 20).map(m => (
                <TouchableOpacity key={m} onPress={() => addMed(m)} style={{ paddingVertical: 6 }}>
                  <Text style={{ color: colors.text, fontSize: 12 }}>+ {m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        <Card style={{ borderColor: colors.primary, backgroundColor: colors.primarySoft }}>
          <SectionTitle>Generate Prescription</SectionTitle>
          <Text style={styles.muted}>Generate ADA 2026 patient-specific recommendations.</Text>
          <View style={{ marginTop: 12, gap: 8 }}>
            <Button label="Generate Complete Summary" onPress={handleGenerate} testID="generate-summary-btn" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><Button label="Medications" variant="outline" onPress={async () => { await savePatient(p); router.push('/medications'); }} /></View>
              <View style={{ flex: 1 }}><Button label="Diet" variant="outline" onPress={async () => { await savePatient(p); router.push('/diet-plan'); }} /></View>
            </View>
          </View>
        </Card>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  label: { color: colors.textMuted, fontSize: 11, marginBottom: 4, fontWeight: '600' },
  bigVal: { fontSize: 24, fontWeight: '800' },
  bmiCat: { fontSize: 12, fontWeight: '500' },
  segBtn: {
    flex: 1, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.cardElevated, alignItems: 'center',
  },
  segBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  alertBox: { padding: 10, borderRadius: radius.md, borderWidth: 1, marginTop: 8 },
});
