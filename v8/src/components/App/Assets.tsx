import React, { useState, useEffect } from "react";
import {
  Card,
  Flex,
  Modal,
  Button,
  ActionIcon,
  Text,
  Group,
  Radio,
  ScrollArea,
  Box,
  FileButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { z } from "zod";

import { Icon } from "@iconify/react";
import trashXFilled from "@iconify/icons-tabler/trash-x-filled";
import pencilIcon from "@iconify/icons-tabler/pencil";
import uploadIcon from "@iconify/icons-tabler/upload";
import settingsIcon from "@iconify/icons-tabler/settings";
import photoOff from "@iconify/icons-tabler/photo-off";
import photoCog from "@iconify/icons-tabler/photo-cog";

import {
  AvatarAsset,
  AvatarAssetMetadata,
  AvatarAssetType,
} from "../../types/types";
import { ListItem } from "./common/ListItem";
import { fileToDataUri } from "../../utils/images";

import { AppCard } from "./common/AppCard";

interface AssetsProps {
  assets: AvatarAsset[];
  validator: z.AnyZodObject;
  selectedThemeId?: string;
  selectedPresetId?: string;
  avatarAssetMetadata: AvatarAssetMetadata<{}>[];
  onAddAsset:
    | ((newAsset: AvatarAsset) => void)
    | ((newAsset: AvatarAsset) => Promise<void>);
  onModifyAsset:
    | ((asset: AvatarAsset) => void)
    | ((asset: AvatarAsset) => Promise<void>);
  onDeleteAsset:
    | ((asset: AvatarAsset) => void)
    | ((asset: AvatarAsset) => Promise<void>);
}

export function Assets({
  assets,
  validator,
  avatarAssetMetadata,
  onDeleteAsset,
  onAddAsset,
  onModifyAsset,
  selectedThemeId,
  selectedPresetId,
}: AssetsProps) {
  type ValidatorType = z.infer<typeof validator>;
  const [structuredAssets, setStructuredAssets] = useState<ValidatorType>();
  const [availableAssets, setAvailableAssets] = useState<
    AvatarAssetMetadata<any>[]
  >([]);
  const [selectedNewAsset, setSelectedNewAsset] =
    useState<AvatarAssetMetadata<any>>();
  const [addAssetModalOpened, addAssetModalActions] = useDisclosure();
  const [assetMetadataLookupTable, setAssetMetadataLookupTable] = useState<
    Record<string, AvatarAssetMetadata<any>>
  >({});

  useEffect(() => {
    setAvailableAssets(
      avatarAssetMetadata.filter((assetMetadata) => {
        if (assetMetadata.type === AvatarAssetType.Multiple) {
          return true;
        }

        return !assets?.find((asset) => asset.name === assetMetadata.name);
      })
    );
  }, [assets]);

  useEffect(() => {
    setAssetMetadataLookupTable(
      avatarAssetMetadata.reduce((table, metadata) => {
        table[metadata.name] = metadata;
        return table;
      }, {} as Record<string, AvatarAssetMetadata<any>>)
    );
  }, [avatarAssetMetadata]);

  return (
    <>
      <Modal
        title="Add Asset"
        opened={addAssetModalOpened}
        onClose={addAssetModalActions.close}
      >
        <Radio.Group
          value={selectedNewAsset?.name}
          name="selectedSource"
          label="Select an Audio Source to activate the animation based on."
          onChange={(assetName) =>
            setSelectedNewAsset(
              availableAssets.find(
                (availableAsset) => availableAsset.name === assetName
              )
            )
          }
          withAsterisk
        >
          <ScrollArea h="30vh">
            {availableAssets.map((asset) => (
              <Box m="1rem" key={asset.name}>
                <Radio
                  value={asset.name}
                  label={asset.name}
                  checked={asset.name === selectedNewAsset?.name}
                  onChange={() => setSelectedNewAsset(asset)}
                />
              </Box>
            ))}
          </ScrollArea>
        </Radio.Group>
        <Group position="right">
          <Button variant="outline" onClick={close} mt="md">
            Cancel
          </Button>
          <Button
            disabled={!selectedNewAsset}
            onClick={() => {
              if (selectedNewAsset) {
                const newAsset: AvatarAsset = {
                  name: selectedNewAsset.name,
                  type: selectedNewAsset.type,
                  value: "",
                };

                if (selectedNewAsset?.config) {
                  newAsset.config = selectedNewAsset?.config;
                }

                onAddAsset(newAsset);
                addAssetModalActions.close();
              }
            }}
            mt="md"
          >
            Submit
          </Button>
        </Group>
      </Modal>

      <AppCard
        title="Assets"
        titleIcon={<Icon icon={photoCog} />}
        headerExtras={
          <Button
            disabled={availableAssets.length === 0 || !!selectedPresetId}
            onClick={addAssetModalActions.open}
          >
            Add Asset
          </Button>
        }
      >
        {assets?.map((asset, index) => (
          <ListItem key={`${asset.name}-${index}`}>
            <Flex
              gap={"0.5rem"}
              direction="row"
              align={"center"}
              justify="center"
            >
              {!asset.value && (
                <Icon
                  height={24}
                  width={24}
                  color={"gray"}
                  icon="tabler:photo-off"
                />
              )}
              {!!asset.value && (
                <img width="24" height="auto" src={asset.value} />
              )}
              <Text className="single-line-ellipsis">{asset.name}</Text>
            </Flex>
            <Group>
              <FileButton
                onChange={async (file) => {
                  if (file) {
                    const modifiedAsset = { ...asset };
                    modifiedAsset.value = await fileToDataUri(file);
                    onModifyAsset(modifiedAsset);
                  }
                }}
                accept="image/png,image/jpeg"
              >
                {(props) => (
                  <ActionIcon
                    variant="filled"
                    color="primary"
                    aria-label={!asset.value ? "Upload" : "Edit"}
                    {...props}
                  >
                    <Icon icon={!asset.value ? uploadIcon : pencilIcon} />
                  </ActionIcon>
                )}
              </FileButton>

              {assetMetadataLookupTable[asset.name]?.config &&
                assetMetadataLookupTable[asset.name]?.configComponent && (
                  <ActionIcon
                    variant="outline"
                    color="primary"
                    aria-label="Settings"
                    disabled={!asset.value}
                  >
                    <Icon
                      icon={settingsIcon}
                      onClick={() => {
                        const Component =
                          assetMetadataLookupTable[asset.name]?.configComponent;

                        let newConfig = asset?.config || {};

                        if (Component) {
                          modals.open({
                            onSubmit: () => {
                              onModifyAsset({
                                ...asset,
                                config: {
                                  ...asset?.config,
                                  ...newConfig,
                                },
                              });
                            },
                            children: (
                              <>
                                <Component
                                  config={asset?.config}
                                  image={asset?.value}
                                  onModifyConfig={(value: any) => {
                                    newConfig = {
                                      ...asset?.config,
                                      ...value,
                                    };
                                  }}
                                />
                                <Flex
                                  mt={16}
                                  gap={16}
                                  direction="row"
                                  justify={"flex-end"}
                                  align="center"
                                >
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      modals.closeAll();
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      onModifyAsset({
                                        ...asset,
                                        config: {
                                          ...asset?.config,
                                          ...newConfig,
                                        },
                                      });
                                      modals.closeAll();
                                    }}
                                  >
                                    Save
                                  </Button>
                                </Flex>
                              </>
                            ),
                          });
                        }
                      }}
                    />
                  </ActionIcon>
                )}

              <ActionIcon variant="filled" color="red" aria-label="Delete">
                <Icon
                  icon={trashXFilled}
                  onClick={() => onDeleteAsset(asset)}
                />
              </ActionIcon>
            </Group>
          </ListItem>
        ))}

        {!assets?.length && (
          <Flex align="center" justify="center" p="1rem">
            <Text fw={"bold"}>
              {!selectedPresetId
                ? "No Assets Found"
                : "Presets already have Assets."}
            </Text>
          </Flex>
        )}
      </AppCard>
    </>
  );
}
