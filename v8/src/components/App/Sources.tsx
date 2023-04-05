import React, { useState } from "react";
import { Card, Flex, Button, TextInput, Text } from "@mantine/core";
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
            // do something
            modals.openConfirmModal({
              title: "Please confirm your action",
              children: (
                <Text size="sm">
                  This action is so important that you are required to confirm
                  it with a modal. Please click one of these buttons to proceed.
                </Text>
              ),
              // labels: { confirm: "Confirm", cancel: "Cancel" },
              // onCancel: () => console.log("Cancel"),
              // onConfirm: () => console.log("Confirmed"),
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
