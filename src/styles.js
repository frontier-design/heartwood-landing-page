import { createGlobalStyle } from "styled-components";
import { fontFaces } from "./themes.js";

const GlobalStyle = createGlobalStyle`
  ${fontFaces}

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-weight: normal;
  }

  html {
    overflow-x: hidden;
  }

  body {
    /* clip, not hidden: html's overflow already propagates to the viewport, so a
       hidden here would make body its own (never-scrolling) scroll container and
       break position:sticky for every descendant. */
    overflow-x: clip;
    font-family: system-ui, -apple-system, sans-serif;
  }
`;

export default GlobalStyle;
