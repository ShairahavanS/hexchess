import FishGrid from "./FishGrid.tsx";
import OctGrid from "./OctGrid.tsx";
import SquareGrid from "./SquareGrid.tsx";
import TriangleGrid from "./TriangleGrid.tsx";

export const GridRegistry: Record<string, React.FC<any>> = {
  "Octagon-Square": OctGrid,
  Square: SquareGrid,
  Triangle: TriangleGrid,
  Fish: FishGrid,
};

export function getGridComponent(mode: string) {
  return GridRegistry[mode] || OctGrid;
}
