import { useState } from "react";

import { Box, Grid } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { PiecesManager } from "./PiecesManager";
import { ShapeEditor } from "./ShapeEditor";
import { SolverPanel } from "./SolverPanel";
// import "./App.css";

function App() {
  const [board, setBoard] = useState<number[][][]>([[[0]]]);
  const [pieces, setPieces] = useState<number[][][][]>([[[[1]]]]);

  return (
    <Container maxWidth="md">
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <Typography
            variant="h6"
            color="inherit"
            component="div"
            sx={{ flexGlow: 1 }}
          >
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
    </Container>
  );
}

export default App;
