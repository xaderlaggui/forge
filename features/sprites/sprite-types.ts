export type ScreenType = 
  | 'home'
  | 'dashboard'
  | 'workout_start'
  | 'workout_active'
  | 'workout_complete'
  | 'workout_summary'
  | 'chatbot'
  | 'onboarding'
  | 'notifications'
  | 'leaderboard'
  | 'social'
  | 'empty_state'
  | 'milestone';

export type AnimationType = 'static' | 'fade-in' | 'slide-in-right' | 'bounce-in';

export interface Sprite {
  id: string;
  file: string;
  character_name: string;
  pose: string;
  personality: string;
  triggers: string[];
  chatbot_tone: string;
  chatbot_message_examples: string[];
  ui_placement: string[];
  animation_allowed?: boolean;
}

export type SpriteMap = Record<string, string>;

export interface SpriteTrigger {
  trigger: string;
  spriteId: string;
}

export interface SpritePlacement {
  screen: ScreenType;
  spriteId: string;
  size: 'small' | 'medium' | 'large' | 'milestone';
}

export interface ChatbotSpriteConfig {
  spriteId: string;
  tone: string;
  messageSuggestion: string;
  animation: AnimationType;
  size: number;
}
