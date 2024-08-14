import { useState } from "react";

import { solve, Answer, Answers } from "./Solver";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  Search,
} from "@mui/icons-material";
import { Box, IconButton, Toolbar, Typography } from "@mui/material";

const PlanarAnswerBoard = (props: {
  answer: Answer;
  height: number;
  width: number;
  gridSize: number;
}) => {
  // TODO: better coloring
  const { answer, height, width, gridSize } = props;
  const answerData = answer.data;

  const margin = 5;
  const svgHeight = height * gridSize + margin * 2;
  const svgWidth = width * gridSize + margin * 2;

  const items = [];

  const colors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#00ffff",
    "#ff00ff",
    "#ff8000",
    "#ff0080",
    "#80ff00",
    "#0080ff",
  ];

  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const item = answerData[y * width + x];

      if (item[0] < 0) {
        items.push(
          <rect
            key={`${y},${x}`}
            x={x * gridSize + margin}
            y={y * gridSize + margin}
            width={gridSize}
            height={gridSize}
            fill="#cccccc"
            stroke="black"
          />,
        );
      } else {
        items.push(
          <rect
            key={`${y},${x}`}
            x={x * gridSize + margin}
            y={y * gridSize + margin}
            width={gridSize}
            height={gridSize}
            fill={colors[item[0] % colors.length]}
            stroke="black"
          />,
        );
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
  pieces: number[][][][];
  board: number[][][];
};

export const SolverPanel = (props: SolverPanelProps) => {
  const { pieces, board } = props;

  const [index, setIndex] = useState(0);
  const [answerState, setAnswerState] = useState<
    { answers: Answers; board: number[][][] } | undefined
  >(undefined);

  const onSolve = () => {
    const problem = { pieces, board };
    const answers = solve(problem);

    setAnswerState({ answers, board });
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
      <Box sx={{ height: "320px" }}>
        {answerState !== undefined && answerState.answers.len() === 0 && (
          <Box>
            <Typography color="error">No solution</Typography>
          </Box>
        )}
        {answerState !== undefined && answerState.answers.len() > 0 && (
          <PlanarAnswerBoard
            answer={answerState.answers.get(actualIndex)}
            height={answerState.board[0].length}
            width={answerState.board[0][0].length}
            gridSize={32}
          />
        )}
      </Box>
    </Box>
  );
};
