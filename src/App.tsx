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
} from "@mui/material";
import { ExpandMore, Menu as MenuIcon } from "@mui/icons-material";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { PiecesManager } from "./PiecesManager";
import { ShapeEditor } from "./ShapeEditor";
import { SolverPanel } from "./SolverPanel";
import { presets } from "./Presets";
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
    setAnchorEl(null);
  };
  const onUsePreset = (presetIdx: number) => {
    console.log(presets[presetIdx].board);
    setBoard(presets[presetIdx].board);
    setPieces(presets[presetIdx].pieces);
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
            </Toolbar>
            <Box sx={{ height: "320px" }}>
              <ShapeEditor
                shape={board}
                onChange={(shape) => setBoard(shape)}
                planarGridSize={32}
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

export default App;
