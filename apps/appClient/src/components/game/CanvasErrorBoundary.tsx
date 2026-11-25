import { Component, type ReactNode } from "react";

type typeCanvasErrorBoundaryProps = {
  children: ReactNode;
};

type typeCanvasErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

// catches webgl and canvas rendering errors gracefully
export class CanvasErrorBoundary extends Component<
  typeCanvasErrorBoundaryProps,
  typeCanvasErrorBoundaryState
> {
  state: typeCanvasErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  // update state when render error occurs
  static getDerivedStateFromError(error: Error): typeCanvasErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || "webgl error",
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900 p-8 font-mono text-white">
          <div className="max-w-md border-4 border-red-500/40 bg-black/60 p-6 text-center shadow-2xl backdrop-blur-md">
            <h2 className="mb-2 text-2xl font-black uppercase tracking-widest text-red-500">
              Graphics Error
            </h2>
            <p className="mb-6 text-sm text-neutral-400">
              Failed to initialize 3D graphics or WebGL context was lost. Please verify hardware acceleration is enabled.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="cursor-pointer border-2 border-white/20 bg-white/10 px-6 py-3 font-bold uppercase tracking-widest text-white transition-all hover:border-white hover:bg-white hover:text-black"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
