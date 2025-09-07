export interface MineCellInfo {
  id: number;
  key: number;
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
  honey: boolean;
}
