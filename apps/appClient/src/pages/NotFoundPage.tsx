import { Link } from "react-router";

const NotFoundPage = () => {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center bg-neutral-900 text-white font-mono p-4"
    >
      <h1 className="text-6xl md:text-8xl font-black text-red-500 tracking-widest">
        404
      </h1>
      <p className="mt-4 text-xl text-gray-300 font-bold uppercase tracking-wider">
        Page not found
      </p>

      <Link
        to="/"
        className="mt-8 border-2 border-white/20 bg-black/60 px-6 py-3 font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Go back home
      </Link>
    </main>
  );
};

export default NotFoundPage;
