import { Box, CloseButton, Dialog, Portal, Wrap } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { Eyebrow } from './ui/primitives';

/**
 * Bottom sheet on phones, centred dialog from `sm:` up. This is where all the
 * per-place depth went when the day detail became a list of rows: the row
 * answers "what and how much", the sheet answers everything else.
 *
 * Built on Chakra's `Dialog`, which brings the parts the hand-rolled overlay
 * only approximated — focus trap and restore, scroll lock, `aria-modal`
 * wiring, and Escape/outside-click handling. Header and footer stay pinned so
 * the two things worth tapping (close, and the nav buttons) remain reachable
 * however long the body gets.
 *
 * The caller mounts this conditionally (`{open !== null && <Sheet …/>}`), so
 * the dialog is always `open` and `onOpenChange` just reports dismissal.
 */
export function Sheet({
  eyebrow,
  title,
  titleExtra,
  footer,
  onClose,
  children,
}: {
  readonly eyebrow?: string | undefined;
  readonly title: string;
  readonly titleExtra?: ReactNode;
  readonly footer?: ReactNode;
  readonly onClose: () => void;
  readonly children: ReactNode;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(event) => {
        if (!event.open) onClose();
      }}
      // Chakra's `sm` is 480px, which would centre the dialog on a large
      // phone; `md` (768px) keeps it a thumb-reachable bottom sheet on every
      // phone and small tablet and only centres it on a desktop.
      placement={{ base: 'bottom', md: 'center' }}
      motionPreset="slide-in-bottom"
      scrollBehavior="inside"
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner p={{ base: '0', md: '4' }}>
          <Dialog.Content
            bg="bg.subtle"
            borderWidth="1px"
            borderColor="border"
            rounded="l1"
            maxH="88dvh"
            w="full"
          >
            <Dialog.Header
              display="flex"
              alignItems="start"
              justifyContent="space-between"
              gap="3"
              borderBottomWidth="1px"
              borderColor="border"
              p="4"
            >
              <Box minW="0">
                {eyebrow !== undefined && <Eyebrow>{eyebrow}</Eyebrow>}
                <Wrap align="center" gap="2">
                  <Dialog.Title textStyle="displayLg">{title}</Dialog.Title>
                  {titleExtra}
                </Wrap>
              </Box>
              <Dialog.CloseTrigger asChild position="static">
                <CloseButton
                  aria-label="Kapat"
                  variant="plain"
                  minH="11"
                  minW="11"
                  flexShrink={0}
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.panel"
                  color="fg.muted"
                  rounded="l1"
                />
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body p="4">{children}</Dialog.Body>

            {footer !== undefined && (
              <Dialog.Footer
                display="block"
                borderTopWidth="1px"
                borderColor="border"
                p="4"
                pb="max(1rem, env(safe-area-inset-bottom))"
              >
                {footer}
              </Dialog.Footer>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
