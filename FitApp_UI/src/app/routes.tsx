import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { WorkoutPlanner } from "./components/WorkoutPlanner";
import { Nutrition } from "./components/Nutrition";
import { Progress } from "./components/Progress";
import { Community } from "./components/Community";
import { Onboarding } from "./components/Onboarding";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Onboarding,
  },
  {
    path: "/app",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "workout", Component: WorkoutPlanner },
      { path: "nutrition", Component: Nutrition },
      { path: "progress", Component: Progress },
      { path: "community", Component: Community },
    ],
  },
]);
