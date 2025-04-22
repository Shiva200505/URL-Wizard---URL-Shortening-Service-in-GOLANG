import { useState, useCallback } from "react";

type ClipboardHook = {
  copy: (text: string) => void;
  copied: boolean;
};

export function useClipboard(timeout = 2000): ClipboardHook {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, timeout);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }, [timeout]);

  return { copy, copied };
}
