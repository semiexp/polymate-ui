import { useEffect, useRef, useState } from "react";

import { Shape } from "./shape";
import {
  Camera,
  Vector3,
  Surface,
  isContainedInConvexPolygon,
} from "./geometry";
import { Box } from "@mui/material";

export type CubicShapeEditorProps = {
  initialShape: Shape;
  onChange: (shape: Shape) => void;
};

const updateShape = (
  shape: number[][][],
  px: number,
  py: number,
  pz: number,
  value: number,
): {
  shape: number[][][];
  offsetX: number;
  offsetY: number;
  offsetZ: number;
} => {
  let minX = shape[0][0].length;
  let minY = shape[0].length;
  let minZ = shape.length;
  let maxX = -1;
  let maxY = -1;
  let maxZ = -1;

  if (value === 1) {
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    minZ = Math.min(minZ, pz);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
    maxZ = Math.max(maxZ, pz);
  }

  for (let z = 0; z < shape.length; ++z) {
    for (let y = 0; y < shape[z].length; ++y) {
      for (let x = 0; x < shape[z][y].length; ++x) {
        if (value === 0 && y === py && x === px && z === pz) {
          continue;
        }

        if (shape[z][y][x] === 1) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          minZ = Math.min(minZ, z);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          maxZ = Math.max(maxZ, z);
        }
      }
    }
  }

  if (minX > maxX) {
    return { shape: [[[0]]], offsetX: 0, offsetY: 0, offsetZ: 0 };
  }

  const newShape = [];
  for (let z = minZ; z <= maxZ; ++z) {
    const layer = [];
    for (let y = minY; y <= maxY; ++y) {
      const row = [];
      for (let x = minX; x <= maxX; ++x) {
        if (z === pz && y === py && x === px) {
          row.push(value);
        } else if (
          0 <= z &&
          z < shape.length &&
          0 <= y &&
          y < shape[z].length &&
          0 <= x &&
          x < shape[z][y].length
        ) {
          row.push(shape[z][y][x]);
        } else {
          row.push(0);
        }
      }
      layer.push(row);
    }
    newShape.push(layer);
  }

  return { shape: newShape, offsetX: minX, offsetY: minY, offsetZ: minZ };
};

