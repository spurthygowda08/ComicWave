import { useState } from "react";
import { playClick } from "@/lib/sounds";
import { toast } from "sonner";

const STYLES = ["Manga", "Superhero", "Noir", "Cartoon", "Watercolor", "Pixel Art"];

interface StoryInputProps {
  onGenerate: (story: string, character: string, style: string) => void;
  isGenerating: boolean;
}

const StoryInput = ({ onGenerate, isGenerating }: StoryInputProps) => {
  const [story, setStory] = useState("");
  const [character, setCharacter] = useState("");
  const [style, setStyle] = useState(STYLES[0]);

  const handleGenerate = () => {
    if (!story.trim()) {
      toast.error("Write a story first! 📝");
      return;
    }
    playClick();
    onGenerate(story, character, style);
  };

  return (
    <div className="comic-card p-6 space-y-4">
      <h3 className="font-bangers text-2xl tracking-wider text-card-foreground">📝 STORY</h3>
      <textarea
        value={story}
        onChange={(e) => setStory(e.target.value)}
        placeholder="Write your epic comic story here..."
        className="w-full h-28 px-4 py-3 rounded-xl border-2 border-card-foreground bg-muted font-comic text-card-foreground resize-none focus:outline-none focus:ring-2 focus:ring-secondary"
      />

      <div>
        <label className="font-bangers text-sm tracking-wider text-card-foreground block mb-1">CHARACTER</label>
        <input
          type="text"
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
          placeholder="Main character name..."
          className="w-full px-4 py-3 rounded-xl border-2 border-card-foreground bg-muted font-comic text-card-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
        />
      </div>

      <div>
        <label className="font-bangers text-sm tracking-wider text-card-foreground block mb-1">STYLE</label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-card-foreground bg-muted font-comic text-card-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          {STYLES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="comic-btn-primary w-full text-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? "GENERATING... ⏳" : "GENERATE COMIC 💥"}
      </button>
    </div>
  );
};

export default StoryInput;
