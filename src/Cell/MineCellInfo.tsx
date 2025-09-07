export interface MineCellInfo {
    id: number;
    column: number;
    row: number;
    key: number;
    outofBounds: boolean;
    mine: boolean;
    revealed: boolean;
    flagged: boolean;
    adjacent: number;
    startingPoint: boolean;
    honey: boolean;
  }