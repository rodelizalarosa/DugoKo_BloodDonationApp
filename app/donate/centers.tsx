import { Navigation, Phone, MapPin } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { mockCenters } from '@/constants/mockData';

export default function CentersScreen() {
  const { theme, isDarkMode } = useTheme();
  const [selectedId, setSelectedId] = useState<string>('c1');

  const openDirections = (lat: number, lng: number, label: string) => {
    const latLng = `${lat},${lng}`;

    // iOS "maps:" deep link (more compatible)
    const iosUrl = `http://maps.apple.com/?daddr=${latLng}&q=${encodeURIComponent(label)}`;
    // Android geo deep link
    const androidUrl = `geo:0,0?q=${latLng}(${encodeURIComponent(label)})`;

    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;

    const url = Platform.select({
      ios: iosUrl,
      android: androidUrl,
      default: webUrl,
    });

    const target = url ?? webUrl;

    Linking.openURL(target).catch(() => {
      Linking.openURL(webUrl);
    });
  };

  const selectedCenter = mockCenters.find((c) => c.id === selectedId) || mockCenters[0];

  const region = useMemo(() => {
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
  }, [selectedCenter.latitude, selectedCenter.longitude]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.paper }]} edges={['top']}>
      <ScreenHeader title="Donation Centers" subtitle="Locate nearby PRC centers" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Mapbox/Real Map Preview (react-native-maps) */}
        <Card style={[styles.mapCard, { backgroundColor: isDarkMode ? '#1E1212' : '#F6EFEA', borderColor: theme.border, overflow: 'hidden' }]}>
          <Text style={[styles.mapLabel, { color: theme.inkFaint }]}>DONATION CENTERS MAP</Text>

          {region ? (
            <MapView
              style={styles.mapView}
              initialRegion={region}
              showsUserLocation={false}
              scrollEnabled
              zoomEnabled
            >
              {mockCenters.map((c) => {
                if (typeof c.latitude !== 'number' || typeof c.longitude !== 'number') return null;
                return (
                  <Marker
                    key={c.id}
                    coordinate={{ latitude: c.latitude, longitude: c.longitude }}
                    title={c.name}
                    description={c.address}
                    onPress={() => setSelectedId(c.id)}
                  />
                );
              })}
            </MapView>
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
          <View style={styles.btnRow}>
            <Button
              label="Get Directions"
              variant="primary"
              onPress={() => openDirections(selectedCenter.latitude, selectedCenter.longitude, selectedCenter.name)}
              style={styles.actionBtn}
              labelStyle={{ fontSize: 12 }}
            />
            <Button
              label="Call Center"
              variant="outline"
              onPress={() => Linking.openURL(`tel:${selectedCenter.contact.replace(/[^\d+]/g, '')}`)}
              style={styles.actionBtn}
              labelStyle={{ fontSize: 12 }}
            />
          </View>
        </Card>

        {/* List of all Centers */}
        <Text style={[styles.sectionTitle, { color: theme.ink }]}>All Chapters</Text>
        {mockCenters.map((c) => {
          const isSelected = c.id === selectedId;
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
                  <View style={styles.centerRight}>
                    <Pressable
                      style={[styles.directionsIcon, { backgroundColor: theme.crimsonLight }]}
                      onPress={() => openDirections(c.latitude, c.longitude, c.name)}
                    >
                      <Navigation size={18} color={theme.crimson} />
                    </Pressable>
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
  activeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeTag: { ...typography.eyebrow, fontSize: 10, fontWeight: '800' },
  btnRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  actionBtn: { flex: 1 },

  // List card styles
  centerCard: { padding: spacing.md },
  centerRow: { flexDirection: 'row', alignItems: 'center' },
  centerRight: { paddingLeft: spacing.md },
  directionsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  phoneText: { ...typography.caption },
  name: { ...typography.bodyStrong },
  meta: { ...typography.body, fontSize: 13, marginTop: 1 },
  hours: { ...typography.caption },
});
