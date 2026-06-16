import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { playClick } from "@/lib/sounds";
import PanelSelector from "./PanelSelector";
import GridDropdown from "./GridDropdown";
import GridLayoutRenderer from "./GridLayoutRenderer";
// import AIInsights from "./AIInsights";
import { useNavigate } from "react-router-dom";
import { getLayoutsForPanelCount } from "@/lib/gridLayouts";
import {  AnimatePresence } from "framer-motion";
import { LogOut } from 'lucide-react';
interface DashboardProps {
  onLogout: () => void;
  user: any;
}

const Dashboard = ({ onLogout, user }: DashboardProps) => {


const handleLoad = (data: any) => {
  console.log("LOADING:", data);

  setStory(data.story || "");
  setCharacter(data.characters || "");
  setStyle(data.style || "manga");

  const fixedPanels = (data.panels || []).map((p: any) => ({
    panel_number: p.panel_number,
    scene: p.scene,
    caption: p.caption,
    dialogue: p.dialogue,
    image: fixImage(
  p.image || p.image_url || p.img || ""
)
  }));

  // 🔥 FIX: SET PANEL COUNT AUTOMATICALLY
  const count = fixedPanels.length;
  setPanelCount(count);

  // 🔥 ALSO SET GRID AUTOMATICALLY
  const layouts = getLayoutsForPanelCount(count);
  if (layouts.length > 0) {
    setSelectedGrid(layouts[0].id);
  }

  // 🔥 SET PANELS
  setPanels([]);
  setTimeout(() => {
    setPanels(fixedPanels);
  }, 50);
};

  const isGuest = user?.guest;
  const navigate = useNavigate();
  const [panelCount, setPanelCount] = useState<number | null>(null);
  const [selectedGrid, setSelectedGrid] = useState<string>("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [panels, setPanels] = useState<any[]>([]);
  const [previewComic, setPreviewComic] = useState<any | null>(null);
  const [story, setStory] = useState("");
  const [character, setCharacter] = useState("");
  const [style, setStyle] = useState("");
  const [showAssistant, setShowAssistant] = useState(false);
const [messages, setMessages] = useState<any[]>([]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const messagesEndRef = useRef<HTMLDivElement>(null);
const [listening, setListening] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [search, setSearch] = useState("");
const [isSpeaking, setIsSpeaking] = useState(false);
  const [storyListening, setStoryListening] = useState(false);
const [characterListening, setCharacterListening] = useState(false);
const [open, setOpen] = useState(false);
const [error, setError] = useState(false);
const dropdownRef = useRef<HTMLDivElement | null>(null);

const options = [
  { value: "manga", label: "Manga" },
  { value: "anime", label: "Anime" },
  { value: "cartoon", label: "Cartoon" },

];
// const handleLogout = () => {
//   playClick();
//   localStorage.clear();
//   navigate("/");
// };
const [storyAudio, setStoryAudio] = useState(0);
const [characterAudio, setCharacterAudio] = useState(0);
// const user = JSON.parse(localStorage.getItem("current_user") || "{}");
const streamRef = useRef<MediaStream | null>(null);
const formatText = (text: string) => {
  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // Add period if missing
  if (!text.endsWith(".") && !text.endsWith("?") && !text.endsWith("!")) {
    text += ".";
  }

  return text;
};

const stopAllListening = () => {
  setStoryListening(false);
  setCharacterListening(false);

  if (streamRef.current) {
    streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }
};

useEffect(() => {
  const handleClickOutside = (event: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

 

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);


useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, loading]);

useEffect(() => {
  if (showAssistant && messages.length === 0) {
   setMessages([
  {
    sender: "bot",
    text: "👋 Hi! I'm your AI Assistant.\nI can help you create comics.\nTry this:\n👉 action funny hero city"
  }
]);
  }
}, [showAssistant]);



const startListening = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.start();
  setListening(true);

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript); // put voice into input
    setListening(false);
  };

  recognition.onerror = () => {
    setListening(false);
  };

  recognition.onend = () => {
    setListening(false);
  };
};
  // ==============================
  // LOAD HISTORY
  // ==============================

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/history/comics?email=${user?.email}`);
      const data = await res.json();
      setHistory(data.comics || []);
    } catch {
      toast.error("Failed to load history");
    }
  };

  // ==============================
  // AUTO GRID
  // ==============================

  useEffect(() => {
    if (panelCount) {
      const layouts = getLayoutsForPanelCount(panelCount);
      if (layouts.length > 0) setSelectedGrid(layouts[0].id);
    }
  }, [panelCount]);

const startStoryListening = async () => {
  if (storyListening) {
    stopAllListening();
    return;
  }

  stopAllListening();

  try {
    setStoryListening(true);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

  let currentText = "";

recognition.onresult = (event: any) => {
  let interim = "";
  let finalText = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;

    if (event.results[i].isFinal) {
      finalText += transcript;
    } else {
      interim += transcript;
    }
  }

  if (finalText) {
    currentText += " " + formatText(finalText.trim());
  }

  setStory(currentText + " " + interim);
};

    recognition.onend = () => setStoryListening(false);

    recognition.start();

    // 🎧 AUDIO (for waveform)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);

      const avg =
        dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      setStoryAudio(avg);

      if (storyListening) requestAnimationFrame(update);
    };

    update();

  } catch (err) {
    console.error(err);
    stopAllListening();
  }
};

const startCharacterListening = async () => {
  if (characterListening) {
    stopAllListening();
    return;
  }

  stopAllListening();

  try {
    setCharacterListening(true);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

  

let currentText = "";

recognition.onresult = (event: any) => {
  let interim = "";
  let finalText = "";

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;

    if (event.results[i].isFinal) {
      finalText += transcript;
    } else {
      interim += transcript;
    }
  }

  if (finalText) {
    currentText += " " + formatText(finalText.trim());
  }

  setCharacter(currentText + " " + interim);
};
    recognition.onend = () => setCharacterListening(false);

    recognition.start();

    // 🎧 AUDIO
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);

      const avg =
        dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      setCharacterAudio(avg);

      if (characterListening) requestAnimationFrame(update);
    };

    update();

  } catch (err) {
    console.error(err);
    stopAllListening();
  }
};

const speakText = (text: string) => {
  // 🔴 If already speaking → STOP
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    return;
  }

  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;

  speech.onstart = () => {
    setIsSpeaking(true);
  };

  speech.onend = () => {
    setIsSpeaking(false);
  };

  window.speechSynthesis.speak(speech);
};
  // ==============================
  // GENERATE
  // ==============================
const sendMessage = async () => {
  if (!input.trim()) return;

  const userMsg = { sender: "user", text: input };
  setMessages(prev => [...prev, userMsg]);
  setInput("");
  setLoading(true);

  try {
    const res = await fetch("http://127.0.0.1:8000/api/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userMsg.text })
    });

    const data = await res.json();
if (data.type === "idea") {
  setMessages(prev => [
    ...prev,
    { sender: "bot", text: data.message }
  ]);

  speakText(data.message);
}

  
  } catch (err) {
    setMessages(prev => [...prev, { sender: "bot", text: "❌ Server error" }]);
  }

  setLoading(false);
};
 const handleGenerate = async () => {

  // ✅ PANEL VALIDATION
  if (!panelCount) {
    return toast.error("Select panel count first!");
  }

  // ✅ STYLE VALIDATION (UPDATED)
  if (!style) {
    setError(true); // 🔥 highlight dropdown
    return toast.error("Select style!");
  }

  // ✅ RESET ERROR IF VALID
  setError(false);

  setLoading(true);

  try {
    const res = await fetch("http://127.0.0.1:8000/api/comic/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        story,
        characters: character,
        panels: panelCount,
        style,
        email: user?.email || "guest"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Something went wrong");
    }

    const fixedPanels = (data.panels || []).map((p: any) => ({
  ...p,
  image: fixImage(
    p.image || p.image_url || p.img || ""
  )
}));

setPanels(fixedPanels);
    loadHistory();

  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Failed ❌");
  } finally {
    setLoading(false);
  }
};

  // ==============================
  // DELETE HISTORY
  // ==============================

  const deleteHistory = async (id: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/history/delete?id=${id}`, {
        method: "DELETE"
      });
      loadHistory();
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ==============================
  // FILTER
  // ==============================

  const filteredHistory = history
  .filter((item: any) =>
    (item.story || "").toLowerCase().includes(search.toLowerCase())
  )
  .filter((item: any) =>
    showFavorites ? item.is_favorite : true
  );

  // ==============================
  // EXPORT
  // ==============================

  const exportPNG = async () => {
    const element = document.getElementById("comic-canvas");
    if (!element) return;

    const canvas = await html2canvas(element);
    const link = document.createElement("a");
    link.download = "comic.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(panels, null, 2)]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "comic.json";
    link.click();
  };
  // 🔥 ADD THIS ABOVE return() INSIDE Dashboard COMPONENT

