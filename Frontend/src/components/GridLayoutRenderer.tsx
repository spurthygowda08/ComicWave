import { useState } from "react";
import { GRID_LAYOUTS, getPanelPositions } from "@/lib/gridLayouts";
import PanelCard from "./PanelCard";

interface Props {
  layoutId: string;
  showCaptions?: boolean;
  panels: any[];
}

const GridLayoutRenderer = ({
  layoutId,
  showCaptions = true,
  panels = []
}: Props) => {

  // =====================================
  // SAFETY
  // =====================================

  if (!layoutId) {
    return (
      <div className="text-center text-gray-500 py-10">
        Select layout
      </div>
    );
  }

  const layout = GRID_LAYOUTS.find(
    (l) => l.id === layoutId
  );

  if (!layout) {
    return (
      <div className="text-center text-red-500 py-10">
        Invalid layout
      </div>
    );
  }

  const positions = getPanelPositions(layoutId);

  // =====================================
  // STATES
  // =====================================

  const [editingPanel, setEditingPanel] =
    useState<number | null>(null);

  const [tempCaption, setTempCaption] =
    useState("");

  const [panelStyles, setPanelStyles] =
    useState<{ [key: number]: string }>({});

  const [, forceUpdate] = useState(0);

  // =====================================
  // IMAGE FIXER
  // =====================================

  const fixImage = (img: string) => {
    if (!img) return "";

    // REMOVE BROKEN DOUBLE PREFIX
    if (
      img.includes(
        "data:image/png;base64,data:image/jpeg;base64,"
      )
    ) {
      return img.replace(
        "data:image/png;base64,",
        ""
      );
    }

    // ALREADY VALID
    if (img.startsWith("data:image")) {
      return img;
    }

    // ADD PREFIX
    return `data:image/png;base64,${img}`;
  };

  // =====================================
  // REGENERATE PANEL
  // =====================================

  const handleRegenerate = async (
    index: number
  ) => {
    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/comic/regenerate-panel",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            panel_index: index
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Regenerate failed"
        );
      }

      panels[index] = {
        ...panels[index],

        image: fixImage(
          data.image ||
          data.image_url ||
          data.img ||
          ""
        ),

        caption: data.caption,

        dialogues: data.dialogue
          ? data.dialogue.split("|")
          : []
      };

      forceUpdate((n) => n + 1);

    } catch (e) {
      console.error(e);
    }
  };

  // =====================================
  // EDIT PANEL
  // =====================================

  const handleEdit = (
    index: number
  ) => {
    setEditingPanel(index);

    setTempCaption(
      panels[index]?.caption || ""
    );
  };

  const saveEdit = () => {

    if (editingPanel === null) {
      return;
    }

    panels[editingPanel].caption =
      tempCaption;

    setEditingPanel(null);

    forceUpdate((n) => n + 1);
  };

  // =====================================
  // STYLE CHANGE
  // =====================================

  const handleStyleChange = (
    index: number
  ) => {

    const style = prompt(
      "Enter style: manga / comic / realistic"
    );

    if (!style) return;

    setPanelStyles((prev) => ({
      ...prev,

      [index]:
        style.toLowerCase()
    }));
  };

  const getStyleFilter = (
    i: number
  ) => {

    const style =
      panelStyles[i];

    if (style === "manga") {
      return "grayscale(100%)";
    }

    if (style === "comic") {
      return "contrast(120%) saturate(120%)";
    }

    return "none";
  };

  // =====================================
  // EMPTY
  // =====================================

  if (!panels || panels.length === 0) {
    return (
      <div className="text-center text-gray-500 py-20">
        No comic generated yet 🚀
      </div>
    );
  }

  // =====================================
  // RENDER
  // =====================================

  return (
    <>
      <div
        className="
          grid
          gap-4
          w-full
          max-w-[1000px]
          mx-auto
        "
        style={{
          gridTemplateColumns:
            layout.columns,

          gridTemplateRows:
            layout.rows,
        }}
      >

        {positions.map((pos, i) => {

          const p = panels?.[i];

          // =====================================
          // IMAGE FIX
          // =====================================

          const imageSrc = fixImage(
            p?.image ||
            p?.image_url ||
            p?.img ||
            ""
          );

          // =====================================
          // EMPTY PANEL
          // =====================================

          if (!p || !imageSrc) {

            return (
              <div
                key={`empty-${i}`}
                className="
                  border
                  border-dashed
                  border-gray-400
                  flex
                  items-center
                  justify-center
                  text-gray-400
                  h-[200px]
                  rounded-xl
                  bg-gray-50
                "
                style={{
                  gridColumn:
                    pos.gridColumn,

                  gridRow:
                    pos.gridRow,
                }}
              >
                Empty Panel
              </div>
            );
          }

          // =====================================
          // DIALOGUES FIX
          // =====================================

          let dialogues: string[] = [];

          if (p.dialogues) {

            dialogues = Array.isArray(
              p.dialogues
            )
              ? p.dialogues
              : [String(p.dialogues)];

          } else if (p.dialogue) {

            if (
              typeof p.dialogue === "object"
            ) {

              dialogues =
                Object.values(
                  p.dialogue
                ) as string[];

            } else {

              dialogues = [
                String(p.dialogue)
              ];
            }
          }

          // =====================================
          // PANEL
          // =====================================

          return (
            <PanelCard
              key={`panel-${i}`}
              index={i}

              style={{
                gridColumn:
                  pos.gridColumn,

                gridRow:
                  pos.gridRow,

                filter:
                  getStyleFilter(i)
              }}

              image={imageSrc}

              caption={
                showCaptions
                  ? p.caption
                  : undefined
              }

              dialogues={dialogues}

              onRegenerate={
                handleRegenerate
              }

              onEdit={handleEdit}

              // onStyleChange={
              //   handleStyleChange
              // }
            />
          );
        })}
      </div>

      {/* =====================================
          EDIT MODAL
      ===================================== */}

      {editingPanel !== null && (
        <div
          className="
            fixed
            inset-0
            bg-black/50
            flex
            items-center
            justify-center
            z-50
          "
        >
          <div
            className="
              bg-white
              p-5
              rounded-xl
              w-[320px]
              border-4
              border-black
              shadow-xl
            "
          >

            <h2 className="font-bold mb-3 text-lg">
              Edit Caption
            </h2>

            <input
              value={tempCaption}

              onChange={(e) =>
                setTempCaption(
                  e.target.value
                )
              }

              className="
                border-2
                border-black
                w-full
                p-2
                mb-4
                rounded
              "
            />

            <div className="flex gap-3">

              <button
                onClick={saveEdit}
                className="
                  comic-btn-primary
                  flex-1
                "
              >
                Save
              </button>

              <button
                onClick={() =>
                  setEditingPanel(null)
                }

                className="
                  flex-1
                  border-2
                  border-black
                  rounded
                  px-3
                  py-2
                "
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GridLayoutRenderer;