import React from 'react';
import { View, Text, Platform, UIManager } from 'react-native';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const isSvgSupported = (): boolean => {
  if (Platform.OS === 'web') return true;
  return Boolean(
    UIManager.getViewManagerConfig &&
    UIManager.getViewManagerConfig('RNSVGSvgView')
  );
};

function SafeSvg({
  size,
  fallbackSymbol,
  fallbackColor,
  children,
}: {
  size: number;
  fallbackSymbol?: string;
  fallbackColor?: string;
  children: React.ReactNode;
}) {
  if (!isSvgSupported()) {
    return (
      <View
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: Math.max(10, Math.round(size * 0.7)),
            color: fallbackColor || '#065F46',
            fontWeight: '800',
            textAlign: 'center',
            lineHeight: size,
          }}
        >
          {fallbackSymbol || '•'}
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

export function CalendarIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="📅" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <Line x1="16" y1="2" x2="16" y2="6" />
        <Line x1="8" y1="2" x2="8" y2="6" />
        <Line x1="3" y1="10" x2="21" y2="10" />
      </Svg>
    </SafeSvg>
  );
}

export function ClockIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="⏱" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Polyline points="12 6 12 12 16 14" />
      </Svg>
    </SafeSvg>
  );
}

export function AlertTriangleIcon({ size = 20, color = '#D97706', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="▲" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <Line x1="12" y1="9" x2="12" y2="13" />
        <Line x1="12" y1="17" x2="12.01" y2="17" />
      </Svg>
    </SafeSvg>
  );
}

export function AlertCircleIcon({ size = 20, color = '#EF4444', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="!" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Line x1="12" y1="8" x2="12" y2="12" />
        <Line x1="12" y1="16" x2="12.01" y2="16" />
      </Svg>
    </SafeSvg>
  );
}

export function CheckCircleIcon({ size = 20, color = '#065F46', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="✓" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <Polyline points="22 4 12 14.01 9 11.01" />
      </Svg>
    </SafeSvg>
  );
}

export function CheckIcon({ size = 18, color = '#065F46', strokeWidth = 2.5 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="✓" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="20 6 9 17 4 12" />
      </Svg>
    </SafeSvg>
  );
}

export function PhoneIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="📞" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </Svg>
    </SafeSvg>
  );
}

export function SearchIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="⌕" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="11" cy="11" r="8" />
        <Line x1="21" y1="21" x2="16.65" y2="16.65" />
      </Svg>
    </SafeSvg>
  );
}

export function ArrowUpDownIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="⇅" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="7 15 12 20 17 15" />
        <Polyline points="17 9 12 4 7 9" />
      </Svg>
    </SafeSvg>
  );
}

export function ChevronDownIcon({ size = 18, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="⌄" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="6 9 12 15 18 9" />
      </Svg>
    </SafeSvg>
  );
}

export function ChevronRightIcon({ size = 18, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="›" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="9 18 15 12 9 6" />
      </Svg>
    </SafeSvg>
  );
}

export function UserIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="👤" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <Circle cx="12" cy="7" r="4" />
      </Svg>
    </SafeSvg>
  );
}

export function BanknoteIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="💵" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="2" y="6" width="20" height="12" rx="2" />
        <Circle cx="12" cy="12" r="2" />
        <Path d="M6 12h.01M18 12h.01" />
      </Svg>
    </SafeSvg>
  );
}

export function ShieldAlertIcon({ size = 20, color = '#D97706', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="🛡" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <Line x1="12" y1="8" x2="12" y2="12" />
        <Line x1="12" y1="16" x2="12.01" y2="16" />
      </Svg>
    </SafeSvg>
  );
}

export function FilterIcon({ size = 18, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="⚡" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </Svg>
    </SafeSvg>
  );
}

export function RefreshCwIcon({ size = 18, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="↻" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="23 4 23 10 17 10" />
        <Polyline points="1 20 1 14 7 14" />
        <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </Svg>
    </SafeSvg>
  );
}

