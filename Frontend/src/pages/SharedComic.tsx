import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GridLayoutRenderer from "@/components/GridLayoutRenderer";

const SharedComic = () => {
  const { id } = useParams();
  const [comic, setComic] = useState<any>(null);

  useEffect(() => {
    const fetchComic = async () => {
      try {
        console.log("Fetching comic ID:", id);

        const res = await fetch(`http://127.0.0.1:8000/api/comic/${id}`);
        const data = await res.json();

        console.log("COMIC DATA:", data);

        setComic(data);
      } catch (e) {
        console.error("Fetch error:", e);
      }
    };

    fetchComic();
  }, [id]);

  if (!comic) {
    return <div className="p-5 text-white">Loading comic...</div>;
  }

  return (
    <div className="p-5 text-white">
      <h1 className="text-xl font-bold mb-4">📖 Shared Comic</h1>

      {/* 🔥 SHOW STORY */}
      <p className="mb-4">{comic.story || "No story found"}</p>

      {/* 🔥 IMPORTANT FIX */}
      {comic.panels && comic.panels.length > 0 ? (
        <GridLayoutRenderer
          layoutId="grid-2"
          panels={comic.panels}
          showCaptions
        />
      ) : (
        <p>No panels found</p>
      )}
    </div>
  );
};

export default SharedComic;