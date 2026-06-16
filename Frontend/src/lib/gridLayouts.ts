export interface GridLayout {
  id: string;
  label: string;
  panels: number;
  columns: string;
  rows: string;
}

export const GRID_LAYOUTS: GridLayout[] = [
  // 2 panels
  { id: "2-h", label: "Horizontal", panels: 2, columns: "1fr 1fr", rows: "1fr" },
  { id: "2-v", label: "Vertical", panels: 2, columns: "1fr", rows: "1fr 1fr" },

  // 4 panels
  { id: "4-a", label: "Grid A (2×2)", panels: 4, columns: "1fr 1fr", rows: "1fr 1fr" },
  { id: "4-b", label: "Grid B", panels: 4, columns: "1fr 1fr 1fr", rows: "1fr 1fr" },
  { id: "4-c", label: "Grid C", panels: 4, columns: "1fr 1fr 1fr", rows: "1fr 1fr" },

  // 6 panels
  { id: "6-a", label: "Grid A (3×2)", panels: 6, columns: "1fr 1fr 1fr", rows: "1fr 1fr" },
  { id: "6-b", label: "Grid B (2×3)", panels: 6, columns: "1fr 1fr", rows: "1fr 1fr 1fr" },
  { id: "6-c", label: "Grid C", panels: 6, columns: "1fr 1fr 1fr", rows: "1fr 1fr 1fr" },

  // 8 panels
  { id: "8-a", label: "Grid A (4×2)", panels: 8, columns: "1fr 1fr 1fr 1fr", rows: "1fr 1fr" },
  { id: "8-b", label: "Grid B", panels: 8, columns: "1fr 1fr 1fr 1fr", rows: "1fr 1fr 1fr" },

  // 12 panels
  { id: "12-a", label: "Grid A (4×3)", panels: 12, columns: "1fr 1fr 1fr 1fr", rows: "1fr 1fr 1fr" },
  { id: "12-b", label: "Grid B (Mixed)", panels: 12, columns: "1fr 1fr 1fr 1fr", rows: "1fr 1fr 1fr 1fr" },
];

export function getLayoutsForPanelCount(count: number): GridLayout[] {
  return GRID_LAYOUTS.filter((l) => l.panels === count);
}

export interface PanelPosition {
  gridColumn: string;
  gridRow: string;
}

export function getPanelPositions(layoutId: string): PanelPosition[] {
  switch (layoutId) {
    // 2 panels
    case "2-h":
      return [
        { gridColumn: "1", gridRow: "1" },
        { gridColumn: "2", gridRow: "1" },
      ];
    case "2-v":
      return [
        { gridColumn: "1", gridRow: "1" },
        { gridColumn: "1", gridRow: "2" },
      ];

    // 4 panels
    case "4-a":
      return [
        { gridColumn: "1", gridRow: "1" },
        { gridColumn: "2", gridRow: "1" },
        { gridColumn: "1", gridRow: "2" },
        { gridColumn: "2", gridRow: "2" },
      ];
    case "4-b":
      // [1][2] top, [3 wide][4] bottom
      return [
        { gridColumn: "1 / 2", gridRow: "1" },
        { gridColumn: "2 / 4", gridRow: "1" },
        { gridColumn: "1 / 3", gridRow: "2" },
        { gridColumn: "3", gridRow: "2" },
      ];
    case "4-c":
      // [1 wide] top, [2][3][4] bottom
      return [
        { gridColumn: "1 / -1", gridRow: "1" },
        { gridColumn: "1", gridRow: "2" },
        { gridColumn: "2", gridRow: "2" },
        { gridColumn: "3", gridRow: "2" },
      ];

    // 6 panels
    case "6-a":
      return [
        { gridColumn: "1", gridRow: "1" },
        { gridColumn: "2", gridRow: "1" },
        { gridColumn: "3", gridRow: "1" },
        { gridColumn: "1", gridRow: "2" },
        { gridColumn: "2", gridRow: "2" },
        { gridColumn: "3", gridRow: "2" },
      ];
    case "6-b":
      return [
        { gridColumn: "1", gridRow: "1" },
        { gridColumn: "2", gridRow: "1" },
        { gridColumn: "1", gridRow: "2" },
        { gridColumn: "2", gridRow: "2" },
        { gridColumn: "1", gridRow: "3" },
        { gridColumn: "2", gridRow: "3" },
      ];
    case "6-c":
      // [1][2][3] / [4 wide] / [5][6]
      return [
        { gridColumn: "1", gridRow: "1" },
        { gridColumn: "2", gridRow: "1" },
        { gridColumn: "3", gridRow: "1" },
        { gridColumn: "1 / -1", gridRow: "2" },
        { gridColumn: "1 / 2", gridRow: "3" },
        { gridColumn: "2 / -1", gridRow: "3" },
      ];

    // 8 panels
    case "8-a":
      return Array.from({ length: 8 }, (_, i) => ({
        gridColumn: `${(i % 4) + 1}`,
        gridRow: `${Math.floor(i / 4) + 1}`,
      }));
    case "8-b":
      // [1][2][3][4] / [5 wide] / [6][7][8]
      return [
        { gridColumn: "1", gridRow: "1" },
        { gridColumn: "2", gridRow: "1" },
        { gridColumn: "3", gridRow: "1" },
        { gridColumn: "4", gridRow: "1" },
        { gridColumn: "1 / -1", gridRow: "2" },
        { gridColumn: "1 / 2", gridRow: "3" },
        { gridColumn: "2 / 3", gridRow: "3" },
        { gridColumn: "3 / -1", gridRow: "3" },
      ];

    // 12 panels
    case "12-a":
      return Array.from({ length: 12 }, (_, i) => ({
        gridColumn: `${(i % 4) + 1}`,
        gridRow: `${Math.floor(i / 4) + 1}`,
      }));
    case "12-b":
      // Mixed: [1 wide][2][3] / [4][5][6][7] / [8][9 wide] / [10][11][12]
      return [
        { gridColumn: "1 / 3", gridRow: "1" },
        { gridColumn: "3", gridRow: "1" },
        { gridColumn: "4", gridRow: "1" },
        { gridColumn: "1", gridRow: "2" },
        { gridColumn: "2", gridRow: "2" },
        { gridColumn: "3", gridRow: "2" },
        { gridColumn: "4", gridRow: "2" },
        { gridColumn: "1 / 2", gridRow: "3" },
        { gridColumn: "2 / -1", gridRow: "3" },
        { gridColumn: "1", gridRow: "4" },
        { gridColumn: "2 / 4", gridRow: "4" },
        { gridColumn: "4", gridRow: "4" },
      ];

    default:
      return [];
  }
}
