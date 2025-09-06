import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface LogoProps {
  size?: number;
  className?: string;
}

const logoSvg = `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="60" fill="#ef4444"/>
  <circle cx="60" cy="60" r="45" fill="#ffffff" fill-opacity="0.1"/>
  <path d="M30 50 C30 45, 35 40, 45 40 L75 40 C85 40, 90 45, 90 50 L85 70 C85 75, 80 80, 75 80 L45 80 C40 80, 35 75, 35 70 Z" fill="#ffffff"/>
  <circle cx="50" cy="55" r="4" fill="#ef4444"/>
  <circle cx="65" cy="58" r="3" fill="#fbbf24"/>
  <circle cx="55" cy="65" r="3" fill="#10b981"/>
  <circle cx="70" cy="50" r="3" fill="#f59e0b"/>
  <path d="M45 35 Q47 30, 45 25" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M60 35 Q62 30, 60 25" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M75 35 Q77 30, 75 25" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
  <rect x="55" y="90" width="10" height="3" fill="#ffffff" rx="1.5"/>
  <rect x="58.5" y="86.5" width="3" height="10" fill="#ffffff" rx="1.5"/>
</svg>`;

export const Logo: React.FC<LogoProps> = ({ size = 96, className = '' }) => {
  return (
    <View className={`${className}`} style={{ width: size, height: size }}>
      <SvgXml xml={logoSvg} width="100%" height="100%" />
    </View>
  );
};

export default Logo;
