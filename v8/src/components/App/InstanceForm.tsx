import React, { useState } from "react";
import { Card, Modal, Button, Select, Group, Flex } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { AppCard } from "./common/AppCard";

import { Icon } from "@iconify/react";
import deviceFloppy from "@iconify/icons-tabler/device-floppy";

export const DEFAULT_INSTANCE = "Default";

interface InstanceFormProps {
  instanceList: string[];
  selectedInstance: string;
  onInstanceChange: (instance: string) => void;
  onInstanceCreated: (instance: string) => void;
  onInstanceDeleted: (instance: string) => void;
}

export function InstanceForm({
  instanceList,
  selectedInstance,
  onInstanceChange,
  onInstanceCreated,
  onInstanceDeleted,
}: InstanceFormProps) {
  const [newInstanceName, setNewInstanceName] = useState("");
  const [newInstanceModalOpened, newInstanceModalActions] = useDisclosure();

  return (
    <>
      <Modal
        title="New Instance"
        opened={newInstanceModalOpened}
        onClose={newInstanceModalActions.close}
      >
        <form
          name="new_instance"
          onSubmit={(event) => {
            event.preventDefault();
            onInstanceCreated(newInstanceName);
            setNewInstanceName("");
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
          <Flex align="center" justify="flex-end">
            <Button
              type="button"
              onClick={() => {
                setNewInstanceName("");
                newInstanceModalActions.close();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </Flex>
        </form>
      </Modal>

      <AppCard
        title="Instances"
        titleIcon={<Icon icon={deviceFloppy} />}
        headerExtras={
          <Button onClick={newInstanceModalActions.open}>New Instance</Button>
        }
      >
        <Flex align={"flex-end"} justify={"center"} gap={"1rem"} my={"2rem"}>
          <Select
            value={selectedInstance}
            label="Selected Instance"
            id="instance"
            data={instanceList.map((instance) => {
              return {
                label: instance,
                value: instance,
              };
            })}
            onChange={(selectedValue) => {
              onInstanceChange(selectedValue || DEFAULT_INSTANCE);
            }}
          />

          {selectedInstance !== DEFAULT_INSTANCE && (
            <Button
              type="button"
              id="remove_instance"
              color={"red"}
              onClick={() => {
                onInstanceDeleted(selectedInstance);
              }}
            >
              Delete
            </Button>
          )}
        </Flex>
      </AppCard>
    </>
  );
}
