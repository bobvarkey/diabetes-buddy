import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/lib/theme';

function MenuButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      testID="menu-btn"
      onPress={() => router.push('/menu')}
      style={{ marginLeft: 12, padding: 6 }}
    >
      <Ionicons name="menu" size={22} color={colors.primary} />
    </TouchableOpacity>
  );
}

function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      testID="back-btn"
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={{ marginLeft: 12, padding: 6, flexDirection: 'row', alignItems: 'center' }}
    >
      <Ionicons name="chevron-back" size={22} color={colors.primary} />
    </TouchableOpacity>
  );
}

export default function GroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontSize: 16, fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Diabetes Buddy', headerLeft: () => <MenuButton /> }} />
      <Stack.Screen name="patient" options={{ title: 'Patient Profile' }} />
      <Stack.Screen name="summary" options={{ title: 'Complete Prescription' }} />
      <Stack.Screen name="medications" options={{ title: 'Medications' }} />
      <Stack.Screen name="prediabetes" options={{ title: 'Prediabetes' }} />
      <Stack.Screen name="insulin-titration" options={{ title: 'Insulin Titration' }} />
      <Stack.Screen name="hypo-risk" options={{ title: 'Hypo Risk' }} />
      <Stack.Screen name="renal-dosing" options={{ title: 'Renal Dosing' }} />
      <Stack.Screen name="ckd-guideline" options={{ title: 'CKD Guideline' }} />
      <Stack.Screen name="foods" options={{ title: 'Food Database' }} />
      <Stack.Screen name="plate" options={{ title: 'Plate Method' }} />
      <Stack.Screen name="diet-plan" options={{ title: '7-Day Diet Plan' }} />
      <Stack.Screen name="progress" options={{ title: 'Progress' }} />
      <Stack.Screen name="menu" options={{ title: 'All Tools', presentation: 'modal' }} />
    </Stack>
  );
}