const fixImage = (img: string) => {
  if (!img) return "";

  // ✅ REMOVE DUPLICATE PREFIX
  if (
    img.includes(
      "data:image/png;base64,data:image/jpeg;base64,"
    )
  ) {
    return img.replace("data:image/png;base64,", "");
  }

  // ✅ IF ALREADY VALID
  if (img.startsWith("data:image")) {
    return img;
  }

  // ✅ OTHERWISE ADD PREFIX
  return `data:image/png;base64,${img}`;
};
  return (
    <div className="comic-bg-pattern min-h-screen">

      {/* HEADER */}
      <motion.div className="sticky top-0 bg-purple-800 border-b-4 border-black text-white z-50 shadow-md">
        <div className="flex justify-between items-center px-8 py-5">
          <h1 className="text-5xl comic-title">COMICWAVE</h1>
          {isGuest && <p>Guest </p>}
          <div className="flex gap-3 items-center">
            <PanelSelector selected={panelCount} onSelect={setPanelCount} />
            {panelCount && (
              <GridDropdown
                selected={selectedGrid}
                onSelect={setSelectedGrid}
                panelCount={panelCount}
              />
            )}
          </div>

     
         <div className="flex gap-3">
  <button
  onClick={() => navigate("/home")}
  className="comic-btn-primary bg-red-400 hover:bg-red-500"
>
  HOME
</button>
  <button
    onClick={() => setShowAssistant(true)}
    className="comic-btn-primary bg-red-400 hover:bg-red-500"
  >
    🤖 ASSISTANT
  </button>

  <button
  onClick={() => {
    setPanels([]);
    setStory("");
    setCharacter("");
    setStyle("");      
    setPanelCount(null);    // or 0
    setSelectedGrid("");    // reset layout
  }}
  className="comic-btn-primary bg-red-400 hover:bg-red-500"
>
  CLEAR
</button>

  <button
    onClick={() => setShowHistory(true)}
    className="comic-btn-primary bg-red-400 hover:bg-red-500"
  >
    HISTORY
  </button>

  <motion.button
  whileHover={{ scale: 1.15, rotate: -8 }}
  whileTap={{ scale: 0.85 }}
  onClick={onLogout}   // ✅ FIXED
  className="p-2 bg-yellow-300 border-2 border-black rounded shadow-[4px_4px_0px_black] hover:bg-red-500"
>
  <LogOut size={18} className="text-black" />
</motion.button>

</div>
        </div>
      </motion.div>

      {/* MAIN */}
      <div className="flex gap-6 px-6 py-6 items-stretch">

        {/* LEFT PANEL */}
        <div className="w-[520px] flex flex-col">

          <div className="comic-card p-5">
<div className="relative">

  {/* 📝 TEXTAREA */}
  <textarea
    value={story}
    onChange={(e) => setStory(e.target.value)}
    className="
      peer w-full h-[220px]
      p-4 pt-12 pr-24
      rounded-xl border-2 border-black
      placeholder-transparent
      focus:outline-none
    "
    placeholder="Enter story..."
  />

  {/* 🏷️ LABEL */}
  <label className="absolute left-3 top-3 text-gray-500 font-extrabold transition-all 
    peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm
    peer-focus:-top-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1
    peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1">
    📝 STORY
  </label>

  {/* 🎤 MIC + WAVEFORM */}
  <div
    className={`
      absolute bottom-3 right-3
      flex items-center gap-2

      px-3 py-1.5
      rounded-lg
      border border-gray-300

      bg-white/90 backdrop-blur-sm

      transition-all duration-300

      ${storyListening ? "shadow-[0_0_12px_rgba(255,0,0,0.6)]" : ""}
    `}
  >

    {/* 🎤 BUTTON */}
    <button
  onClick={startStoryListening}
  className={`
    text-sm font-semibold flex items-center gap-2

    ${storyListening 
      ? "text-red-500 scale-105" 
      : "text-gray-600 hover:text-black hover:scale-105"}

    transition-all duration-200
  `}
>
  🎤 {storyListening ? "Listening..." : "Speak"}
</button>

    {/* 🌊 WAVEFORM ANIMATION */}
    {storyListening && (
  <div className="flex items-end gap-[3px] h-6">

    {[...Array(5)].map((_, i) => {
  const base = Math.pow(storyAudio / 255, 1.5) * 30;

  const height = Math.max(
    4,
    base + Math.random() * 8 - 4 // 🔥 natural movement
  );

  return (
    <span
  key={i}
  style={{ height: `${height}px` }}
  className="w-[3px] bg-red-500 rounded shadow-[0_0_6px_rgba(255,0,0,0.8)] transition-all duration-75"
/>
  );
})}

  </div>
)}

  </div>

</div>

            <div className="relative">
              <input
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                className="peer w-full p-4 pt-12 rounded-xl border-2 border-black placeholder-transparent focus:outline-none"
                placeholder="Enter characters..."
              />
              <label className="absolute left-3 top-3 text-gray-500 font-extrabold transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1">
                👤 CHARACTER
              </label>
            
            {/* 🎤 MIC + WAVEFORM */}
  <div
    className={`
      absolute bottom-3 right-3
      flex items-center gap-2

      px-3 py-1.5
      rounded-lg
      border border-gray-300

      bg-white/90 backdrop-blur-sm

      transition-all duration-300

      ${characterListening ? "shadow-[0_0_12px_rgba(255,0,0,0.6)]" : ""}
    `}
  >

    {/* 🎤 BUTTON */}
    <button
  onClick={startCharacterListening}
  className={`
    text-sm font-semibold flex items-center gap-2

    ${characterListening 
      ? "text-red-500 scale-105" 
      : "text-gray-600 hover:text-black hover:scale-105"}

    transition-all duration-200
  `}
>
  🎤 {characterListening ? "Listening..." : "Speak"}
</button>

    {/* 🌊 WAVEFORM ANIMATION */}
    {characterListening && (
  <div className="flex items-end gap-[3px] h-6">

    {[...Array(5)].map((_, i) => {
  const base = Math.pow(storyAudio / 255, 1.5) * 30;

  const height = Math.max(
    4,
    base + Math.random() * 8 - 4 // 🔥 natural movement
  );

  return (
   <span
  key={i}
  style={{ height: `${height}px` }}
  className="w-[3px] bg-red-500 rounded shadow-[0_0_6px_rgba(255,0,0,0.8)] transition-all duration-75"
/>
  );
})}

  </div>
)}
</div>

  </div>


<div>
  <label className="font-extrabold text-gray-700 mb-2 block">🎨 STYLE</label>

  <div ref={dropdownRef} className="relative">

    {/* SELECT BOX */}
    <div
      onClick={() => setOpen(!open)}
      className={`w-full p-3 rounded-xl border-2 flex justify-between cursor-pointer ${
        error ? "border-red-500" : "border-black"
      }`}
    >
      <span>{style || "Select style..."}</span>
      <span>▾</span>
    </div>

    {/* DROPDOWN */}
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="absolute w-full bg-white border-2 border-black rounded-xl mt-2 z-50 shadow-lg"
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setStyle(opt.value);
                setOpen(false);
                setError(false);
              }}
              className="p-3 hover:bg-yellow-200 cursor-pointer"
            >
              {opt.label}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>

  </div>
