export const MascotImages = {
  coach: require('../assets/images/coach.png'),
  hero: require('../assets/images/welcome.png'),
  nutrition: require('../assets/images/nutrition-removebg.png'),
  progress: require('../assets/images/progress-removebg.png'),
  welcome: require('../assets/images/welcome.png'),
  workout: require('../assets/images/workout-removebg.png'),
  app_icon: require('../assets/images/mascot/bear-4/bear-4-4.png'),
  bear_1_1: require('../assets/images/mascot/bear-1/bear-1-1.png'),
  bear_3_1: require('../assets/images/mascot/bear-3/bear-3-1.png'),
  bear_3_3: require('../assets/images/mascot/bear-3/bear-3-3.png'),
} as const;

export type MascotKey = keyof typeof MascotImages;
