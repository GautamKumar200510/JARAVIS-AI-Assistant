import React from 'react';
import { JarvisLogo } from './JarvisLogo';

interface GeminiStarLogoProps {
  className?: string;
  size?: number;
}

export const GeminiStarLogo: React.FC<GeminiStarLogoProps> = ({ 
  className = '', 
  size = 28 
}) => {
  return <JarvisLogo className={className} size={size} />;
};

export { JarvisLogo };
