// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";

// interface AIInsightsProps {
//   panels?: any[];
// }

// const AIInsights = ({ panels = [] }: AIInsightsProps) => {

//   const [metrics, setMetrics] = useState<any>(null);
//   const [reader, setReader] = useState<any>(null);

//   // ==============================
//   // 🔥 GENERATE DYNAMIC METRICS
//   // ==============================
//   useEffect(() => {
//     if (!panels || panels.length === 0) return;

//     // 🔥 Simple logic (can be replaced with backend AI later)
//     const dialogueCount = panels.reduce((acc, p) => acc + (p.dialogue?.length || 0), 0);

//     const emotionalBalance = Math.min(100, panels.length * 20);
//     const dialogueOverload = Math.min(100, dialogueCount * 2);
//     const completeness = panels.length >= 4 ? 90 : panels.length * 20;

//     setMetrics({
//       emotional: emotionalBalance,
//       dialogue: dialogueOverload,
//       completeness
//     });

//     // 🔥 Reader simulation
//     const engagingPanel = Math.floor(Math.random() * panels.length) + 1;
//     const boredPanel = Math.floor(Math.random() * panels.length) + 1;

//     setReader({
//       attention: (Math.random() * 2 + 7).toFixed(1),
//       engagement: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
//       readTime: `${panels.length * 0.8} min`,
//       clarity: ["Good", "Excellent"][Math.floor(Math.random() * 2)],
//       engagingPanel,
//       boredPanel
//     });

//   }, [panels]);

//   if (!metrics) return null;

//   // ==============================
//   // 🔥 BAR COMPONENT
//   // ==============================
//   const Bar = ({ label, value, color }: any) => (
//     <div className="mb-4">
//       <div className="flex justify-between text-sm font-bold mb-1">
//         <span>{label}</span>
//         <span>{value}%</span>
//       </div>

//       <div className="w-full bg-gray-300 rounded h-3">
//         <motion.div
//           initial={{ width: 0 }}
//           animate={{ width: `${value}%` }}
//           transition={{ duration: 0.8 }}
//           className="h-3 rounded"
//           style={{ backgroundColor: color }}
//         />
//       </div>
//     </div>
//   );

//   return (
//     <div className="space-y-4">

//       {/* ==============================
//           📊 STORY HEALTH MONITOR
//       ============================== */}
//       <div className="comic-card p-4">

//         <h2 className="font-bold text-lg mb-3">📊 Story Health Monitor</h2>

//         <Bar label="❤️ Emotional Balance" value={metrics.emotional} color="#22c55e" />
//         <Bar label="💬 Dialogue Load" value={metrics.dialogue} color="#eab308" />
//         <Bar label="📚 Story Completeness" value={metrics.completeness} color="#3b82f6" />

//       </div>

//       {/* ==============================
//           👀 READER SIMULATION
//       ============================== */}
//       <div className="comic-card p-4">

//         <h2 className="font-bold text-lg mb-3">👀 Reader Simulation</h2>

//         <div className="space-y-2 text-sm">

//           <p>👁 Attention Score: <b>{reader.attention}/10</b></p>
//           <p>🔥 Engagement: <b>{reader.engagement}</b></p>
//           <p>📖 Read Time: <b>{reader.readTime}</b></p>
//           <p>🎯 Clarity: <b>{reader.clarity}</b></p>

//           <div className="mt-3 p-2 bg-yellow-100 border border-black">
//             💡 Most Engaging Panel: <b>Panel {reader.engagingPanel}</b>
//           </div>

//           <div className="mt-2 p-2 bg-red-100 border border-black">
//             ⚠ Reader may drop at: <b>Panel {reader.boredPanel}</b>
//           </div>

//         </div>
//       </div>

//       {/* ==============================
//           🔥 PANEL-WISE FEEDBACK
//       ============================== */}
//       <div className="comic-card p-4">

//         <h2 className="font-bold text-lg mb-3">🧠 Panel Insights</h2>

//         <div className="space-y-2 text-sm">

//           {panels.map((panel, index) => (
//             <div
//               key={index}
//               className="border border-black p-2 bg-gray-50"
//             >
//               <p className="font-bold">Panel {index + 1}</p>

//               <p>
//                 {index + 1 === reader.engagingPanel && "🔥 Highly engaging!"}
//                 {index + 1 === reader.boredPanel && " ⚠ Needs improvement"}
//                 {index + 1 !== reader.engagingPanel &&
//                   index + 1 !== reader.boredPanel &&
//                   " 👍 Balanced scene"}
//               </p>
//             </div>
//           ))}

//         </div>
//       </div>

//     </div>
//   );
// };

// export default AIInsights;