/**
 * Map.web.tsx — Web-specific implementation of the Map component.
 *
 * The native Map.tsx uses @rnmapbox/maps (Mapbox). On web, Mapbox cannot
 * render natively, so this stub renders an OpenStreetMap iframe instead
 * — no API key required. No external navigation buttons.
 *
 * Metro / Expo automatically picks this file over Map.tsx when bundling
 * for web (platform-specific file resolution).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        title="Location map"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
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
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
  },
  badgeText: {
    ...typography.caption,
    fontSize: 10,
  },
});
