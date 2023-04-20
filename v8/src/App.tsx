import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
  FormEvent,
} from "react";
import {
  MantineProvider,
  AppShell,
  Navbar,
  Header,
  Flex,
  Button,
  Modal,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { z, AnyZodObject } from "zod";

import { OBS_EVENTS } from "./types/enums";
import { AvatarAsset, ObsInput } from "./types/types";

import { LocalStorageContext } from "./context/localforage.context";
import { useAppObsCallbacks } from "./hooks/use-obs-callbacks";

import { Assets } from "./components/App/Assets";
import { Sources } from "./components/App/Sources";
import { Audio } from "./components/App/Audio";
import { InstanceForm } from "./components/App/InstanceForm";
import { showPublishModals } from "./components/App/Publish";

import OBSWebSocket from "obs-websocket-js";
const obs = new OBSWebSocket();

import "./App.css";
import {
  generateCss,
  validator,
  assetMetadata,
} from "./components/Avatars/SouthParkCanadian";

const DEFAULT_INSTANCE = "Default";

const DEFAULT_CONFIG: AppConfig = {
  assets: [],
  sources: [],
  obsToken: "ws://localhost:4455",
};

interface AppAsset {
  dataUri: string;
  name: string;
}

interface AppConfig {
  assets: AvatarAsset[];
  sources: string[];
  obsToken: string;
}

export function App() {
  const [loading, setLoading] = useState(true);
  const [obsToken, setObsToken] = useState("");
  const [assets, setAssets] = useState<AvatarAsset[]>([]);
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

    // setAssets([]);
    // setSources([]);
    // setSourceList([]);

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
  }, [selectedInstance]);

  const persist = useCallback(
    async (instanceName: string, config: AppConfig) => {
      try {
        if (instanceName) {
          console.log(
            `Writing instance, ${instanceName}, with config:
              ${JSON.stringify(config, null, 2)}
            `
          );
          await localStorage.setItem(instanceName, config);
        }
      } catch (e: any) {
        console.log("Error writing to localstorage", e);
      }
    },
    []
  );

  useEffect(() => {
    persist(selectedInstance, {
      obsToken,
      assets,
      sources,
    });
  }, [obsToken, sources, assets]);

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
          <Header height={70} p="xs">
            <Flex direction="row" align="center" justify="space-between">
              <h1>cmgTuber</h1>
              <Button
                disabled={!connected}
                onClick={() => {
                  showPublishModals(
                    `${window.location.toString()}/overlay`,
                    `
                      body { background-color: rgba(0,0,0,0); }

                      ${sources.map(
                        (source, index) => `
                        --obs-source-${index + 1}: "${source}";
                      `
                      )}

                      ${generateCss(assets)}
                    `
                  );
                }}
              >
                Publish
              </Button>
            </Flex>
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
          <Flex direction="column" gap="1rem" mx="auto" maw={"540px"}>
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
            <Assets
              assets={assets}
              validator={validator}
              avatarAssetMetadata={assetMetadata}
              onAddAsset={(newAsset) => {
                setAssets([...assets, newAsset]);
              }}
              onModifyAsset={(asset) => {
                setAssets(
                  assets.map((_asset) => {
                    if (_asset.name === asset.name) {
                      return asset;
                    }
                    return _asset;
                  })
                );
              }}
              onDeleteAsset={(asset) => {
                setAssets(assets.filter((_asset) => _asset !== asset));
              }}
            />
            <Sources
              obsToken={obsToken}
              sources={sources}
              sourceList={sourceList}
              connected={connected}
              onReconnectClick={(newObsToken) => {
                setObsToken(newObsToken);
              }}
              onAddSource={(newSource) => {
                setSources([...sources, newSource]);
              }}
              onDeleteSource={(source) => {
                setSources(sources.filter((_source) => _source !== source));
              }}
            />
            {/* <Audio /> */}
          </Flex>
        )}
      </AppShell>
    </MantineProvider>
  );
}
