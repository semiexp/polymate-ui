import { useEffect, useRef, useState } from "react";

import {
  Camera,
  Vector3,
  Surface,
  isContainedInConvexPolygon,
} from "./geometry";
import { Box } from "@mui/material";

export type Coord = { x: number; y: number; z: number };

type ExtraInfo = {
  color: string;
  cube: Coord;
  anotherCube: Coord;
};

const neighbors = [
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 0, z: -1 },
  { x: 0, y: -1, z: 0 },
  { x: -1, y: 0, z: 0 },
];

const enumerateSurfaces = (
  cubes: { coord: Coord; color: string }[],
): Surface<ExtraInfo>[] => {
  const surfaces: Surface<ExtraInfo>[] = [];

  const maybeAddSurface = (cube: Coord, anotherCube: Coord, color: string) => {
    const x = Math.max(cube.x, anotherCube.x);
    const y = Math.max(cube.y, anotherCube.y);
    const z = Math.max(cube.z, anotherCube.z);
    const dx = Math.abs(anotherCube.x - cube.x);
    const dy = Math.abs(anotherCube.y - cube.y);
    const dz = Math.abs(anotherCube.z - cube.z);

    const vertices = [
      new Vector3(x, y, z),
      new Vector3(x + dz, y + dx, z + dy),
      new Vector3(x + dy + dz, y + dz + dx, z + dx + dy),
      new Vector3(x + dy, y + dz, z + dx),
    ];

    surfaces.push({
      data: { color, cube, anotherCube },
      vertices,
    });
  };

  for (const c of cubes) {
    for (const nb of neighbors) {
      const anotherCube = {
        x: c.coord.x + nb.x,
        y: c.coord.y + nb.y,
        z: c.coord.z + nb.z,
      };
      maybeAddSurface(c.coord, anotherCube, c.color);
    }
  }

  return surfaces;
};

export type Cube = {
  color: string;
  coord: Coord;
};

export type PointedCube = {
  cube: Coord;
  anotherCube: Coord;
};

export type CubicShapeManipulatorProps = {
  cubes: Cube[];
  preprocess?: (cubes: Cube[], pointed?: PointedCube) => Cube[] | null;
  onClick?: (pointed?: PointedCube) => void;
};

export const CubicShapeManipulator = (props: CubicShapeManipulatorProps) => {
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const scale = 50.0 * Math.pow(1.5, zoomLevel);

  const cubes = props.cubes;
  let dimX = 0;
  let dimY = 0;
  let dimZ = 0;

  for (const c of cubes) {
    dimX = Math.max(dimX, c.coord.x + 1);
    dimY = Math.max(dimY, c.coord.y + 1);
    dimZ = Math.max(dimZ, c.coord.z + 1);
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
  const [mouseX, setMouseX] = useState(-1);
  const [mouseY, setMouseY] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(-1);
  const [height, setHeight] = useState(-1);

  const projectedSurfaces = camera.projectSurfaces(enumerateSurfaces(cubes));
  projectedSurfaces.reverse(); // draw nearer surfaces later

  let selectedSurface: ExtraInfo | null = null;

  if (mouseX >= 0) {
    const relX = mouseX - width / 2;
    const relY = -(mouseY - height / 2);

    for (let i = projectedSurfaces.length - 1; i >= 0; --i) {
      const surface = projectedSurfaces[i];
      if (
        isContainedInConvexPolygon(surface.vertices, {
          x: relX / scale,
          y: relY / scale,
        })
      ) {
        selectedSurface = surface.data;
        break;
      }
    }
  }

  let actualCubes: Cube[];
  if (props.preprocess) {
    if (selectedSurface !== null) {
      const tmp = props.preprocess(cubes, {
        cube: selectedSurface.cube,
        anotherCube: selectedSurface.anotherCube,
      });
      if (tmp === null) {
        actualCubes = cubes;
      } else {
        actualCubes = tmp;
      }
    } else {
      const tmp = props.preprocess(cubes);
      if (tmp === null) {
        actualCubes = cubes;
      } else {
        actualCubes = tmp;
      }
    }
  } else {
    actualCubes = props.cubes;
  }

  const actualProjectedSurfaces = camera.projectSurfaces(
    enumerateSurfaces(actualCubes),
  );
  actualProjectedSurfaces.reverse(); // draw nearer surfaces later

  const onMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (e.nativeEvent.button === 0) {
      if (props.onClick) {
        if (selectedSurface !== null) {
          props.onClick({
            cube: selectedSurface.cube,
            anotherCube: selectedSurface.anotherCube,
          });
        } else {
          props.onClick();
        }
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
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    setMouseX(x);
    setMouseY(y);

    if (!cameraOnMouseDown) {
      return;
    }

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

  const onMouseLeave = () => {
    setCameraOnMouseDown(null);
    setMouseX(-1);
    setMouseY(-1);
  };

  const onWheel = (e: React.WheelEvent) => {
    const newZoomLevel = zoomLevel + (e.deltaY > 0 ? -1 : 1);
    if (!(-2 <= newZoomLevel && newZoomLevel <= 1)) {
      return;
    }
    setZoomLevel(newZoomLevel);
  };

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

  for (const surface of actualProjectedSurfaces) {
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
        onMouseLeave={onMouseLeave}
        onWheel={onWheel}
        onContextMenu={(e) => e.preventDefault()}
      >
        {items}
      </svg>
    </Box>
  );
};
