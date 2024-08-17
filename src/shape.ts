export type Shape = number[][][];
export type DetailedPiece = {
  shape: Shape;
  count: number;
};

export const isEmpty = (shape: Shape): boolean => {
  for (let z = 0; z < shape.length; ++z) {
    for (let y = 0; y < shape[z].length; ++y) {
      for (let x = 0; x < shape[z][y].length; ++x) {
        if (shape[z][y][x] === 1) {
          return false;
        }
      }
    }
  }
  return true;
};