export function XIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="✕" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Line x1="18" y1="6" x2="6" y2="18" />
        <Line x1="6" y1="6" x2="18" y2="18" />
      </Svg>
    </SafeSvg>
  );
}

export function Edit3Icon({ size = 18, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="✎" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 20h9" />
        <Path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </Svg>
    </SafeSvg>
  );
}

export function BellRingIcon({ size = 20, color = '#D97706', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="🔔" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        <Path d="M2 8c0-2.2 1.8-4 4-4" />
        <Path d="M22 8c0-2.2-1.8-4-4-4" />
      </Svg>
    </SafeSvg>
  );
}

export function ArrowRightIcon({ size = 18, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="→" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Line x1="5" y1="12" x2="19" y2="12" />
        <Polyline points="12 5 19 12 12 19" />
      </Svg>
    </SafeSvg>
  );
}

export function PlusIcon({ size = 20, color = '#065F46', strokeWidth = 2.5 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="+" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Line x1="12" y1="5" x2="12" y2="19" />
        <Line x1="5" y1="12" x2="19" y2="12" />
      </Svg>
    </SafeSvg>
  );
}

export function ArrowDownLeftIcon({ size = 18, color = '#10B981', strokeWidth = 2.5 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="↙" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Line x1="17" y1="7" x2="7" y2="17" />
        <Polyline points="17 17 7 17 7 7" />
      </Svg>
    </SafeSvg>
  );
}

export function ArrowUpRightIcon({ size = 18, color = '#EF4444', strokeWidth = 2.5 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="↗" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Line x1="7" y1="17" x2="17" y2="7" />
        <Polyline points="7 7 17 7 17 17" />
      </Svg>
    </SafeSvg>
  );
}

export function BuildingIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="🏢" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <Path d="M9 22v-4h6v4" />
        <Path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
      </Svg>
    </SafeSvg>
  );
}

export function SettingsIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="⚙" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="3" />
        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </Svg>
    </SafeSvg>
  );
}

export function LogOutIcon({ size = 20, color = '#EF4444', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="⎋" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <Polyline points="16 17 21 12 16 7" />
        <Line x1="21" y1="12" x2="9" y2="12" />
      </Svg>
    </SafeSvg>
  );
}

export function CloudIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="☁" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </Svg>
    </SafeSvg>
  );
}

export function ShieldCheckIcon({ size = 20, color = '#065F46', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="🛡" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <Polyline points="9 12 11 14 15 10" />
      </Svg>
    </SafeSvg>
  );
}

export function MapPinIcon({ size = 20, color = '#64748B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="📍" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <Circle cx="12" cy="10" r="3" />
      </Svg>
    </SafeSvg>
  );
}

export function WifiIcon({ size = 18, color = '#10B981', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="📶" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <Path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <Line x1="12" y1="20" x2="12.01" y2="20" />
      </Svg>
    </SafeSvg>
  );
}

export function WifiOffIcon({ size = 18, color = '#F59E0B', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="📵" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Line x1="1" y1="1" x2="23" y2="23" />
        <Path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <Path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <Path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
        <Path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <Line x1="12" y1="20" x2="12.01" y2="20" />
      </Svg>
    </SafeSvg>
  );
}

export function CloudUploadIcon({ size = 18, color = '#2563EB', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="☁" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M16 16l-4-4-4 4" />
        <Path d="M12 12v9" />
        <Path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        <Polyline points="16 16 12 12 8 16" />
      </Svg>
    </SafeSvg>
  );
}

export function AwardIcon({ size = 20, color = '#7C3AED', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="★" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="8" r="7" />
        <Polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </Svg>
    </SafeSvg>
  );
}

export function InfoIcon({ size = 20, color = '#2563EB', strokeWidth = 2 }: IconProps) {
  return (
    <SafeSvg size={size} fallbackSymbol="ℹ" fallbackColor={color}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Line x1="12" y1="16" x2="12" y2="12" />
        <Line x1="12" y1="8" x2="12.01" y2="8" />
      </Svg>
    </SafeSvg>
  );
}



