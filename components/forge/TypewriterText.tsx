import React, { useState, useEffect } from 'react';
import { View, Text, TextProps } from 'react-native';

interface TypewriterTextProps extends TextProps {
  text: string;
  delay?: number;
  animate?: boolean;
  onComplete?: () => void;
}

export function TypewriterText({ text, delay = 20, animate = true, onComplete, style, ...props }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState(animate ? '' : text);

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
      return;
    }
    
    // Reset when text changes
    setDisplayedText('');
    
    if (!text) {
      if (onComplete) onComplete();
      return;
    }

    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        const next = text.slice(0, prev.length + 1);
        if (next === text) {
          clearInterval(intervalId);
          if (onComplete) onComplete();
        }
        return next;
      });
    }, delay);

    return () => clearInterval(intervalId);
  }, [text, delay, animate]);

  return (
    <View style={{ position: 'relative' }}>
      {/* Invisible full text forces the container to its final size immediately */}
      <Text style={[style, { opacity: 0 }]} {...props}>
        {text}
      </Text>
      {/* Visible typing text positioned exactly over it */}
      <Text style={[style, { position: 'absolute', top: 0, left: 0 }]} {...props}>
        {displayedText}
      </Text>
    </View>
  );
}
