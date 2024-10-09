import { useState } from "react";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  Button,
} from "@mui/material";
import { ExpandMore, GridOn, Menu as MenuIcon } from "@mui/icons-material";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { PiecesManager } from "./PiecesManager";
import { ShapeEditor } from "./ShapeEditor";
import { SolverPanel } from "./SolverPanel";
import { presets } from "./Presets";
import { openDialog, AutoMuiDialog } from "./dialog";
import { DetailedPiece } from "./shape";
// import "./App.css";

function App() {
  const [board, setBoard] = useState<number[][][]>([[[1]]]);
  const [pieces, setPieces] = useState<DetailedPiece[]>([
    {
      shape: [[[1]]],
      count: 1,
    },
  ]);
  const [shapeEditorGeneration, setShapeEditorGeneration] = useState(0);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpenAppMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseAppMenu = () => {
    setAnchorEl(null);
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
    setAnchorEl(null);
  };
  const onNewBoard = async () => {
    const newBoardShape = await openDialog(PieceEditorDialog, {
      width: 1,
      height: 1,
      depth: 1,
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
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="md">
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <IconButton
            size="small"
            edge="start"
            color="inherit"
            sx={{ ml: -2, mr: 1 }}
            aria-controls={anchorEl !== null ? "app-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl !== null ? "true" : undefined}
            onClick={handleOpenAppMenu}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" component="div">
            Polymate
          </Typography>
        </Toolbar>
      </AppBar>

      <Grid container spacing={0}>
        <Grid item xs={6}>
          <PiecesManager
            pieces={pieces}
            onChange={(pieces) => setPieces(pieces)}
          />
        </Grid>
        <Grid item xs={6}>
          <Box
            sx={{
              border: 2,
              borderColor: "#999999",
              margin: 1,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Toolbar variant="dense" sx={{ backgroundColor: "#ffffcc" }}>
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

      <Menu
        id="app-menu"
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={handleCloseAppMenu}
        MenuListProps={{ "aria-labelledby": "app-menu" }}
      >
        <MenuItem onClick={onNewProblem}>New Problem</MenuItem>
        <Accordion
          elevation={0}
          sx={{ backgroundColor: "transparent" }}
          disableGutters
        >
          <AccordionSummary
            sx={{ padding: 0, minHeight: 0 }}
            expandIcon={<ExpandMore />}
          >
            <MenuItem sx={{ margin: 0 }}>Load presets</MenuItem>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 0, margin: 0 }}>
            {presets.map((preset, i) => (
              <MenuItem key={`${i}`} onClick={() => onUsePreset(i)}>
                {preset.name}
              </MenuItem>
            ))}
          </AccordionDetails>
        </Accordion>
      </Menu>
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
