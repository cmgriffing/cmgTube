import React, { PropsWithoutRef, useState, useEffect } from "react";

import { Flex, Box, Select } from "@mantine/core";

import { Icon } from "@iconify/react";
import paintIcon from "@iconify/icons-tabler/paint";

import { AvatarModule, ThemeMetadata } from "../../types/types";

const CUSTOM_PRESET: ThemeMetadata = { id: "", label: "Custom" };

import { AppCard } from "./common/AppCard";

interface ThemeSelectorProps {
  currentThemeId: string;
  currentPresetId: string;
  themes: AvatarModule[];
  onThemeChanged:
    | ((avatarModule?: AvatarModule) => void)
    | ((avatarModule?: AvatarModule) => Promise<void>);
  onPresetChanged:
    | ((preset?: ThemeMetadata) => void)
    | ((preset?: ThemeMetadata) => Promise<void>);
}

export function ThemeSelector({
  themes,
  currentThemeId,
  currentPresetId,
  onThemeChanged,
  onPresetChanged,
}: PropsWithoutRef<ThemeSelectorProps>) {
  const [selectedTheme, setSelectedTheme] = useState<
    AvatarModule | undefined
  >();
  const [selectedPreset, setSelectedPreset] = useState<
    ThemeMetadata | undefined
  >();

  useEffect(() => {
    const currentTheme = themes.find(
      (theme) => theme.themeMetadata.id === currentThemeId
    );

    setSelectedTheme(currentTheme);
    setSelectedPreset(
      currentTheme?.themePresets.find(
        (preset) => preset.id === currentPresetId
      ) || CUSTOM_PRESET
    );
  }, [currentThemeId, currentPresetId]);

  return (
    <>
      <AppCard title="Theme" titleIcon={<Icon icon={paintIcon} />}>
        <Flex gap="1rem">
          <Box w="50%">
            <Select
              label="Theme"
              placeholder="Pick one"
              searchable
              nothingFound="No options"
              value={selectedTheme?.themeMetadata.id}
              data={themes.map((theme) => ({
                value: theme.themeMetadata.id,
                label: theme.themeMetadata.label,
              }))}
              onChange={(selectedThemeId) => {
                const newSelectedTheme = themes.find(
                  (theme) => theme.themeMetadata.id === selectedThemeId
                );

                setSelectedTheme(newSelectedTheme);
                onThemeChanged(newSelectedTheme);
                setSelectedPreset(CUSTOM_PRESET);
                onPresetChanged(CUSTOM_PRESET);
              }}
            />
          </Box>

          {selectedTheme?.themePresets?.length && (
            <Box w="50%">
              <Select
                label="Preset"
                placeholder="Pick one"
                searchable
                nothingFound="No options"
                value={selectedPreset?.id}
                data={[CUSTOM_PRESET, ...selectedTheme.themePresets].map(
                  (preset) => ({
                    value: preset.id,
                    label: preset.label,
                  })
                )}
                onChange={(selectedPresetId) => {
                  const newSelectedPreset =
                    selectedTheme.themePresets.find(
                      (preset) => preset.id === selectedPresetId
                    ) || CUSTOM_PRESET;
                  setSelectedPreset(newSelectedPreset);
                  onPresetChanged(newSelectedPreset);
                }}
              />
            </Box>
          )}
        </Flex>
      </AppCard>
    </>
  );
}
