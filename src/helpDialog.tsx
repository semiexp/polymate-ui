import { useTranslation } from "react-i18next";

import {
  Button,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import { AutoMuiDialog } from "./dialog";

export const HelpDialog = (props: {
  initialValues: unknown;
  close: (value?: unknown) => void;
}) => {
  const close = props.close;

  const { t } = useTranslation();

  return (
    <AutoMuiDialog>
      <DialogContent>
        <Typography variant="h5">{t("help.shapeEditor.title")}</Typography>
        <Typography variant="h6">
          {t("help.shapeEditor.planar.title")}
        </Typography>
        <Typography>{t("help.shapeEditor.planar.content1")}</Typography>
        <Typography>{t("help.shapeEditor.planar.content2")}</Typography>
        <Typography>{t("help.shapeEditor.planar.content3")}</Typography>
        <Typography variant="h6">
          {t("help.shapeEditor.cubic.title")}
        </Typography>
        <Typography>{t("help.shapeEditor.cubic.content1")}</Typography>
        <Typography>{t("help.shapeEditor.cubic.content2")}</Typography>
        <Typography>{t("help.shapeEditor.cubic.content3")}</Typography>
        <Typography>{t("help.shapeEditor.cubic.content4")}</Typography>
        <Typography>{t("help.shapeEditor.cubic.content5")}</Typography>
        <Typography variant="h5">{t("help.disclaimer.title")}</Typography>
        <Typography>{t("help.disclaimer.content")}</Typography>

        <Typography>
          <a href="licenses.txt">{t("help.licenses")}</a>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()}>{t("help.close")}</Button>
      </DialogActions>
    </AutoMuiDialog>
  );
};
