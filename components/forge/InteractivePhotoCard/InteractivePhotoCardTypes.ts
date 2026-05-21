import React from 'react';

export type StickerTheme = 'white' | 'dark' | 'orange';

export interface InteractivePhotoCardProps {
  photoUri: string;
  workout: any;
  pickImage: () => void;
  shareImage: () => void;
  isUploading: boolean;
  shareViewShotRef: React.RefObject<any>;
}

export const getStickerColors = (theme: StickerTheme) => {
  switch (theme) {
    case 'dark':
      return {
        text: '#111113',
        label: 'rgba(17, 17, 19, 0.65)',
        brand: '#111113',
        shoe: '#111113',
        gradientStart: 'rgba(245, 245, 247, 0.01)',
        gradientEnd: 'rgba(230, 230, 235, 0.88)',
      };
    case 'orange':
      return {
        text: '#FFFFFF',
        label: 'rgba(255, 255, 255, 0.75)',
        brand: '#FF5C2E',
        shoe: '#FF5C2E',
        gradientStart: 'rgba(255, 92, 46, 0.02)',
        gradientEnd: 'rgba(255, 92, 46, 0.82)',
      };
    case 'white':
    default:
      return {
        text: '#FFFFFF',
        label: 'rgba(255, 255, 255, 0.75)',
        brand: '#FFFFFF',
        shoe: '#FFFFFF',
        gradientStart: 'rgba(30, 30, 36, 0.02)',
        gradientEnd: 'rgba(15, 15, 20, 0.88)',
      };
  }
};
