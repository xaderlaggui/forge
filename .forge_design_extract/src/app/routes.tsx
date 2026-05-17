import { createMemoryRouter } from "react-router";
import AppRoot from "./AppRoot";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Workout from "./pages/Workout";

const DummyPage = ({ title }: { title: string }) => (
  <div className="flex-1 flex items-center justify-center h-full text-t2 font-medium">{title} Page Coming Soon</div>
);

export const router = createMemoryRouter([
  {
    path: "/",
    Component: AppRoot,
    children: [
      { index: true, Component: Splash },
      { path: "login", Component: Login },
      { path: "home", Component: Home },
      { path: "workout", Component: Workout },
      { path: "nutrition", element: <DummyPage title="Nutrition" /> },
      { path: "progress", element: <DummyPage title="Progress" /> },
    ],
  },
], {
  initialEntries: ["/"],
});