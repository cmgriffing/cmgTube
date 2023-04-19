import React, { PropsWithChildren, useState } from "react";
import { Flex } from "@mantine/core";

export function ListItem({ children }: PropsWithChildren<{}>) {
  return (
    <Flex
      align="space-between"
      direction="row"
      justify="space-between"
      p={"8px"}
    >
      {children}
    </Flex>
  );
}
