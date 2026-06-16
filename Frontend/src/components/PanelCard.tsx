import { useState } from "react";
import { motion } from "framer-motion";
import {
  RotateCw,
  Pencil,
  ArrowUpDown,
  Eye
} from "lucide-react";

import { playPop } from "@/lib/sounds";

interface PanelCardProps {
  index: number;
  style?: React.CSSProperties;
  image?: string;
  caption?: string;
  dialogues?: string[];
  delay?: number;
  onRegenerate?: (index: number) => void;
  onEdit?: (index: number) => void;

  // 🔥 FUTURE FEATURE
  // onStyleChange?: (index: number) => void;
}

const PanelCard = ({
  index,
  style,
  image,
  caption,
  dialogues = [],
  delay = 0,
  onRegenerate,
  onEdit,

  // onStyleChange
}: PanelCardProps) => {

  const [hovered,
    setHovered] =
    useState(false);

  // =====================================
  // CAPTION POSITION
  // =====================================
  const [captionPosition,
    setCaptionPosition] =
    useState<"bottom" | "raised">(
      "bottom"
    );

  // =====================================
  // CAPTION VISIBILITY
  // =====================================
  const [showCaption,
    setShowCaption] =
    useState(true);

  return (

    <motion.div

      initial={{
        scale: 0.8,
        opacity: 0
      }}

      animate={{
        scale: 1,
        opacity: 1
      }}

      transition={{
        delay: delay * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}

      className="
        comic-panel
        group
        relative
        overflow-hidden
        border-4
        border-black
        rounded-xl
        shadow-[6px_6px_0px_black]
        aspect-[4/3]
        bg-white
      "

      style={style}

      onMouseEnter={() => {

        setHovered(true);
        playPop();

      }}

      onMouseLeave={() =>
        setHovered(false)
      }
    >

      {/* =====================================
          IMAGE
      ===================================== */}

      <img

        // ✅ FIXED IMAGE HANDLING
        src={
          image ||
          "/image-error.png"
        }

        alt={`Panel ${index + 1}`}

        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
        "

        loading="lazy"

        onError={(e: any) => {

          // ✅ STOP LOOP
          e.currentTarget.onerror = null;

          // ✅ LOCAL FALLBACK
          e.currentTarget.src =
            "/image-error.png";
        }}
      />

      {/* =====================================
          COMIC TEXTURE
      ===================================== */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle,_rgba(0,0,0,0.1)_1px,_transparent_1px)]
          bg-[size:6px_6px]
          opacity-20
          pointer-events-none
        "
      />

      {/* =====================================
          DIALOGUES
      ===================================== */}

      {dialogues.map((d, i) => (

        <div
          key={i}

          className={`
            absolute
            bg-white
            text-black
            text-xs
            font-bold
            px-3
            py-2
            rounded-2xl
            border-2
            border-black
            shadow-[3px_3px_0px_black]

            ${
              i === 0
                ? "top-3 left-3"
                : "bottom-3 right-3"
            }
          `}
        >

          {d}

          <div
            className="
              absolute
              w-3
              h-3
              bg-white
              border-l-2
              border-b-2
              border-black
              rotate-45
              bottom-[-6px]
              left-4
            "
          />

        </div>
      ))}

      {/* =====================================
          CAPTION
      ===================================== */}

      {showCaption && caption && (

        <div
          className={`
            absolute
            left-0
            right-0
            bg-yellow-300
            text-black
            px-3
            py-1
            text-xs
            font-bold
            border-t-2
            border-black
            transition-all
            duration-300

            ${
              captionPosition === "bottom"
                ? "bottom-[-5px]"
                : "bottom-10"
            }
          `}
        >

          {caption}

        </div>
      )}

      {/* =====================================
          HOVER BUTTONS
      ===================================== */}

      {hovered && (

        <motion.div

          initial={{ opacity: 0 }}

          animate={{ opacity: 1 }}

          className="
            absolute
            bottom-2
            left-1/2
            -translate-x-1/2
            flex
            gap-2
            z-10
          "
        >

          {/* 🔄 REGENERATE */}

          <button
            className="
              bg-white
              border-2
              border-black
              rounded-lg
              p-2
              shadow
              hover:scale-110
              transition
            "

            onClick={(e) => {

              e.stopPropagation();

              playPop();

              onRegenerate?.(index);
            }}
          >

            <RotateCw size={16} />

          </button>

          {/* ✏️ EDIT */}

          <button
            className="
              bg-white
              border-2
              border-black
              rounded-lg
              p-2
              shadow
              hover:scale-110
              transition
            "

            onClick={(e) => {

              e.stopPropagation();

              playPop();

              onEdit?.(index);
            }}
          >

            <Pencil size={16} />

          </button>

          {/* ↕️ MOVE CAPTION */}

          <button
            className="
              bg-yellow-300
              border-2
              border-black
              rounded-lg
              p-2
              shadow
              hover:scale-110
              transition
            "

            onClick={(e) => {

              e.stopPropagation();

              playPop();

              setCaptionPosition(prev =>

                prev === "bottom"
                  ? "raised"
                  : "bottom"
              );
            }}
          >

            <ArrowUpDown size={16} />

          </button>

          {/* 👁️ TOGGLE CAPTION */}

          <button
            className="
              bg-gray-200
              border-2
              border-black
              rounded-lg
              p-2
              shadow
              hover:scale-110
              transition
            "

            onClick={(e) => {

              e.stopPropagation();

              playPop();

              setShowCaption(prev =>
                !prev
              );
            }}
          >

            <Eye size={16} />

          </button>

        </motion.div>
      )}

    </motion.div>
  );
};

export default PanelCard;