import { Add } from "@mui/icons-material";
import {
  Box,
  Grid,
  Toolbar,
  Typography,
  IconButton,
  Button,
} from "@mui/material";

import { ShapePreview } from "./ShapePreview";

export const PiecesManager = () => {
  const shapes = [
    [
      [
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
    ],
    [[[1]]],
    [[[1, 1, 1, 1, 1]]],
    [
      [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0],
      ],
    ],
    [[[1]]],
    [
      [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0],
      ],
    ],
    [
      [
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 0],
      ],
    ],
  ];

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
        <Grid container spacing={0}>
          {shapes.map((shape, index) => (
            <Grid item xs="auto" key={index}>
              <Button sx={{ border: 1, borderColor: "#aaaaaa", margin: 0.5 }}>
                <ShapePreview
                  shape={shape}
                  color="#ccccff"
                  maxGridSize={20}
                  height={90}
                  maxWidth={90}
                  padding={0.5}
                />
              </Button>
            </Grid>
          ))}
        </Grid>{" "}
      </Box>
    </Box>
  );
};
