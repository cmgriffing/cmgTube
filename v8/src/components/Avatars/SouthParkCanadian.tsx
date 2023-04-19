import { useEffect, useState, useRef, useCallback } from "react";
import { z } from "zod";

import { CssData, useCssData } from "../../hooks/use-css-data";
import {
  AvatarProps,
  AvatarAssetType,
  AvatarAssetMetadata,
  AvatarAssetComponentProps,
  AvatarAsset,
} from "../../types/types";
import { createZodAsset } from "./common";

import "./SouthParkCanadian.css";

const nameToCssVar = {
  idle: "--images-idle",
  active: "--images-active",
  activeSliceY: "--images-active-slice-y",
  random: (index: number) => `--images-random-${index}`,
};

function FOO({
  image,
  onModifyConfig,
  config,
}: AvatarAssetComponentProps<any>) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [sliceTop, setSliceTop] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      const imageHeight =
        imageRef.current?.getBoundingClientRect()?.height || 0;

      const slicePercentage = (config.slicePointY || 0) / 100;

      setSliceTop(imageHeight * slicePercentage);
    }, 100);
  }, [config?.slicePointY, imageRef.current]);

  const getDistancesFromClick = useCallback(
    (event: React.MouseEvent<HTMLLabelElement, MouseEvent>) => {
      const rect = imageRef.current?.getBoundingClientRect();
      const imageHeight = rect?.height || 0;
      const imageY = rect?.y || 0;

      const clickY = event.clientY;
      const relativeClickY = clickY - imageY;

      let percentage = 0;
      if (imageHeight) {
        percentage = relativeClickY / imageHeight;
      }

      return {
        percentage,
        top: relativeClickY,
      };
    },
    [imageRef]
  );

  return (
    <div>
      <label
        className="config-widget"
        onClick={(event) => {
          const { percentage, top } = getDistancesFromClick(event);
          onModifyConfig({
            slicePointY: percentage * 100,
          });
          setSliceTop(top);
        }}
      >
        <img src={image} ref={imageRef} />
        <input
          type="number"
          className="sr-only"
          value={config.slicePointY}
          onChange={(event) => {
            onModifyConfig({
              slicePointY: +event.currentTarget?.value || 42,
            });
          }}
        />
        <div
          className="config-widget-slice-y-bar"
          style={{ top: `${sliceTop}px` }}
        ></div>
      </label>
    </div>
  );
}

export const assetMetadata: AvatarAssetMetadata<any>[] = [
  { name: "idle", type: AvatarAssetType.Single, required: true },
  {
    name: "active",
    type: AvatarAssetType.Single,
    required: true,
    config: { slicePointY: 0 },
    configComponent: FOO,
  },
  { name: "blink", type: AvatarAssetType.Single, required: false },
  {
    name: "random",
    type: AvatarAssetType.Multiple,
    required: false,
  },
];

export const validator = z.object({
  idle: createZodAsset(z.object({})),
  active: createZodAsset(
    z
      .object({
        sliceY: z.number(),
      })
      .default({
        sliceY: 0,
      })
  ),
  blink: createZodAsset(z.object({})).optional(),
  random: z.array(createZodAsset(z.object({}))),
});

export function generateCss(assets: AvatarAsset[]): string {
  // return `
  //   ${nameToCssVar["idle"]}: ${config.idle.value};
  //   ${nameToCssVar["active"]}: ${config.active};
  //   ${config.random
  //     .map((item, index) => `${nameToCssVar["random"](index)}: ${item.value}`)
  //     .join("\n")}
  // `;

  const assetNameIndex: Record<string, number> = {};

  return `
    :root {
      ${assets
        .map((asset) => {
          if (asset.type === AvatarAssetType.Multiple) {
            if (!assetNameIndex[asset.name]) {
              assetNameIndex[asset.name] = 1;
            } else {
              assetNameIndex[asset.name] += 1;
            }

            const cssVar: any = (nameToCssVar as any)[asset.name];

            if (cssVar) {
              return `${cssVar(assetNameIndex[asset.name])}: "${
                asset.value
              }" !important;`;
            } else {
              return "";
            }
          } else {
            const cssVar: string = (nameToCssVar as any)[asset.name];

            if (cssVar) {
              return `${cssVar}: "${asset.value}" !important;`;
            } else {
              return "";
            }
          }
        })
        .join("\n")}
    }
  `;
}

interface SouthParkCanadianRuntimeConfig {
  idle: string;
  activeTop: string;
  activeBottom: string;
  random: string[];
}

export function AvatarComponent({ isActive, renderTimestamp }: AvatarProps) {
  const [config, setConfig] = useState<SouthParkCanadianRuntimeConfig>({
    idle: "",
    activeTop: "",
    activeBottom: "",
    random: [],
  });
  const [randomImage, setRandomImage] = useState("");

  // Get Data from computed styles
  const cssData = useCssData(
    {
      idle: "--images-idle",
      active: "--images-active",
      activeSliceY: "--images-active-slice-y",
      random_1: "--images-random-1",
      random_2: "--images-random-2",
      random_3: "--images-random-3",
      random_blink: "--images-random-blink",
      random_pog: "--images-random-pog",
      random_wat: "--images-random-wat",
      random_hmm: "--images-random-hmm",
    },
    renderTimestamp
  );

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
      const showRandom = Math.random() > 0.2;

      if (showRandom) {
        setRandomImage(
          config.random[Math.floor(Math.random() * config.random.length)] || ""
        );

        setTimeout(() => {
          setRandomImage("");
        }, 750);
      }
    }, 3000);

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
