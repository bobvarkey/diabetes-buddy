import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/ui';
import { colors, radius } from '../../src/lib/theme';

const TOOLS = [
  { path: '/', label: 'Dashboard', icon: 'grid-outline', desc: 'Overview & quick stats' },
  { path: '/patient', label: 'Patient Profile', icon: 'person-outline', desc: 'Demographics, comorbidities, labs' },
  { path: '/summary', label: 'Complete Prescription', icon: 'document-text-outline', desc: 'Full prescription summary' },
  { path: '/medications', label: 'Med Optimizer', icon: 'medkit-outline', desc: 'ADA 2026 algorithm' },
  { path: '/prediabetes', label: 'Prediabetes Algorithm', icon: 'pulse-outline', desc: 'AACE 2023 management' },
  { path: '/insulin-titration', label: 'Insulin Titration', icon: 'flask-outline', desc: 'Dose adjustment protocols' },
  { path: '/hypo-risk', label: 'Hypoglycemia Risk', icon: 'shield-half-outline', desc: 'Multi-factor scoring' },
  { path: '/renal-dosing', label: 'Renal Dose Adjust', icon: 'water-outline', desc: 'eGFR-based dosing' },
  { path: '/ckd-guideline', label: 'NICE CKD Guideline', icon: 'git-branch-outline', desc: 'CKD in T2D pathway' },
  { path: '/foods', label: 'Kerala Food Database', icon: 'restaurant-outline', desc: 'Carb counts, GI' },
  { path: '/plate', label: 'Plate Method', icon: 'ellipse-outline', desc: 'Visual meal builder' },
  { path: '/diet-plan', label: '7-Day Diet Plan', icon: 'calendar-outline', desc: 'Personalized Kerala diet' },
  { path: '/progress', label: 'Progress Tracker', icon: 'trending-up-outline', desc: 'Weight & BG monitoring' },
];

export default function Menu() {
  const router = useRouter();
  return (
    <ScreenContainer testID="menu">
      <Text style={styles.h1}>All Tools</Text>
      <Text style={styles.muted}>13 clinical tools · ADA 2026 + LAI · Kerala Diet</Text>
      <View style={{ marginTop: 16, gap: 6 }}>
        {TOOLS.map(t => (
          <TouchableOpacity
            key={t.path}
            testID={`menu-${t.path === '/' ? 'home' : t.path.replace('/', '')}`}
            onPress={() => { router.dismissAll?.(); router.replace(t.path as any); }}
            style={styles.tool}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={t.icon as any} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t.label}</Text>
              <Text style={styles.desc}>{t.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ marginTop: 24, padding: 14, backgroundColor: colors.cardElevated, borderRadius: radius.md }}>
        <Text style={{ color: colors.textDim, fontSize: 10, lineHeight: 14, textAlign: 'center' }}>
          Diabetes Buddy v1.0 · ADA Standards 2026{'\n'}
          LAI Lipid Guidelines · Kerala Diet{'\n'}
          Clinical decision support — physician review required.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  h1: { color: colors.text, fontSize: 22, fontWeight: '800' },
  muted: { color: colors.textMuted, fontSize: 12 },
  tool: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12,
    backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { color: colors.text, fontSize: 14, fontWeight: '600' },
  desc: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
