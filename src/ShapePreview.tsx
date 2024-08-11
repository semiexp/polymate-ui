export type ShapePreviewProps = {
  shape: number[][][];
  color: string;
  maxGridSize: number;
  padding: number;

  height: number;
  maxWidth: number;
};

export const ShapePreview = (props: ShapePreviewProps) => {
  const { shape, color, maxGridSize, padding, height, maxWidth } = props;

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
  const width = gridSize * (sizeX + padding);

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

  return (
    <svg height={height} width={width}>
      {items}
    </svg>
  );
};
