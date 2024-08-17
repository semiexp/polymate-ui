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
  TextField,
} from "@mui/material";

import { ShapePreview } from "./ShapePreview";
import { ShapeEditor } from "./ShapeEditor";
import { Shape, DetailedPiece, isEmpty } from "./shape";

export type PiecesManagerProps = {
  pieces: DetailedPiece[];
  onChange: (pieces: DetailedPiece[]) => void;
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
    const newShape = await pieceEditorDialogRef.current!.open({
      shape: [[[0]]],
      count: 1,
    });
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
          {pieces.map((piece, index) => (
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
                  shape={piece.shape}
                  count={piece.count}
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
  shape: Shape;
  count: number;
  callback?: (value?: DetailedPiece) => void;
};

type PieceEditorDialogRefType = {
  open(initialPiece: DetailedPiece): Promise<DetailedPiece | undefined>;
};

const PieceEditorDialog = forwardRef((_props, ref) => {
  const [state, setState] = useState<PieceDialogState>({
    open: false,
    isEmptyError: false,
    shape: [[[0]]],
    count: 1,
  });

  useImperativeHandle(ref, () => {
    return {
      open(initialPiece: DetailedPiece): Promise<DetailedPiece | undefined> {
        return new Promise((resolve: (value?: DetailedPiece) => void) => {
          setState({
            open: true,
            isEmptyError: false,
            shape: initialPiece.shape,
            count: initialPiece.count,
            callback: resolve,
          });
        });
      },
    };
  });

  const onClick = (ok: boolean) => {
    if (ok && isEmpty(state.shape)) {
      setState({ ...state, isEmptyError: true });
      return;
    }

    state.callback!(
      ok ? { shape: state.shape, count: state.count } : undefined,
    );
    setState({ open: false, isEmptyError: false, shape: [[[0]]], count: 1 });
  };

  const onChangeCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseInt(e.target.value);
    if (isNaN(n) || n < 1) {
      return;
    }
    setState({ ...state, count: n });
  };

  return (
    <Dialog open={state.open}>
      <DialogTitle>Edit Piece</DialogTitle>
      <DialogContent>
        <Box sx={{ height: "320px" }}>
          <ShapeEditor
            shape={state.shape}
            onChange={(shape) => setState({ ...state, shape })}
            planarGridSize={32}
          />
        </Box>
        {state.isEmptyError && (
          <Typography color="error">Piece must not be empty</Typography>
        )}
        <TextField
          label="Piece count"
          type="number"
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2 }}
          inputProps={{ min: 1 }}
          variant="standard"
          value={state.count}
          onChange={onChangeCount}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClick(false)}>Cancel</Button>
        <Button onClick={() => onClick(true)}>OK</Button>
      </DialogActions>
    </Dialog>
  );
});
