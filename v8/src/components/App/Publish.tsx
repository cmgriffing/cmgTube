import React, { PropsWithChildren, PropsWithoutRef } from "react";
import {
  Flex,
  TextInput,
  Textarea,
  CopyButton,
  Button,
  createStyles,
} from "@mantine/core";
import { modals } from "@mantine/modals";

const useStyles = createStyles((theme) => ({
  Paragraph: {
    marginBottom: "1rem",
  },
  Image: {
    width: "100%",
    height: "auto",
    marginBottom: "4rem",
  },
}));

const commonModalOptions = {
  closeOnConfirm: false,
  labels: { confirm: "Next", cancel: "Back" },
  onClose: () => {
    modals.closeAll();
  },
  styles(theme: any, params: any, context: any) {
    return {
      title: {
        fontSize: "20px",
        fontWeight: 700,
      },
    };
  },
};

function PublishSection({ children }: PropsWithChildren<{}>) {
  return (
    <>
      {/* <Flex direction="row" p="1rem"> */}
      {children}
      {/* </Flex> */}
    </>
  );
}

function PublishModalPrerequisites() {
  return (
    <PublishSection>
      <Paragraph>These docs assume the usage of OBS.</Paragraph>
      <Paragraph>
        Other tools like XSplit should still work as long as they have a Source
        similar to the BrowserSource in OBS.
      </Paragraph>
    </PublishSection>
  );
}

function PublishModalCreateBrowserSource() {
  return (
    <PublishSection>
      <Paragraph>Create a new Browser Source in OBS.</Paragraph>
      <Image src="/publish/add-browser-source.png" />

      <Paragraph>
        Make sure that "Shutdown Source when not visible" is unchecked.
      </Paragraph>
      <Image src="/publish/browser-source-shutdown.png" />
    </PublishSection>
  );
}

function PublishModalCopyUrl({ url }: { url: string }) {
  return (
    <PublishSection>
      <Paragraph>
        You should see a modal window for configuring the Browser Source.
      </Paragraph>
      <Image src="/publish/browser-source-settings.png" />
      <Paragraph>
        If you don't, you can open it by right clicking the Browser Source in
        the Sources pane and clicking Properties.
      </Paragraph>
      <Image src="/publish/source-properties.png" />

      <Paragraph>Copy the following URL.</Paragraph>
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

      <Paragraph>Paste the URL into the OBS Browser Source settings.</Paragraph>
      <Image src="/publish/paste-url.png" />
    </PublishSection>
  );
}

function PublishModalCopyCss({ css }: { css: string }) {
  return (
    <PublishSection>
      <Paragraph>You will need to copy this CSS.</Paragraph>

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

      <Paragraph>
        Clear out any text in the Custom CSS field and then paste the CSS copied
        from above into your OBS Browser Source's "Custom CSS" field.
      </Paragraph>
      <Image src="/publish/paste-css.png" />
    </PublishSection>
  );
}

function PublishModalNotes() {
  return (
    <PublishSection>
      <Paragraph>
        You should be up and running. If you have issues please try and post
        them to Github. We may eventually create a Discord for this project,
        too.
      </Paragraph>
      <Image src="/publish/high-five.gif" />
    </PublishSection>
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
                    title: "That's it!",
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

function Paragraph({ children }: PropsWithChildren<{}>) {
  const { classes } = useStyles();

  return <p className={classes.Paragraph}>{children}</p>;
}

function Image({ src }: PropsWithoutRef<{ src: string }>) {
  const { classes } = useStyles();
  return <img className={classes.Image} src={src} />;
}
