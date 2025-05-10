import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Box, Tab, Tabs } from "@mui/material";

import { PlanarShapeEditor } from "./planarShapeEditor";
import { CubicShapeEditor } from "./cubicShapeEditor";

type ShapeEditorProps = {
  shape: number[][][];
  onChange: (shape: number[][][]) => void;
  planarGridSize: number;
};

const toPlanarShape = (shape: number[][][]) => {
  if (shape.length === 1) {
    return shape;
  } else if (shape[0].length === 1) {
    const flat = [];
    for (let i = 0; i < shape.length; ++i) {
      const row = [];
      for (let j = 0; j < shape[i][0].length; ++j) {
        row.push(shape[i][0][j]);
      }
      flat.push(row);
    }
    return [flat];
  } else if (shape[0][0].length === 1) {
    const flat = [];
    for (let i = 0; i < shape.length; ++i) {
      const row = [];
      for (let j = 0; j < shape[i].length; ++j) {
        row.push(shape[i][j][0]);
      }
      flat.push(row);
    }
    return [flat];
  } else {
    return shape; // not planar
  }
};

export const ShapeEditor = (props: ShapeEditorProps) => {
  const { shape, onChange } = props;
  const [tabValue, setTabValue] = useState(shape.length === 1 ? 0 : 1);

  const { t } = useTranslation();

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
          <Tab label={t("editor.planar")} disabled={shape.length !== 1} />
          <Tab label={t("editor.cubic")} />
          <Tab label={t("editor.layerwise")} disabled />
        </Tabs>
      </Box>
      {tabValue === 0 && (
        <PlanarShapeEditor
          initialShape={shape[0]}
          onChange={(s) => {
            onChange([s]);
          }}
          gridSize={32}
        />
      )}
      {tabValue === 1 && (
        <CubicShapeEditor
          initialShape={shape}
          onChange={(s) => {
            onChange(toPlanarShape(s));
          }}
        />
      )}
    </Box>
  );
};
