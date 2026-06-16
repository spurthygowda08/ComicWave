import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { playClick } from "@/lib/sounds";
import html2canvas from "html2canvas";

// ✅ SERIES API
const API = "http://localhost:8000/series";

// ✅ AI GENERATION API
const AI_API =
  "http://127.0.0.1:8000/api/episode/generate";

const EpisodeBuilder = ({ user }: any) => {

  const navigate = useNavigate();

  const location = useLocation();

  const {
    seasonId,
    episodeIndex
  } = location.state || {};

  // =====================================
  // STATES
  // =====================================

  const [title, setTitle] =
    useState("");

  const [story, setStory] =
    useState("");

  const [characters, setCharacters] =
    useState("");

  const [panels, setPanels] =
    useState(4);

  const [style, setStyle] =
    useState("manga");

  const [generatedPanels,
    setGeneratedPanels] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  // =====================================
  // LOAD EPISODE DATA
  // =====================================
  useEffect(() => {

    if (!seasonId) return;

    const loadEpisode = async () => {

      try {

        // ✅ IMPORTANT FIX
        const res = await fetch(
          `${API}?email=${user?.email || "guest"}`
        );

        const data = await res.json();

        // ✅ FIND USER SEASON
        const season = data.find(
          (s: any) =>
            s._id === seasonId
        );

        if (!season) return;

        const ep =
          season?.episodes?.[episodeIndex];

        if (!ep) return;

        // LOAD
        setTitle(
          ep.title || ""
        );

        setPanels(
          ep.panelCount || 4
        );

        setStory(
          ep.story || ""
        );

        setCharacters(
          ep.characters || ""
        );

        setStyle(
          ep.style || "manga"
        );

        // ✅ LOAD GENERATED PANELS
        if (
          Array.isArray(ep.panels)
        ) {

          setGeneratedPanels(
            ep.panels
          );
        }

      } catch (error) {

        console.error(
          "❌ Load episode failed:",
          error
        );
      }
    };

    loadEpisode();

  }, [
    seasonId,
    episodeIndex,
    user
  ]);

  // =====================================
  // SAVE TO DATABASE
  // =====================================
  const saveToDB =
    async (panelsData: any[]) => {

    try {

      // ✅ IMPORTANT FIX
      const res = await fetch(
        `${API}?email=${user?.email || "guest"}`
      );

      const data = await res.json();

      const season = data.find(
        (s: any) =>
          s._id === seasonId
      );

      if (!season) return;

      // ✅ UPDATE EPISODE
      season.episodes[
        episodeIndex
      ] = {

        ...season.episodes[
          episodeIndex
        ],

        title,

        story,

        characters,

        style,

        panelCount: panels,

        panels: panelsData,

        status:
          panelsData.length > 0
            ? "Completed"
            : "Not Started"
      };

      // SAVE
      await fetch(
        `${API}/${seasonId}`,
        {

          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            season
          )
        }
      );

    } catch (error) {

      console.error(
        "❌ Save failed:",
        error
      );
    }
  };

  // =====================================
  // AUTO SAVE
  // =====================================
  useEffect(() => {

    if (!seasonId) return;

    const timeout = setTimeout(
      () => {

        saveToDB(
          generatedPanels
        );

      },
      800
    );

    return () =>
      clearTimeout(timeout);

  }, [
    story,
    characters,
    style,
    title,
    panels
  ]);

  // =====================================
  // DOWNLOAD PNG
  // =====================================
  const downloadEpisodePNG =
    async () => {

    const element =
      document.getElementById(
        "episode-canvas"
      );

    if (!element) return;

    const canvas =
      await html2canvas(
        element,
        {
          backgroundColor:
            "#ffffff",

          scale: 2
        }
      );

    const link =
      document.createElement("a");

    link.download =
      "episode.png";

    link.href =
      canvas.toDataURL();

    link.click();
  };

  // =====================================
  // GENERATE EPISODE
  // =====================================
  const handleGenerate =
    async () => {

    playClick();

    if (!story) {

      alert(
        "Please enter story"
      );

      return;
    }

    setLoading(true);

    try {

      const res = await fetch(
        AI_API,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            story,

            characters,

            panels,

            style,

            seasonId,

            episodeIndex,

            // ✅ IMPORTANT
            userEmail:
              user?.email || "guest"
          })
        }
      );

      const data =
        await res.json();

      console.log(
        "🎬 Generated:",
        data
      );

      if (
        Array.isArray(
          data.panels
        )
      ) {

        setGeneratedPanels(
          data.panels
        );

        await saveToDB(
          data.panels
        );
      }

    } catch (error) {

      console.error(error);

      alert(
        "AI generation failed"
      );
    }

    setLoading(false);
  };

  // =====================================
  // REGENERATE PANEL
  // =====================================
  const regeneratePanel =
    async (index: number) => {

    playClick();

    try {

      const res = await fetch(
        AI_API,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            story,

            characters,

            panels: 1,

            style,

            seasonId,

            episodeIndex,

            // ✅ IMPORTANT
            userEmail:
              user?.email || "guest"
          })
        }
      );

      const data =
        await res.json();

      if (
        !Array.isArray(
          data.panels
        )
      ) return;

      const updated = [
        ...generatedPanels
      ];

      updated[index] =
        data.panels[0];

      setGeneratedPanels(
        updated
      );

      await saveToDB(
        updated
      );

    } catch (error) {

      console.error(error);
    }
  };

  // =====================================
  // EDIT TEXT
  // =====================================
  const editText =
    (
      index: number,
      field:
        | "caption"
        | "dialogue"
    ) => {

    const value = prompt(
      "Edit:",
      generatedPanels[index][field] || ""
    );

    if (value === null)
      return;

    const updated = [
      ...generatedPanels
    ];

    updated[index][field] =
      value;

    setGeneratedPanels(
      updated
    );

    saveToDB(updated);
  };

  return (

    <div className="min-h-screen comic-bg-pattern p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <h1 className="comic-title text-4xl">
          🎬 {title || "Episode Builder"}
        </h1>

        <div className="flex gap-4 items-center">

          <button
            onClick={downloadEpisodePNG}
            className="comic-btn-secondary"
          >
            📥 DOWNLOAD
          </button>

          <button
            onClick={() =>
              navigate("/series")
            }
            className="
              px-4 py-2
              bg-yellow-300
              border-2 border-black
              rounded-lg
              font-bold
              text-black
              shadow-[4px_4px_0px_black]
            "
          >
            ← Back
          </button>

        </div>

      </div>

      {/* FORM */}
      <div className="comic-card p-6 border-4 border-black bg-white max-w-6xl mx-auto space-y-4">

        {/* TITLE */}
        <div>

          <label className="font-bold text-lg">
            📝 Episode Title
          </label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            className="w-full p-2 border-2 border-black rounded text-sm"
          />

        </div>

        {/* STORY */}
        <div>

          <label className="font-bold text-lg">
            🎭 Scene Description
          </label>

          <textarea
            value={story}
            onChange={(e) =>
              setStory(
                e.target.value
              )
            }
            className="w-full p-2 border-2 border-black rounded h-24 text-sm resize-none"
          />

        </div>

        {/* CHARACTERS */}
        <div>

          <label className="font-bold text-lg">
            🧍 Characters
          </label>

          <input
            value={characters}
            onChange={(e) =>
              setCharacters(
                e.target.value
              )
            }
            className="w-full p-2 border-2 border-black rounded text-sm"
          />

        </div>

        {/* STYLE */}
        <div>

          <label className="font-bold text-lg">
            🎨 Style
          </label>

          <select
            value={style}
            onChange={(e) =>
              setStyle(
                e.target.value
              )
            }
            className="w-full p-2 border-2 border-black rounded text-sm"
          >
            <option value="manga">
              Manga
            </option>

            <option value="anime">
              Anime
            </option>

            <option value="marvel">
              Marvel
            </option>

            <option value="realistic">
              Realistic
            </option>

          </select>

        </div>

        {/* PANELS */}
        <div>

          <label className="font-bold text-lg">
            📊 Number of Panels
          </label>

          <div className="flex gap-2">

            {[2, 4, 6, 8].map(
              (num) => (

              <button
                key={num}
                onClick={() =>
                  setPanels(num)
                }
                className={`px-4 py-1 border-2 border-black rounded font-bold ${
                  panels === num
                    ? "bg-yellow-300 shadow-[3px_3px_0px_black]"
                    : "bg-white"
                }`}
              >
                {num}
              </button>
            ))}

          </div>

        </div>

        {/* GENERATE */}
        <button
          onClick={handleGenerate}
          className="comic-btn-primary w-full text-base py-2"
        >
          {loading
            ? "Generating..."
            : "🚀 Generate Episode"}
        </button>

      </div>

      
    {/* OUTPUT */}
{generatedPanels.length > 0 && (

  <div
    id="episode-canvas"
    className="
      mt-12
      max-w-6xl
      mx-auto
      bg-white
      p-6
      rounded-2xl
      border-4
      border-black
      shadow-[8px_8px_0px_black]
    "
  >

    {/* ✅ TITLE INCLUDED IN DOWNLOAD */}
    <div className="text-center mb-10">

      <h1 className="text-5xl font-extrabold comic-title text-black">
        🎬 {title || "Untitled Episode"}
      </h1>

    </div>

    {/* PANELS GRID */}
    <div className="grid gap-8 grid-cols-1 md:grid-cols-2">

      {generatedPanels.map(
        (panel, i) => (

        <div
          key={i}
          className="
            group
            relative
            bg-white
            border-4
            border-black
            rounded-2xl
            overflow-hidden
            shadow-[6px_6px_0px_black]
          "
        >

          {/* IMAGE */}
          <div className="relative">

            <img
              src={panel.image}
              className="w-full h-[260px] object-cover"
            />

            {/* DIALOGUE */}
            {panel.dialogue && (

              <div
                className="
                  absolute
                  top-4
                  left-4
                  max-w-[75%]
                  bg-white
                  border-2
                  border-black
                  px-4
                  py-2
                  rounded-2xl
                  text-xs
                  font-bold
                  text-black
                  shadow
                "
              >

                {panel.dialogue}

              </div>
            )}

          </div>

          {/* CAPTION */}
          <div
            className="
              bg-yellow-400
              border-t-4
              border-black
              px-4
              py-3
              text-sm
              font-bold
              text-black
            "
          >

            {panel.caption}

          </div>

          {/* ACTIONS */}
          <div
            className="
              absolute
              top-3
              right-3
              flex
              gap-2
              opacity-0
              group-hover:opacity-100
              transition
            "
          >

            {/* REGENERATE */}
            <button
              onClick={() =>
                regeneratePanel(i)
              }

              className="
                bg-yellow-400
                border-2
                border-black
                px-2
                py-1
                rounded
                shadow
                hover:scale-105
                transition
              "
            >
              🔁
            </button>

            {/* EDIT */}
            <button
              onClick={() =>
                editText(
                  i,
                  "caption"
                )
              }

              className="
                bg-yellow-400
                border-2
                border-black
                px-2
                py-1
                rounded
                shadow
                hover:scale-105
                transition
              "
            >
              ✏️
            </button>

          </div>

        </div>
      ))}

    </div>

  </div>
)}
    </div>
  );
};

export default EpisodeBuilder;