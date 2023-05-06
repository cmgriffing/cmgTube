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
  Box,
  Modal,
  TextInput,
  MediaQuery,
  getBreakpointValue,
  Text,
  createStyles,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { z, AnyZodObject } from "zod";

import { OBS_EVENTS } from "./types/enums";
import { AvatarAsset, ObsInput, ValidationStep } from "./types/types";

import { LocalStorageContext } from "./context/localforage.context";
import { useAppObsCallbacks } from "./hooks/use-obs-callbacks";

import { Assets } from "./components/App/Assets";
import { ConnectionForm } from "./components/App/ConnectionForm";
import { Sources } from "./components/App/Sources";
import { Audio } from "./components/App/Audio";
import { ThemeSelector } from "./components/App/ThemeSelector";
import { ValidationTimeline } from "./components/App/ValidationTimeline";
import { InstanceForm, DEFAULT_INSTANCE } from "./components/App/InstanceForm";
import { showPublishModals } from "./components/App/Publish";
import { Preview } from "./components/App/Preview";
import { Logo } from "./components/App/Logo";

import OBSWebSocket from "obs-websocket-js";
const obs = new OBSWebSocket();

import "./App.css";
// import {
//   generateCss,
//   validator,
//   assetMetadata,
// } from "./components/Avatars/SouthParkCanadian";

import * as SouthParkCanadian from "./components/Avatars/SouthParkCanadian";

const THEMES = [SouthParkCanadian];

const DEFAULT_CONFIG: AppConfig = {
  assets: [],
  sources: [],
  obsToken: "ws://localhost:4455",
  currentThemeId: "",
  currentPresetId: "",
};

interface AppAsset {
  dataUri: string;
  name: string;
}

const useStyles = createStyles((theme) => ({
  title: {
    fontFamily: "Abril Fatface",
  },
}));

interface AppConfig {
  assets: AvatarAsset[];
  sources: string[];
  obsToken: string;
  currentThemeId: string;
  currentPresetId: string;
}

