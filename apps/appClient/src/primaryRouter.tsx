import { createBrowserRouter } from "react-router";
import App from "./App";
import LayoutState from "./layout/LayoutState";
import GamePage from "./pages/GamePage";
import WelcomePage from "./pages/WelcomePage";
import NotFoundPage from "./pages/NotFoundPage";

export const primaryRouter = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <WelcomePage />,
      },
      {
        path: "/play",
        element: (
          <LayoutState>
            {/* this page mounts the 3d canvas and network manager */}
            <GamePage />
          </LayoutState>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
