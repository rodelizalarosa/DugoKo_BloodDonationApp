/**
 * Map.web.tsx — Web-specific implementation of the Map component.
 *
 * @rnmapbox/maps is a native-only library that requires the Mapbox iOS/Android
 * SDKs. It cannot be bundled for web because it attempts to import
 * `mapbox-gl/dist/mapbox-gl.css`, which is not installed.
 *
 * Metro / Expo automatically picks this file over Map.tsx when bundling for web
 * (platform-specific file resolution).
 *
 * This stub renders an OpenStreetMap iframe — no API key required.
 */

import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { spacing, typography, radius } from '@/constants/theme';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

export interface MapProps {
  centerLatitude: number;
  centerLongitude: number;
  zoom?: number;
  markers?: MapMarker[];
  onMarkerPress?: (markerId: string) => void;
  style?: any;
}

export default function Map({
  centerLatitude,
  centerLongitude,
  zoom = 13,
  markers = [],
  style,
}: MapProps) {
  const { theme } = useTheme();

  const hasCoords =
    typeof centerLatitude === 'number' &&
    typeof centerLongitude === 'number' &&
    !Number.isNaN(centerLatitude) &&
    !Number.isNaN(centerLongitude);

  const openInMaps = () => {
    if (!hasCoords) return;
    const url = `https://www.openstreetmap.org/?mlat=${centerLatitude}&mlon=${centerLongitude}#map=${zoom}/${centerLatitude}/${centerLongitude}`;
    Linking.openURL(url);
  };

  if (!hasCoords) {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface }, style]}>
        <MapPin size={24} color={theme.inkFaint} />
        <Text style={[styles.label, { color: theme.inkMuted }]}>Map unavailable</Text>
      </View>
    );
  }

  // Embed OpenStreetMap via iframe — works on web without any API key.
  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${
    centerLongitude - 0.01
  }%2C${centerLatitude - 0.01}%2C${centerLongitude + 0.01}%2C${
    centerLatitude + 0.01
  }&layer=mapnik&marker=${centerLatitude}%2C${centerLongitude}`;

  return (
    <View style={[styles.container, style]}>
      {/* @ts-ignore — iframe is a valid web element */}
      <iframe
        src={iframeSrc}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: radius.sm,
        }}
        title="Event location map"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <TouchableOpacity
        onPress={openInMaps}
        style={[styles.badge, { backgroundColor: theme.surface }]}
        activeOpacity={0.8}
      >
        <MapPin size={10} color={theme.crimson} />
        <Text style={[styles.badgeText, { color: theme.inkMuted }]}>Open in Maps</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  label: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  badge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    opacity: 0.92,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
  },
});
