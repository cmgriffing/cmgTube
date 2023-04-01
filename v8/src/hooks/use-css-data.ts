import { useState, useEffect } from "react";

export type CssData = Record<string, string>;

export function useCssData(variableMap: Record<string, string>) {
  const [cssData, setCssData] = useState<CssData>({});

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);

    const newCssData: CssData = {};

    Object.entries(variableMap).forEach(([key, cssVar]) => {
      const value = styles.getPropertyValue(cssVar);
      try {
        newCssData[key] = JSON.parse(decodeURIComponent(value));
      } catch (e: any) {
        newCssData[key] = value;
      }
    });

    setCssData(newCssData);
  }, []);

  return cssData;
}
