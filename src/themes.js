import { css } from "styled-components";
import ppFrama from "./assets/fonts/PP-Frama-Variable.woff2";
import ppRightSerifMono from "./assets/fonts/PPRightSerifMono-Variable.woff2";

export const fontFaces = css`
  @font-face {
    font-family: "PP Frama";
    src: url(${ppFrama}) format("woff2");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: "PP Right Serif Mono";
    src: url(${ppRightSerifMono}) format("woff2");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }
`;

export const monoCallout = css`
  font-family: "PP Right Serif Mono", monospace;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: clamp(0.875rem, 1.15vw, 1.5rem);
`;

export const displayHeading = css`
  font-family: "PP Frama", sans-serif;
  font-weight: 500;
  line-height: 1.25;
  font-size: clamp(1.35rem, 2.5vw, 3.25rem);
  text-wrap: pretty;
`;

export const bodySerif = css`
  font-family: "PP Right Serif Mono", monospace;
  font-weight: 300;
  line-height: 1.6;
  font-size: clamp(0.95rem, 1.05vw, 1.25rem);
`;

export const freightBody = css`
  font-family: "freight-text-pro", Georgia, serif;
  font-weight: 400;
  line-height: 1.35;
  font-size: clamp(1.25rem, 1.05vw, 1.25rem);
`;

export const colors = {
  teal: "#2697AA",
  black: "#212121",
  lightBlue: "#C5DCEA",
  white: "#ededed",
  gray: "#f4f4f4",
};
