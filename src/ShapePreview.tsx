export type ShapePreviewProps = {
  shape: number[][][];
  count: number;
  color: string;
  maxGridSize: number;
  padding: number;

  height: number;
  maxWidth: number;
};

const ShapePreview2D = (props: ShapePreviewProps) => {
  const { shape, count, color, maxGridSize, padding, height, maxWidth } = props;

  const sizeZ = shape.length;
  const sizeY = shape[0].length;
  const sizeX = shape[0][0].length;

  if (sizeZ !== 1) {
    throw new Error("TODO: support sizeZ > 1");
  }

  const gridSize = Math.min(
    maxGridSize,
    Math.floor(height / (sizeY + padding)),
    Math.floor(maxWidth / (sizeX + padding)),
  );
  const width = gridSize * (Math.max(2, sizeX) + padding);

  const offsetX = (width - gridSize * sizeX) * 0.5;
  const offsetY = (height - gridSize * sizeY) * 0.5;

  const items = [];
  for (let y = 0; y < sizeY; ++y) {
    for (let x = 0; x < sizeX; ++x) {
      if (shape[0][y][x] === 1) {
        items.push(
          <rect
            key={`0,${y},${x}`}
            x={x * gridSize + offsetX}
            y={y * gridSize + offsetY}
            width={gridSize}
            height={gridSize}
            fill={color}
            stroke="black"
          />,
        );
      }
    }
  }

  if (count !== 1) {
    items.push(
      <text x={0} y={height} fill="#aa0000" fontSize={15}>
        {count}
      </text>,
    );
  }

  return (
    <svg height={height} width={width}>
      {items}
    </svg>
  );
};

const ShapePreview3D = (props: ShapePreviewProps) => {
  const { shape, count, color, maxGridSize, padding, height, maxWidth } = props;

  const sizeZ = shape.length;
  const sizeY = shape[0].length;
  const sizeX = shape[0][0].length;

  const diagonalRatio = 0.4;
  const gridSize = Math.min(
    maxGridSize,
    Math.floor(height / (sizeY + sizeZ * diagonalRatio + padding)),
    Math.floor(maxWidth / (sizeX + sizeZ * diagonalRatio + padding)),
  );
  const width =
    gridSize * (Math.max(2, sizeX + sizeZ * diagonalRatio) + padding);

  const offsetX = (width - gridSize * (sizeX + sizeZ * diagonalRatio)) * 0.5;
  const offsetY = (height - gridSize * (sizeY + sizeZ * diagonalRatio)) * 0.5;

  const items = [];
  for (let z = sizeZ - 1; z >= 0; --z) {
    for (let y = sizeY - 1; y >= 0; --y) {
      for (let x = 0; x < sizeX; ++x) {
        if (shape[sizeZ - 1 - z][y][x] === 1) {
          const midx = (x + 1 + z * diagonalRatio) * gridSize + offsetX;
          const midy = (y + (sizeZ - z) * diagonalRatio) * gridSize + offsetY;
          items.push(
            <polygon
              key={`${z},${y},${x},a`}
              points={[
                `${midx},${midy}`,
                `${midx - gridSize},${midy}`,
                `${midx - gridSize},${midy + gridSize}`,
                `${midx},${midy + gridSize}`,
              ].join(" ")}
              fill={color}
              stroke="black"
            />,
          );
          items.push(
            <polygon
              key={`${z},${y},${x},b`}
              points={[
                `${midx},${midy}`,
                `${midx - gridSize},${midy}`,
                `${midx - gridSize + gridSize * diagonalRatio},${midy - gridSize * diagonalRatio}`,
                `${midx + gridSize * diagonalRatio},${midy - gridSize * diagonalRatio}`,
              ].join(" ")}
              fill={color}
              stroke="black"
            />,
          );
          items.push(
            <polygon
              key={`${z},${y},${x},c`}
              points={[
                `${midx},${midy}`,
                `${midx},${midy + gridSize}`,
                `${midx + gridSize * diagonalRatio},${midy + gridSize - gridSize * diagonalRatio}`,
                `${midx + gridSize * diagonalRatio},${midy - gridSize * diagonalRatio}`,
              ].join(" ")}
              fill={color}
              stroke="black"
            />,
          );
        }
      }
    }
  }

  if (count !== 1) {
    items.push(
      <text x={0} y={height} fill="#aa0000" fontSize={15}>
        {count}
      </text>,
    );
  }

  return (
    <svg height={height} width={width}>
      {items}
    </svg>
  );
};

export const ShapePreview = (props: ShapePreviewProps) => {
  if (props.shape.length === 1) {
    return <ShapePreview2D {...props} />;
  } else {
    return <ShapePreview3D {...props} />;
  }
};
