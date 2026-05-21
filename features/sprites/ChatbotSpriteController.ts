import { ChatbotSpriteConfig } from './sprite-types';
import { spriteAssets } from './sprite-assets';

// Intent keywords mapping to sprite IDs
const intentMap: Record<string, string> = {
  'swim': 'diver',
  'swam': 'diver',
  'swimming': 'diver',
  'run': 'rocket',
  'ran': 'rocket',
  'running': 'rocket',
  'bike': 'dasher',
  'cycle': 'dasher',
  'cycling': 'dasher',
  'lift': 'ironback',
  'weight': 'ironback',
  'squat': 'squatter',
  'bench': 'presser',
  'deadlift': 'deadlift',
  'yoga': 'warrior',
  'stretch': 'warrior',
  'box': 'knockout',
  'boxing': 'knockout',
  'hiit': 'knockout',
  'tennis': 'ace',
  'volleyball': 'spiker',
  'climb': 'scaler',
  'skate': 'shredder',
  'surf': 'surfer',
  'golf': 'swinger',
  'ski': 'snowcrusher',
  'row': 'rower'
};

export class ChatbotSpriteController {
  private lastShownSprite: string | null = null;
  public enable_bear_chatbot_sprites: boolean = true;

  constructor() {
    this.lastShownSprite = 'titan'; // Default idle
  }

  public getSpriteForMessage(message: string, isGreeting: boolean = false, isError: boolean = false): ChatbotSpriteConfig {
    if (!this.enable_bear_chatbot_sprites) {
      return {
        spriteId: 'titan',
        tone: 'neutral',
        messageSuggestion: '',
        animation: 'static',
        size: 120
      };
    }

    let nextSpriteId = 'titan'; // Default idle

    if (isError) {
      nextSpriteId = 'forge';
    } else if (isGreeting) {
      nextSpriteId = 'blaze';
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
    if (nextSpriteId === this.lastShownSprite && nextSpriteId !== 'titan') {
      // If repeat, fallback to a secondary related sprite or default
      nextSpriteId = 'titan';
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
    return spriteAssets[spriteId] || spriteAssets['titan'];
  }
}

export const chatbotSpriteController = new ChatbotSpriteController();
