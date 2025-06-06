import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { solveAsync, getAnswerAsync, terminateWorker, Answer } from "./Solver";
import { DetailedPiece } from "./shape";
import { CubicShapeManipulator, PointedCube } from "./cubicShapeManipulator";
import {
  Cancel,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  Search,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { TooltipButton } from "./components/tooltipButton";

const getColor = (id: number, selected: boolean, translucent?: boolean) => {
  const alpha = translucent ? 0.3 : 1.0;
  if (selected) {
    return `hsla(${(id % 12) * 30}, ${80 - (Math.floor(id / 12) % 2) * 40}%, 60%, ${alpha})`;
  } else {
    return `hsla(${(id % 12) * 30}, ${100 - (Math.floor(id / 12) % 2) * 50}%, 80%, ${alpha})`;
  }
};

const LayerwiseAnswerBoard = (props: {
  answer: Answer;
  pieceCounts: number[];
  dims: [number, number, number];
  gridSize: number;
}) => {
  // TODO: better coloring
  const { answer, pieceCounts, dims, gridSize } = props;
  const answerData = answer.data;

  const margin = 5;
  const svgHeight = ((dims[1] + 0.5) * dims[0] - 0.5) * gridSize + margin * 2;
  const svgWidth = dims[2] * gridSize + margin * 2;

  const items = [];

  const height = dims[1];
  const width = dims[2];

  const cumulativePieceIds = [];
  let cumulativePieceId = 0;
  for (let i = 0; i < pieceCounts.length; ++i) {
    const ids = [];
    for (let j = 0; j < pieceCounts[i]; ++j) {
      ids.push(cumulativePieceId++);
    }
    cumulativePieceIds.push(ids);
  }

  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);

  for (let z = 0; z < dims[0]; ++z) {
    const start = z * width * height;
    const yOffset = (dims[0] - 1 - z) * (height + 0.5) * gridSize;

    items.push(
      <rect
        key={`background,${z}`}
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
        const pieceId = cumulativePieceIds[item[0]][item[1]];

        items.push(
          <rect
            key={`${z},${y},${x}`}
            x={x * gridSize + margin}
            y={yOffset + y * gridSize + margin}
            width={gridSize}
            height={gridSize}
            fill={getColor(pieceId, pieceId === selectedPieceId)}
            onMouseOver={() => setSelectedPieceId(pieceId)}
            onMouseOut={() => setSelectedPieceId(null)}
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

const CubicAnswerBoard = (props: {
  answer: Answer;
  pieceCounts: number[];
  dims: [number, number, number];
}) => {
  const { answer, pieceCounts, dims } = props;
  const answerData = answer.data;

  const cumulativePieceIds: number[][] = [];
  let cumulativePieceId = 0;
  for (let i = 0; i < pieceCounts.length; ++i) {
    const ids = [];
    for (let j = 0; j < pieceCounts[i]; ++j) {
      ids.push(cumulativePieceId++);
    }
    cumulativePieceIds.push(ids);
  }

  const [isTranslucent, setIsTranslucent] = useState(
    new Array(cumulativePieceId).fill(false),
  );

  useEffect(() => {
    setIsTranslucent(new Array(cumulativePieceId).fill(false));
  }, [answer]);

  const cubes = [];
  for (let i = 0; i < dims[0]; ++i) {
    for (let j = 0; j < dims[1]; ++j) {
      for (let k = 0; k < dims[2]; ++k) {
        const item = answerData[i * dims[1] * dims[2] + j * dims[2] + k];
        if (item[0] < 0) continue;
        const pieceId = cumulativePieceIds[item[0]][item[1]];
        cubes.push({
          coord: { x: k, y: j, z: i },
          color: getColor(pieceId, false, isTranslucent[pieceId]),
          id: pieceId,
        });
      }
    }
  }

  const onClick = (pointed?: PointedCube) => {
    if (pointed) {
      const cube = pointed.cube;
      const item =
        answerData[cube.z * dims[1] * dims[2] + cube.y * dims[2] + cube.x];
      if (item[0] < 0) return;

      const pieceId = cumulativePieceIds[item[0]][item[1]];
      const newTranslucent = [...isTranslucent];
      newTranslucent[pieceId] = !newTranslucent[pieceId];
      setIsTranslucent(newTranslucent);
    }
  };

  return <CubicShapeManipulator cubes={cubes} onClick={onClick} />;
};

export type SolverPanelProps = {
  pieces: DetailedPiece[];
  board: number[][][];
};

export const SolverPanel = (props: SolverPanelProps) => {
  const { pieces, board } = props;

  const [index, setIndex] = useState(0);
  const [solvedProblem, setSolvedProblem] = useState<{
    numAnswers: number;
    pieceCounts: number[];
    board: number[][][];
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);

  const setIndexAndLoadAnswer = async (index: number) => {
    const ans = await getAnswerAsync(index);
    if (ans === null) {
      return;
    }
    setCurrentAnswer(ans);
    setIndex(index);
  };

  const onSolve = async () => {
    if (isRunning) {
      terminateWorker();
      return;
    }

    const pieceShapes = pieces.map((p) => p.shape);
    const pieceCounts = pieces.map((p) => p.count);
    const problem = {
      pieces: pieceShapes,
      piece_count: pieceCounts,
      board,
    };

    setIsRunning(true);
    const answers = await solveAsync(problem);
    setIsRunning(false);

    if (answers.status === "ok") {
      setSolvedProblem({ numAnswers: answers.numAnswers, pieceCounts, board });
      setCurrentAnswer(null);

      if (answers.numAnswers > 0) {
        await setIndexAndLoadAnswer(0);
      }
    } else {
      setSolvedProblem(null);
      setCurrentAnswer(null);
    }
  };

  const actualIndex =
    solvedProblem !== null ? Math.min(index, solvedProblem.numAnswers - 1) : 0;

  const updateIndex = async (mode: number) => {
    if (solvedProblem === null) {
      return;
    }
    if (mode === -2) {
      await setIndexAndLoadAnswer(0);
    } else if (mode === -1) {
      await setIndexAndLoadAnswer(Math.max(actualIndex - 1, 0));
    } else if (mode === 1) {
      await setIndexAndLoadAnswer(
        Math.min(actualIndex + 1, solvedProblem.numAnswers - 1),
      );
    } else if (mode === 2) {
      await setIndexAndLoadAnswer(solvedProblem.numAnswers - 1);
    }
  };

  const [tabValue, setTabValue] = useState(0);

  const { t } = useTranslation();

  return (
    <Box className="toolbox">
      <Toolbar variant="dense" className="solver-toolbar">
        <Typography variant="h6" color="inherit" component="div">
          {t("solver.title")}
        </Typography>
        <TooltipButton
          title={isRunning ? t("stopSolver") : t("runSolver")}
          size="small"
          edge="start"
          color="inherit"
          sx={{ marginLeft: 1 }}
          onClick={onSolve}
        >
          {isRunning ? <Cancel /> : <Search />}
        </TooltipButton>
        <TooltipButton
          title={t("solver.firstAnswer")}
          size="small"
          edge="start"
          color="inherit"
          disabled={
            solvedProblem === undefined || actualIndex === 0 || isRunning
          }
          onClick={async () => await updateIndex(-2)}
        >
          <KeyboardDoubleArrowLeft />
        </TooltipButton>
        <TooltipButton
          title={t("solver.prevAnswer")}
          size="small"
          edge="start"
          color="inherit"
          disabled={
            solvedProblem === undefined || actualIndex === 0 || isRunning
          }
          onClick={async () => await updateIndex(-1)}
        >
          <KeyboardArrowLeft />
        </TooltipButton>
        <TooltipButton
          title={t("solver.nextAnswer")}
          size="small"
          edge="start"
          color="inherit"
          disabled={
            solvedProblem === null ||
            actualIndex >= solvedProblem.numAnswers - 1 ||
            isRunning
          }
          onClick={async () => await updateIndex(1)}
        >
          <KeyboardArrowRight />
        </TooltipButton>
        <TooltipButton
          title={t("solver.lastAnswer")}
          size="small"
          edge="start"
          color="inherit"
          disabled={
            solvedProblem === null ||
            actualIndex >= solvedProblem.numAnswers - 1 ||
            isRunning
          }
          onClick={async () => await updateIndex(2)}
        >
          <KeyboardDoubleArrowRight />
        </TooltipButton>
        {solvedProblem !== null && (
          <Typography color="inherit" sx={{ marginLeft: 1 }}>
            {actualIndex + 1} / {solvedProblem.numAnswers}
          </Typography>
        )}
        {isRunning && <CircularProgress sx={{ marginLeft: 1 }} />}
      </Toolbar>
      <Box sx={{ height: "400px" }}>
        {solvedProblem !== null && solvedProblem.numAnswers === 0 && (
          <Box>
            <Typography color="error">{t("solver.noSolution")}</Typography>
          </Box>
        )}
        {solvedProblem !== null && solvedProblem.numAnswers > 0 && (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexFlow: "column",
            }}
          >
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                flexGrow: 0,
                flexShrink: 1,
                flexBasis: "auto",
              }}
            >
              <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)}>
                <Tab label={t("solver.layerwise")} />
                <Tab label={t("solver.cubic")} />
              </Tabs>
            </Box>
            {tabValue === 0 && currentAnswer !== null && (
              <Box sx={{ height: "100%", overflowY: "scroll" }}>
                <LayerwiseAnswerBoard
                  answer={currentAnswer}
                  pieceCounts={solvedProblem.pieceCounts}
                  dims={[
                    solvedProblem.board.length,
                    solvedProblem.board[0].length,
                    solvedProblem.board[0][0].length,
                  ]}
                  gridSize={32}
                />
              </Box>
            )}
            {tabValue === 1 && currentAnswer !== null && (
              <CubicAnswerBoard
                answer={currentAnswer}
                pieceCounts={solvedProblem.pieceCounts}
                dims={[
                  solvedProblem.board.length,
                  solvedProblem.board[0].length,
                  solvedProblem.board[0][0].length,
                ]}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
