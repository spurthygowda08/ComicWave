import { playClick } from "@/lib/sounds";

interface PanelSelectorProps {
  selected: number | null;
  onSelect: (count: number) => void;
}

const PANEL_COUNTS = [2, 4, 6, 8, 12];

const PanelSelector = ({ selected, onSelect }: PanelSelectorProps) => {
  return (
    <div className="flex gap-2">
      {PANEL_COUNTS.map((count) => (
        <button
          key={count}
          onClick={() => { onSelect(count); playClick(); }}
          className={`font-bangers text-base px-3 py-1.5 rounded-lg border-2 border-card-foreground transition-all ${
            selected === count
              ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_hsl(0,0%,0%)]"
              : "bg-card text-card-foreground hover:bg-muted"
          }`}
        >
          {count}
        </button>
      ))}
    </div>
  );
};

export default PanelSelector;
