import { useRouter } from 'expo-router';
import { ChevronRight, KeyRound, Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useProfile } from '@/lib/hooks/useProfile';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDarkMode, setThemePreference } = useTheme();
  const { updateProfile } = useProfile();

  const handleThemeChange = async (enabled: boolean) => {
    const preference = enabled ? 'dark' : 'light';
    await setThemePreference(preference);
    await updateProfile({ theme_preference: preference });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Settings" subtitle="Account preferences" />
      <View style={styles.content}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {/* Reset Password */}
          <Pressable
            style={[styles.menuRow, styles.menuRowBorder, { borderBottomColor: theme.border }]}
            onPress={() => router.push('/auth/forgot-password')}
          >
            <View style={styles.menuLeft}>
              <KeyRound size={20} color={theme.crimson} />
              <View>
                <Text style={[styles.menuLabel, { color: theme.ink }]}>Reset Password</Text>
                <Text style={[styles.menuDesc, { color: theme.inkFaint }]}>Change your account password</Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.inkFaint} />
          </Pressable>

          {/* Dark / Light Mode */}
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              {isDarkMode ? (
                <Moon size={20} color={theme.crimson} />
              ) : (
                <Sun size={20} color={theme.crimson} />
              )}
              <View>
                <Text style={[styles.menuLabel, { color: theme.ink }]}>Dark Mode</Text>
                <Text style={[styles.menuDesc, { color: theme.inkFaint }]}>
                  {isDarkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeChange}
              trackColor={{ false: '#ccc', true: theme.crimson }}
              thumbColor="#FFF"
            />
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  menuRowBorder: { borderBottomWidth: 1 },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  menuLabel: { ...typography.bodyStrong },
  menuDesc: { ...typography.caption, marginTop: 2 },
});
