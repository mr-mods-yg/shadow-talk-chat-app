import { Loader } from "lucide-react";
import { useState, useEffect } from "react";

export default function BlinkingWatcher() {

  // BELOW IS AN AI GENERATED STORY
  // IT DOES NOT REFLECTS MY OPINIONS IN ANY REGARDS ¯\_(ツ)_/¯
  const frames = [
    "(O_O)",   // The Watcher is just staring as usual.
    "(O///O)", // Suddenly notices a cute female watcher.
    "(O_O) (•_•)", // They look at each other.
    "(O_o) (•_•)?", // He panics, unsure what to do.
    "(o_O) (•_•)", // Tries to act cool.
    "(O///O) (•_•)", // Blushes hard.
    "(O////O) (•_•)?", // Oh no, she noticed!
    "(>_<) (•_•)", // Embarrassed, looks away.
    "(-_-;) (•_•)", // Thinking of an escape plan.
    "(ಠ_ಠ) (•_•)", // Tries to play it cool.
    "(O_O) (♥_♥)", // Wait, she smiled back!
    "(✧_✧) (♥‿♥)", // Confidence boosted, game on!
  ];

  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 2000); // Changes every 600ms for a smooth story flow

    return () => clearInterval(interval);
  }, [frames.length]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-3xl ">
      <div className="flex items-center gap-2 text-primary">
        <Loader className="size-10 animate-spin" />
        <span>Connecting to the server...</span>
      </div>
        <pre className="text-4xl transition-all mt-5 mb-5">{frames[frameIndex]}</pre>
      <div className="mt-2 text-2xl text-center ">
        <p className="text-secondary">If you can see this screen, then it will take few seconds to connect to server.
        <br />
        The server is hosted on Render Free Tier.
        </p>
        <p className="text-secondary mt-4">
        My free instance is getting spinned down due to inactivity, <br />which can delay requests by 50 seconds or more.
        <br /><br /></p>

      </div>
    </div>
  );
}
