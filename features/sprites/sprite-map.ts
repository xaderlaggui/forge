import { ScreenType, SpriteMap } from './sprite-types';
import spritesJson from '../../../assets/sprites/forge-bear-sprites.json';
import { Sprite } from './sprite-types';

const sprites = spritesJson as Sprite[];

export const triggerToSpriteMap: SpriteMap = {};

// Auto-populate trigger map from JSON config
sprites.forEach(sprite => {
  sprite.triggers.forEach(trigger => {
    // If a trigger is claimed by multiple sprites, the last one in the JSON wins
    triggerToSpriteMap[trigger] = sprite.id; 
  });
});

export const screenToDefaultSpriteMap: Record<ScreenType, string> = {
  home: 'blaze',
  dashboard: 'grizzly',
  workout_start: 'forge',
  workout_active: 'rocket',
  workout_complete: 'ignite',
  workout_summary: 'grizzly',
  chatbot: 'titan',
  onboarding: 'blaze',
  notifications: 'forge',
  leaderboard: 'summit',
  social: 'highfive',
  empty_state: 'forge',
  milestone: 'ignite'
};

export const workoutTypeToSpriteMap: Record<string, string[]> = {
  cycling: ['dasher'],
  running: ['rocket'],
  sprint: ['rocket'],
  hiit: ['knockout'],
  boxing: ['knockout'],
  pull_day: ['deadlift', 'puller', 'ironback'],
  push_day: ['presser', 'curl'],
  leg_day: ['squatter', 'legpress', 'lunger', 'romanian'],
  yoga: ['warrior'],
  stretch: ['warrior'],
  martial_arts: ['striker', 'judoka'],
  swimming: ['diver'],
  cooldown: ['diver'],
  rowing: ['rower'],
  team_sports: ['spiker', 'highfive'],
  climbing: ['scaler'],
  winter: ['snowcrusher'],
  skiing: ['snowcrusher'],
  new_workout: ['shredder']
};

export const notificationToSpriteMap: Record<string, string> = {
  daily_reminder: 'forge',
  streak_at_risk: 'forge',
  milestone_achieved: 'ignite',
  friend_challenge: 'highfive',
  leaderboard_improved: 'netmaster',
  coach_mode: 'doublepoint',
  rest_day: 'diver'
};
