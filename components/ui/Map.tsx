import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { useTheme } from '@/context/ThemeContext';

// Set public access token. Use EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN if defined.
// Provide a default placeholder token.
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZHVnb2tvLWFwcCIsImEiOiJjbHhxNXYyMWUwMDFwMmtzZXozdmhsbXFpIn0.placeholder-token';
Mapbox.setAccessToken(MAPBOX_TOKEN);

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
  onMarkerPress,
  style,
}: MapProps) {
  const { theme, isDarkMode } = useTheme();

  // Determine map style URL based on the application's theme context
  const mapStyle = isDarkMode ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Light;

  const centerCoordinate = useMemo<[number, number]>(() => {
    return [centerLongitude, centerLatitude];
  }, [centerLatitude, centerLongitude]);

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
  },
  markerContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerPin: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
