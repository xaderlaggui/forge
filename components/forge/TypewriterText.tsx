import React, { useState, useEffect } from 'react';
import { Text, TextProps } from 'react-native';

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
    <Text style={style} {...props}>
      {displayedText}
    </Text>
  );
}
