import { Dialog, DialogProps } from "@mui/material";
import { createElement, createContext, useContext, useState } from "react";
import { createRoot } from "react-dom/client";

const dialogRoots = new Map();
const DialogOpenStateContext = createContext(false);

const DialogWrapper = <T,>(props: {
  dialogImpl: (props: {
    initialValues: T;
    close: (values?: T) => void;
  }) => JSX.Element;
  initialValues: T;
  resolve: (value: T | undefined) => void;
}) => {
  const { dialogImpl, initialValues, resolve } = props;
  const [open, setOpen] = useState(true);

  return (
    <DialogOpenStateContext.Provider value={open}>
      {createElement(dialogImpl, {
        initialValues,
        close: (values) => {
          setOpen(false);
          resolve(values);
        },
      })}
    </DialogOpenStateContext.Provider>
  );
};

export const openDialog = <T,>(
  dialogImpl: (props: {
    initialValues: T;
    close: (values: T | undefined) => void;
  }) => JSX.Element,
  initialValues: T,
): Promise<T | undefined> => {
  if (!dialogRoots.has(dialogImpl)) {
    const newRoot = document.createElement("div");
    document.body.appendChild(newRoot);
    dialogRoots.set(dialogImpl, newRoot);
  }

  const dialogRoot = dialogRoots.get(dialogImpl)!;

  return new Promise((resolve) => {
    createRoot(dialogRoot).render(
      <DialogWrapper
        dialogImpl={dialogImpl}
        initialValues={initialValues}
        resolve={resolve}
      />,
    );
  });
};

export type AutoMuiDialogProps = Omit<DialogProps, "open">;

export const AutoMuiDialog = (props: AutoMuiDialogProps) => {
  const open = useContext(DialogOpenStateContext);
  return createElement(Dialog, { ...props, open }, props.children);
};
