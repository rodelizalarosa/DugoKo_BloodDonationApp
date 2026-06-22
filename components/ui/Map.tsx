/**
 * Map.tsx - Native map component with a safe fallback.
 *
 * The preferred implementation uses @rnmapbox/maps, but that requires a
 * custom development client or a production build with the native module
 * installed. When the native module is unavailable, we fall back to
 * react-native-maps so the screen still works instead of crashing.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing, typography } from '@/constants/theme';

let Mapbox: typeof import('@rnmapbox/maps') | null = null;
try {
  Mapbox = require('@rnmapbox/maps');
} catch {
  Mapbox = null;
}

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
if (Mapbox && MAPBOX_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_TOKEN);
}

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

function hasValidCoords(latitude: number, longitude: number) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude)
  );
}

function MapFallback({
  centerLatitude,
  centerLongitude,
  markers = [],
  onMarkerPress,
  style,
}: MapProps) {
  const { theme } = useTheme();

  const region = useMemo(() => {
    if (!hasValidCoords(centerLatitude, centerLongitude)) return null;

    return {
      latitude: centerLatitude,
      longitude: centerLongitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [centerLatitude, centerLongitude]);

  if (!region) {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface }, style]}>
        <Text style={[styles.label, { color: theme.inkMuted }]}>Map unavailable</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={[styles.map, { borderColor: theme.border }]}
        initialRegion={region}
      >
        {markers
          .filter((marker) => hasValidCoords(marker.latitude, marker.longitude))
          .map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={marker.title}
              description={marker.description}
              onPress={() => onMarkerPress?.(marker.id)}
            />
          ))}
      </MapView>
    </View>
  );
}

export default function Map({
  centerLatitude,
  centerLongitude,
  zoom = 13,
  markers = [],
  onMarkerPress,
  style,
}: MapProps) {
  const { theme, isDarkMode } = useTheme();
  const centerCoordinate = useMemo<[number, number]>(() => {
    return [centerLongitude, centerLatitude];
  }, [centerLatitude, centerLongitude]);

  if (!Mapbox) {
    return (
      <MapFallback
        centerLatitude={centerLatitude}
        centerLongitude={centerLongitude}
        zoom={zoom}
        markers={markers}
        onMarkerPress={onMarkerPress}
        style={style}
      />
    );
  }

  if (!hasValidCoords(centerLatitude, centerLongitude)) {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface }, style]}>
        <Text style={[styles.label, { color: theme.inkMuted }]}>Map unavailable</Text>
      </View>
    );
  }

  const mapStyle = isDarkMode ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Light;

  return (
    <View style={[styles.container, style]}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={mapStyle}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          zoomLevel={zoom}
          centerCoordinate={centerCoordinate}
          animationMode="flyTo"
          animationDuration={1000}
        />
        {markers.map((marker) => {
          const coord: [number, number] = [marker.longitude, marker.latitude];
          return (
            <Mapbox.PointAnnotation
              key={marker.id}
              id={marker.id}
              coordinate={coord}
              onSelected={() => onMarkerPress?.(marker.id)}
            >
              <View style={[styles.markerContainer, { borderColor: theme.paper }]}>
                <View style={[styles.markerPin, { backgroundColor: theme.crimson }]} />
              </View>
            </Mapbox.PointAnnotation>
          );
        })}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  label: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  markerContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 3.84px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  markerPin: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
