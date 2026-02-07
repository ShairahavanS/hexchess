import React from "react";
import { getGridComponent } from "./GridRegistry.ts";

const GenericGrid = (props: any) => {
  const GridComponent = getGridComponent(props.gameMode);
  return <GridComponent {...props} />;
};

export default GenericGrid;
