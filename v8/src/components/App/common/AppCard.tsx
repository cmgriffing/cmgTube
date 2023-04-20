import React, { PropsWithChildren } from "react";
import { Card, Flex } from "@mantine/core";

interface AppCardProps {
  title: string;
  headerExtras: React.ReactNode;
}

export function AppCard({
  children,
  title,
  headerExtras,
}: PropsWithChildren<AppCardProps>) {
  return (
    <Card
      sx={{
        overflow: "initial",
      }}
    >
      <Flex
        direction="row"
        align="center"
        justify="space-between"
        w="full"
        mb="1rem"
      >
        <h2>{title}</h2>
        {!!headerExtras && (
          <Flex direction={"row"} align="center" justify={"flex-end"}>
            {headerExtras}
          </Flex>
        )}
      </Flex>
      {children}
    </Card>
  );
}
