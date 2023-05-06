import React, { useState, useContext, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import OBSWebSocket from "obs-websocket-js";
const obs = new OBSWebSocket();

import { useCssData } from "./hooks/use-css-data";

import "./Overlay.css";
import { useOverlayObsCallbacks } from "./hooks/use-obs-callbacks";
import { OBS_EVENTS } from "./types/enums";
import { ObsInput, PostMessageType } from "./types/types";
import { AvatarComponent as SouthParkCanadianComponent } from "./components/Avatars/SouthParkCanadian";

const STYLES_ELEMENT_ID = "custom-styles";

type AvatarType = "south-park-ca";

const avatarMap: Record<
  AvatarType,
  (props: { isActive: boolean; renderTimestamp: number }) => JSX.Element
> = {
  "south-park-ca": SouthParkCanadianComponent,
};

export function Overlay() {
  const cssData = useCssData({
    obs_token: "--obs-token",
    obs_source_1: "--obs-source-1",
  });
  const { overlayType, preset } = useParams<{
    overlayType: AvatarType;
    preset: string;
  }>();
  const [forcedUpdateTimestamp, setForcedUpdateTimestamp] = useState(0);
  const [overriddenStyles, setOverriddenStyles] = useState("");

  const AvatarComponent =
    avatarMap[(overlayType as AvatarType) || "south-park-ca"] ||
    SouthParkCanadianComponent;

  const [active, setActive] = useState(false);
  const [overridingActive, setOverridingActive] = useState(false);
  const [config, setConfig] = useState({
    obsToken: cssData.obs_token,
    sources: [] as string[],
  });
  const previousToken = useRef("");

  useOverlayObsCallbacks(obs, {
    [OBS_EVENTS.ConnectionClosed]: async () => {
      console.log("CONNECTION CLOSED!");
    },
    // arg is not actually ObsInput
    [OBS_EVENTS.Identified]: async (event) => {
      console.debug("Identified", event);
    },
    [OBS_EVENTS.InputVolumeMeters]: async (event: any) => {
      const inputs: ObsInput[] = event.inputs.filter((input: ObsInput) => {
        return config.sources.includes(input.inputName);
      });

      for (const input of inputs) {
        for (const channel of input?.inputLevelsMul || []) {
          if (channel[0] > 0) {
            if (!overridingActive) {
              setActive(true);
            }
            return;
          }
        }
      }

      if (!overridingActive) {
        setActive(false);
      }
    },
  });

  useEffect(() => {
    const sources = Object.entries(cssData)
      .filter(([key, value]) => {
        return key.indexOf("source") > -1;
      })
      .map(([key, value]) => {
        return value as string;
      });

    setConfig({
      obsToken: cssData.obs_token,
      sources,
    });
  }, [cssData]);

  useEffect(() => {
    if (
      config.obsToken &&
      typeof config.obsToken === "string" &&
      config.obsToken !== previousToken.current
    ) {
      previousToken.current = config.obsToken;
      console.log("OBS Disconnecting");
      obs.disconnect();
      const token = new URL(config.obsToken);
      const password = token.password;
      token.password = "";
      const url = token.href;
      console.log("OBS Connecting");
      obs.connect(url, password, { eventSubscriptions: 1 << 16 });
    }

    return () => {
      obs.disconnect();
    };
  }, [config]);

  useEffect(() => {
    if (overlayType && preset) {
      fetch(`/${overlayType}/${preset}.json`)
        .then((response: any) => {
          return response.json();
        })
        .then((response) => {
          const cssVars = `
            :root {
              ${Object.entries(response)
                .map(([key, value]) => {
                  let formattedValue = `${value}`;

                  if (typeof value === "string") {
                    formattedValue = `"${value}"`;
                  }

                  return `${key}: ${formattedValue};\n\n`;
                })
                .join("")}
            }
          `;

          let styleElement = document.querySelector(`#${STYLES_ELEMENT_ID}`);
          if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = STYLES_ELEMENT_ID;
            document.head.appendChild(styleElement);
          }

          styleElement.innerHTML = cssVars;

          // setTimeout(() => {
          setForcedUpdateTimestamp(Date.now());
          // }, 100);
        })
        .catch((e) => {
          console.log(
            "Failed to fetch preset for overlay.",
            {
              preset,
              overlayType,
            },
            e
          );
        });
    }
  }, [overlayType, preset]);

  useEffect(() => {
    // consider throttling this function
    const messageHandler = (event: any) => {
      if (event.data.type === PostMessageType.Active) {
        setActive(!!event.data.active);
        setOverridingActive(!!event.data.active);
      }

      if (event.data.type === PostMessageType.Styles) {
        setOverriddenStyles(event.data.styles);
        setTimeout(() => {
          setForcedUpdateTimestamp(Date.now());
        }, 100);
      }
    };
    window.addEventListener("message", messageHandler, false);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

  useEffect(() => {
    let stylesElement = document.getElementById(STYLES_ELEMENT_ID);
    if (!stylesElement) {
      stylesElement = document.createElement("style");
      stylesElement.setAttribute("type", "text/css");
      stylesElement.id = STYLES_ELEMENT_ID;
      document.head.appendChild(stylesElement);
    }

    stylesElement.innerHTML = overriddenStyles;
    setForcedUpdateTimestamp(Date.now());
  }, [overriddenStyles]);

  return (
    <div className="overlay">
      <AvatarComponent
        isActive={active}
        renderTimestamp={forcedUpdateTimestamp}
      />
    </div>
  );
}
