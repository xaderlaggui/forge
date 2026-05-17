export const MascotImages = {
  coach:     require('../assets/images/ai-bear-removebg-preview.png'),
  hero:      require('../assets/images/home_hero-removebg-preview.png'),
  nutrition: require('../assets/images/nutrition-removebg-preview.png'),
  progress:  require('../assets/images/progress-bear-removebg-preview.png'),
  welcome:   require('../assets/images/welcome-removebg-preview.png'),
  workout:   require('../assets/images/workout-removebg-preview.png'),
} as const;

export type MascotKey = keyof typeof MascotImages;
