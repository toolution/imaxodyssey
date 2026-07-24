import type { ReactNode } from 'react';
import { Share2, Sparkles, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

export type VoyagePromptKind = 'gratitude';

export interface VoyagePromptCopy {
  close: string;
  gratitude: {
    eyebrow: string;
    title: string;
    description: string;
    share: string;
    later: string;
  };
}

export function VoyagePrompts({
  prompt,
  copy,
  onClose,
  onShare,
}: {
  prompt: VoyagePromptKind | null;
  copy: VoyagePromptCopy;
  onClose: () => void;
  onShare: () => void;
}) {
  return (
    <Dialog
      open={prompt !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {prompt ? (
        <DialogContent
          className={`voyage-prompt voyage-prompt-${prompt}`}
          showCloseButton={false}
        >
          <DialogClose
            render={
              <Button
                className="voyage-prompt-close"
                variant="ghost"
                size="icon"
                aria-label={copy.close}
              />
            }
          >
            <X aria-hidden="true" />
          </DialogClose>

          {prompt === 'gratitude' ? (
            <GratitudePrompt copy={copy} onShare={onShare} />
          ) : null}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function GratitudePrompt({
  copy,
  onShare,
}: {
  copy: VoyagePromptCopy;
  onShare: () => void;
}) {
  return (
    <>
      <PromptSeal>
        <Sparkles aria-hidden="true" />
      </PromptSeal>
      <p className="voyage-prompt-eyebrow">{copy.gratitude.eyebrow}</p>
      <DialogTitle>{copy.gratitude.title}</DialogTitle>
      <DialogDescription>{copy.gratitude.description}</DialogDescription>
      <div className="voyage-prompt-actions">
        <Button className="voyage-prompt-primary" size="lg" onClick={onShare}>
          <Share2 aria-hidden="true" />
          {copy.gratitude.share}
        </Button>
        <DialogClose
          render={
            <Button
              className="voyage-prompt-secondary"
              variant="outline"
              size="lg"
            />
          }
        >
          {copy.gratitude.later}
        </DialogClose>
      </div>
    </>
  );
}

function PromptSeal({ children }: { children: ReactNode }) {
  return <span className="voyage-prompt-seal">{children}</span>;
}
