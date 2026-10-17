import PrimaryCanvas from "../components/game/PrimaryCanvas";

const GamePage = () => {
  return (
    <main id="main-content" className="w-full h-dvh overflow-hidden">
      <h1 className="sr-only">Block Shooter Arena Match</h1>
      <PrimaryCanvas />
    </main>
  );
};
export default GamePage;
