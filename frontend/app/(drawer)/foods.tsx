import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenContainer, InputField } from '../../src/components/ui';
import { colors, radius } from '../../src/lib/theme';
import { FOOD_CATEGORIES, KERALA_FOODS, FoodCategory } from '../../src/lib/food-data';

export default function FoodsScreen() {
  const [active, setActive] = useState<FoodCategory>('veggies');
  const [search, setSearch] = useState('');

  const foods = useMemo(() => KERALA_FOODS.filter(f => f.category === active && (!search || f.name.toLowerCase().includes(search.toLowerCase()) || (f.nameLocal || '').toLowerCase().includes(search.toLowerCase()))), [active, search]);

  const giColor = (gi: string) => gi === 'low' ? colors.success : gi === 'medium' ? colors.warning : colors.destructive;

  return (
    <ScreenContainer testID="foods">
      <Text style={styles.h1}>Kerala Food Database</Text>
      <Text style={styles.muted}>ADA 2026 carb counts</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {FOOD_CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.key}
              onPress={() => setActive(c.key)}
              style={[styles.chip, active === c.key && styles.chipActive]}
              testID={`cat-${c.key}`}
            >
              <Text style={{ fontSize: 14 }}>{c.icon}</Text>
              <Text style={[styles.chipText, active === c.key && { color: colors.primaryFg }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <InputField value={search} onChangeText={setSearch} placeholder="Search foods..." testID="food-search" />

      {foods.map(f => (
        <Card key={f.id} style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.foodName}>{f.name}</Text>
              {f.nameLocal && <Text style={styles.localName}>{f.nameLocal}</Text>}
            </View>
            <View style={[styles.giBadge, { backgroundColor: giColor(f.glycemicIndex) + '22' }]}>
              <Text style={{ color: giColor(f.glycemicIndex), fontSize: 10, fontWeight: '700' }}>GI: {f.glycemicIndex}</Text>
            </View>
          </View>
          <Text style={styles.serving}>Serving: {f.serving}</Text>
          <View style={styles.macros}>
            <View style={styles.macro}><Text style={styles.macroLabel}>Cal</Text><Text style={styles.macroVal}>{f.calories}</Text></View>
            <View style={styles.macro}><Text style={styles.macroLabel}>Carbs</Text><Text style={styles.macroVal}>{f.carbsG}g</Text></View>
            <View style={styles.macro}><Text style={styles.macroLabel}>Prot</Text><Text style={styles.macroVal}>{f.proteinG}g</Text></View>
            <View style={styles.macro}><Text style={styles.macroLabel}>Na</Text><Text style={styles.macroVal}>{f.sodiumMg}mg</Text></View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
            {f.texture === 'soft' && <Text style={[styles.tag, { backgroundColor: colors.cardElevated, color: colors.text }]}>Soft</Text>}
            {f.isLowSodium && <Text style={[styles.tag, { backgroundColor: colors.successSoft, color: colors.success }]}>Low sodium</Text>}
          </View>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: 12 },
  chip: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  foodName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  localName: { color: colors.textMuted, fontSize: 11, fontStyle: 'italic' },
  giBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  serving: { color: colors.textMuted, fontSize: 11, marginVertical: 6 },
  macros: { flexDirection: 'row', gap: 6 },
  macro: { flex: 1, padding: 8, backgroundColor: colors.cardElevated, borderRadius: radius.sm, alignItems: 'center' },
  macroLabel: { color: colors.textMuted, fontSize: 10 },
  macroVal: { color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 2 },
  tag: { fontSize: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
});
