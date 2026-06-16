import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { getLayoutsForPanelCount, getPanelPositions, type GridLayout } from "@/lib/gridLayouts";
import { playClick } from "@/lib/sounds";

interface GridDropdownProps {
  selected: string;
  onSelect: (id: string) => void;
  panelCount: number;
}

const MiniGridPreview = ({ layout }: { layout: GridLayout }) => {
  const positions = getPanelPositions(layout.id);

  return (
    <div
      className="w-8 h-6 grid gap-px"
      style={{ gridTemplateColumns: layout.columns, gridTemplateRows: layout.rows }}
    >
      {positions.map((pos, i) => (
        <div
          key={i}
          className="border border-card-foreground rounded-sm bg-muted"
          style={{
            gridColumn: pos.gridColumn,
            gridRow: pos.gridRow,
          }}
        />
      ))}
    </div>
  );
};

const GridDropdown = ({ selected, onSelect, panelCount }: GridDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const layouts = getLayoutsForPanelCount(panelCount);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLabel = layouts.find((l) => l.id === selected)?.label || "Select Grid";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); playClick(); }}
        className="comic-btn-secondary flex items-center gap-2 text-base py-2 px-4"
      >
        {currentLabel}
        <ChevronDown size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full mt-2 left-0 z-50 comic-card p-2 min-w-[200px]"
          >
            {layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => { onSelect(layout.id); setOpen(false); playClick(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors font-comic text-card-foreground"
              >
                <MiniGridPreview layout={layout} />
                <span className="font-bangers tracking-wider text-sm">{layout.label}</span>
                {selected === layout.id && <Check size={16} className="ml-auto text-secondary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GridDropdown;
