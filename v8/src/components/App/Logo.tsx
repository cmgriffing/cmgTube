import React from "react";
import { createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  svg: {
    background: theme.colors.blue[5],
    padding: "2px",
    borderRadius: "4px",
    color: "white",
  },
}));

export function Logo({ size = 42 }: { size?: number }) {
  const { classes } = useStyles();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 24"
      className={classes.svg}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M2 12a5 5 0 0 0 5 5a8 8 0 0 1 5 2a8 8 0 0 1 5-2a5 5 0 0 0 5-5V7h-5a8 8 0 0 0-5 2a8 8 0 0 0-5-2H2Z" />
        <path d="M6 11c1.5 0 3 .5 3 2c-2 0-3 0-3-2Zm12 0c-1.5 0-3 .5-3 2c2 0 3 0 3-2Z" />
      </g>
    </svg>
  );
}
