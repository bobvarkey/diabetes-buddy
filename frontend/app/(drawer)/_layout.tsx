import { Stack } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
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

export default function GroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontSize: 16, fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
        headerLeft: () => <MenuButton />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Diabetes Buddy' }} />
      <Stack.Screen name="patient" options={{ title: 'Patient Profile', headerLeft: undefined }} />
      <Stack.Screen name="summary" options={{ title: 'Complete Prescription', headerLeft: undefined }} />
      <Stack.Screen name="medications" options={{ title: 'Medications', headerLeft: undefined }} />
      <Stack.Screen name="prediabetes" options={{ title: 'Prediabetes', headerLeft: undefined }} />
      <Stack.Screen name="insulin-titration" options={{ title: 'Insulin Titration', headerLeft: undefined }} />
      <Stack.Screen name="hypo-risk" options={{ title: 'Hypo Risk', headerLeft: undefined }} />
      <Stack.Screen name="renal-dosing" options={{ title: 'Renal Dosing', headerLeft: undefined }} />
      <Stack.Screen name="ckd-guideline" options={{ title: 'CKD Guideline', headerLeft: undefined }} />
      <Stack.Screen name="foods" options={{ title: 'Food Database', headerLeft: undefined }} />
      <Stack.Screen name="plate" options={{ title: 'Plate Method', headerLeft: undefined }} />
      <Stack.Screen name="diet-plan" options={{ title: '7-Day Diet Plan', headerLeft: undefined }} />
      <Stack.Screen name="progress" options={{ title: 'Progress', headerLeft: undefined }} />
      <Stack.Screen name="menu" options={{ title: 'All Tools', presentation: 'modal', headerLeft: undefined }} />
    </Stack>
  );
}
