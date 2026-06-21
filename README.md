# 🩸 DugóKo

> Your Blood. Your Community. Your Impact.

DugóKo is a community blood donation companion app that helps users track their donation journey, discover nearby blood drives, respond to urgent blood requests, and access blood donation information. Built using React Native, Expo, and Supabase.

## 🚀 Built With

- React Native
- Expo
- Expo Router
- TypeScript
- Supabase
- PostgreSQL
- Mapbox

## 📱 Core Features

- Donation Tracking
- Event Finder
- Community Blood Requests
- Donation History
- Notifications
- Blood Education
- Dona Assistant

## 📄 License

This project is intended for academic purposes.

## 🗺️ Mapbox Setup & Configuration

This project uses `@rnmapbox/maps` for theme-aware native mapping.

### 1. Setup Public Access Token
Create a `.env` file in the root of the project (`DugoKo_BloodDonationApp`) and add your Mapbox Public Token:
```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-public-token-here
```
This is picked up dynamically in `components/ui/Map.tsx`.

### 2. Custom Development Client Build
Since Mapbox relies on native SDKs, it will not run inside standard Expo Go. You must build a custom development client:
```bash
# 1. Generate native folders (Android/iOS)
npx expo prebuild --clean

# 2. Run local native builds
npx expo run:android  # For Android emulator/device
npx expo run:ios      # For iOS simulator/device
```
