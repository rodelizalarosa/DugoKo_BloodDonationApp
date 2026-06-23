import { Phone, MapPin, Navigation } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, Linking } from 'react-native';
import Map from '@/components/ui/Map';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useCentersAndEvents } from '@/lib/hooks/useCentersAndEvents';

export default function CentersScreen() {
  const { theme, isDarkMode } = useTheme();
  const { centers } = useCentersAndEvents();
  const [selectedId, setSelectedId] = useState<string>('');

  const activeId = selectedId || centers[0]?.id || '';
  const selectedCenter = centers.find((c) => c.id === activeId) || centers[0];

  const region = useMemo(() => {
    if (!selectedCenter) return null;
    const lat = selectedCenter.latitude;
    const lng = selectedCenter.longitude;

    if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [selectedCenter]);

  const markers = useMemo(() => {
    return centers
      .filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number' && !Number.isNaN(c.latitude) && !Number.isNaN(c.longitude))
      .map((c) => ({
        id: c.id,
        latitude: c.latitude,
        longitude: c.longitude,
        title: c.name,
        description: c.address,
      }));
  }, [centers]);

  if (centers.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
        <ScreenHeader title="Donation Centers" subtitle="Locate nearby PRC centers" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.crimson} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Donation Centers" subtitle="Locate nearby PRC centers" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Mapbox Map Preview */}
        <Card style={[styles.mapCard, { backgroundColor: isDarkMode ? '#1E1212' : '#F6EFEA', borderColor: theme.border, overflow: 'hidden' }]}>
          <Text style={[styles.mapLabel, { color: theme.inkFaint }]}>DONATION CENTERS MAP</Text>

          {region ? (
            <Map
              style={styles.mapView}
              centerLatitude={selectedCenter.latitude}
              centerLongitude={selectedCenter.longitude}
              zoom={12}
              markers={markers}
              onMarkerPress={(id) => setSelectedId(id)}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.inkMuted }}>Map unavailable</Text>
            </View>
          )}
        </Card>

        {/* Selected Center Summary Quick Card */}
        <Card style={[styles.activeCard, { borderColor: theme.crimson, borderWidth: 1 }]}>
          <View style={styles.activeHeader}>
            <MapPin size={18} color={theme.crimson} />
            <Text style={[styles.activeTag, { color: theme.crimson }]}>SELECTED LOCATION</Text>
          </View>
          <Text style={[styles.name, { color: theme.ink }]}>{selectedCenter.name}</Text>
          <Text style={[styles.meta, { color: theme.inkMuted }]}>{selectedCenter.address}</Text>
          <Text style={[styles.meta, { color: theme.inkFaint }]}>{selectedCenter.contact} · {selectedCenter.hours}</Text>
          <View style={styles.activeActions}>
            <Button
              label="Get Directions"
              variant="outline"
              size="small"
              onPress={() => {
                const lat = selectedCenter.latitude;
                const lng = selectedCenter.longitude;
                if (lat && lng) {
                  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${lng},${lat}?destination=${lng},${lat}&(access_token=pk.eyJ1IjoiZGVtby1hY2NvdW50IiwiYSI6ImNsRGVtb0FQMTMxZzIycnF2NzZ6Zmh4eXgifQ.R6JADKqMnUOPmS9la6qQMQ`;
                  Linking.openURL(url);
                }
              }}
              disabled={!selectedCenter.latitude || !selectedCenter.longitude}
              style={{ flex: 1 }}
            />
            <Button
              label="Call"
              size="small"
              onPress={() => selectedCenter.contact && Linking.openURL(`tel:${selectedCenter.contact.replace(/[^+\d]/g, '')}`)}
              disabled={!selectedCenter.contact}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* List of all Centers */}
        <Text style={[styles.sectionTitle, { color: theme.ink }]}>All Chapters</Text>
        {centers.map((c) => {
          const isSelected = c.id === activeId;
          return (
            <Pressable key={c.id} onPress={() => setSelectedId(c.id)}>
              <Card style={[styles.centerCard, isSelected && { borderColor: theme.crimson, borderWidth: 1 }]}>
                <View style={styles.centerRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.name, { color: theme.ink }]}>{c.name}</Text>
                    <Text style={[styles.meta, { color: theme.inkMuted }]}>{c.address}</Text>
                    <Text style={[styles.hours, { color: theme.inkFaint }]}>{c.hours}</Text>
                    <View style={styles.phoneRow}>
                      <Phone size={12} color={theme.inkMuted} />
                      <Text style={[styles.phoneText, { color: theme.inkMuted }]}>{c.contact}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl * 2 },
  sectionTitle: { ...typography.h2, marginTop: spacing.xs },
  
  // Map preview styles
  mapCard: { height: 210, padding: 8, gap: 4 },
  mapLabel: { ...typography.eyebrow, fontSize: 9, paddingLeft: 4, marginBottom: 4 },
  mapView: { flex: 1, borderRadius: radius.sm, overflow: 'hidden' },

  // Active center card styles
  activeCard: { gap: spacing.sm },
  activeActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  activeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeTag: { ...typography.eyebrow, fontSize: 10, fontWeight: '800' },


  // List card styles
  centerCard: { padding: spacing.md },
  centerRow: { flexDirection: 'row', alignItems: 'center' },


  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  phoneText: { ...typography.caption },
  name: { ...typography.bodyStrong },
  meta: { ...typography.body, fontSize: 13, marginTop: 1 },
  hours: { ...typography.caption },
});