export function App() {
  const [loading, setLoading] = useState(true);
  const [obsToken, setObsToken] = useState("");
  const [currentThemeId, setCurrentThemeId] = useState("");
  const [currentPresetId, setCurrentPresetId] = useState("");
  const [assets, setAssets] = useState<AvatarAsset[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [sourceList, setSourceList] = useState<string[]>([]);
  const [instanceList, setInstanceList] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(DEFAULT_INSTANCE);
  const previousToken = useRef(obsToken);
  const [customCss, setCustomCss] = useState("");

  const { classes } = useStyles();

  const localStorage = useContext(LocalStorageContext);

  useAppObsCallbacks(obs, {
    [OBS_EVENTS.ConnectionClosed]: async () => {
      setConnected(false);
    },

    [OBS_EVENTS.Identified]: async () => {
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
      setSources(sources.map(renameSource) || []);
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

    if (instanceName == "") {
      setLoading(false);
      return false;
    }

    const instanceNames = (await localStorage.keys()).filter(
      (key) => !!key.trim()
    );
    setInstanceList(instanceNames);

    const config = {
      ...DEFAULT_CONFIG,
      ...(((await localStorage
        .getItem(instanceName)
        .catch(() => DEFAULT_CONFIG)) as unknown as AppConfig) ||
        DEFAULT_CONFIG),
    };

    setObsToken(config.obsToken);

    setSources(config.sources || []);
    setAssets(config?.assets || []);

    setCurrentThemeId(config.currentThemeId);
    setCurrentPresetId(config.currentPresetId);

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
        console.log("No OBS auth found");
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
          // console.log(
          //   `Writing instance, ${instanceName}, with config:
          //     ${JSON.stringify(config, null, 2)}
          //   `
          // );
          await localStorage.setItem(instanceName, config);
        }
      } catch (e: any) {
        console.log("Error writing to localstorage", e);
      }
    },
    []
  );

  useEffect(() => {
    if (!loading) {
      persist(selectedInstance, {
        obsToken,
        assets,
        sources,
        currentThemeId,
        currentPresetId,
      });

      const selectedTheme = THEMES.find(
        (theme) => theme?.themeMetadata.id === currentThemeId
      );

      setTimeout(() => {
        setCustomCss(`
          :root {
            --obs-token: "${obsToken}";
            --obs-source-1: "Mic";
            ${sources.map(
              (source, index) => `--obs-source-${index + 1}: "${source}";\n`
            )}
          }

        ${selectedTheme?.generateCss(assets)}
      `);
      }, 3000);
    }
  }, [obsToken, sources, assets, currentThemeId, currentPresetId, loading]);

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

  const validity = getValidity(
    connected,
    assets,
    SouthParkCanadian.validator,
    sources,
    currentThemeId,
    currentPresetId
  );

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        components: {
          Modal: {
            styles: (theme, params: any, { variant }) => ({
              title: {
                fontSize: "24px",
                fontWeight: 700,
              },
            }),
          },
        },
      }}
    >
      <AppShell
        navbarOffsetBreakpoint="sm"
        navbar={
          <Navbar
            hidden={true}
            hiddenBreakpoint="sm"
            width={{ base: 300 }}
            height={"100%"}
          >
            <Box m="2rem auto">
              <ValidationTimeline steps={validity} />
            </Box>

            <Preview
              themeId={currentThemeId}
              presetId={currentPresetId}
              customCss={customCss}
            />
          </Navbar>
        }
        padding="md"
        header={
          <Header height={70} p="xs">
            <Flex direction="row" align="center" justify="space-between">
              <Flex direction="row" align="center" justify="center" px="0.5rem">
                <Logo />
                <Text
                  ml={"0.5rem"}
                  size={"32px"}
                  weight={700}
                  className={classes.title}
                >
                  maskd
                </Text>
              </Flex>
              <Button
                disabled={!connected || !isValid(validity)}
                onClick={() => {
                  showPublishModals(
                    `${window.location.toString()}/overlay`,
                    customCss
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
        {!loading && (
          <Flex direction="column" gap="1rem" mx="auto" w="100%" maw={"540px"}>
            <InstanceForm
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
            />
            <ThemeSelector
              currentThemeId={currentThemeId}
              currentPresetId={currentPresetId}
              themes={THEMES}
              onThemeChanged={(theme) => {
                setCurrentThemeId(theme?.themeMetadata.id || "");
              }}
              onPresetChanged={(preset) => {
                setCurrentPresetId(preset?.id || "");
              }}
            />
            <Assets
              assets={assets}
              validator={SouthParkCanadian.validator}
              avatarAssetMetadata={SouthParkCanadian.assetMetadata}
              selectedThemeId={currentThemeId}
              selectedPresetId={currentPresetId}
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
            <ConnectionForm
              obsToken={obsToken}
              isConnected={connected}
              onReconnectClick={(newObsToken) => {
                setObsToken(newObsToken);
              }}
              onDisconnectClick={() => {
                // TODO: Investigate why this doesn't work as expected.
                // Shows empty page instead of disconnected state
                setObsToken("");
              }}
            />
            {!!connected && (
              <Sources
                sources={sources}
                sourceList={sourceList}
                onAddSource={(newSource) => {
                  setSources([...sources, newSource]);
                }}
                onDeleteSource={(source) => {
                  setSources(sources.filter((_source) => _source !== source));
                }}
              />
            )}
            {/* <Audio /> */}
          </Flex>
        )}
      </AppShell>
    </MantineProvider>
  );
}

function getValidity(
  connected: boolean,
  assets: AvatarAsset[],
  validator: z.ZodObject<any>,
  sources: string[],
  currentThemeId: string,
  currentPresetId: string
): ValidationStep[] {
  // const assetsAreValid = validator.parse(
  //   assets.reduce((acc, asset, index) => {
  //     acc[asset.name] = asset;
  //     return acc;
  //   }, {} as Record<string, AvatarAsset | AvatarAsset[]>)
  // );
  const assetsAreValid = true;

  const mainSteps = [
    { label: "Instance", valid: true },
    {
      label: "Theme",
      valid: true,
    },
    {
      label: "Assets",
      valid: !assetsAreValid || !!(currentThemeId && currentPresetId),
    },
    { label: "Connection", valid: connected },
    { label: "Sources", valid: sources.length >= 1 },
  ];

  return [...mainSteps, { label: "Done", valid: isValid(mainSteps) }];
}

function isValid(steps: ValidationStep[]) {
  return !steps.some((step) => !step.valid);
}
