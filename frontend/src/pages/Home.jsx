import { Send } from "lucide-react";

function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen">
      {/* Background Image */}
      {/* <div 
        className="absolute inset-0 w-5/10 h-full bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/nathan-dumlao.jpg')" }}
      ></div> */}
      {/* removed background image because it was looking not very good across light themes */}

      {/* Content Section */}
      <div className="relative text-center mb-8">
        <div className="flex flex-col items-center gap-2 group">
          <div className="size-18 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Send className="size-9 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mt-2">Whisper in Temporary Shadows</h1>
          <p className="text-base-content/60">Join, Chat, Disappear at Will!</p>
        </div>
      </div>

      {/* Buttons */}
      <button className="btn btn-lg btn-wide m-5">Create Shadow</button>
      <button className="btn btn-lg btn-wide m-5">Join Shadow</button>
    </div>
  );
}

export default Home;
