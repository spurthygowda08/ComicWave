import { toPng } from "html-to-image";
import { toast } from "sonner";
import { playClick } from "@/lib/sounds";

interface ExportButtonsProps {
  layoutId: string | null;
}

const ExportButtons = ({ layoutId }: ExportButtonsProps) => {
  const handleExportPNG = async () => {
    playClick();
    const node = document.getElementById("comic-grid-export");
    if (!node) {
      toast.error("No comic to export!");
      return;
    }
    try {
      const dataUrl = await toPng(node, { backgroundColor: "#fff" });
      const link = document.createElement("a");
      link.download = "comic-wave.png";
      link.href = dataUrl;
      link.click();
      toast.success("Comic exported as PNG! 🖼️");
    } catch {
      toast.error("Export failed 😢");
    }
  };

  const handleExportJSON = () => {
    playClick();
    const data = {
      app: "Comic Wave",
      layout: layoutId,
      exportedAt: new Date().toISOString(),
      panels: layoutId ? Array.from({ length: 4 }, (_, i) => ({ id: i + 1, content: null })) : [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = "comic-wave.json";
    link.href = URL.createObjectURL(blob);
    link.click();
    toast.success("Comic exported as JSON! 📄");
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleExportPNG} className="comic-btn-primary text-sm py-2 px-4">
        📤 Export PNG
      </button>
      <button onClick={handleExportJSON} className="comic-btn-secondary text-sm py-2 px-4">
        📤 Export JSON
      </button>
    </div>
  );
};

export default ExportButtons;
