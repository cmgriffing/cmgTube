/*

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
                                assets: [], // newAssetList,
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
                                assets: [], // newAssetList,
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
*/

import React from "react";
import { Card, Flex } from "@mantine/core";

interface Asset {}

interface AssetsProps {
  assets: Asset[];
}

export function Assets({ assets }: AssetsProps) {
  return (
    <Card>
      <h2>ASSETS</h2>
      <p>ASSETS BODY</p>
    </Card>
  );
}
