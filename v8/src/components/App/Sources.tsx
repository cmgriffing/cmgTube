import React, { useState, useMemo, useCallback } from "react";
import {
  ActionIcon,
  Card,
  Flex,
  Button,
  Box,
  TextInput,
  Text,
  Radio,
  ScrollArea,
  Group,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { ListItem } from "./common/ListItem";
import { AppCard } from "./common/AppCard";

import { Icon } from "@iconify/react";
import trashXFilled from "@iconify/icons-tabler/trash-x-filled";
import microphoneIcon from "@iconify/icons-tabler/microphone";

interface SourcesProps {
  sources: string[];
  sourceList: string[];
  onAddSource:
    | ((newSource: string) => void)
    | ((newSource: string) => Promise<void>);
  onDeleteSource:
    | ((newSource: string) => void)
    | ((newSource: string) => Promise<void>);
}

export function Sources({
  sources,
  sourceList,
  onAddSource,
  onDeleteSource,
}: SourcesProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const [selectedNewSource, setSelectedNewSource] = useState<string>();

  const unusedSources = useMemo(() => {
    return sourceList.filter((source) => {
      return sources.indexOf(source) === -1;
    });
  }, [sources, sourceList]);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Add Source">
        <Radio.Group
          value={selectedNewSource}
          name="selectedSource"
          label="Select an Audio Source to activate the animation based on."
          onChange={(source) => setSelectedNewSource(source)}
          withAsterisk
        >
          <ScrollArea h="30vh">
            {unusedSources.map((source) => (
              <Box m="1rem" key={source}>
                <Radio
                  value={source}
                  label={source}
                  checked={source === selectedNewSource}
                  onChange={() => setSelectedNewSource(source)}
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
            disabled={!selectedNewSource}
            onClick={() => {
              if (selectedNewSource) {
                onAddSource(selectedNewSource);
                close();
              }
            }}
            mt="md"
          >
            Submit
          </Button>
        </Group>
      </Modal>
      <AppCard
        title="Sources"
        titleIcon={<Icon icon={microphoneIcon} />}
        headerExtras={
          <Button disabled={unusedSources.length === 0} onClick={open}>
            Add Source
          </Button>
        }
      >
        <Flex direction="column">
          {sources.length > 0 &&
            sources.map((source) => (
              <ListItem key={source}>
                <Text className="single-line-ellipsis">{source}</Text>
                <Flex
                  direction={"row"}
                  miw={"120px"}
                  align="flex-end"
                  justify={"flex-end"}
                >
                  <ActionIcon variant="filled" color="red">
                    <Icon
                      icon={trashXFilled}
                      onClick={() => onDeleteSource(source)}
                    />
                  </ActionIcon>
                </Flex>
              </ListItem>
            ))}
          {!sources.length && (
            <Flex align="center" justify="center" p="1rem">
              <Text fw={"bold"}>No Sources Found</Text>
            </Flex>
          )}
        </Flex>
      </AppCard>
    </>
  );
}
