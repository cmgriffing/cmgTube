import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useContext,
  FormEvent,
} from "react";

import { OBS_EVENTS } from "./types/enums";
import { ObsInput } from "./types/types";

import { LocalStorageContext } from "./context/localforage.context";
import { useAppObsCallbacks } from "./hooks/use-obs-callbacks";

import OBSWebSocket from "obs-websocket-js";
const obs = new OBSWebSocket();

import "./App.css";

interface Config {
  obsToken: string;
  assets: string[];
  sources: string[];
}

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

// async function updateReferences() {
//   let refs = ["idle", "active"];
//   for (const asset_list_item of asset_list.children) {
//     const asset_url_input = asset_list_item.querySelector("input[name=url]");
//     const asset_dataurl = asset_url_input.value;
//     if (asset_dataurl.startsWith("data:text")) {
//       const asset_text = await fetch(asset_dataurl, { cache: "no-cache" }).then(
//         (response) => response.text()
//       );
//       const asset_references = asset_text.matchAll(/#[\w-]+/g);
//       for (const asset_reference of asset_references) {
//         refs.push(asset_reference[0].substring(1));
//       }
//     }
//   }
//   refs = [...new Set(refs)];
//   /** @type {HTMLDataListElement} */
//   const element_references_datalist = document.querySelector(
//     "datalist#element_references"
//   );
//   while (element_references_datalist.childElementCount > 0) {
//     element_references_datalist.firstElementChild.remove();
//   }
//   for (const ref of refs) {
//     const option = document.createElement("option");
//     option.value = ref;
//     element_references_datalist.appendChild(option);
//   }
//   for (const asset_list_item of asset_list.children) {
//     const asset_id_input = asset_list_item.querySelector("input[name=id]");
//     const asset_id = asset_id_input.value;
//     if (refs.includes(asset_id)) {
//       refs.splice(refs.indexOf(asset_id), 1);
//     }
//   }
//   const asset_warning_div = document.querySelector("div#asset_warning");
//   if (refs.length != 0) {
//     const missing_assets_list =
//       asset_warning_div.querySelector("ul#missing_assets");
//     while (missing_assets_list.childElementCount > 0) {
//       missing_assets_list.firstElementChild.remove();
//     }
//     for (const ref of refs) {
//       const listItem = document.createElement("li");
//       listItem.innerHTML = ref;
//       missing_assets_list.appendChild(listItem);
//     }
//     asset_warning_div.hidden = false;
//   } else {
//     asset_warning_div.hidden = true;
//   }
// }
async function obs_auth() {
  const url = new URL("https://sugoidogo.github.io/obsconnect");
  url.searchParams.append("redirect_uri", location.href);
  location.assign(url);
}

// instance_select_init().then(load_config);

