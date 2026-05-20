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
      };
    case 'orange':
      return {
        text: '#FFFFFF',
        label: 'rgba(255, 255, 255, 0.75)',
        brand: '#FF5C2E',
        shoe: '#FF5C2E',
      };
    case 'white':
    default:
      return {
        text: '#FFFFFF',
        label: 'rgba(255, 255, 255, 0.75)',
        brand: '#FFFFFF',
        shoe: '#FFFFFF',
      };
  }
};
