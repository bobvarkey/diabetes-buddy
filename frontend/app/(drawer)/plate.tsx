import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, ScreenContainer } from '../../src/components/ui';
import { colors, radius } from '../../src/lib/theme';
import { KERALA_FOODS, FoodItem } from '../../src/lib/food-data';

export default function PlateScreen() {
  const [veggie, setVeggie] = useState<FoodItem[]>([]);
  const [protein, setProtein] = useState<FoodItem[]>([]);
  const [grain, setGrain] = useState<FoodItem[]>([]);
  const [active, setActive] = useState<'veggie' | 'protein' | 'grain' | null>(null);

  const totalCarbs = [...veggie, ...protein, ...grain].reduce((s, f) => s + f.carbsG, 0);
  const totalProtein = [...veggie, ...protein, ...grain].reduce((s, f) => s + f.proteinG, 0);
  const totalCal = [...veggie, ...protein, ...grain].reduce((s, f) => s + f.calories, 0);
  const veggieOk = veggie.length >= 1;
  const proteinOk = totalProtein >= 20 && totalProtein <= 30;
  const carbOk = totalCarbs >= 15 && totalCarbs <= 45;
  const score = [veggieOk, proteinOk, carbOk].filter(Boolean).length;

  const available = active === 'veggie' ? KERALA_FOODS.filter(f => f.category === 'veggies')
    : active === 'protein' ? KERALA_FOODS.filter(f => f.category === 'proteins')
    : active === 'grain' ? KERALA_FOODS.filter(f => f.category === 'grains') : [];

  const addFood = (f: FoodItem) => {
    if (active === 'veggie') setVeggie([...veggie, f]);
    if (active === 'protein') setProtein([...protein, f]);
    if (active === 'grain') setGrain([...grain, f]);
    setActive(null);
  };

  const Slot = ({ slot, label, color, foods, target }: any) => (
    <TouchableOpacity onPress={() => setActive(slot)} style={[styles.plateSlot, { backgroundColor: foods.length ? color : color + '22', borderColor: color }]} testID={`plate-${slot}`}>
      <Text style={[styles.slotLabel, { color: foods.length ? '#fff' : color }]}>{label}</Text>
      <Text style={[styles.slotTarget, { color: foods.length ? '#fff' : colors.textMuted }]}>{target}</Text>
      <Text style={[styles.slotCount, { color: foods.length ? '#fff' : colors.textMuted }]}>{foods.length} item{foods.length !== 1 ? 's' : ''}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer testID="plate-method">
      <Text style={styles.h1}>Plate Method</Text>
      <Text style={styles.muted}>Tap sections to add Kerala foods</Text>

      <View style={styles.plateContainer}>
        <Slot slot="veggie" label="🥬 Veggies" target="½ plate · 200g+" color={colors.plateVeggie} foods={veggie} />
        <View style={{ flex: 1, gap: 8 }}>
          <Slot slot="protein" label="🐟 Protein" target="¼ plate · 20-30g" color={colors.plateProtein} foods={protein} />
          <Slot slot="grain" label="🍚 Grains" target="¼ plate · 15-45g carb" color={colors.plateGrain} foods={grain} />
        </View>
      </View>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '900' }}>{score}/3</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.check, { color: veggieOk ? colors.success : colors.textMuted }]}>{veggieOk ? '✓' : '○'} Veggies</Text>
            <Text style={[styles.check, { color: proteinOk ? colors.success : colors.textMuted }]}>{proteinOk ? '✓' : '○'} {totalProtein}g protein</Text>
            <Text style={[styles.check, { color: carbOk ? colors.success : colors.textMuted }]}>{carbOk ? '✓' : '○'} {totalCarbs}g carbs</Text>
          </View>
        </View>
        <View style={styles.totals}>
          <View style={styles.totalCol}><Text style={styles.bigVal}>{totalCal}</Text><Text style={styles.muted}>kcal</Text></View>
          <View style={styles.totalCol}><Text style={styles.bigVal}>{totalCarbs}g</Text><Text style={styles.muted}>carbs</Text></View>
          <View style={styles.totalCol}><Text style={styles.bigVal}>{totalProtein}g</Text><Text style={styles.muted}>protein</Text></View>
        </View>
      </Card>

      {active && (
        <Card accent={colors.primary}>
          <Text style={styles.h3}>Add to {active}</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {available.map(f => (
              <TouchableOpacity key={f.id} onPress={() => addFood(f)} style={styles.foodBtn}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 13 }}>{f.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>{f.serving}</Text>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>{f.carbsG}g C · {f.proteinG}g P</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={() => setActive(null)} style={{ marginTop: 8 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>Cancel</Text>
          </TouchableOpacity>
        </Card>
      )}

      {[
        { name: 'Veggies', list: veggie, set: setVeggie },
        { name: 'Protein', list: protein, set: setProtein },
        { name: 'Grains', list: grain, set: setGrain },
      ].map((s, i) => s.list.length > 0 && (
        <Card key={i} style={{ padding: 12 }}>
          <Text style={styles.h4}>{s.name}</Text>
          {s.list.map((f, j) => (
            <View key={j} style={styles.foodRow}>
              <Text style={{ color: colors.text, fontSize: 12, flex: 1 }}>{f.name} <Text style={{ color: colors.textMuted }}>({f.serving})</Text></Text>
              <TouchableOpacity onPress={() => s.set(s.list.filter((_, idx) => idx !== j))}>
                <Text style={{ color: colors.destructive, fontSize: 11 }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  h3: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8, textTransform: 'capitalize' },
  h4: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  muted: { color: colors.textMuted, fontSize: 11 },
  plateContainer: { flexDirection: 'row', gap: 8, marginVertical: 16, height: 200 },
  plateSlot: {
    flex: 1, borderRadius: radius.lg, padding: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  slotLabel: { fontSize: 14, fontWeight: '700' },
  slotTarget: { fontSize: 10, marginTop: 2 },
  slotCount: { fontSize: 11, marginTop: 6, fontWeight: '600' },
  check: { fontSize: 12, marginVertical: 2 },
  totals: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  totalCol: { flex: 1, alignItems: 'center' },
  bigVal: { color: colors.text, fontSize: 18, fontWeight: '800' },
  foodBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  foodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
});
