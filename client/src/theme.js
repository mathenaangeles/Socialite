import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0139e2",
      contrastText: "#ffffff", 
    },
    secondary: {
      main: "#7cbedf",
      contrastText: "#000000",
    },
    background: {
      default: "#000000", 
      paper: "#121212", 
    },
    text: {
      primary: "#ffffff", 
      secondary: "#cccccc", 
    },
  },
  typography: {
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
    h5: {
        fontWeight: "bold",
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "20px", 
          textTransform: "none",
        },
        outlined: {
            border: "1px solid",
        }
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        ".slick-dots li button:before": {
          color: "white !important",
          fontSize: "12px",
        },
        ".slick-dots li.slick-active button:before": {
          color: "white !important", 
        },
      },
    },
  },
});

export default theme;
