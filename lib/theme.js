"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1d3c78",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f5c400",
    },
    background: {
      default: "#f0f2f5",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
