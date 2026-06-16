import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { playClick } from "@/lib/sounds";

const HomePage = ({ user }: any) => {
  const navigate = useNavigate();

  const isGuest = user?.guest;

  const handleQuick = () => {
    playClick();
    navigate("/dashboard");
  };

  const handleSeries = () => {
    playClick();

    if (isGuest) {
      alert("🔐 Login required to access Series Builder");
      return;
    }

    navigate("/series");
  };

  return (
    <div className="min-h-screen comic-bg-pattern px-6 py-10 flex flex-col">

      {/* 🔥 HEADER */}
      <div className="text-center mb-16">
        <h1 className="comic-title text-6xl mb-3">
          COMICWAVE
        </h1>

        <p className="text-lg font-semibold text-white tracking-wide 
          drop-shadow-[2px_2px_0px_black] 
          bg-black/40 inline-block px-4 py-1 rounded-md mt-2">
          Craft stories. Build worlds. Create comics. 🎬
        </p>
      </div>

      {/* 👤 GUEST BADGE */}
      {isGuest && (
        <div className="absolute top-6 left-6 bg-yellow-300 border-2 border-black px-3 py-1 font-bold shadow-[3px_3px_0px_black]">
          👤 Guest Mode
        </div>
      )}

      {/* 🎯 MAIN CONTENT */}
      <div className="flex flex-1 items-center justify-center">

        <div className="flex flex-col md:flex-row gap-12 w-full max-w-6xl">

          {/* ⚡ QUICK COMIC */}
          <motion.div
            onClick={handleQuick}
            whileHover={{ scale: 1.05, y: -5 }}
            className="comic-card flex-1 h-[320px] p-10 cursor-pointer border-4 border-black bg-white text-black flex flex-col justify-between shadow-[10px_10px_0px_black]"
          >
            <div>
              <h2 className="text-3xl font-extrabold mb-4">
                ⚡ Quick Comic
              </h2>

              <p className="text-lg text-gray-700 leading-relaxed">
                Instantly generate a comic with AI.
                Perfect for quick ideas and fun storytelling.
              </p>
            </div>

            <button className="comic-btn-primary w-full text-lg py-3 mt-6">
              Start Creating →
            </button>
          </motion.div>

          {/* 🚀 SERIES STORY (LOCKED FOR GUEST) */}
          <motion.div
            onClick={handleSeries}
            whileHover={!isGuest ? { scale: 1.05, y: -5 } : {}}
            className={`relative comic-card flex-1 h-[320px] p-10 border-4 border-black text-black flex flex-col justify-between shadow-[10px_10px_0px_black]
              ${isGuest ? "bg-gray-300 cursor-not-allowed opacity-70" : "bg-yellow-300 cursor-pointer"}
            `}
          >

            {/* 🔒 LOCK OVERLAY */}
            {isGuest && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white font-bold text-lg z-10">
                🔒 Locked Feature
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/");
                  }}
                  className="mt-3 bg-yellow-300 text-black px-4 py-2 border-2 border-black shadow"
                >
                  🚀 Upgrade
                </button>
              </div>
            )}

            <div>
              <h2 className="text-3xl font-extrabold mb-4">
                🚀 Series Story
              </h2>

              <p className="text-lg text-gray-800 leading-relaxed">
                Build multi-episode narratives with continuity.
                Create your own comic universe.
              </p>
            </div>

            <button className="comic-btn-primary w-full text-lg py-3 mt-6">
              Build Series →
            </button>

          </motion.div>

        </div>
      </div>

    </div>
  );
};

export default HomePage;