</div>

           <button
  onClick={handleGenerate}
  disabled={loading}
  className={`comic-btn-primary w-full mt-4 flex items-center justify-center gap-2 ${
    loading ? "opacity-60 cursor-not-allowed" : ""
  }`}
>
  {loading && (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  )}
  {loading ? "Generating..." : "GENERATE"}
</button>

          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={exportPNG} className="comic-btn-secondary flex-1">
              📥 EXPORT PNG
            </button>

            <button onClick={exportJSON} className="comic-btn-secondary flex-1">
              📤 EXPORT JSON
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1">
          <div id="comic-canvas" className="comic-card p-4">

            {/* ✅ ONLY CHANGE ADDED HERE */}
            <GridLayoutRenderer 
  layoutId={selectedGrid} 
  panels={panels} 
  showCaptions 
/>
          </div>

          {/* <AIInsights panels={panels} /> */}
        </div>

      </div>

      {/* HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="comic-card w-[700px] max-h-[80vh] overflow-y-auto p-5 border-4 border-black">

            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">📚 History</h2>
              <button onClick={() => setShowHistory(false)}>✖</button>
            </div>

            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border mb-4"
            />

          {filteredHistory.map((item: any) => (
  <div
    key={item._id}
    className="flex items-center gap-4 p-4 mb-3 bg-white rounded-xl shadow-md border hover:shadow-lg transition"
  >
    {/* 🖼 IMAGE */}
   <img
  src={fixImage(
    item.panels?.[0]?.image ||
    item.panels?.[0]?.image_url ||
    item.panels?.[0]?.img
  )}
  className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:scale-105 transition"
  onClick={() => setPreviewComic(item)}
