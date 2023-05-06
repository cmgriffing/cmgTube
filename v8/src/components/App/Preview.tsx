import React, {
  PropsWithoutRef,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import { createStyles, getStylesRef, rem, Flex, Button } from "@mantine/core";
import { PostMessageType } from "../../types/types";
import { useRefCallback } from "../../hooks/use-ref-callback";

const useStyles = createStyles((theme) => ({
  previewIframe: {
    border: "none",
    width: "100%",
  },
  previewLabel: {
    position: "absolute",
    top: 0,
    left: 0,
    padding: "0 0.5rem 0.15rem",
    color: "white",
    background: theme.colors.gray[5],
    borderRadius: "0.2rem 0 0.5rem 0",
    fontSize: "0.6rem",
    textTransform: "uppercase",
    fontWeight: 700,
  },
  wrapper: {
    border: `4px solid ${theme.colors.blue[5]}`,
    borderRadius: "8px",
    margin: "0 1rem",
    position: "relative",
  },
}));

interface PreviewProps {
  themeId?: string;
  presetId?: string;
  customCss?: string;
}

export function Preview({
  themeId,
  presetId,
  customCss,
}: PropsWithoutRef<PreviewProps>) {
  const { classes } = useStyles();
  const iframe = useRef<HTMLIFrameElement>(null);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (iframe?.current?.contentWindow) {
      console.log({ customCss });
      iframe.current.contentWindow?.postMessage({
        type: PostMessageType.Styles,
        styles: customCss,
      });
    }
  }, [customCss, iframe.current]);

  return (
    <div className={classes.wrapper}>
      <label className={classes.previewLabel}>Preview</label>
      <Flex mih={"150px"}>
        <iframe
          ref={iframe}
          className={classes.previewIframe}
          src={`${location.origin}/overlay/${themeId}/${presetId}`}
        />
      </Flex>
      <Button
        m={"3px"}
        w="calc(100% - 6px)"
        onClick={() => {
          if (iframe.current?.contentWindow) {
            iframe?.current?.contentWindow.postMessage({
              type: PostMessageType.Active,
              active: !activated,
            });
          }
          setActivated(!activated);
        }}
      >
        {activated ? "Stop" : "Animate"}
      </Button>
    </div>
  );
}
