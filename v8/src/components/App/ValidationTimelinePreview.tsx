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

interface ValidationTimelineProps {
  steps: ValidationStep[];
}

export function ValidationTimelinePreview({
  steps,
}: PropsWithoutRef<ValidationTimelineProps>) {
  const [showingVerticalTimelineModal, verticalTimelineModalActions] =
    useDisclosure();

  return (
    <>
      <Modal
        onClose={verticalTimelineModalActions.close}
        opened={showingVerticalTimelineModal}
      >
        <Timeline>
          {steps.map((item) => (
            <Timeline.Item>
              <Box>{item.label}</Box>
            </Timeline.Item>
          ))}
        </Timeline>
      </Modal>

      <HorizontalTimeline>
        {steps.map((item) => (
          <HorizontalTimelineItem>
            <Box>{item.label}</Box>
          </HorizontalTimelineItem>
        ))}
      </HorizontalTimeline>
    </>
  );
}

interface HorizontalTimelineProps extends TimelineProps {
  start?: boolean;
  end?: boolean;
}

function HorizontalTimeline({
  children,
  start,
}: PropsWithoutRef<HorizontalTimelineProps>) {
  return (
    <Flex direction="row" w="100%" align={"center"} justify={"center"}>
      {children}
    </Flex>
  );
}

interface HorizontalTimelineItemProps extends TimelineProps {}

function HorizontalTimelineItem({
  children,
}: PropsWithChildren<HorizontalTimelineItemProps>) {
  return <div>{children}</div>;
}
