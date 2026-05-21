import { ChatbotSpriteConfig } from './sprite-types';
import { spriteAssets } from './sprite-assets';

// Intent keywords mapping to sprite IDs
const intentMap: Record<string, string> = {
  'swim': 'swimming',
  'swam': 'swimming',
  'swimming': 'swimming',
  'walk': 'walking',
  'walked': 'walking',
  'walking': 'walking',
  'run': 'running',
  'ran': 'running',
  'running': 'running',
  'bike': 'cycling',
  'cycle': 'cycling',
  'cycling': 'cycling',
  'lift': 'flex',
  'weight': 'flex',
  'squat': 'back_squat',
  'bench': 'bench-press',
  'deadlift': 'deadlift',
  'yoga': 'yoga',
  'stretch': 'yoga',
  'box': 'boxing',
  'boxing': 'boxing',
  'hiit': 'boxing',
  'tennis': 'tennis',
  'volleyball': 'volleyball',
  'climb': 'rock-climbing',
  'skate': 'skateboarding',
  'surf': 'surfing',
  'golf': 'golf',
  'ski': 'snowboarding',
  'row': 'rowing'
};

export class ChatbotSpriteController {
  private lastShownSprite: string | null = null;
  public enable_bear_chatbot_sprites: boolean = true;

  constructor() {
    this.lastShownSprite = 'smiling-coach'; // Default idle
  }

  public getSpriteForMessage(message: string, isGreeting: boolean = false, isError: boolean = false): ChatbotSpriteConfig {
    if (!this.enable_bear_chatbot_sprites) {
      return {
        spriteId: 'smiling-coach',
        tone: 'neutral',
        messageSuggestion: '',
        animation: 'static',
        size: 120
      };
    }

    let nextSpriteId = 'smiling-coach'; // Default idle

    if (isError) {
      nextSpriteId = 'pointing';
    } else if (isGreeting) {
      nextSpriteId = 'high-five';
    } else {
      // Intent matching
      const lowerMessage = message.toLowerCase();
      for (const [keyword, spriteId] of Object.entries(intentMap)) {
        // Basic keyword matching using word boundaries
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(lowerMessage)) {
          nextSpriteId = spriteId;
          break;
        }
      }
    }

    // Prevent repeat
    if (nextSpriteId === this.lastShownSprite && nextSpriteId !== 'smiling-coach') {
      // If repeat, fallback to a secondary related sprite or default
      nextSpriteId = 'smiling-coach';
    }

    this.lastShownSprite = nextSpriteId;

    return {
      spriteId: nextSpriteId,
      tone: 'dynamic', // Could be expanded by looking up in JSON
      messageSuggestion: '',
      animation: 'fade-in',
      size: 120
    };
  }

  public getAssetSource(spriteId: string) {
    return spriteAssets[spriteId] || spriteAssets['smiling-coach'];
  }
}

export const chatbotSpriteController = new ChatbotSpriteController();
