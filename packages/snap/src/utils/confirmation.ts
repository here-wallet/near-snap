import { SnapsGlobalObject } from '@metamask/snaps-types';
import { copyable, heading, panel, text } from '@metamask/snaps-ui';

type ConfirmationDialogContent = {
  prompt: string;
  description?: string;
  textAreaContent?: string;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export async function showConfirmationDialog(
  snap: SnapsGlobalObject,
  message: ConfirmationDialogContent,
): Promise<boolean> {
  const result = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading(message.prompt),
        text(message.description ?? ''),
        copyable(message.textAreaContent ?? ''),
      ]),
    },
  });

  return Boolean(result);
}
