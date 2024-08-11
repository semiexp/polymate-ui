import { Add } from "@mui/icons-material";
import { Box, Grid, IconButton } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

// import "./App.css";

function App() {
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
          <Box
            sx={{
              border: 2,
              borderColor: "#999999",
              margin: 1,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Toolbar variant="dense" sx={{ backgroundColor: "#ffdddd" }}>
              <Typography
                variant="h6"
                color="inherit"
                component="div"
                sx={{ flexGlow: 1 }}
              >
                Pieces
              </Typography>
              <IconButton
                size="small"
                edge="start"
                color="inherit"
                sx={{ marginLeft: "auto" }}
              >
                <Add />
              </IconButton>
            </Toolbar>
            <Box sx={{ overflowY: "scroll", height: "320px" }}>
              <Typography>Lorem ipsum</Typography>
            </Box>
          </Box>
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
              <Typography>Lorem ipsum</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
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
            </Toolbar>
            <Box sx={{ height: "320px" }}>
              <Typography>Lorem ipsum</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
