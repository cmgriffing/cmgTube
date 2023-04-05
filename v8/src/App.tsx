import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
  FormEvent,
} from "react";
import { MantineProvider, AppShell, Navbar, Header, Flex } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";

import { OBS_EVENTS } from "./types/enums";
import { ObsInput } from "./types/types";

import { LocalStorageContext } from "./context/localforage.context";
import { useAppObsCallbacks } from "./hooks/use-obs-callbacks";

import { Assets } from "./components/App/Assets";
import { Sources } from "./components/App/Sources";
import { Audio } from "./components/App/Audio";
import { InstanceForm } from "./components/App/InstanceForm";

import OBSWebSocket from "obs-websocket-js";
const obs = new OBSWebSocket();

import "./App.css";

const DEFAULT_INSTANCE = "Default";

const DEFAULT_CONFIG: AppConfig = {
  assets: [],
  sources: [],
  obsToken: "ws://localhost:4455",
};

async function dataUriToFile(dataUri: string, id = Date.now()) {
  let filename = null;
  if (!dataUri.startsWith("data:")) {
    filename = dataUri.split("/").at(-1);
  }
  const source: Blob = await fetch(dataUri, { cache: "no-cache" }).then(
    (response) => response.blob()
  );
  if (!filename) {
    filename = id + "." + source.type.split("/")[1];
  }
  return new File([source], filename, { type: source.type });
}

async function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const fileReader = new FileReader();

      fileReader.onload = function (result) {
        try {
          if (result.loaded && fileReader.result) {
            if (typeof fileReader.result === "string") {
              resolve(fileReader.result);
            } else {
              resolve(fileReader.result.toString());
            }
          }
        } catch (error: any) {
          reject(error);
        }
      };

      fileReader.onerror = function (error) {
        reject(error);
      };

      fileReader.readAsDataURL(file);
    } catch (error: any) {
      reject(error);
    }
  });
}

interface AppAsset {
  dataUri: string;
  name: string;
}

interface AppConfig {
  assets: AppAsset[];
  sources: string[];
  obsToken: string;
}

export function App() {
  const [loading, setLoading] = useState(true);
  const [obsToken, setObsToken] = useState("");
  const [assets, setAssets] = useState<AppAsset[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [sourceList, setSourceList] = useState<string[]>([]);
  const [instanceList, setInstanceList] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [connected, setConnected] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(DEFAULT_INSTANCE);
  const previousToken = useRef(obsToken);

  const localStorage = useContext(LocalStorageContext);

  useAppObsCallbacks(obs, {
    [OBS_EVENTS.ConnectionClosed]: async () => {
      setStatus("Not connected to OBS");
      setConnected(false);
    },

    [OBS_EVENTS.Identified]: async () => {
      setStatus("Connected to OBS");
      setConnected(true);
      const response = await obs.call("GetInputList");
      setSourceList(
        (response.inputs as unknown as ObsInput[]).map(
          (input) => input.inputName
        )
      );
    },

    [OBS_EVENTS.InputCreated]: async (input) => {
      setSourceList([...sourceList, input.inputName]);
    },

    [OBS_EVENTS.InputNameChanged]: async (input) => {
      const renameSource = (source: string) => {
        if (source === input.oldInputName) {
          return input.inputName;
        } else {
          return source;
        }
      };

      setSourceList(sourceList.map(renameSource));
      setSources(sources.map(renameSource));
    },

    [OBS_EVENTS.InputRemoved]: async (input) => {
      setSourceList(sourceList.filter((source) => source !== input.inputName));
      setSources(sources.filter((source) => source !== input.inputName));
    },
  });

  const loadConfig = useCallback(async (instanceName = DEFAULT_INSTANCE) => {
    // reset phase
    // setLoading(true);
    // obs.disconnect();

    setAssets([]);
    setSources([]);
    setSourceList([]);

    if (instanceName == "") {
      setLoading(false);
      return false;
    }

    const config =
      ((await localStorage
        .getItem(instanceName)
        .catch(() => DEFAULT_CONFIG)) as unknown as AppConfig) ||
      DEFAULT_CONFIG;

    console.debug(config);

    if (config.obsToken) {
      setObsToken(config.obsToken);
    }

    const instanceNames = await localStorage.keys();
    setInstanceList(instanceNames);

    setSources(config.sources);
    setAssets(config.assets);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (obsToken !== previousToken.current) {
      setLoading(true);
      obs.disconnect();
      previousToken.current = obsToken;
      if (obsToken) {
        let obsUrl = "";
        let obsPassword = "";
        const url = new URL(obsToken);
        obsPassword = url.password;
        url.password = "";
        obsUrl = url.href;
        obs.connect(obsUrl, obsPassword).then(() => {
          setLoading(false);
        });
      } else {
        setStatus("No OBS Authorization found");
      }
    }
  }, [obsToken]);

  useEffect(() => {
    loadConfig(selectedInstance);
  }, [selectedInstance, loadConfig]);

  const persist = (instanceName: string, config: AppConfig) => {
    if (instanceName) {
      console.log(`Writing instance, ${instanceName}, with config:
      ${JSON.stringify(config, null, 2)}
    `);
      localStorage.setItem(instanceName, config);
    }
  };

  // TODO: Refactor away from nested Promises
  // async function obsAdjustSensitivity(sourceName: string) {
  //   obs.call("GetSourceFilterList", { sourceName }).then((response) => {
  //     for (const filter of response.filters) {
  //       if ((filter.filterKind = "noise_gate_filter")) {
  //         obs.call("OpenInputFiltersDialog", { inputName: sourceName });
  //         return;
  //       }
  //     }
  //     obs
  //       .call("CreateSourceFilter", {
  //         sourceName,
  //         filterName: "Noise Gate for PNGTube",
  //         filterKind: "noise_gate_filter",
  //         filterSettings: {
  //           close_threshold: -60,
  //           open_threshold: -30,
  //         },
  //       })
  //       .then((response) => {
  //         obs.call("OpenInputFiltersDialog", { inputName: sourceName });
  //       });
  //   });
  // }

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <AppShell
        padding="md"
        header={
          <Header height={60} p="xs">
            <h1>cmgTuber</h1>
          </Header>
        }
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        })}
      >
        <div id="status" hidden={!loading && !status}>
          {!status && "Loading..."}
          {status}
        </div>
        {!loading && (
          <Flex direction="column" gap="1rem">
            {/* <InstanceForm
                instanceList={instanceList}
                selectedInstance={selectedInstance}
                onInstanceChange={(instance) => {
                  setSelectedInstance(instance);
                }}
                onInstanceCreated={(instance) => {
                  setInstanceList([...instanceList, instance].sort());
                  setSelectedInstance(instance);
                }}
                onInstanceDeleted={(instance) => {
                  const newInstanceList = instanceList.filter(
                    (instance) => instance !== selectedInstance
                  );
                  setInstanceList(newInstanceList);
                  setSelectedInstance(newInstanceList[0] || "");
                }}
              /> */}
            {/* <Assets assets={assetList} /> */}
            <Sources
              obsToken={obsToken}
              sources={sourceList}
              connected={connected}
              onReconnectClick={(newObsToken) => {
                setObsToken(newObsToken);
              }}
            />
            <Audio />
          </Flex>
        )}
      </AppShell>
    </MantineProvider>
  );
}
