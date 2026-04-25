import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenContainer, Button } from '../../src/components/ui';
import { colors, radius } from '../../src/lib/theme';
import { PatientData, loadPatient } from '../../src/lib/patient-data';
import { generate7DayPlan, DayPlan } from '../../src/lib/diet-generator';

export default function DietPlan() {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [open, setOpen] = useState(0);

  useEffect(() => { loadPatient().then(p => { if (p) { setPatient(p); setPlan(generate7DayPlan(p)); } }); }, []);

  const avg = useMemo(() => {
    if (!plan.length) return { cal: 0, carb: 0, prot: 0 };
    return {
      cal: Math.round(plan.reduce((s, d) => s + d.totalCalories, 0) / 7),
      carb: Math.round(plan.reduce((s, d) => s + d.totalCarbs, 0) / 7),
      prot: Math.round(plan.reduce((s, d) => s + d.totalProtein, 0) / 7),
    };
  }, [plan]);

  if (!patient) return <ScreenContainer><Card><Text style={{ color: colors.textMuted, textAlign: 'center', padding: 16 }}>Load patient first.</Text></Card></ScreenContainer>;

  return (
    <ScreenContainer testID="diet-plan">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={styles.h1}>7-Day Diet Plan</Text>
          <Text style={styles.muted}>Kochi foods · 1600-1800 cal · 30-45g carb/meal</Text>
        </View>
        <Button label="Regenerate" variant="outline" size="sm" onPress={() => setPlan(generate7DayPlan(patient))} testID="regenerate-diet" />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 12 }}>
        {patient.postStrokeDysphagia && <Text style={[styles.tag, { color: colors.warning, backgroundColor: colors.warningSoft }]}>Soft textures</Text>}
        {patient.hfNYHA >= 2 && <Text style={[styles.tag, { color: colors.info, backgroundColor: colors.infoSoft }]}>Low sodium (HF)</Text>}
        <Text style={[styles.tag, { color: colors.primary, backgroundColor: colors.primarySoft }]}>1600-1800 kcal</Text>
        <Text style={[styles.tag, { color: colors.text, backgroundColor: colors.cardElevated }]}>30-45g carb/meal</Text>
      </View>

      <Card style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 14 }}>
        <View style={{ alignItems: 'center' }}><Text style={styles.bigVal}>{avg.cal}</Text><Text style={styles.muted}>kcal/day</Text></View>
        <View style={{ alignItems: 'center' }}><Text style={styles.bigVal}>{avg.carb}g</Text><Text style={styles.muted}>carbs/day</Text></View>
        <View style={{ alignItems: 'center' }}><Text style={styles.bigVal}>{avg.prot}g</Text><Text style={styles.muted}>protein/day</Text></View>
      </Card>

      {plan.map((day, di) => (
        <Card key={di} style={{ padding: 12 }}>
          <TouchableOpacity onPress={() => setOpen(open === di ? -1 : di)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} testID={`day-${di}`}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 }}>
              <View style={styles.dayPill}><Text style={{ color: colors.primary, fontWeight: '900', fontSize: 11 }}>{day.day.slice(0, 2)}</Text></View>
              <View>
                <Text style={styles.dayName}>{day.day}</Text>
                <Text style={styles.muted}>{day.totalCalories} kcal · {day.totalCarbs}g carbs</Text>
              </View>
            </View>
            <Ionicons name={open === di ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
          </TouchableOpacity>
          {open === di && (
            <View style={{ marginTop: 12, gap: 12 }}>
              {day.meals.map((meal, mi) => (
                <View key={mi}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.mealName}>{meal.name} <Text style={styles.muted}>{meal.time}</Text></Text>
                    <Text style={styles.muted}>{meal.totalCalories} kcal · {meal.totalCarbs}g C</Text>
                  </View>
                  {meal.foods.map((f, fi) => (
                    <View key={fi} style={styles.foodLine}>
                      <Text style={{ color: colors.text, fontSize: 11, flex: 1 }}>• {f.food.name}</Text>
                      <Text style={styles.muted}>{f.food.calories} cal · {f.food.carbsG}g C</Text>
                    </View>
                  ))}
                </View>
              ))}
              {day.snacks.length > 0 && (
                <View>
                  <Text style={styles.mealName}>Snacks</Text>
                  {day.snacks.map((s, si) => (
                    <View key={si} style={styles.foodLine}>
                      <Text style={{ color: colors.text, fontSize: 11, flex: 1 }}>• {s.food.name}</Text>
                      <Text style={styles.muted}>{s.food.calories} cal</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 20, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: 11 },
  tag: { fontSize: 11, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  bigVal: { color: colors.text, fontSize: 18, fontWeight: '800' },
  dayPill: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  dayName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  mealName: { color: colors.text, fontSize: 12, fontWeight: '600' },
  foodLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: colors.primarySoft },
});
