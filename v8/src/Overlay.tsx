import React, { useState, useContext, useEffect, useRef } from "react";

import OBSWebSocket from "obs-websocket-js";
const obs = new OBSWebSocket();

import { useCssData } from "./hooks/use-css-data";

import "./Overlay.css";
import { useOverlayObsCallbacks } from "./hooks/use-obs-callbacks";
import { OBS_EVENTS } from "./types/enums";
import { ObsInput } from "./types/types";
import { AvatarSouthParkCanadian } from "./components/Avatars/SouthParkCanadian";

// // load config and assets
// const config = await getConfig()
// console.debug(config)
// if (!(config.assets instanceof Array)) {
//     config.assets = [config.assets]
// }
// if(typeof config.sources == 'string'){
//     config.sources=[config.sources]
// }
// import loadAsset from '../js-util/AssetLoader.mjs'
// for (const source of config.assets) {
//     loadAsset(source.url, source.id, true)
// }

// // backoff mechanism
// let backoff=false
// function backoffStart(event){
//     if(event instanceof AnimationEvent && getComputedStyle(event.target,event.pseudoElement).animationIterationCount=='infinite'){
//         return
//     }
//     backoff=true
// }
// function backoffEnd(){
//     backoff=false
// }
// window.ontransitionstart=backoffStart
// window.ontransitionend=backoffEnd
// window.ontransitioncancel=backoffEnd
// window.onanimationstart=backoffStart
// window.onanimationend=backoffEnd
// window.ontransitioncancel=backoffEnd
// // animation function
// let active=false
// requestAnimationFrame(function animate(){
//     if(!backoff){
//         for(const img of document.querySelectorAll('img')){
//             if(active){
//                 img.classList.add('active')
//             }else{
//                 img.classList.remove('active')
//             }
//         }
//     }
//     requestAnimationFrame(animate)
// })

// // obs connection
// obs.on('Identified',(event)=>{
//     console.debug(event)
// })
// obs.on('InputVolumeMeters',(event)=>{
//     const inputs=event.inputs.filter(input=>config.sources.includes(input.inputName))
//     for(const input of inputs){
//         for(const channel of input.inputLevelsMul){
//             if(channel[0]>0){
//                 active=true
//                 return
//             }
//         }
//     }
//     active=false
// })

export function Overlay() {
  const cssData = useCssData({
    obs_token: "--obs-token",
    obs_source_1: "--obs-source-1",
  });

  const [active, setActive] = useState(false);
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
      // console.log("Input Volume changed", event);

      const inputs: ObsInput[] = event.inputs.filter((input: ObsInput) => {
        return config.sources.includes(input.inputName);
      });

      for (const input of inputs) {
        for (const channel of input?.inputLevelsMul || []) {
          if (channel[0] > 0) {
            setActive(true);
            return;
          }
        }
      }

      setActive(false);
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

  return (
    <div className="overlay">
      <AvatarSouthParkCanadian isActive={active} />
    </div>
  );
}
