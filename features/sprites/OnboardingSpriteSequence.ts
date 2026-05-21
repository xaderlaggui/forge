import { ChatbotSpriteConfig } from './sprite-types';

export class OnboardingSpriteSequence {
  public getSpriteForStep(stepIndex: number): ChatbotSpriteConfig {
    switch (stepIndex) {
      case 0:
        return {
          spriteId: 'blaze',
          tone: 'hype',
          messageSuggestion: "Welcome to FORGE. Let's build something real.",
          animation: 'slide-in-right',
          size: 160
        };
      case 1:
        return {
          spriteId: 'eagle',
          tone: 'focused',
          messageSuggestion: "Precision is everything. We track every rep.",
          animation: 'fade-in',
          size: 160
        };
      case 2:
        return {
          spriteId: 'highfive',
          tone: 'warm',
          messageSuggestion: "You're not alone. The squad is here.",
          animation: 'bounce-in',
          size: 160
        };
      case 3: // Login / Signup
        return {
          spriteId: 'forge',
          tone: 'direct',
          messageSuggestion: "Time to commit. Sign in.",
          animation: 'fade-in',
          size: 140
        };
      case 4: // Personalize
        return {
          spriteId: 'shredder',
          tone: 'playful',
          messageSuggestion: "Let's calibrate your baseline. Be honest!",
          animation: 'bounce-in',
          size: 120
        };
      default:
        return {
          spriteId: 'titan',
          tone: 'neutral',
          messageSuggestion: "Let's go.",
          animation: 'fade-in',
          size: 120
        };
    }
  }
}

export const onboardingSpriteSequence = new OnboardingSpriteSequence();
