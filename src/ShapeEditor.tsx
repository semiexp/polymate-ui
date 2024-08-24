import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";

import { PlanarShapeEditor } from "./planarShapeEditor";
import { CubicShapeEditor } from "./cubicShapeEditor";

type ShapeEditorProps = {
  shape: number[][][];
  onChange: (shape: number[][][]) => void;
  planarGridSize: number;
};

export const ShapeEditor = (props: ShapeEditorProps) => {
  const [tabValue, setTabValue] = useState(0);
  const { shape, onChange } = props;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexFlow: "column",
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          flexGrow: 0,
          flexShrink: 1,
          flexBasis: "auto",
        }}
      >
        <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)}>
          <Tab label="Planar" />
          <Tab label="Cubic" />
          <Tab label="Layerwise" disabled />
        </Tabs>
      </Box>
      {tabValue === 0 && (
        <PlanarShapeEditor
          shape={shape[0]}
          onChange={(s) => {
            onChange([s]);
          }}
          gridSize={32}
        />
      )}
      {tabValue === 1 && <CubicShapeEditor shape={shape} onChange={onChange} />}
    </Box>
  );
};
