import OBSWebSocket from "obs-websocket-js";
import React, { useEffect } from "react";
import { OBS_EVENTS } from "../types/enums";
import { ObsInput } from "../types/types";

type ObsEventCallback =
  | (() => Promise<void>)
  | ((input: ObsInput) => Promise<void>);

type ObsCallbacks = Record<OBS_EVENTS, ObsEventCallback>;

export function useObsCallbacks(
  obs: OBSWebSocket,
  callbacks: Partial<ObsCallbacks>
) {
  useEffect(() => {
    // console.log("Wiring up OBS Callbacks");

    Object.entries(callbacks).map(([callbackKey, callback]) => {
      obs.on(callbackKey as OBS_EVENTS, callback as any);
    });

    return function () {
      Object.keys(callbacks).map((callbackKey) => {
        obs.off(callbackKey as OBS_EVENTS);
      });
    };
  }, [obs, callbacks]);
}

type AppObsCallbacks = Record<
  | OBS_EVENTS.ConnectionClosed
  | OBS_EVENTS.Identified
  | OBS_EVENTS.InputCreated
  | OBS_EVENTS.InputNameChanged
  | OBS_EVENTS.InputRemoved,
  ObsEventCallback
>;
export function useAppObsCallbacks(
  obs: OBSWebSocket,
  callbacks: AppObsCallbacks
) {
  return useObsCallbacks(obs, callbacks);
}

type OverlayObsCallbacks = Record<
  | OBS_EVENTS.ConnectionClosed
  | OBS_EVENTS.Identified
  | OBS_EVENTS.InputVolumeMeters,
  ObsEventCallback
>;

export function useOverlayObsCallbacks(
  obs: OBSWebSocket,
  callbacks: OverlayObsCallbacks
) {
  return useObsCallbacks(obs, callbacks);
}
