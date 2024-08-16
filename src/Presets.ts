export const pentominoes2D = [
  [[1, 1, 1, 1, 1]],
  [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
  ],
  [
    [1, 1, 1, 1],
    [0, 1, 0, 0],
  ],
  [
    [0, 1, 1, 1],
    [1, 1, 0, 0],
  ],
  [
    [1, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 1],
  ],
];

export const pentominoes = pentominoes2D.map((shape) => [shape]);

type Preset = {
  name: string;
  pieces: number[][][][];
  board: number[][][];
};

export const presets: Preset[] = [
  {
    name: "Pentomino 6x10",
    pieces: pentominoes,
    board: [Array.from({ length: 6 }, () => Array(10).fill(1))],
  },
  {
    name: "Pentomino 8x8",
    pieces: pentominoes,
    board: [
      [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
      ],
    ],
  },
];
