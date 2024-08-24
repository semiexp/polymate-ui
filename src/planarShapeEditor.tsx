import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

type PlanarShapeEditorProps = {
  initialShape: number[][];
  onChange: (shape: number[][]) => void;
  gridSize: number;
};

const updateShape = (
  shape: number[][],
  px: number,
  py: number,
  value: number,
): { shape: number[][]; offsetX: number; offsetY: number } => {
  let minX = shape[0].length;
  let minY = shape.length;
  let maxX = -1;
  let maxY = -1;

  if (value === 1) {
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
  }

  for (let y = 0; y < shape.length; ++y) {
    for (let x = 0; x < shape[y].length; ++x) {
      if (value === 0 && y === py && x === px) {
        continue;
      }

      if (shape[y][x] === 1) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (minX > maxX) {
    return { shape: [[0]], offsetX: 0, offsetY: 0 };
  }

  const newShape = [];
  for (let y = minY; y <= maxY; ++y) {
    const row = [];
    for (let x = minX; x <= maxX; ++x) {
      if (y === py && x === px) {
        row.push(value);
      } else if (0 <= y && y < shape.length && 0 <= x && x < shape[y].length) {
        row.push(shape[y][x]);
      } else {
        row.push(0);
      }
    }
    newShape.push(row);
  }

  return { shape: newShape, offsetX: minX, offsetY: minY };
};

export const PlanarShapeEditor = (props: PlanarShapeEditorProps) => {
  const gridSize = props.gridSize;
  const [shape, _setShape] = useState(props.initialShape);

  const setShape = (shape: number[][]) => {
    _setShape(shape);
    props.onChange(shape);
  };

  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(-1);
  const [height, setHeight] = useState(-1);

  // relative position at which the cell (0, 0) is drawn
  const [dx, setDx] = useState(-(shape[0].length - 1) * gridSize * 0.5);
  const [dy, setDy] = useState(-(shape.length - 1) * gridSize * 0.5);

  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartDx, setDragStartDx] = useState(0);
  const [dragStartDy, setDragStartDy] = useState(0);

  const [updateValue, setUpdateValue] = useState<number | null>(null);

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

  const svgItems = [];
  if (width > 0) {
    const shapeHeight = shape.length;
    const shapeWidth = shape[0].length;

    const gridXPos = dx + (gridSize + width) * 0.5;
    const gridXMin = gridXPos - Math.floor(gridXPos / gridSize) * gridSize;
    for (let n = 0; n <= Math.floor(width / gridSize); ++n) {
      svgItems.push(
        <line
          key={`gridX${n}`}
          x1={gridXMin + n * gridSize}
          y1={0}
          x2={gridXMin + n * gridSize}
          y2={height}
          stroke="#cccccc"
        />,
      );
    }

    const gridYPos = dy + (gridSize + height) * 0.5;
    const gridYMin = gridYPos - Math.floor(gridYPos / gridSize) * gridSize;
    for (let n = 0; n <= Math.floor(height / gridSize); ++n) {
      svgItems.push(
        <line
          key={`gridY${n}`}
          x1={0}
          y1={gridYMin + n * gridSize}
          x2={width}
          y2={gridYMin + n * gridSize}
          stroke="#cccccc"
        />,
      );
    }

    for (let y = 0; y < shapeHeight; ++y) {
      for (let x = 0; x < shapeWidth; ++x) {
        if (shape[y][x] === 1) {
          svgItems.push(
            <rect
              key={`${y},${x}`}
              x={(x - 0.5) * gridSize + dx + width * 0.5}
              y={(y - 0.5) * gridSize + dy + height * 0.5}
              width={gridSize}
              height={gridSize}
              fill="#ccccff"
              stroke="black"
            />,
          );
        }
      }
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      setDragging(true);
      setDragStartDx(dx);
      setDragStartDy(dy);
      setDragStartX(e.clientX);
      setDragStartY(e.clientY);
      e.preventDefault();
      return;
    }

    // compute coordinate relative to the grid component
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(
      (e.clientX - rect.left - dx - width * 0.5) / gridSize + 0.5,
    );
    const y = Math.floor(
      (e.clientY - rect.top - dy - height * 0.5) / gridSize + 0.5,
    );

    const curValue =
      0 <= y && y < shape.length && 0 <= x && x < shape[y].length
        ? shape[y][x]
        : 0;
    const newValue = curValue === 0 ? 1 : 0;

    setUpdateValue(newValue);
    const updated = updateShape(shape, x, y, newValue);
    setShape(updated.shape);
    setDx(dx + updated.offsetX * gridSize);
    setDy(dy + updated.offsetY * gridSize);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setDx(dragStartDx + e.clientX - dragStartX);
      setDy(dragStartDy + e.clientY - dragStartY);
    } else if (updateValue !== null) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.floor(
        (e.clientX - rect.left - dx - width * 0.5) / gridSize + 0.5,
      );
      const y = Math.floor(
        (e.clientY - rect.top - dy - height * 0.5) / gridSize + 0.5,
      );

      const curValue =
        0 <= y && y < shape.length && 0 <= x && x < shape[y].length
          ? shape[y][x]
          : 0;
      if (curValue === updateValue) {
        return;
      }

      const updated = updateShape(shape, x, y, updateValue);
      setShape(updated.shape);
      setDx(dx + updated.offsetX * gridSize);
      setDy(dy + updated.offsetY * gridSize);
    }
  };

  const onMouseUp = () => {
    setDragging(false);
    setUpdateValue(null);
  };

  return (
    <Box
      ref={boxRef}
      sx={{
        width: "100%",
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: "auto",
        overflow: "hidden",
        cursor: dragging ? "grabbing" : "pointer",
      }}
    >
      <svg
        height={height}
        width={width}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {svgItems}
      </svg>
    </Box>
  );
};
