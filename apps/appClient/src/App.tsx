import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:font-bold focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
      >
        Skip to main content
      </a>
      <div className="font-inter overflow-x-hidden h-full w-full">
        <Outlet />
      </div>
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
