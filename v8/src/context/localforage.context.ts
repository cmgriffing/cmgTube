import { createContext } from "react";

import localforage from "localforage";

const localStorage = localforage.createInstance({ name: "pngtube.v8" });

export const LocalStorageContext = createContext(localStorage);
