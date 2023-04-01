import React, { createContext } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import localforage from "localforage";

import { App } from "./App";
import { Overlay } from "./Overlay";

import { LocalStorageContext } from "./context/localforage.context";

const localStorage = localforage.createInstance({ name: "pngtube.v8" });

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
    },
    {
      path: "/overlay",
      element: <Overlay />,
    },
  ],
  {
    // basename: "/cmgTube",
  }
);

import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LocalStorageContext.Provider value={localStorage}>
      <RouterProvider router={router} />
    </LocalStorageContext.Provider>
  </React.StrictMode>
);
