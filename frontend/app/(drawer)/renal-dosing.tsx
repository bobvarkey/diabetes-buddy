import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, ScreenContainer, InputField } from '../../src/components/ui';
import { colors, radius } from '../../src/lib/theme';

type Entry = { drug: string; cls: string; normal: string; r1: string; r2: string; r3: string; r4: string; r5: string; notes: string };

const DATA: Entry[] = [
  { drug: 'Metformin', cls: 'Biguanide', normal: '500–2000 mg/day', r1: 'No adj', r2: 'No adj', r3: 'Max 1000 mg/day', r4: 'Contraindicated', r5: 'Contraindicated', notes: 'Do not initiate if eGFR <30.' },
  { drug: 'Empagliflozin', cls: 'SGLT2i', normal: '10–25 mg/day', r1: 'No adj', r2: 'No adj', r3: 'No adj', r4: 'May continue if on', r5: 'Contraindicated', notes: 'CV/renal benefit at lower eGFR.' },
  { drug: 'Dapagliflozin', cls: 'SGLT2i', normal: '5–10 mg/day', r1: 'No adj', r2: 'No adj', r3: 'No adj', r4: 'May continue if on', r5: 'Contraindicated', notes: 'Approved for CKD/HF benefit.' },
  { drug: 'Canagliflozin', cls: 'SGLT2i', normal: '100–300 mg/day', r1: 'No adj', r2: 'Max 100 mg', r3: 'Max 100 mg', r4: 'Contraindicated', r5: 'Contraindicated', notes: 'Monitor amputation risk.' },
  { drug: 'Semaglutide (SC)', cls: 'GLP-1 RA', normal: '0.25–2 mg/wk', r1: 'No adj', r2: 'No adj', r3: 'No adj', r4: 'Caution', r5: 'Limited data', notes: 'Proven CV benefit (SUSTAIN-6).' },
  { drug: 'Liraglutide', cls: 'GLP-1 RA', normal: '0.6–1.8 mg/day', r1: 'No adj', r2: 'No adj', r3: 'No adj', r4: 'Caution', r5: 'Limited data', notes: 'CV benefit (LEADER).' },
  { drug: 'Dulaglutide', cls: 'GLP-1 RA', normal: '0.75–4.5 mg/wk', r1: 'No adj', r2: 'No adj', r3: 'No adj', r4: 'Caution', r5: 'Limited data', notes: 'Renal benefit (REWIND).' },
  { drug: 'Tirzepatide', cls: 'GIP/GLP-1', normal: '2.5–15 mg/wk', r1: 'No adj', r2: 'No adj', r3: 'No adj', r4: 'Caution', r5: 'Limited data', notes: 'Superior efficacy (SURPASS).' },
  { drug: 'Sitagliptin', cls: 'DPP-4i', normal: '100 mg/day', r1: 'No adj', r2: '50 mg/day', r3: '50 mg/day', r4: '25 mg/day', r5: '25 mg/day', notes: 'Use across all CKD stages.' },
  { drug: 'Saxagliptin', cls: 'DPP-4i', normal: '5 mg/day', r1: 'No adj', r2: '2.5 mg/day', r3: '2.5 mg/day', r4: '2.5 mg/day', r5: '2.5 mg/day', notes: 'Caution: HF (SAVOR-TIMI 53).' },
  { drug: 'Linagliptin', cls: 'DPP-4i', normal: '5 mg/day', r1: 'No adj', r2: 'No adj', r3: 'No adj', r4: 'No adj', r5: 'No adj', notes: 'No renal adj — hepatic.' },
  { drug: 'Vildagliptin', cls: 'DPP-4i', normal: '50 mg BID', r1: 'No adj', r2: '50 mg OD', r3: '50 mg OD', r4: '50 mg OD', r5: '50 mg OD', notes: 'Monitor LFTs.' },
  { drug: 'Pioglitazone', cls: 'TZD', normal: '15–45 mg/day', r1: 'No adj', r2: 'No adj', r3: 'No adj', r4: 'No adj', r5: 'No adj', notes: 'Avoid in HF NYHA III–IV.' },
  { drug: 'Glimepiride', cls: 'SU', normal: '1–4 mg/day', r1: 'No adj', r2: 'Start at 1 mg', r3: 'Start at 1 mg', r4: 'Avoid', r5: 'Avoid', notes: 'High hypo risk in CKD.' },
  { drug: 'Gliclazide', cls: 'SU', normal: '40–320 mg/day', r1: 'No adj', r2: 'No adj', r3: 'Caution', r4: 'Avoid', r5: 'Avoid', notes: 'Preferred SU in CKD.' },
  { drug: 'Insulin Glargine', cls: 'Basal', normal: 'Individualized', r1: 'No adj', r2: 'No adj', r3: 'Reduce 25%', r4: 'Reduce 50%', r5: 'Reduce 50%+', notes: 'Insulin clearance reduced.' },
  { drug: 'Insulin Degludec', cls: 'Basal', normal: 'Individualized', r1: 'No adj', r2: 'No adj', r3: 'Reduce 25%', r4: 'Reduce 50%', r5: 'Reduce 50%+', notes: 'Lower hypo than glargine.' },
  { drug: 'Finerenone', cls: 'MRA', normal: '10–20 mg/day', r1: '20 mg/day', r2: '20 mg/day', r3: '10 mg/day', r4: '10 mg/day', r5: 'Avoid', notes: 'CKD+T2D. Monitor K+. Stop if K>5.' },
];

