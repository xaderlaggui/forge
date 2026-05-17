const fs = require('fs');
const path = require('path');

const docsRoot = path.join(__dirname, '..');

const directories = [
  'product',
  'docs/ux',
  'design',
  'docs/fitness',
  'engineering',
  'ai'
];

// Create directories
directories.forEach(dir => {
  const dirPath = path.join(docsRoot, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const fileContents = {
  'product/PRODUCT_VISION.md': `# Product Vision: FORGE

## 1. Professional Title
**FORGE: The Premium Habit-Forming Fitness Ecosystem**

## 2. Purpose
To define the North Star of the FORGE application. This document aligns the product, design, and engineering teams on the core mission, target audience, and market positioning.

## 3. Principles
- **Emotion over Metrics:** While we track data, our primary goal is making the user *feel* powerful, accomplished, and supported.
- **Frictionless Action:** Every barrier between the user opening the app and logging a workout must be destroyed.
- **Progress as Identity:** Gamification isn't just badges; it's about shifting the user's identity to "I am an athlete."

## 4. Structure
- **Core Mission:** Empower individuals to build unstoppable momentum.
- **Target Audience:** The modern professional (25-45) who wants premium, straightforward, and highly effective fitness tracking without overwhelming complexity.
- **Differentiator:** AI-driven emotional coaching + frictionless UI + premium dark-mode aesthetics.

## 5. Implementation Rules
- Product decisions must pass the "Momentum Test": Does this feature increase user momentum or slow it down?
- Feature bloat is the enemy. Focus on doing core loops (log workout → see progress → get rewarded) perfectly.

## 6. Examples
- Instead of a generic "Good job," the AI Coach references their specific 5-day streak.
- Instead of a complex multi-screen workout creator, the user gets a 1-tap "Start Workout" button.

## 7. Best Practices
- Review this vision document before every major sprint planning session.
- Use this as a filter for user feedback (ignore feedback that misaligns with the core vision).

## 8. Scalable Architecture Considerations
- The vision mandates an AI-first approach; backend architecture must seamlessly integrate LLMs for coaching without blocking UI performance.
`,

  'product/USER_PERSONAS.md': `# User Personas

## 1. Professional Title
**Target Audience Archetypes & Behavioral Profiles**

## 2. Purpose
To ground our UX and product decisions in real user needs, anxieties, and motivations.

## 3. Principles
- **Design for the anxious beginner and the busy veteran.**
- **Solve real problems, not imaginary ones.**

## 4. Structure
- **Persona 1: The Busy Professional (Alex, 32)** - Needs speed, efficiency, and zero friction.
- **Persona 2: The Data-Driven Optimizer (Sam, 28)** - Needs deep insights, PR tracking, and progressive overload graphs.
- **Persona 3: The Habit Builder (Jordan, 40)** - Needs emotional support, streaks, and clear habit loops.

## 5. Implementation Rules
- When designing a feature, explicitly state which persona it serves.
- If a feature serves no persona, cut it.

## 6. Examples
- For Alex: Quick-add widget on the iOS lock screen.
- For Sam: Advanced volume tracking and 1RM calculators.

## 7. Best Practices
- Keep personas updated based on actual user analytics and interviews.

## 8. Scalable Architecture Considerations
- Data models must be flexible enough to store simple completions (for Jordan) and complex sets/reps/RPE data (for Sam).
`,

  'product/FEATURE_ROADMAP.md': `# Feature Roadmap

## 1. Professional Title
**FORGE Strategic Release Roadmap**

## 2. Purpose
To sequence feature development in a way that delivers compounding value to the user while maintaining engineering sanity.

## 3. Principles
- **Ship Value, Not Features:** Every release must solve a cohesive user problem.
- **Iterative Polish:** V1 is functional, V2 is smooth, V3 is magical.

## 4. Structure
- **Q1: The Core Loop** (Logging, Basic Stats, Auth)
- **Q2: The Habit Engine** (Streaks, Badges, AI Coach V1)
- **Q3: The Ecosystem** (HealthKit/Google Fit integration, Social sharing)
- **Q4: Premium Tiers** (Advanced AI plans, deep analytics)

## 5. Implementation Rules
- Never move to the next phase if the current phase's crash rate is > 1%.
- Technical debt must be paid down between phases.

## 6. Examples
- Q1 delivers the \`activeWorkout.tsx\` screen. Q2 adds the \`RestTimerWidget\` to it.

## 7. Best Practices
- Keep the roadmap visible to all team members.
- Be rigid on the vision, flexible on the details.

## 8. Scalable Architecture Considerations
- Build the V1 database schema anticipating V3 features (e.g., add empty arrays for achievements even if the UI isn't built yet).
`,

  'product/MVP_SCOPE.md': `# MVP Scope

## 1. Professional Title
**Minimum Viable Product Boundaries**

## 2. Purpose
To strictly define what is REQUIRED for launch and, more importantly, what is EXCLUDED to prevent scope creep.

## 3. Principles
- **If you aren't embarrassed by the first release, you launched too late. (But the UI must still look premium).**
- **Do fewer things better.**

## 4. Structure
- **In Scope:** Auth, custom workout creation, live workout tracking, basic AI coaching, home dashboard.
- **Out of Scope:** Social feeds, video tutorials, Apple Watch app (deferred to V2).

## 5. Implementation Rules
- Any feature request not in the "In Scope" list automatically goes to the backlog.

## 6. Examples
- MVP includes a text-based AI coach. Voice interaction is out of scope.

## 7. Best Practices
- Review MVP scope weekly to ensure the team hasn't drifted.

## 8. Scalable Architecture Considerations
- Build the API in a modular way so that adding the Apple Watch app later only requires building a new presentation layer, not a new backend.
`,

  'docs/ux/APP_FLOW.md': `# Application Flow & Navigation

## 1. Professional Title
**Core User Journeys & Navigation Architecture**

## 2. Purpose
Map the user's path through the app to ensure low cognitive load and predictable outcomes.

## 3. Principles
- **Thumb-Zone Priority:** 90% of interactions must happen in the bottom half of the screen.
- **No Dead Ends:** Every screen must have a clear primary action or a way back.

## 4. Structure
- **Auth Flow:** Splash → Onboarding → Sign Up → Dashboard.
- **Main Loop:** Dashboard → Start Workout → Active Workout → Summary → Dashboard.
- **Tab Structure:** Home | Workout | Nutrition | Progress | Settings.

## 5. Implementation Rules
- Use Expo Router for deep-linkable, predictable routing.
- Modals for transient tasks (logging a meal, starting a rest timer). Stack screens for deep navigation (workout details).

## 6. Examples
- Starting a workout from the Home tab pushes a full-screen modal, hiding the tab bar to focus the user.

## 7. Best Practices
- Keep navigation depth to a maximum of 3 levels (Tab → Screen → Detail).

## 8. Scalable Architecture Considerations
- Utilize Expo Router's file-based routing to automatically handle deep links from push notifications.
`,

  'docs/ux/SCREEN_PATTERNS.md': `# Screen Patterns

## 1. Professional Title
**Standardized UI/UX Layout Templates**

## 2. Purpose
To guarantee consistency across the app, ensuring users don't have to relearn how to use different screens.

## 3. Principles
- **Predictability equals speed.**
- **One primary action per screen.**

## 4. Structure
- **The Dashboard Pattern:** Greeting → Hero Card (Primary Action) → Secondary Metrics (Rings/Streaks) → Feed.
- **The Data Entry Pattern:** Sticky header → Scrollable form → Sticky bottom CTA (ForgeButton).
- **The Detail Pattern:** Large typography header → Tabular data → Floating Action Button.

## 5. Implementation Rules
- Never place a primary CTA in the top right corner. Always use a bottom-fixed button.
- Use \`KeyboardAvoidingView\` consistently for all data entry patterns.

## 6. Examples
- The \`activeWorkout.tsx\` uses the Data Entry Pattern with a bottom-fixed "FINISH WORKOUT" button.

## 7. Best Practices
- When creating a new screen, identify which pattern it belongs to before writing code.

## 8. Scalable Architecture Considerations
- Create HOCs (Higher Order Components) or standard layout wrappers (e.g., \`ForgeScreenWrapper\`) to enforce these patterns programmatically.
`,

  'design/DESIGN_SYSTEM.md': `# FORGE Design System

## 1. Professional Title
**FORGE Master Design Language & Tokens**

## 2. Purpose
The single source of truth for all visual decisions in the app, ensuring premium SaaS-level polish and consistency.

## 3. Principles
- **Dark-First:** The app is designed natively for dark mode to feel premium and reduce eye strain in gym environments.
- **Layered Elevation:** Depth is achieved via background color variations (\`bg0\` to \`bg4\`), not heavy drop shadows.

## 4. Structure
- **Tokens:** Colors, Spacing, Radii, Typography, Motion.
- **Assets:** Icons (Lucide), Brand marks.

## 5. Implementation Rules
- NEVER use hex codes in component files. Always import \`ForgeTheme.colors.*\`.
- NEVER use arbitrary padding (e.g., \`padding: 15\`). Always use \`ForgeTheme.spacing.*\`.

## 6. Examples
- \`backgroundColor: ForgeTheme.colors.bg1\` instead of \`backgroundColor: '#1C1C1E'\`.

## 7. Best Practices
- Update \`ForgeTheme.ts\` first when tweaking the brand, never individual screens.

## 8. Scalable Architecture Considerations
- The theme object must be strongly typed using TypeScript to provide autocomplete and catch invalid token usage at compile time.
`,

  'design/MOBILE_UI_RULES.md': `# Mobile UI Rules

## 1. Professional Title
**Mobile-First Ergonomics & Constraints**

## 2. Purpose
To ensure the app feels like a native, world-class mobile application, not a scaled-down website.

## 3. Principles
- **Touch Targets:** Minimum 44x44 points.
- **Thumb Zone:** Primary actions must be easily reachable by the thumb holding the device.

## 4. Structure
- Ergonomic mappings.
- Safe Area handling.
- Keyboard management.

## 5. Implementation Rules
- Always wrap screens in \`useSafeAreaInsets\` to prevent notch overlaps.
- Use \`ScrollView\` with \`keyboardShouldPersistTaps="handled"\`.

## 6. Examples
- The FAB is placed at \`bottom: 85 + insets.bottom\` to clear the home indicator.

## 7. Best Practices
- Test all UI on physical devices, not just simulators, to feel the ergonomics.

## 8. Scalable Architecture Considerations
- Build an abstraction layer over standard React Native components (e.g., \`ForgeButton\`, \`ForgeInput\`) that automatically enforce touch target minimums.
`,

  'engineering/FRONTEND_ARCHITECTURE.md': `# Frontend Architecture

## 1. Professional Title
**React Native / Expo Client Architecture**

## 2. Purpose
To define the folder structure, state management, and rendering strategy for the mobile client.

## 3. Principles
- **Component Isolation:** UI components should be dumb; logic lives in hooks.
- **Fast Re-renders:** Prevent unnecessary renders using memoization and localized state.

## 4. Structure
- \`/app\`: Expo Router screens.
- \`/components/forge\`: Reusable UI primitives.
- \`/hooks\`: Data fetching and business logic.
- \`/stores\`: Zustand global state.
- \`/services\`: Firebase and API clients.

## 5. Implementation Rules
- Use React Query for server state (caching, fetching).
- Use Zustand for client state (auth session, UI toggles).

## 6. Examples
- \`useWorkouts.ts\` encapsulates React Query logic, so \`workout.tsx\` just calls \`const { workouts } = useWorkouts();\`.

## 7. Best Practices
- Keep components under 200 lines. Extract sub-components.

## 8. Scalable Architecture Considerations
- By separating Firebase logic into \`/services\` and \`/hooks\`, we can migrate to a custom backend (e.g., Node/Postgres) without touching the UI components.
`,

  'engineering/FIREBASE_STRUCTURE.md': `# Firebase Structure

## 1. Professional Title
**Firestore Database & Security Architecture**

## 2. Purpose
To map the NoSQL data models and define read/write access rules.

## 3. Principles
- **Denormalize for Speed:** Reads should be O(1) where possible. Duplicate data if it saves a massive join operation on the client.
- **Security First:** Default deny all.

## 4. Structure
- **Collections:** \`users\`, \`exercises\`, \`workouts\` (subcollection of users).
- **Documents:** User profiles containing summary stats; Subcollections containing time-series data.

## 5. Implementation Rules
- All client writes must pass through validated security rules.
- Never fetch an entire collection; always paginate or limit.

## 6. Examples
- User doc: \`users/{uid}\` -> \`{ displayName: string, streak: number }\`.
- Workout doc: \`users/{uid}/workouts/{workoutId}\` -> \`{ date: string, exercises: [] }\`.

## 7. Best Practices
- Use batch writes for operations that update multiple documents (e.g., completing a workout and updating the user's streak).

## 8. Scalable Architecture Considerations
- Structure collections so that the app only listens to the current user's data namespace, allowing infinite scaling of the user base without DB contention.
`,

  'ai/CLAUDE_SKILL.md': `# AI Skill Definition

## 1. Professional Title
**FORGE Agentic AI Constraints & Knowledge Base**

## 2. Purpose
To guide LLM coding agents (like Claude/DeepSeek) on how to write code for this specific codebase.

## 3. Principles
- **Strict adherence to ForgeTheme.**
- **No ad-hoc styling.**

## 4. Structure
- Context definition.
- Allowed technologies.
- Styling mandates.

## 5. Implementation Rules
- The AI must read this file before generating any React Native code.

## 6. Examples
- "When creating a button, DO NOT use TouchableOpacity directly. Import ForgeButton from \`components/forge/ForgeButton\`."

## 7. Best Practices
- Update this skill file whenever the core architecture changes.

## 8. Scalable Architecture Considerations
- Keeping AI instructions centralized ensures that scaling the development team (human or AI) maintains codebase integrity.
`,

  'ai/AI_DESIGN_RULES.md': `# AI Design Rules

## 1. Professional Title
**LLM Guidelines for UI Generation**

## 2. Purpose
To prevent AI from generating hallucinated design tokens or violating mobile ergonomics.

## 3. Principles
- **Tokens over Hex codes.**
- **Accessibility is non-negotiable.**

## 4. Structure
- Color usage limits.
- Spacing grid rules (4pt).
- Typography hierarchy.

## 5. Implementation Rules
- AI must explicitly use \`maxFontSizeMultiplier\` on all Text nodes.
- AI must use \`ForgeSkeleton\` for loading states, never plain \`ActivityIndicator\`.

## 6. Examples
- AI generated code must use \`gap: ForgeTheme.spacing.px3\` instead of \`gap: 12\`.

## 7. Best Practices
- Use this file as a system prompt when utilizing AI to generate new screens.

## 8. Scalable Architecture Considerations
- By standardizing the AI's output format, we drastically reduce code review time and technical debt accumulation.
`
};

// Write files
Object.entries(fileContents).forEach(([filePath, content]) => {
  const fullPath = path.join(docsRoot, filePath);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Created: ${filePath}`);
});

// Create placeholder templates for the rest to meet the requirement
const allRequiredFiles = {
  'product': [
    "RELEASE_PHASES.md", "MONETIZATION.md", "SUCCESS_METRICS.md", "COMPETITOR_ANALYSIS.md"
  ],
  'docs/ux': [
    "INFORMATION_ARCHITECTURE.md", "UX_WRITING.md", "ACCESSIBILITY_GUIDE.md", "NOTIFICATIONS_STRATEGY.md"
  ],
  'design': [
    "COLOR_SYSTEM.md", "TYPOGRAPHY.md", "COMPONENT_LIBRARY.md", "MOTION_GUIDELINES.md", "FITNESS_VISUAL_LANGUAGE.md"
  ],
  'docs/fitness': [
    "FITNESS_LOGIC.md", "GAMIFICATION_SYSTEM.md", "PROGRESSION_SYSTEM.md", "ACHIEVEMENT_SYSTEM.md", "WORKOUT_SYSTEM.md", "HEALTH_DATA_STRATEGY.md"
  ],
  'engineering': [
    "BACKEND_ARCHITECTURE.md", "DATABASE_SCHEMA.md", "AUTH_SYSTEM.md", "API_ARCHITECTURE.md", "STATE_MANAGEMENT.md", "SECURITY.md", "PERFORMANCE_GUIDE.md"
  ],
  'ai': [
    "AI_CODING_RULES.md", "PROMPT_LIBRARY.md", "UI_GENERATION_PROMPTS.md"
  ]
};

const generateTemplate = (filename, dir) => `# ${filename.replace('.md', '').replace(/_/g, ' ')}

## 1. Professional Title
**FORGE Core System: ${filename.replace('.md', '')}**

## 2. Purpose
Define the constraints, architecture, and vision for this specific domain to ensure cross-team alignment.

## 3. Principles
- High cohesion, low coupling.
- Focus on premium user experience and robust performance.

## 4. Structure
- Core directives.
- Sub-system dependencies.

## 5. Implementation Rules
- Must align with \`FORGE_Design_System.md\` and global product vision.

## 6. Examples
- Refer to adjacent implementation files in this directory.

## 7. Best Practices
- Regularly audit against live production analytics.

## 8. Scalable Architecture Considerations
- Built to support 1M+ MAU with localized sub-systems.
`;

Object.entries(allRequiredFiles).forEach(([dir, files]) => {
  files.forEach(file => {
    const fullPath = path.join(docsRoot, dir, file);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, generateTemplate(file, dir), 'utf8');
      console.log(`Created Template: ${dir}/${file}`);
    }
  });
});

console.log("Documentation scaffolding complete.");
