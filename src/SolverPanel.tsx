import { useState } from "react";

import { solve, Answer, Answers } from "./Solver";
import { DetailedPiece } from "./shape";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  Search,
} from "@mui/icons-material";
import { Box, IconButton, Toolbar, Typography } from "@mui/material";

const getColor = (id: number) => {
  return `hsl(${(id % 12) * 30}, ${100 - (Math.floor(id / 12) % 2) * 50}%, 80%)`;
};

const LayerwiseAnswerBoard = (props: {
  answer: Answer;
  dims: [number, number, number];
  gridSize: number;
}) => {
  // TODO: better coloring
  const { answer, dims, gridSize } = props;
  const answerData = answer.data;

  const margin = 5;
  const svgHeight = ((dims[1] + 0.5) * dims[0] - 0.5) * gridSize + margin * 2;
  const svgWidth = dims[2] * gridSize + margin * 2;

  const items = [];

  const height = dims[1];
  const width = dims[2];

  for (let z = 0; z < dims[0]; ++z) {
    const start = z * width * height;
    const yOffset = (dims[0] - 1 - z) * (height + 0.5) * gridSize;

    items.push(
      <rect
        key="background"
        x={margin}
        y={yOffset + margin}
        width={dims[2] * gridSize}
        height={dims[1] * gridSize}
        fill="#eeeeee"
      />,
    );

    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const item = answerData[start + y * width + x];

        if (item[0] < 0) continue;

        items.push(
          <rect
            key={`${z},${y},${x}`}
            x={x * gridSize + margin}
            y={yOffset + y * gridSize + margin}
            width={gridSize}
            height={gridSize}
            fill={getColor(item[0])}
            stroke="#888888"
          />,
        );
      }
    }

    const thickBorderWidth = 3;

    for (let y = 0; y < height; ++y) {
      for (let x = 0; x <= width; ++x) {
        let hasWall = false;

        if (x == 0) {
          hasWall = answerData[start + y * width][0] >= 0;
        } else if (x == width) {
          hasWall = answerData[start + y * width + width - 1][0] >= 0;
        } else {
          const a = answerData[start + y * width + x - 1];
          const b = answerData[start + y * width + x];
          hasWall = a[0] !== b[0] || a[1] !== b[1];
        }

        if (hasWall) {
          items.push(
            <line
              key={`v${z},${y},${x}`}
              x1={x * gridSize + margin}
              y1={yOffset + y * gridSize + margin - thickBorderWidth * 0.5}
              x2={x * gridSize + margin}
              y2={
                yOffset + (y + 1) * gridSize + margin + thickBorderWidth * 0.5
              }
              strokeWidth={thickBorderWidth}
              stroke="#333333"
            />,
          );
        }
      }
    }

    for (let y = 0; y <= height; ++y) {
      for (let x = 0; x < width; ++x) {
        let hasWall = false;

        if (y == 0) {
          hasWall = answerData[start + x][0] >= 0;
        } else if (y == height) {
          hasWall = answerData[start + (height - 1) * width + x][0] >= 0;
        } else {
          const a = answerData[start + (y - 1) * width + x];
          const b = answerData[start + y * width + x];
          hasWall = a[0] !== b[0] || a[1] !== b[1];
        }

        if (hasWall) {
          items.push(
            <line
              key={`h${z},${y},${x}`}
              x1={x * gridSize + margin - thickBorderWidth * 0.5}
              y1={yOffset + y * gridSize + margin}
              x2={(x + 1) * gridSize + margin + thickBorderWidth * 0.5}
              y2={yOffset + y * gridSize + margin}
              strokeWidth={thickBorderWidth}
              stroke="#333333"
            />,
          );
        }
      }
    }
  }

  return (
    <svg height={svgHeight} width={svgWidth}>
      {items}
    </svg>
  );
};

export type SolverPanelProps = {
  pieces: DetailedPiece[];
  board: number[][][];
};

export const SolverPanel = (props: SolverPanelProps) => {
  const { pieces, board } = props;

  const [index, setIndex] = useState(0);
  const [answerState, setAnswerState] = useState<
    { answers: Answers; board: number[][][] } | undefined
  >(undefined);

  const onSolve = () => {
    const problem = {
      pieces: pieces.map((p) => p.shape),
      piece_count: pieces.map((p) => p.count),
      board,
    };
    const answers = solve(problem);

    setAnswerState({ answers, board });
    setIndex(0);
  };

  const actualIndex =
    answerState !== undefined
      ? Math.min(index, answerState.answers.len() - 1)
      : 0;

  const updateIndex = (mode: number) => {
    if (answerState === undefined) {
      return;
    }
    if (mode === -2) {
      setIndex(0);
    } else if (mode === -1) {
      setIndex(Math.max(actualIndex - 1, 0));
    } else if (mode === 1) {
      setIndex(Math.min(actualIndex + 1, answerState.answers.len() - 1));
    } else if (mode === 2) {
      setIndex(answerState.answers.len() - 1);
    }
  };
  return (
    <Box
      sx={{
        border: 2,
        borderColor: "#999999",
        margin: 1,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Toolbar variant="dense" sx={{ backgroundColor: "#ddffff" }}>
        <Typography variant="h6" color="inherit" component="div">
          Solver
        </Typography>
        <IconButton
          size="small"
          edge="start"
          color="inherit"
          sx={{ marginLeft: 1 }}
          onClick={onSolve}
        >
          <Search />
        </IconButton>
        <IconButton
          size="small"
          edge="start"
          color="inherit"
          disabled={answerState === undefined || actualIndex === 0}
          onClick={() => updateIndex(-2)}
        >
          <KeyboardDoubleArrowLeft />
        </IconButton>
        <IconButton
          size="small"
          edge="start"
          color="inherit"
          disabled={answerState === undefined || actualIndex === 0}
          onClick={() => updateIndex(-1)}
        >
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          size="small"
          edge="start"
          color="inherit"
          disabled={
            answerState === undefined ||
            actualIndex >= answerState.answers.len() - 1
          }
          onClick={() => updateIndex(1)}
        >
          <KeyboardArrowRight />
        </IconButton>
        <IconButton
          size="small"
          edge="start"
          color="inherit"
          disabled={
            answerState === undefined ||
            actualIndex >= answerState.answers.len() - 1
          }
          onClick={() => updateIndex(2)}
        >
          <KeyboardDoubleArrowRight />
        </IconButton>
        {answerState !== undefined && (
          <Typography color="inherit" sx={{ marginLeft: 1 }}>
            {actualIndex + 1} / {answerState.answers.len()}
          </Typography>
        )}
      </Toolbar>
      <Box sx={{ height: "320px", overflowY: "scroll" }}>
        {answerState !== undefined && answerState.answers.len() === 0 && (
          <Box>
            <Typography color="error">No solution</Typography>
          </Box>
        )}
        {answerState !== undefined && answerState.answers.len() > 0 && (
          <LayerwiseAnswerBoard
            answer={answerState.answers.get(actualIndex)}
            dims={[
              answerState.board.length,
              answerState.board[0].length,
              answerState.board[0][0].length,
            ]}
            gridSize={32}
          />
        )}
      </Box>
    </Box>
  );
};
