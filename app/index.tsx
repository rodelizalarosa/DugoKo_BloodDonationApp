import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image } from 'react-native';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function SplashScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(20);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={[styles.iconWrapper, { backgroundColor: theme.paper }]}>
            <Image
              source={require('@/assets/images/favicon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.title, { color: theme.ink }]}>DugóKo</Text>
          <Text style={[styles.tagline, { color: theme.inkMuted }]}>Every drop is a lifeline.</Text>
        </Animated.View>

        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <Button 
            label="Get Started" 
            onPress={() => router.push('/auth/login')} 
            fullWidth 
          />
          <Text style={[styles.footerText, { color: theme.inkFaint }]}>
            Your Blood. Your Community. Your Impact.
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    padding: spacing.xxl,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#B3122A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    ...typography.display,
    fontSize: 42,
    letterSpacing: -1,
  },
  tagline: {
    ...typography.body,
    fontSize: 18,
    marginTop: spacing.xs,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerText: {
    ...typography.caption,
    textAlign: 'center',
  },
  logoImage: {
    width: 96,
    height: 96,
  },
});
