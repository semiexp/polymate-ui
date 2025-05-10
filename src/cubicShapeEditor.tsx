import { useEffect, useState } from "react";

import { Shape } from "./shape";
import {
  CubicShapeManipulator,
  Cube,
  PointedCube,
} from "./cubicShapeManipulator";

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
  const [shape, setShape] = useState(props.initialShape);
  const [offset, setOffset] = useState({ x: 0, y: 0, z: 0 });
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const cubes = [];
  for (let z = 0; z < shape.length; ++z) {
    for (let y = 0; y < shape[z].length; ++y) {
      for (let x = 0; x < shape[z][y].length; ++x) {
        if (shape[z][y][x] === 1) {
          const coord = {
            x: x + offset.x,
            y: y + offset.y,
            z: z + offset.z,
          };
          cubes.push({ coord, color: "#ccccff" });
        }
      }
    }
  }

  useEffect(() => {
    const onKeyUpdate = (e: KeyboardEvent) => {
      setIsDeleteMode(e.ctrlKey);
    };
    window.addEventListener("keydown", onKeyUpdate);
    window.addEventListener("keyup", onKeyUpdate);
    return () => {
      window.removeEventListener("keydown", onKeyUpdate);
      window.removeEventListener("keyup", onKeyUpdate);
    };
  }, []);

  const preprocess = (cubes: Cube[], pointed?: PointedCube) => {
    if (pointed === undefined) {
      return cubes;
    }

    if (isDeleteMode) {
      if (cubes.length <= 1) {
        return cubes;
      }
      const ret = [...cubes];
      return ret.map((c) => {
        if (
          c.coord.x === pointed.cube.x &&
          c.coord.y === pointed.cube.y &&
          c.coord.z === pointed.cube.z
        ) {
          return { coord: c.coord, color: "rgb(238 238 255 / 50%)" };
        } else {
          return c;
        }
      });
    } else {
      return cubes.concat([
        { coord: pointed.anotherCube, color: "rgb(255 204 204 / 50%)" },
      ]);
    }
  };

  const onClick = (pointed?: PointedCube) => {
    if (pointed === undefined) {
      return;
    }

    let updated;

    if (isDeleteMode) {
      if (cubes.length <= 1) {
        return;
      }
      const { x, y, z } = pointed.cube;
      updated = updateShape(shape, x - offset.x, y - offset.y, z - offset.z, 0);
    } else {
      const { x, y, z } = pointed.anotherCube;
      updated = updateShape(shape, x - offset.x, y - offset.y, z - offset.z, 1);
    }

    setShape(updated.shape);
    setOffset({
      x: offset.x + updated.offsetX,
      y: offset.y + updated.offsetY,
      z: offset.z + updated.offsetZ,
    });

    props.onChange(updated.shape);
  };

  return (
    <CubicShapeManipulator
      cubes={cubes}
      preprocess={preprocess}
      onClick={onClick}
    />
  );
};