const COLS = [
  { key: 'r1' as const, label: '60-89' },
  { key: 'r2' as const, label: '45-59' },
  { key: 'r3' as const, label: '30-44' },
  { key: 'r4' as const, label: '15-29' },
  { key: 'r5' as const, label: '<15' },
];

const cellColor = (val: string) => {
  const v = val.toLowerCase();
  if (v.includes('contraind') || v === 'avoid') return colors.destructive;
  if (v.includes('caution') || v.includes('reduce') || v.includes('start') || v.includes('max') || v.includes('continue')) return colors.warning;
  if (v.includes('limited')) return colors.textMuted;
  return colors.success;
};

export default function RenalDosing() {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => DATA.filter(d => !search || d.drug.toLowerCase().includes(search.toLowerCase()) || d.cls.toLowerCase().includes(search.toLowerCase())), [search]);

  return (
    <ScreenContainer testID="renal-dosing">
      <Text style={styles.h1}>Renal Dose Adjustment</Text>
      <Text style={styles.muted}>eGFR-based dose modifications · ADA 2026 + KDIGO</Text>

      <Card style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.destructive }]} /><Text style={styles.muted}>Contraindicated</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.warning }]} /><Text style={styles.muted}>Adjust</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.success }]} /><Text style={styles.muted}>No adj</Text></View>
      </Card>

      <InputField value={search} onChangeText={setSearch} placeholder="Search drug or class..." testID="renal-search" />

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: 110 }]}>Drug</Text>
            <Text style={[styles.th, { width: 70 }]}>Class</Text>
            <Text style={[styles.th, { width: 110 }]}>Normal</Text>
            {COLS.map(c => <Text key={c.key} style={[styles.th, { width: 90, textAlign: 'center' }]}>{c.label}</Text>)}
          </View>
          {filtered.map((d, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.td, { width: 110, fontWeight: '700' }]}>{d.drug}</Text>
              <Text style={[styles.td, { width: 70, color: colors.textMuted }]}>{d.cls}</Text>
              <Text style={[styles.td, { width: 110 }]}>{d.normal}</Text>
              {COLS.map(c => (
                <View key={c.key} style={[styles.td, { width: 90 }]}>
                  <Text style={{ color: cellColor(d[c.key]), fontSize: 10, textAlign: 'center', fontWeight: '600' }}>{d[c.key]}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <Card>
        <Text style={styles.h3}>Clinical Notes</Text>
        {filtered.map((d, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 6, marginVertical: 4 }}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700', width: 100 }}>{d.drug}:</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, flex: 1 }}>{d.notes}</Text>
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
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  tableHead: { flexDirection: 'row', backgroundColor: colors.cardElevated, padding: 8, borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md },
  th: { color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  td: { color: colors.text, fontSize: 11 },
});
