import React, { PropsWithChildren } from "react";
import { Flex, TextInput, Textarea, CopyButton, Button } from "@mantine/core";
import { modals } from "@mantine/modals";

const commonModalOptions = {
  closeOnConfirm: false,
  labels: { confirm: "Next", cancel: "Back" },
};

function PublishSection({ children }: PropsWithChildren<{}>) {
  return (
    <Flex direction="row" p="1rem">
      {children}
    </Flex>
  );
}

function PublishModalPrerequisites() {
  return (
    <PublishSection>
      <p>
        Create a new Browser Source in OBS. Make sure that "Shutdown Source when
        not visible" is unchecked".
      </p>
      <img src="https://placekitten.com/200/200" />
    </PublishSection>
  );
}

function PublishModalCreateBrowserSource() {
  return (
    <>
      <p>
        Create a new Browser Source in OBS. Make sure that "Shutdown Source when
        not visible" is unchecked".
      </p>
      <img src="https://placekitten.com/200/200" />
    </>
  );
}

function PublishModalCopyUrl({ url }: { url: string }) {
  return (
    <>
      <p>Copy the following URL into OBS</p>
      <img src="https://placekitten.com/200/200" />

      <CopyButton value={url}>
        {({ copied, copy }) => (
          <Flex align={"flex-end"}>
            <TextInput
              label="OBS BrowserSource URL"
              value={url}
              readOnly
              onClick={copy}
              onFocus={copy}
            />
            <Button color={copied ? "teal" : "blue"} onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </Flex>
        )}
      </CopyButton>
    </>
  );
}

function PublishModalCopyCss({ css }: { css: string }) {
  return (
    <>
      <h2>Copy CSS</h2>
      <p>
        You will need to copy this css chunk into your OBS BrowserSource's
        "Custom CSS" field.
      </p>

      <CopyButton value={css}>
        {({ copied, copy }) => (
          <>
            <Button color={copied ? "teal" : "blue"} onClick={copy}>
              {copied ? "Copied CSS" : "Copy CSS"}
            </Button>
            <Textarea
              label="OBS BrowserSource CSS"
              value={css}
              readOnly
              onClick={copy}
              onFocus={copy}
              maxRows={4}
              minRows={4}
            />
          </>
        )}
      </CopyButton>
    </>
  );
}

function PublishModalNotes() {
  return (
    <>
      <p>
        If you have issues getting the images to show up, you can try this. Turn
        on "Shutdown Source when not visible". Close the config. Toggle
        visibility of cmgTube until the images show up. Make sure to turn off
        "Shutdown Source when not visible" to keep it working.
      </p>
      <img src="https://placekitten.com/200/200" />
    </>
  );
}

export function showPublishModals(url: string, css: string) {
  modals.openConfirmModal({
    ...commonModalOptions,
    title: "Prerequisites",
    children: <PublishModalPrerequisites />,
    labels: { confirm: "Next", cancel: "Cancel" },
    onConfirm: () => {
      modals.openConfirmModal({
        ...commonModalOptions,
        title: "Create BrowserSource",
        children: <PublishModalCreateBrowserSource />,
        onConfirm: () => {
          modals.openConfirmModal({
            ...commonModalOptions,
            title: "Copy URL",
            children: <PublishModalCopyUrl url={url} />,
            onConfirm: () => {
              modals.openConfirmModal({
                ...commonModalOptions,
                title: "Copy CSS",
                children: <PublishModalCopyCss css={css} />,
                onConfirm: () => {
                  modals.openConfirmModal({
                    ...commonModalOptions,
                    title: "Notes/Issues",
                    children: <PublishModalNotes />,
                    labels: { confirm: "Done", cancel: "Cancel" },
                    onConfirm: () => {
                      modals.closeAll();
                    },
                  });
                },
              });
            },
          });
        },
      });
    },
  });
}
