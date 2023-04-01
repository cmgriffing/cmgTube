import { createContext } from "react";

import OBSWebSocket from "obs-websocket-js";
const obs = new OBSWebSocket();

export const OBSContext = createContext(obs);
