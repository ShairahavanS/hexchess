import OctGrid from "./OctGrid.tsx";
import SquareGrid from "./SquareGrid.tsx";

export const GridRegistry: Record<string, React.FC<any>> = {
  "Octagon-Square": OctGrid,
  Square: SquareGrid,
};

export function getGridComponent(mode: string) {
  return GridRegistry[mode] || OctGrid;
}
