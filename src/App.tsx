import React, { useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Container,
  Toolbar,
  Typography,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
} from "@mui/material";
import { GridOn } from "@mui/icons-material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { presets } from "./Presets";
import { PiecesManager } from "./PiecesManager";
import { ShapeEditor } from "./ShapeEditor";
import { SolverPanel } from "./SolverPanel";
import { openDialog, AutoMuiDialog } from "./dialog";
import { DetailedPiece } from "./shape";
import "./App.css";

function App() {
  const [board, setBoard] = useState<number[][][]>([[[1]]]);
  const [pieces, setPieces] = useState<DetailedPiece[]>([
    {
      shape: [[[1]]],
      count: 1,
    },
  ]);
  const [shapeEditorGeneration, setShapeEditorGeneration] = useState(0);

  const [presetMenuAnchorEl, setPresetMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const handleOpenPresetMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPresetMenuAnchorEl(event.currentTarget);
  };

  const handleClosePresetMenu = () => {
    setPresetMenuAnchorEl(null);
  };

  const onNewProblem = () => {
    // TODO: show confirmation dialog
    setBoard([[[1]]]);
    setPieces([
      {
        shape: [[[1]]],
        count: 1,
      },
    ]);
    setShapeEditorGeneration(shapeEditorGeneration ^ 1);
  };
  const onNewBoard = async () => {
    const newBoardShape = await openDialog(PieceEditorDialog, {
      width: board[0][0].length,
      height: board[0].length,
      depth: board.length,
    });
    if (newBoardShape !== undefined) {
      setBoard(
        Array.from({ length: newBoardShape.depth }, () =>
          Array.from({ length: newBoardShape.height }, () =>
            Array.from({ length: newBoardShape.width }, () => 1),
          ),
        ),
      );
      setShapeEditorGeneration(shapeEditorGeneration ^ 1);
    }
  };

  const onUsePreset = (presetIdx: number) => {
    console.log(presets[presetIdx].board);
    setBoard(presets[presetIdx].board);
    setPieces(presets[presetIdx].pieces);
    setShapeEditorGeneration(shapeEditorGeneration ^ 1);
  };

  return (
    <Container maxWidth="md">
      <Box>
        <Toolbar variant="dense" className="app-toolbar">
          <IconButton
            size="small"
            edge="start"
            color="inherit"
            sx={{ ml: -2 }}
            onClick={onNewProblem}
          >
            <AddBoxIcon />
          </IconButton>
          <IconButton
            size="small"
            edge="start"
            color="inherit"
            onClick={handleOpenPresetMenu}
          >
            <LibraryBooksIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" component="div">
            Polymate
          </Typography>
        </Toolbar>
      </Box>

      <Menu
        id="preset-menu"
        anchorEl={presetMenuAnchorEl}
        open={presetMenuAnchorEl !== null}
        onClose={handleClosePresetMenu}
        MenuListProps={{ "aria-labelledby": "preset-menu" }}
      >
        {presets.map((preset, i) => (
          <MenuItem
            key={`${i}`}
            onClick={() => {
              onUsePreset(i);
              handleClosePresetMenu();
            }}
          >
            {preset.name}
          </MenuItem>
        ))}
      </Menu>

      <Grid container spacing={0} sx={{ backgroundColor: "#f5f5f5" }}>
        <Grid item xs={6}>
          <PiecesManager
            pieces={pieces}
            onChange={(pieces) => setPieces(pieces)}
          />
        </Grid>
        <Grid item xs={6}>
          <Box className="toolbox">
            <Toolbar variant="dense" className="board-toolbar">
              <Typography variant="h6" color="inherit" component="div">
                Board
              </Typography>
              <IconButton
                size="small"
                edge="start"
                color="inherit"
                sx={{ marginLeft: "auto" }}
                onClick={onNewBoard}
              >
                <GridOn />
              </IconButton>
            </Toolbar>
            <Box sx={{ height: "320px" }}>
              <ShapeEditor
                shape={board}
                onChange={(shape) => setBoard(shape)}
                planarGridSize={32}
                key={shapeEditorGeneration}
              />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <SolverPanel pieces={pieces} board={board} />
        </Grid>
      </Grid>
    </Container>
  );
}

type PieceEditorDialogType = { width: number; height: number; depth: number };

const PieceEditorDialog = (props: {
  initialValues: PieceEditorDialogType;
  close: (value?: PieceEditorDialogType) => void;
}) => {
  const { initialValues, close } = props;
  const [values, setValues] = useState(initialValues);

  const onChange =
    (key: keyof PieceEditorDialogType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = parseInt(e.target.value);
      if (isNaN(n) || n < 1) {
        return;
      }
      setValues({ ...values, [key]: n });
    };

  return (
    <AutoMuiDialog>
      <DialogTitle>New board</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
          <TextField
            label="Width"
            type="number"
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
            inputProps={{ min: 1 }}
            variant="standard"
            value={values.width}
            onChange={onChange("width")}
          />

          <TextField
            label="Height"
            type="number"
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
            inputProps={{ min: 1 }}
            variant="standard"
            value={values.height}
            onChange={onChange("height")}
          />

          <TextField
            label="Depth"
            type="number"
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
            inputProps={{ min: 1 }}
            variant="standard"
            value={values.depth}
            onChange={onChange("depth")}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()}>Cancel</Button>
        <Button onClick={() => close(values)}>OK</Button>
      </DialogActions>
    </AutoMuiDialog>
  );
};

export default App;
