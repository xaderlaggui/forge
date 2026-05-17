export const MascotImages = {
  coach:     require('../assets/images/chatbot-removebg.png'),
  hero:      require('../assets/images/welcome-removebg.png'),
  nutrition: require('../assets/images/nutrition-removebg.png'),
  progress:  require('../assets/images/progress-removebg.png'),
  welcome:   require('../assets/images/welcome-removebg.png'),
  workout:   require('../assets/images/workout-removebg.png'),
  app_icon:  require('../assets/images/app_icon-removebg.png'),
} as const;

export type MascotKey = keyof typeof MascotImages;
