import React, { useState } from "react";
import { Card, Flex, Button, TextInput, Text, Select } from "@mantine/core";
import { modals } from "@mantine/modals";

interface SourcesProps {
  obsToken: string;
  connected: boolean;
  sources: string[];
  onReconnectClick:
    | ((obsToken: string) => void)
    | ((obsToken: string) => Promise<void>);
}

export function Sources({
  obsToken,
  sources,
  connected,
  onReconnectClick,
}: SourcesProps) {
  const [newObsToken, setNewObsToken] = useState(obsToken);

  return (
    <Card>
      <Flex direction="row" align="center" justify="space-between" w="full">
        <h2>Sources</h2>
        <Button
          disabled={!connected}
          onClick={() => {
            modals.open({
              title: "Add Source",
              children: (
                <>
                  <Select
                    dropdownPosition="bottom"
                    label="Sources"
                    placeholder="Select a Source..."
                    data={sources.map((source) => {
                      // list out available sources
                      // make sure to filter out already used sources
                      return {};
                    })}
                  />
                  <Button fullWidth onClick={() => modals.closeAll()} mt="md">
                    Submit
                  </Button>
                </>
              ),
            });
          }}
        >
          Add Source
        </Button>
      </Flex>
      {!connected && (
        <Flex direction="column" align="center">
          <p>
            Disconnected from OBS. We need to connect to OBS to get the list of
            Sources available.
          </p>
          <form
            onSubmit={() => {
              console.log({ newObsToken });
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
      {connected && <Flex>SOURCES BODY</Flex>}
    </Card>
  );
}
