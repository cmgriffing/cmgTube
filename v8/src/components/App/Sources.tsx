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

import { ListItem } from "./common";

import { Icon } from "@iconify/react";
import trashXFilled from "@iconify/icons-tabler/trash-x-filled";

interface SourcesProps {
  obsToken: string;
  connected: boolean;
  sources: string[];
  sourceList: string[];
  onReconnectClick:
    | ((obsToken: string) => void)
    | ((obsToken: string) => Promise<void>);
  onAddSource:
    | ((newSource: string) => void)
    | ((newSource: string) => Promise<void>);
  onDeleteSource:
    | ((newSource: string) => void)
    | ((newSource: string) => Promise<void>);
}

export function Sources({
  obsToken,
  sources,
  sourceList,
  connected,
  onReconnectClick,
  onAddSource,
  onDeleteSource,
}: SourcesProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [newObsToken, setNewObsToken] = useState(obsToken);

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
      <Card>
        <Flex direction="row" align="center" justify="space-between" w="full">
          <h2>Sources</h2>
          <Button
            disabled={!connected || unusedSources.length === 0}
            onClick={open}
          >
            Add Source
          </Button>
        </Flex>
        {!connected && (
          <Flex direction="column" align="center">
            <p>
              Disconnected from OBS. We need to connect to OBS to get the list
              of Sources available.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onReconnectClick(newObsToken);
              }}
            >
              <TextInput
                label="OBS WebSocket Server"
                id="obs-token"
                value={newObsToken}
                name="obsToken"
                placeholder={"ws://localhost:4455"}
                onInput={(inputEvent) => {
                  setNewObsToken(inputEvent.currentTarget.value);
                }}
              />
              <Button type="submit">Reconnect</Button>
            </form>
          </Flex>
        )}
        {connected && (
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
            {!sources.length && <div>No Sources Found</div>}
          </Flex>
        )}
      </Card>
    </>
  );
}
