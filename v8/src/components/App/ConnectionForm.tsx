import React, { PropsWithoutRef, useState } from "react";
import { Flex, TextInput, Button, Box } from "@mantine/core";
import { AppCard } from "./common/AppCard";

import { Icon } from "@iconify/react";
import videoIcon from "@iconify/icons-tabler/video";

interface ConnectionFormProps {
  obsToken: string;
  isConnected: boolean;
  onReconnectClick:
    | ((obsToken: string) => void)
    | ((obsToken: string) => Promise<void>);
  onDisconnectClick: (() => void) | (() => Promise<void>);
}

export function ConnectionForm({
  obsToken,
  isConnected,
  onReconnectClick,
  onDisconnectClick,
}: PropsWithoutRef<ConnectionFormProps>) {
  const [newObsToken, setNewObsToken] = useState(obsToken);

  return (
    <AppCard title="Connection Info" titleIcon={<Icon icon={videoIcon} />}>
      <Flex
        direction="column"
        align="center"
        gap={"1rem"}
        maw="20rem"
        mx={"auto"}
      >
        <ConnectionStatus isConnected={isConnected} />
        {!isConnected && (
          <>
            <p>
              We need to connect to OBS to get the list of Sources available.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onReconnectClick(newObsToken);
              }}
              style={{ width: "100%" }}
            >
              <Flex direction={"row"} align={"flex-end"} gap={"0.5rem"}>
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
              </Flex>
            </form>
          </>
        )}

        {!!isConnected && (
          <Button
            type="button"
            onClick={() => {
              onDisconnectClick();
            }}
          >
            Disconnect
          </Button>
        )}
      </Flex>
    </AppCard>
  );
}

function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <Flex direction="row" align={"center"} justify="center" gap="0.5rem">
      <Box
        h={24}
        w={24}
        bg={isConnected ? "green" : "red"}
        style={{ borderRadius: "24px" }}
      />
      <h3>{!isConnected ? "Disconnected from OBS" : "Connected to OBS"}</h3>
    </Flex>
  );
}
