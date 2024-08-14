import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import { Add } from "@mui/icons-material";
import {
  Box,
  Grid,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";

import { ShapePreview } from "./ShapePreview";
import { ShapeEditor } from "./ShapeEditor";

const isEmpty = (shape: number[][][]): boolean => {
  for (let z = 0; z < shape.length; ++z) {
    for (let y = 0; y < shape[z].length; ++y) {
      for (let x = 0; x < shape[z][y].length; ++x) {
        if (shape[z][y][x] === 1) {
          return false;
        }
      }
    }
  }
  return true;
};

export type PiecesManagerProps = {
  pieces: number[][][][];
  onChange: (pieces: number[][][][]) => void;
};

export const PiecesManager = (props: PiecesManagerProps) => {
  const pieceEditorDialogRef = useRef<PieceEditorDialogRefType>(null);

  const { pieces, onChange } = props;

  const onEditPiece = async (index: number) => {
    const newShape = await pieceEditorDialogRef.current!.open(pieces[index]);
    if (newShape) {
      const newShapes = [];
      for (let i = 0; i < pieces.length; ++i) {
        newShapes.push(i === index ? newShape : pieces[i]);
      }
      onChange(newShapes);
    }
  };

  const onAddPiece = async () => {
    const newShape = await pieceEditorDialogRef.current!.open([[[0]]]);
    if (newShape) {
      onChange([...pieces, newShape]);
    }
  };

  const onRemovePiece = (index: number) => {
    onChange(pieces.filter((_piece, i) => i !== index));
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
          onClick={onAddPiece}
        >
          <Add />
        </IconButton>
      </Toolbar>
      <Box sx={{ overflowY: "scroll", height: "320px" }}>
        <Grid container spacing={0}>
          {pieces.map((shape, index) => (
            <Grid item xs="auto" key={index}>
              <Button
                sx={{ border: 1, borderColor: "#aaaaaa", margin: 0.5 }}
                onClick={() => onEditPiece(index)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onRemovePiece(index);
                }}
              >
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
        </Grid>
      </Box>
      <PieceEditorDialog ref={pieceEditorDialogRef} />
    </Box>
  );
};

type PieceDialogState = {
  open: boolean;
  isEmptyError: boolean;
  piece: number[][][];
  callback?: (value?: number[][][]) => void;
};

type PieceEditorDialogRefType = {
  open(initialPiece: number[][][]): Promise<number[][][] | undefined>;
};

const PieceEditorDialog = forwardRef((_props, ref) => {
  const [state, setState] = useState<PieceDialogState>({
    open: false,
    isEmptyError: false,
    piece: [[[0]]],
  });

  useImperativeHandle(ref, () => {
    return {
      open(initialPiece: number[][][]): Promise<number[][][] | undefined> {
        return new Promise((resolve: (value?: number[][][]) => void) => {
          setState({
            open: true,
            isEmptyError: false,
            piece: initialPiece,
            callback: resolve,
          });
        });
      },
    };
  });

  const onClick = (ok: boolean) => {
    if (ok && isEmpty(state.piece)) {
      setState({ ...state, isEmptyError: true });
      return;
    }

    state.callback!(ok ? state.piece : undefined);
    setState({ open: false, isEmptyError: false, piece: [[[0]]] });
  };

  return (
    <Dialog open={state.open}>
      <DialogTitle>Edit Piece</DialogTitle>
      <DialogContent>
        <Box sx={{ height: "320px" }}>
          <ShapeEditor
            shape={state.piece}
            onChange={(shape) => setState({ ...state, piece: shape })}
            planarGridSize={32}
          />
        </Box>
        {state.isEmptyError && (
          <Typography color="error">Piece must not be empty</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClick(false)}>Cancel</Button>
        <Button onClick={() => onClick(true)}>OK</Button>
      </DialogActions>
    </Dialog>
  );
});
