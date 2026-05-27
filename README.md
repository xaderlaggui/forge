# Forge Fitness 🐻🔥

Forge Fitness is a comprehensive React Native mobile application built with Expo that combines workout tracking, nutrition planning, AI coaching, and gamification to help users achieve their fitness goals.

## 🌟 Key Features

- **Gamified Progression**: Level up your personal bear mascot by maintaining streaks and logging workouts consistently. The mascot's mood and appearance change based on your activity!
- **Workout Tracking & Routine Builder**: Create custom workout routines, track sets, reps, and volume (KG/LBS), and view detailed workout histories.
- **Nutrition & Meal Planning**: Log meals, track macronutrients with interactive donut charts, and get AI-powered nutritional analysis from simple text descriptions.
- **AI Fitness Coach**: Integrated conversational AI (powered by Groq / LLaMA-3) to give you real-time advice, generate custom weekly meal plans, and analyze your eating habits.
- **Interactive Photo Sharing**: Share your workout progress with customizable "sticker" overlays and beautiful gradient backgrounds. Generates shareable images using `react-native-view-shot` and `expo-sharing`.
- **Advanced Theming**: A robust custom design system (`useForgeTheme`) with dynamic color palettes, sleek dark modes, and carefully crafted micro-animations.

## 🏗️ Architecture & Tech Stack

This project is built using a modern, feature-sliced architecture for maintainability and scalability.

**Core Stack:**
- **Framework:** [Expo](https://expo.dev/) (SDK 54) with **React Native**
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Backend & Auth:** [Supabase](https://supabase.com/)
- **AI Integration:** [Groq API](https://groq.com/) (LLaMA-3 70B for lightning-fast inference)

**Key Libraries:**
- **UI/Styling:** `lucide-react-native` (Icons), `react-native-reanimated` (Animations), `@shopify/flash-list` (Performant lists)
- **Data Visualization:** `react-native-gifted-charts`, `react-native-body-highlighter`
- **Media:** `expo-image`, `expo-camera`, `expo-image-picker`, `expo-media-library`

## 📁 Directory Structure

```
├── app/                  # Expo Router file-based routing
│   ├── (ai)/             # AI Coach & Meal Generator screens
│   ├── (auth)/           # Authentication screens
│   ├── (nutrition)/      # Meal tracking screens
│   ├── (profile)/        # Profile, Settings, Privacy
│   ├── (tabs)/           # Main bottom tab navigation
│   └── (workout)/        # Workout tracking & Routine builder
├── components/           # Generic, reusable UI components (e.g., ForgeButton)
├── constants/            # Global constants (Theme tokens, prompts, assets)
├── features/             # Feature-sliced domains (Logic + UI specific to a domain)
│   ├── ai/               # AI Chat & Generator logic
│   ├── dashboard/        # Home screen widgets & logic
│   ├── nutrition/        # Macro rings, daily tracking
│   ├── planner/          # Calendar and daily plan logic
│   ├── profile/          # User profile state
│   ├── progress/         # Photo sharing & stickers
│   ├── sprites/          # Mascot sprite definitions
│   └── workout/          # Active session & exercise logic
├── services/             # External APIs (Supabase, Groq)
├── stores/               # Global Zustand stores (Auth, Settings)
├── types/                # Global TypeScript definitions
└── utils/                # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo CLI
- iOS Simulator or Android Emulator (or a physical device with Expo Go / Dev Build)

### Installation

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
   ```
4. **Start the development server:**
   ```bash
   npx expo start -c
   ```

## 🤝 Contributing
1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📄 License
This project is proprietary and confidential.
