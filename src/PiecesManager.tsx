import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Add } from "@mui/icons-material";
import {
  Box,
  Grid,
  Toolbar,
  Typography,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
} from "@mui/material";

import { ShapePreview } from "./ShapePreview";
import { ShapeEditor } from "./ShapeEditor";
import { DetailedPiece, isEmpty } from "./shape";

import { openDialog, AutoMuiDialog } from "./dialog";
import { TooltipButton } from "./components/tooltipButton";

export type PiecesManagerProps = {
  pieces: DetailedPiece[];
  onChange: (pieces: DetailedPiece[]) => void;
};

export const PiecesManager = (props: PiecesManagerProps) => {
  const { pieces, onChange } = props;

  const onEditPiece = async (index: number) => {
    const newShape = await openDialog(PieceEditorDialog, pieces[index]);
    if (newShape) {
      const newShapes = [];
      for (let i = 0; i < pieces.length; ++i) {
        newShapes.push(i === index ? newShape : pieces[i]);
      }
      onChange(newShapes);
    }
  };

  const onAddPiece = async () => {
    const newShape = await openDialog(PieceEditorDialog, {
      shape: [[[1]]],
      count: 1,
    });
    if (newShape) {
      onChange([...pieces, newShape]);
    }
  };

  const onRemovePiece = (index: number) => {
    onChange(pieces.filter((_piece, i) => i !== index));
  };

  const { t } = useTranslation();

  return (
    <Box className="toolbox">
      <Toolbar variant="dense" className="pieces-toolbar">
        <Typography
          variant="h6"
          color="inherit"
          component="div"
          sx={{ flexGlow: 1 }}
        >
          {t("pieces")}
        </Typography>
        <TooltipButton
          title={t("addPiece")}
          size="small"
          edge="start"
          color="inherit"
          sx={{ marginLeft: "auto" }}
          onClick={onAddPiece}
        >
          <Add />
        </TooltipButton>
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
    </Box>
  );
};

const toPlanarPiece = (shape: number[][][]) => {
  if (shape.length === 1) {
    return shape;
  } else if (shape[0].length === 1) {
    const flat = [];
    for (let i = 0; i < shape.length; ++i) {
      const row = [];
      for (let j = 0; j < shape[i][0].length; ++j) {
        row.push(shape[i][0][j]);
      }
      flat.push(row);
    }
    return [flat];
  } else if (shape[0][0].length === 1) {
    const flat = [];
    for (let i = 0; i < shape.length; ++i) {
      const row = [];
      for (let j = 0; j < shape[i].length; ++j) {
        row.push(shape[i][j][0]);
      }
      flat.push(row);
    }
    return [flat];
  } else {
    return shape; // not planar
  }
};

type PieceEditorDialogType = { shape: number[][][]; count: number };

const PieceEditorDialog = (props: {
  initialValues: PieceEditorDialogType;
  close: (value?: PieceEditorDialogType) => void;
}) => {
  const { initialValues, close } = props;
  const [isEmptyError, setIsEmptyError] = useState(false);

  const [values, setValues] = useState(initialValues);
  const onChangeCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseInt(e.target.value);
    if (isNaN(n) || n < 1) {
      return;
    }
    setValues({ ...values, count: n });
  };

  const { t } = useTranslation();

  return (
    <AutoMuiDialog>
      <DialogTitle>{t("editPiece")}</DialogTitle>
      <DialogContent>
        <Box sx={{ height: "320px" }}>
          <ShapeEditor
            shape={values.shape}
            onChange={(shape) => setValues({ ...values, shape })}
            planarGridSize={32}
          />
        </Box>
        {isEmptyError && (
          <Typography color="error">{t("pieceEmpty")}</Typography>
        )}
        <TextField
          label={t("pieceCount")}
          type="number"
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2 }}
          inputProps={{ min: 1 }}
          variant="standard"
          value={values.count}
          onChange={onChangeCount}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()}>{t("cancel")}</Button>
        <Button
          onClick={() => {
            if (isEmpty(values.shape)) {
              setIsEmptyError(true);
              return;
            }
            const ret = {
              shape: toPlanarPiece(values.shape),
              count: values.count,
            };
            close(ret);
          }}
        >
          {t("ok")}
        </Button>
      </DialogActions>
    </AutoMuiDialog>
  );
};