/>

    {/* 📄 INFO */}
    <div className="flex-1">
      <p className="font-semibold text-sm line-clamp-2">
        {item.story || "No story"}
      </p>

      <div className="text-xs text-gray-500 mt-1 flex gap-3">
        <span>🎨 {item.style}</span>
        <span>📊 {item.panels?.length} panels</span>
      </div>
    </div>

    {/* 🎮 ACTIONS */}
    <div className="flex flex-col items-end gap-2">

      {/* LOAD */}
      <button
  onClick={() => {
    handleLoad(item);
    setShowHistory(false);
  }}
  className="text-blue-600 text-sm hover:underline"
>
  📂 Load
</button>

      {/* DELETE */}
      <button
        onClick={() => deleteHistory(item._id)}
        className="text-red-500 text-sm hover:underline"
      >
        🗑 Delete
      </button>

      {/* FAVORITE ❤️ */}
<button
  onClick={async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/history/favorite?id=${item._id}`,
        { method: "POST" }
      );

      const data = await res.json();

      // 🔥 Update UI instantly
      setHistory((prev: any) =>
        prev.map((h: any) =>
          h._id === item._id
            ? { ...h, is_favorite: data.is_favorite }
            : h
        )
      );

    } catch (e) {
      console.error("Favorite error:", e);
    }
  }}
  className={`text-lg transition ${
    item.is_favorite ? "text-pink-500 scale-110" : "text-gray-400"
  }`}
>
  {item.is_favorite ? "❤️" : "🤍"}
</button>

      {/* SHARE 🔗 */}
<button
  onClick={() => {
    const url = `${window.location.origin}/comic/${item._id}`;

    if (navigator.share) {
      navigator.share({
        title: "Check out my comic!",
        text: item.story || "Amazing AI Comic",
        url: url,
      })
      .then(() => console.log("Shared successfully"))
      .catch((err) => console.log("Share cancelled", err));
    } else {
      // fallback
      navigator.clipboard.writeText(url);
      alert("🔗 Link copied!");
    }
  }}
  className="text-green-600 text-sm"
>
  🔗 Share
</button>

    </div>
  </div>
))}
{previewComic && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

    <div className="bg-white w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 shadow-2xl border-4 border-black">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🖼 Comic Preview</h2>
        <button
          onClick={() => setPreviewComic(null)}
          className="text-xl"
        >
          ✖
        </button>
      </div>

      {/* STORY */}
      <p className="mb-4 text-gray-700 font-medium">
        {previewComic.story}
      </p>

      {/* PANELS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        {previewComic?.panels?.map((panel: any, i: number) => (
          <div key={i} className="border rounded-lg overflow-hidden shadow">

            <img
  src={fixImage(
    panel.image || panel.image_url || panel.img
  )}
  className="w-full h-48 object-cover"
/>

            <div className="p-2 text-xs bg-gray-100">
              <p><b>💬</b> {panel.dialogue}</p>
              <p><b>📝</b> {panel.caption}</p>
            </div>

          </div>
        ))}

      </div>


      {/* ACTIONS */}
      <div className="flex justify-end gap-3 mt-5">

  {/* LOAD BUTTON */}
  <button
  onClick={() => {
    handleLoad(previewComic);
    setPreviewComic(null);
    setShowHistory(false);
  }}
  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
>
  📂 Load
</button>

  {/* CLOSE BUTTON */}
  <button
    onClick={() => setPreviewComic(null)}
    className="bg-gray-300 px-4 py-2 rounded-lg"
  >
    Close
  </button>

</div>
    </div>
  </div>
)}
          </div>
        </div>
      )}
{showAssistant && (
  <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden z-50">

    {/* HEADER */}
    <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <span className="font-semibold">AI Assistant</span>
      </div>
      <button onClick={() => setShowAssistant(false)} className="text-white">✖</button>
    </div>

    {/* CHAT AREA */}
<div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50 text-black">
{messages.map((msg, i) => (
  <div
    key={i}
    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm shadow ${
        msg.sender === "user"
          ? "bg-purple-600 text-white"
          : "bg-gray-100 text-black border"
      }`}
    >
      {/* TEXT */}
      <div className="space-y-1">
        {msg.text.split("\n").map((line: string, index: number) => (
          <div key={index}>{line}</div>
        ))}
      </div>

      {/* 🔊 SPEAKER BUTTON (ONLY FOR BOT) */}
     {msg.sender === "bot" && (
  <button
    onClick={() => speakText(msg.text)}
    className="text-xs mt-1 text-gray-500 hover:text-black"
  >
    {window.speechSynthesis.speaking ? "⏹ Stop" : "🔊"}
  </button>
)}
    </div>
  </div>
))}

      {/* 🔄 Typing indicator */}
{loading && (
  <div className="flex justify-start">
    <div className="px-3 py-2 bg-gray-100 border rounded-2xl text-sm text-black">
      typing...
    </div>
  </div>
)}

      <div ref={messagesEndRef}></div>
    </div>

    {/* INPUT */}
   <div className="p-2 border-t flex gap-2 bg-white text-black ">

  {/* INPUT */}
  <input
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Ask anything..."
    className="flex-1 px-3 py-2 border rounded-full text-sm outline-none focus:ring-2 focus:ring-purple-400"
    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
  />

  {/* 🎤 MIC BUTTON */}
  <button
    onClick={startListening}
    className={`px-3 rounded-full ${
      listening ? "bg-red-500 text-white" : "bg-gray-200"
    }`}
  >
    🎤
  </button>

  {/* SEND BUTTON */}
  <button
    onClick={sendMessage}
    className="bg-purple-600 text-white px-4 rounded-full hover:bg-purple-700"
  >
    ➤
  </button>

</div>

  </div>
)}
    </div>
  );
};

export default Dashboard;