export function App() {
  const [loading, setLoading] = useState(true);
  const [obsToken, setObsToken] = useState("");
  const [assetList, setAssetList] = useState<File[]>([]);
  const [sourceList, setSourceList] = useState<string[]>([]);
  const [instanceList, setInstanceList] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [newInstanceName, setNewInstanceName] = useState("");
  const [selectedInstance, setSelectedInstance] = useState("");

  const localStorage = useContext(LocalStorageContext);

  useAppObsCallbacks(obs, {
    [OBS_EVENTS.ConnectionClosed]: async () => {
      setStatus("Not connected to OBS");
    },

    [OBS_EVENTS.Identified]: async () => {
      setStatus("Connected to OBS");
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
      setSourceList(
        sourceList.map((source) => {
          if (source === input.oldInputName) {
            return input.inputName;
          } else {
            return source;
          }
        })
      );
    },

    [OBS_EVENTS.InputRemoved]: async (input) => {
      setSourceList(sourceList.filter((source) => source !== input.inputName));
    },
  });

  const addAssetInputRef = useRef<HTMLInputElement>(null);

  const loadConfig = useCallback(async (instanceName = "INSTANCE NAME") => {
    // reset phase
    setLoading(true);
    obs.disconnect();

    setAssetList([]);
    setSourceList([]);

    if (instanceName == "") {
      setLoading(false);
      return false;
    }

    const config =
      (await localStorage.getItem(instanceName)) ||
      (await fetch("default.json", { cache: "no-cache" })
        .then((response) => response.json())
        .catch(() => ({
          assets: [],
          sources: ["Mic/Aux"],
          obs_token: "ws://localhost:4455",
        })));

    console.debug(config);

    if (config.obsToken) {
      setObsToken(config.obsToken);

      let obsurl = "";
      let obspassword = "";
      const search_params = new URLSearchParams(location.search);
      if (search_params.has("obsurl")) {
        obsurl = search_params.get("obsurl") || "";
        obspassword = search_params.get("obspassword") || "";
        const url = new URL(obsurl);
        url.password = obspassword;
        setObsToken(url.href);
      } else if (obsToken) {
        const url = new URL(obsToken);
        obspassword = url.password;
        url.password = "";
        obsurl = url.href;
      } else {
        setStatus("No OBS Authorization found");
      }
      await obs.connect(obsurl, obspassword);
    }

    if (config.assets) {
      if (!(config.assets instanceof Array)) {
        config.assets = [config.assets];
      }
      config.assets = await Promise.allSettled(
        config.assets.map((assetDataUri: string) => dataUriToFile(assetDataUri))
      );
    } else {
      config.assets = [];
    }

    if (config.sources) {
      if (typeof config.sources == "string") {
        config.sources = [config.sources];
      }
    } else {
      config.sources = [];
    }

    const instanceNames = await localStorage.keys();

    setInstanceList(instanceNames);
    setSourceList(config.sources);
    setAssetList(config.assets);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConfig();
  }, [selectedInstance, loadConfig]);

  const persist = (instanceName: string, config: Config) => {
    if (instanceName) {
      console.log(`Writing instance, ${instanceName}, with config:
      ${JSON.stringify(config, null, 2)}
    `);
      localStorage.setItem(instanceName, config);
    }
  };

  // TODO: Refactor away from nested Promises
  async function obsAdjustSensitivity(sourceName: string) {
    obs.call("GetSourceFilterList", { sourceName }).then((response) => {
      for (const filter of response.filters) {
        if ((filter.filterKind = "noise_gate_filter")) {
          obs.call("OpenInputFiltersDialog", { inputName: sourceName });
          return;
        }
      }
      obs
        .call("CreateSourceFilter", {
          sourceName,
          filterName: "Noise Gate for PNGTube",
          filterKind: "noise_gate_filter",
          filterSettings: {
            close_threshold: -60,
            open_threshold: -30,
          },
        })
        .then((response) => {
          obs.call("OpenInputFiltersDialog", { inputName: sourceName });
        });
    });
  }

  return (
    <>
      <h1>PNGTube</h1>
      <div id="status" hidden={!loading && !status}>
        {!status && "Loading..."}
        {status}
      </div>
      <select
        id="instance"
        hidden={loading}
        onChange={(event) => {
          setSelectedInstance(event.currentTarget.value);
        }}
      >
        <option value="">Create New Instance</option>
        {instanceList.map((instance) => {
          return <option value={instance}>{instance}</option>;
        })}
      </select>
      <form
        name="new_instance"
        hidden={loading}
        onSubmit={(event) => {
          event.preventDefault();
          setInstanceList([...instanceList, newInstanceName].sort());
          setSelectedInstance(newInstanceName);
          setNewInstanceName("");
          // TODO: this seems off. We should have clearer separations between saving and loading
          // loadConfig();
          persist(newInstanceName, {
            obsToken,
            sources: sourceList,
            assets: assetList,
          });
        }}
      >
        <input
          type="text"
          value={newInstanceName}
          name="instance_name"
          required
          onInput={(e) => {
            setNewInstanceName(e.currentTarget.value);
          }}
        />
        <button type="submit">Create new instance</button>
      </form>
      <form
        name="instance_config"
        hidden={loading}
        onSubmit={async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const config: Config = {
            obsToken,
            assets: await Promise.all(
              assetList.map((asset) => fileToDataUri(asset))
            ),
            sources: sourceList,
          };
          console.debug(config);
          // TODO: move data serialization to a seperate step
          localStorage.setItem(selectedInstance || "", config);
          const url = new URL(location.origin + location.pathname);
          if (url.pathname.endsWith("/")) {
            url.pathname += "overlay";
          } else {
            const path = url.pathname.split("/");
            path.pop();
            path.push("overlay");
            url.pathname = path.join("/");
          }
          url.searchParams.append("name", selectedInstance || "");
          url.hash = JSON.stringify(config);
          // TODO: Make this embeddable into CSS to get around file size restrictions
          if (url.href.length > 30000) {
            setStatus(
              "Too much data! That url probably won't work unless you use this page as a custom browser dock in OBS."
            );
          }
          console.log("Copying url to clipboard");
          navigator.clipboard.writeText(url.href);
          persist(selectedInstance, {
            obsToken,
            sources: sourceList,
            assets: assetList,
          });
        }}
      >
        <button
          type="button"
          id="remove_instance"
          onClick={async () => {
            await localStorage.removeItem(selectedInstance);
            setSelectedInstance(instanceList[0] || "");
            setInstanceList(
              instanceList.filter((instance) => instance !== selectedInstance)
            );
          }}
        >
          Delete
        </button>
        <br />
        <table>
          <tbody>
            <tr>
              <td>
                <h2>Assets</h2>
                <div id="asset_warning" hidden>
                  Possible missing assets:
                  <ul id="missing_assets"></ul>
                  Make sure all your assets have been added,
                  <br />
                  and their id's are set correctly below.
                  <br />
                  If you have already done so, ignore this warning.
                  <br />
                </div>
                <input
                  ref={addAssetInputRef}
                  type="file"
                  id="asset_file_input"
                  multiple
                  onChange={(event) => {
                    const input = addAssetInputRef?.current;
                    if (input) {
                      if (input?.files) {
                        setAssetList([...assetList, ...input.files]);
                      }
                      input.value = "";
                    }
                  }}
                />
                <ul id="asset_list">
                  {assetList.map((asset, index) => {
                    return (
                      <li key={asset.name || `asset${index}`} className="asset">
                        <form
                          name="assets"
                          onSubmit={(event) => {
                            event?.preventDefault();
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const newAssetList = assetList.filter(
                                (_asset) => _asset !== asset
                              );
                              setAssetList(newAssetList);

                              persist(selectedInstance, {
                                obsToken,
                                sources: sourceList,
                                assets: newAssetList,
                              });
                            }}
                          >
                            remove
                          </button>
                          <input
                            type="search"
                            name="id"
                            required
                            pattern="[\w-]+"
                            list="element_references"
                            value={asset.name}
                            onInput={(event) => {
                              const newAssetList = assetList.map((_asset) => {
                                if (_asset === asset) {
                                  return new File(
                                    [_asset],
                                    event.currentTarget.value
                                  );
                                }
                                return _asset;
                              });
                              setAssetList(newAssetList);
                              persist(selectedInstance, {
                                obsToken,
                                sources: sourceList,
                                assets: newAssetList,
                              });
                            }}
                          />
                          <span id="filename">{asset.name}</span>
                          <input type="hidden" name="url" />
                        </form>
                      </li>
                    );
                  })}
                </ul>
              </td>
              <td>
                <h2>Activation</h2>
                <div id="obs_config">
                  <span id="obs_status">Connecting to OBS...</span>
                  <input type="hidden" name="obs_token" value={obsToken} />
                  <button
                    type="button"
                    id="obs_auth"
                    onClick={() => {
                      // TODO
                      obs_auth();
                    }}
                  >
                    Get OBS Authorization
                  </button>
                </div>
                <br />
                <button type="button" id="add_source" onClick={() => {}}>
                  Add Source
                </button>
                <ul id="source_list">
                  {sourceList.map((source) => {
                    return (
                      <li key={source || "only_source"} className="source">
                        <button type="button" onClick={() => {}}>
                          remove
                        </button>
                        <input
                          type="search"
                          name="sources"
                          list="obs_sources"
                          required
                          pattern=".+"
                        />
                        <br />
                        <button type="button" className="sensitivity">
                          Adjust Sensitivity
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </td>
              <td id="instructions">
                <h3>Adjusting Sensitivity</h3>
                <table>
                  <thead>
                    <tr>
                      <td colSpan={2}>Noise Gate Settings</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Close Threshold</td>
                      <td>Idle volume level</td>
                    </tr>
                    <tr>
                      <td>Open Threshold</td>
                      <td>Active volume level</td>
                    </tr>
                    <tr>
                      <td>Hold Time</td>
                      <td>How long to hold before switching back to idle</td>
                    </tr>
                  </tbody>
                </table>
                <br />
                PNGTube will consider your audio sources 'active' if there is
                any sound coming through at all. The volume meters in OBS won't
                show sounds quieter than -60db, so even if you think it's
                silent, most audio devices have some static noise in them. The
                "Adjust Sensitivity" button on the left will open the filter
                panel, and add a noise gate if you don't have one already.
              </td>
            </tr>
          </tbody>
        </table>
        <button type="submit">Save & Copy URL</button>
      </form>

      <datalist id="element_references"></datalist>

      <datalist id="obs_sources"></datalist>
    </>
  );
}
