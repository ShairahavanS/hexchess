import ArrowGrid from "./ArrowGrid.tsx";
import FishGrid from "./FishGrid.tsx";
import OctGrid from "./OctGrid.tsx";
import SquareGrid from "./SquareGrid.tsx";
import StarGrid from "./StarGrid.tsx";
import TriangleGrid from "./TriangleGrid.tsx";

export const GridRegistry: Record<string, React.FC<any>> = {
  "Octagon-Square": OctGrid,
  Square: SquareGrid,
  Triangle: TriangleGrid,
  Fish: FishGrid,
  Arrow: ArrowGrid,
  "Star-Rhombus": StarGrid,
};

export function getGridComponent(mode: string) {
  return GridRegistry[mode] || OctGrid;
}
