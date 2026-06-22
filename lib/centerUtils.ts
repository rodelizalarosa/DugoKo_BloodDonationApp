import { Linking, Platform } from 'react-native';

export function callCenter(phoneNumber: string): void {
  const cleaned = phoneNumber.replace(/[\s()-]/g, '');
  const tel = Platform.OS === 'android' ? `tel:${cleaned}` : `telprompt:${cleaned}`;
  Linking.openURL(tel).catch(() => {});
}

export function openDirections(lat: number, lng: number, label: string): void {
  const encodedLabel = encodeURIComponent(label);
  const url = Platform.select({
    ios: `maps:0,0?q=${encodedLabel}@${lat},${lng}`,
    android: `geo:0,0?q=${lat},${lng}(${encodedLabel})`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  });
  Linking.openURL(url!).catch(() => {});
}