export const CubicShapeEditor = (props: CubicShapeEditorProps) => {
  // TODO: automatically rotate
  const [shape, _setShape] = useState(props.initialShape);

  const setShape = (shape: Shape) => {
    _setShape(shape);
    props.onChange(shape);
  };

  const [zoomLevel, setZoomLevel] = useState(1.0);
  const scale = 50.0 * Math.pow(1.5, zoomLevel);

  const dimX = shape[0][0].length;
  const dimY = shape[0].length;
  const dimZ = shape.length;

  const surfaces: Surface<{
    color: string;
    anotherCube: { x: number; y: number; z: number };
  }>[] = [];

  const maybeAddSurface = (
    z0: number,
    y0: number,
    x0: number,
    z1: number,
    y1: number,
    x1: number,
  ) => {
    const hasBox0 =
      0 <= z0 &&
      z0 < dimZ &&
      0 <= y0 &&
      y0 < dimY &&
      0 <= x0 &&
      x0 < dimX &&
      shape[z0][y0][x0] === 1;
    const hasBox1 =
      0 <= z1 &&
      z1 < dimZ &&
      0 <= y1 &&
      y1 < dimY &&
      0 <= x1 &&
      x1 < dimX &&
      shape[z1][y1][x1] === 1;

    if (hasBox0 === hasBox1) {
      return;
    }

    const color = "#ccccff";

    const dz = z1 - z0;
    const dy = y1 - y0;
    const dx = x1 - x0;

    const vertices = [
      new Vector3(x1, y1, z1),
      new Vector3(x1 + dz, y1 + dx, z1 + dy),
      new Vector3(x1 + dy + dz, y1 + dz + dx, z1 + dx + dy),
      new Vector3(x1 + dy, y1 + dz, z1 + dx),
    ];

    const anotherCube = hasBox0
      ? { x: x1, y: y1, z: z1 }
      : { x: x0, y: y0, z: z0 };
    surfaces.push({ data: { color, anotherCube }, vertices });
  };

  for (let z = 0; z < dimZ; ++z) {
    for (let y = 0; y < dimY; ++y) {
      for (let x = 0; x < dimX; ++x) {
        if (x == 0) {
          maybeAddSurface(z, y, x - 1, z, y, x);
        }
        maybeAddSurface(z, y, x, z, y, x + 1);

        if (y == 0) {
          maybeAddSurface(z, y - 1, x, z, y, x);
        }
        maybeAddSurface(z, y, x, z, y + 1, x);

        if (z == 0) {
          maybeAddSurface(z - 1, y, x, z, y, x);
        }
        maybeAddSurface(z, y, x, z + 1, y, x);
      }
    }
  }

  const [camera, setCamera] = useState(
    new Camera(
      new Vector3(dimX / 2, dimY / 2, dimZ / 2),
      new Vector3(1, 1, 2),
      new Vector3(0, 1, 0),
    ),
  );
  const [cameraOnMouseDown, setCameraOnMouseDown] = useState<{
    camera: Camera;
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [isMoveCenter, setIsMoveCenter] = useState(false);

  const projectedSurfaces = camera.projectSurfaces(surfaces);
  projectedSurfaces.reverse(); // draw nearer surfaces later

  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (e.nativeEvent.button === 0) {
      const relX = x - width / 2;
      const relY = -(y - height / 2);

      let addedBox: { x: number; y: number; z: number } | null = null;

      for (let i = projectedSurfaces.length - 1; i >= 0; --i) {
        const surface = projectedSurfaces[i];
        if (
          isContainedInConvexPolygon(surface.vertices, {
            x: relX / scale,
            y: relY / scale,
          })
        ) {
          addedBox = surface.data.anotherCube;
          break;
        }
      }

      if (addedBox !== null) {
        const updated = updateShape(
          shape,
          addedBox.x,
          addedBox.y,
          addedBox.z,
          1,
        );
        setShape(updated.shape);
        setCamera(
          camera.moveCenter(
            new Vector3(-updated.offsetX, -updated.offsetY, -updated.offsetZ),
          ),
        );
      }
    } else if (e.nativeEvent.button === 1) {
      setCameraOnMouseDown({ camera, mouseX: x, mouseY: y });
      setIsMoveCenter(true);
    } else if (e.nativeEvent.button === 2) {
      setCameraOnMouseDown({ camera, mouseX: x, mouseY: y });
      if (e.ctrlKey) {
        setIsMoveCenter(true);
      } else {
        setIsMoveCenter(false);
      }
      e.preventDefault();
    }
  };

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!cameraOnMouseDown) {
      return;
    }

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const dx = x - cameraOnMouseDown.mouseX;
    const dy = -(y - cameraOnMouseDown.mouseY);

    if (isMoveCenter) {
      setCamera(
        cameraOnMouseDown.camera.moveCenter(
          camera.cameraRight
            .scale(-dx / scale)
            .add(camera.cameraUp.scale(-dy / scale)),
        ),
      );
    } else {
      setCamera(cameraOnMouseDown.camera.rotateView(dx, dy, 1.0 / scale));
    }
  };

  const onMouseUp = () => {
    setCameraOnMouseDown(null);
  };

  const onWheel = (e: React.WheelEvent) => {
    const newZoomLevel = zoomLevel + (e.deltaY > 0 ? -1 : 1);
    if (!(-2 <= newZoomLevel && newZoomLevel <= 1)) {
      return;
    }
    setZoomLevel(newZoomLevel);
  };

  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(-1);
  const [height, setHeight] = useState(-1);

  useEffect(() => {
    const set = () => {
      if (boxRef.current) {
        const current = boxRef.current;
        setWidth(current.clientWidth);
        setHeight(current.clientHeight);
      }
    };

    const observer = new ResizeObserver(() => {
      set();
    });
    if (boxRef.current) {
      observer.observe(boxRef.current);
    }
    set();
    return () => {
      observer.disconnect();
    };
  }, [boxRef]);

  const items = [];

  for (const surface of projectedSurfaces) {
    const points = surface.vertices.map((v) => ({
      x: v.x * scale + width / 2,
      y: -v.y * scale + height / 2,
    }));

    items.push(
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill={surface.data.color}
        stroke="black"
      />,
    );
  }

  return (
    <Box
      ref={boxRef}
      sx={{
        width: "100%",
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
        overflow: "hidden",
      }}
    >
      <svg
        width={width}
        height={height}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
        onContextMenu={(e) => e.preventDefault()}
      >
        {items}
      </svg>
    </Box>
  );
};
