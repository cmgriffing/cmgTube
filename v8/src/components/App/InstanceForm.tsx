import React, { useState } from "react";

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

  return (
    <>
      <select
        id="instance"
        onChange={(event) => {
          onInstanceChange(event.currentTarget.value);
        }}
      >
        <option value="">Create New Instance</option>
        {instanceList.map((instance) => {
          return <option value={instance}>{instance}</option>;
        })}
      </select>
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
        <button type="submit">Create new instance</button>

        <button
          type="button"
          id="remove_instance"
          onClick={() => {
            onInstanceDeleted(selectedInstance);
          }}
        >
          Delete
        </button>
      </form>
    </>
  );
}
