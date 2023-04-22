import React, { PropsWithChildren } from "react";
import { Card, Flex, Box } from "@mantine/core";

interface AppCardProps {
  title: string;
  titleIcon?: React.ReactNode;
  headerExtras?: React.ReactNode;
}

export function AppCard({
  children,
  title,
  titleIcon,
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
        <h2>
          <Flex direction={"row"} align="center">
            {!!titleIcon && <Box mr={"0.5rem"}>{titleIcon}</Box>}
            {title}
          </Flex>
        </h2>
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
