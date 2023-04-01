import { useEffect, useState } from "react";

import { CssData, useCssData } from "../../hooks/use-css-data";
import { AvatarProps } from "../../types/types";

import "./SouthParkCanadian.css";

interface SouthParkCanadianConfig {
  idle: string;
  activeTop: string;
  activeBottom: string;
  random: string[];
}

export function AvatarSouthParkCanadian({ isActive }: AvatarProps) {
  const [config, setConfig] = useState<SouthParkCanadianConfig>({
    idle: "",
    activeTop: "",
    activeBottom: "",
    random: [],
  });
  const [randomImage, setRandomImage] = useState("");

  // Get Data from computed styles
  const cssData = useCssData({
    idle: "--images-idle",
    active: "--images-active",
    activeSliceY: "--images-active-slice-y",
    random_1: "--images-random-1",
    random_2: "--images-random-2",
  });

  useEffect(() => {
    const random = Object.entries(cssData)
      .filter(([key, value]) => {
        return key.indexOf("random") > -1;
      })
      .map(([key, value]) => {
        return value as string;
      });

    const canvas = document.createElement("canvas");
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    let ctx = canvas.getContext("2d");
    if (ctx) {
      const img = new Image();
      // img.height = window.innerHeight;
      img.onload = function () {
        canvas.height = img.height;
        canvas.width = img.width;

        ctx = canvas.getContext("2d");
        const rawSliceY = parseInt(cssData.activeSliceY);
        const slicePercentY = rawSliceY / 100;
        if (isNaN(slicePercentY)) {
          return;
        }
        if (ctx) {
          // draw top half
          ctx.drawImage(img, 0, 0);
          const sliceHeight = img.height * slicePercentY;
          // TODO: reevaluate img.height instead of window
          ctx.clearRect(0, sliceHeight, img.width, img.height - sliceHeight);
          const activeTop = canvas.toDataURL();

          ctx.clearRect(0, 0, img.width, img.height);

          // draw bottom half

          ctx.drawImage(img, 0, 0);
          // TODO: reevaluate img.height instead of window
          ctx.clearRect(0, 0, img.width, sliceHeight);
          const activeBottom = canvas.toDataURL();

          setConfig({
            idle: cssData.idle,
            activeTop,
            activeBottom,
            random,
          });
        }
      };
      img.src = cssData.active;
    }
  }, [cssData]);

  useEffect(() => {
    const interval = setInterval(() => {
      document.documentElement.style.setProperty(
        "--random-head-rotation",
        `${Math.ceil(Math.random() * 40 - 20)}deg`
      );
    }, 500);

    return function () {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const showRandom = Math.random() > 0.3;

      if (showRandom) {
        setRandomImage(
          config.random[Math.floor(Math.random() * config.random.length)] || ""
        );

        setTimeout(() => {
          setRandomImage("");
        }, 1000);
      }
    }, 5000);

    return function () {
      clearInterval(interval);
    };
  });

  return (
    <>
      {isActive && (
        <>
          <img
            height={200}
            width={200}
            className="active active-top"
            src={config.activeTop}
          />

          <img
            height={200}
            width={200}
            className="active"
            src={config.activeBottom}
          />
        </>
      )}
      {!isActive && (
        <img
          height={200}
          width={200}
          className="idle"
          src={randomImage || config.idle}
        />
      )}
    </>
  );
}
