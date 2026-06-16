import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  LogOut,
  Trash2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Download
} from "lucide-react";

import { playClick, playPop } from "@/lib/sounds";

import html2canvas from "html2canvas";

// ✅ IMPORTANT FIX
// Backend uses NO /api prefix for series routes
const API = "http://localhost:8000/series";

const SeriesPage = ({ user }: any) => {

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [showDownloadMenu,
    setShowDownloadMenu] =
    useState<number | null>(null);

  // ✅ SAFE ARRAY STATE
  const [seasons, setSeasons] =
    useState<any[]>([]);

  const [collapsed,
    setCollapsed] =
    useState<{ [key: number]: boolean }>({});

  // =====================================
  // LOAD USER SEASONS
  // =====================================
  useEffect(() => {

    const fetchSeries = async () => {

      try {

        // ✅ USER EMAIL FILTER
        const res = await fetch(
          `${API}?email=${user?.email || "guest"}`
        );

        const data = await res.json();

        console.log("🎬 Series API:", data);

        // ✅ SAFE CHECK
        if (Array.isArray(data)) {

          setSeasons(data);

        } else {

          console.error(
            "❌ Invalid series response"
          );

          setSeasons([]);
        }

      } catch (error) {

        console.error(
          "❌ Series fetch error:",
          error
        );

        setSeasons([]);
      }
    };

    fetchSeries();

  }, [user]);

  // =====================================
  // LOGOUT
  // =====================================
  const handleLogout = () => {

    playClick();

    localStorage.clear();

    navigate("/");
  };

  // =====================================
  // ADD SEASON
  // =====================================
  const addSeason = async () => {

    playClick();

    const newSeason = {

      title:
        `Season ${seasons.length + 1}`,

      episodes: [],

      // ✅ USER LINK
      userEmail:
        user?.email || "guest"
    };

    try {

      const res = await fetch(API, {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify(newSeason)
      });

      const data = await res.json();

      setSeasons([
        ...seasons,
        {
          ...newSeason,
          _id: data.id
        }
      ]);

    } catch (error) {

      console.error(error);
    }
  };

  // =====================================
  // ADD EPISODE
  // =====================================
  const addEpisodeToSeason =
    async (index: number) => {

    playClick();

    const updated = [...seasons];

    const season = updated[index];

    // ✅ SAFETY
    if (!Array.isArray(season.episodes)) {
      season.episodes = [];
    }

    season.episodes.push({

      title:
        `Episode ${season.episodes.length + 1}`,

      panelCount: 4,

      panels: [],

      story: "",

      characters: "",

      style: "manga",

      status: "Not Started"
    });

    try {

      await fetch(
        `${API}/${season._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(season)
        }
      );

      setSeasons(updated);

    } catch (error) {

      console.error(error);
    }
  };

  // =====================================
  // DELETE EPISODE
  // =====================================
  const deleteEpisode =
    async (
      sIndex: number,
      eIndex: number
    ) => {

    playClick();

    const updated = [...seasons];

    updated[sIndex]
      .episodes.splice(eIndex, 1);

    try {

      await fetch(
        `${API}/${updated[sIndex]._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(updated[sIndex])
        }
      );

      setSeasons(updated);

    } catch (error) {

      console.error(error);
    }
  };

  // =====================================
  // DELETE SEASON
  // =====================================
  const deleteSeason =
    async (index: number) => {

    if (
      !confirm(
        "Delete this season?"
      )
    ) return;

    playClick();

    try {

      await fetch(
        `${API}/${seasons[index]._id}`,
        {
          method: "DELETE"
        }
      );

      setSeasons(
        seasons.filter(
          (_, i) => i !== index
        )
      );

    } catch (error) {

      console.error(error);
    }
  };

  // =====================================
  // RENAME SEASON
  // =====================================
  const renameSeason =
    async (index: number) => {

    const name = prompt(
      "Enter new season name:"
    );

    if (!name) return;

    const updated = [...seasons];

    updated[index].title = name;

    try {

      await fetch(
        `${API}/${updated[index]._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(updated[index])
        }
      );

      setSeasons(updated);

    } catch (error) {

      console.error(error);
    }
  };

  // =====================================
  // COLLAPSE
  // =====================================
  const toggleCollapse =
    (index: number) => {

    setCollapsed(prev => ({
      ...prev,
      [index]:
        !prev[index]
    }));
  };

  // =====================================
  // DOWNLOAD PNG
  // =====================================
  const downloadSeasonPNG =
    async (seasonIndex: number) => {

    setCollapsed(prev => ({
      ...prev,
      [seasonIndex]: false
    }));

    setTimeout(async () => {

      const element =
        document.getElementById(
          `season-canvas-${seasonIndex}`
        );

      if (!element) return;

      const canvas =
        await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale:
            window.devicePixelRatio || 2
        });

      const link =
        document.createElement("a");

      link.download =
        `season-${seasonIndex + 1}.png`;

      link.href =
        canvas.toDataURL();

      link.click();

    }, 300);
  };

  // =====================================
  // DOWNLOAD JSON
  // =====================================
  const downloadSeasonJSON =
    (
      season: any,
      index: number
    ) => {

    const blob = new Blob(
      [
        JSON.stringify(
          season,
          null,
          2
        )
      ]
    );

    const link =
      document.createElement("a");

    link.href =
      URL.createObjectURL(blob);

    link.download =
      `season-${index + 1}.json`;

    link.click();
  };

  // =====================================
  // OPEN EPISODE
  // =====================================
  const openEpisode =
    (
      sIndex: number,
      eIndex: number
    ) => {

    playClick();

    navigate(
      "/episode-builder",
      {
        state: {
          seasonId:
            seasons[sIndex]._id,

          episodeIndex: eIndex
        }
      }
    );
  };

  return (

    <div className="min-h-screen comic-bg-pattern p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">

        <h1 className="comic-title text-4xl">
          SERIES BUILDER
        </h1>

        <div className="flex gap-4 items-center">
          <button
  onClick={() => navigate("/home")}
  className="comic-btn-primary hover:bg-red-500 hover:text-white transition"
>
  Home
</button>
          <button
            onClick={addSeason}
            className="comic-btn-primary hover:bg-red-500 hover:text-white transition"
          >
            + Add Season
          </button>

          <motion.button
            whileHover={{
              scale: 1.15,
              rotate: -8
            }}
            whileTap={{
              scale: 0.85
            }}
            onClick={handleLogout}
            className="p-2 bg-yellow-300 border-2 border-black rounded shadow hover:bg-red-500"
          >
            <LogOut size={18} />
          </motion.button>

        </div>

      </div>

      {/* EMPTY */}
      {seasons.length === 0 && (

        <div className="comic-card p-10 text-center border-4 border-black bg-white">

          <h2 className="text-2xl font-extrabold mb-3">
            🚀 Your Comic Universe Starts Here
          </h2>

          <p className="text-gray-600 mb-4">
            Create your first season and begin storytelling.
          </p>

          <button
            onClick={addSeason}
            className="comic-btn-primary"
          >
            + Create Season
          </button>

        </div>
      )}

      {/* SEASONS */}
      <div className="space-y-10">

        {Array.isArray(seasons) &&
          seasons.map((season, sIndex) => (

          <div key={season._id}>

            {/* HEADER */}
            <div className="comic-card p-4 mb-4 border-4 border-black bg-yellow-300 flex justify-between items-center">

              <div>

                <h2 className="text-2xl font-extrabold">
                  🎬 {season.title}
                </h2>

                <p className="text-xs text-gray-700">
                  {season.episodes?.length || 0} Episodes
                </p>

              </div>

              <div className="flex gap-2">

                {/* ADD */}
                <button
                  onClick={() =>
                    addEpisodeToSeason(sIndex)
                  }
                  className="p-2 bg-white border-2 border-black rounded shadow"
                >
                  <Plus size={16} />
                </button>

                {/* RENAME */}
                <button
                  onClick={() =>
                    renameSeason(sIndex)
                  }
                  className="p-2 bg-white border-2 border-black rounded shadow"
                >
                  <Pencil size={16} />
                </button>

                {/* COLLAPSE */}
                <button
                  onClick={() =>
                    toggleCollapse(sIndex)
                  }
                  className="p-2 bg-white border-2 border-black rounded shadow"
                >
                  {collapsed[sIndex]
                    ? <ChevronDown size={16} />
                    : <ChevronUp size={16} />}
                </button>

                {/* DELETE */}
                <button
                  onClick={() =>
                    deleteSeason(sIndex)
                  }
                  className="p-2 bg-yellow-300 border-2 border-black rounded shadow hover:bg-red-500"
                >
                  <Trash2 size={16} />
                </button>

              </div>

            </div>

            {/* EPISODES */}
{!collapsed[sIndex] && (

  <div
    id={`season-canvas-${sIndex}`}
    className="bg-white p-8 rounded-xl border-4 border-black shadow-[8px_8px_0px_black]"
  >

    {/* SEASON TITLE */}
    <h1 className="text-4xl font-extrabold mb-10 text-center text-black comic-title">
      🎬 {season.title}
    </h1>

    {/* ✅ SMALL RESPONSIVE CARDS GRID */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      {Array.isArray(season.episodes) &&
        season.episodes.map(
        (ep: any, eIndex: number) => (

          <motion.div
            key={eIndex}

            whileHover={{
              scale: 1.03,
              rotate: -1
            }}

            whileTap={{
              scale: 0.97
            }}

            onMouseEnter={playPop}

            className="
              comic-card
              p-4
              border-4
              border-black
              bg-white
              shadow-[6px_6px_0px_black]
              rounded-2xl
              transition-all
              min-h-[230px]
              flex
              flex-col
              justify-between
            "
          >

            {/* TOP CONTENT */}
            <div>

              {/* TITLE */}
              <h3 className="font-extrabold text-lg mb-4 line-clamp-2 text-black">

                🎬 {ep.title}

              </h3>

              {/* PANELS */}
              <div className="space-y-2">

                <p className="text-sm font-semibold text-gray-700">

                  📊 Panels:
                  {" "}
                  {ep.panelCount || 0}

                </p>

                {/* STATUS */}
                <p
                  className={`text-sm font-bold ${
                    ep.status === "Completed"
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >

                  {ep.status === "Completed"
                    ? "✅ Completed"
                    : "⏳ Not Started"}

                </p>

              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-6">

              {/* OPEN */}
              <button
                onClick={() =>
                  openEpisode(
                    sIndex,
                    eIndex
                  )
                }

                className="
                  comic-btn-primary
                  flex-1
                  text-sm
                  py-2
                "
              >
                OPEN →
              </button>

              {/* DELETE */}
              <button
                onClick={() =>
                  deleteEpisode(
                    sIndex,
                    eIndex
                  )
                }

                className="
                  bg-red-500
                  hover:bg-red-600
                  text-white
                  px-4
                  py-2
                  rounded-lg
                  border-2
                  border-black
                  text-sm
                  font-bold
                  transition
                "
              >
                Delete
              </button>

            </div>

          </motion.div>
        ))}

    </div>

  </div>
)}

          </div>
        ))}

      </div>

    </div>
  );
};

export default SeriesPage;