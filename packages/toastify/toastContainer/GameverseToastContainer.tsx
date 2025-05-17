import React from "react";
import { ToastContainer } from "react-toastify";
import { GameverseToastContainerProps } from "./GameverseToastContainer.type";

export const GameverseToastContainer = ({
  ...toastContainerProps
}: GameverseToastContainerProps) => {
  return <ToastContainer {...toastContainerProps} />;
};