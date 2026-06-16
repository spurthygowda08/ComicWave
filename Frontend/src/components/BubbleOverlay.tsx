const BUBBLE_TEXTS = [
  "POW!",
  "Amazing!",
  "Watch out!",
  "Let's go!",
  "Wow!!",
  "BOOM!",
  "Ha ha!",
  "Oh no!",
];

interface BubbleOverlayProps {
  panelIndex: number;
}

const BubbleOverlay = ({ panelIndex }: BubbleOverlayProps) => {
  const text = BUBBLE_TEXTS[panelIndex % BUBBLE_TEXTS.length];
  const positions = [
    { top: "10%", left: "10%" },
    { top: "8%", right: "10%", left: "auto" },
    { bottom: "30%", left: "15%", top: "auto" },
    { top: "12%", left: "20%" },
  ];
  const pos = positions[panelIndex % positions.length];

  return (
    <div className="speech-bubble" style={{ ...pos, zIndex: 5 }}>
      <span className="font-bangers text-card-foreground">{text}</span>
    </div>
  );
};

export default BubbleOverlay;
