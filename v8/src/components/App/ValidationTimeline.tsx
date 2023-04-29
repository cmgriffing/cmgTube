import React, { PropsWithoutRef, PropsWithChildren } from "react";
import {
  TimelineProps,
  Modal,
  Flex,
  TimelineItemProps,
  Box,
  Timeline,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ValidationStep } from "../../types/types";

import { Icon } from "@iconify/react";
import checkIcon from "@iconify/icons-tabler/check";

interface ValidationTimelineProps {
  steps: ValidationStep[];
}

export function ValidationTimeline({
  steps,
}: PropsWithoutRef<ValidationTimelineProps>) {
  return (
    <>
      <Timeline
        lineWidth={3}
        active={steps.findIndex((step) => !step.valid) - 1}
      >
        {steps.map((item) => (
          <Timeline.Item
            bullet={
              item.valid ? <Icon icon={checkIcon} width={12} /> : undefined
            }
            active={item.valid}
            lineVariant={!item.valid ? "dashed" : undefined}
          >
            <Box>{item.label}</Box>
          </Timeline.Item>
        ))}
      </Timeline>
    </>
  );
}
