import React, { createContext } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import loadable from "@loadable/component";
import localforage from "localforage";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";

import { LocalStorageContext } from "./context/localforage.context";

const localStorage = localforage.createInstance({ name: "pngtube.v8" });

const App = loadable(() => import("./App"), {
  resolveComponent: (components) => components.App,
});

const Overlay = loadable(() => import("./Overlay"), {
  resolveComponent: (components) => components.Overlay,
});

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
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <ModalsProvider>
          <RouterProvider router={router} />
        </ModalsProvider>
      </MantineProvider>
    </LocalStorageContext.Provider>
  </React.StrictMode>
);
