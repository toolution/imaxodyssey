import type { ReactNode } from 'react';
import { Check, MapPin, Share2, Sparkles, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

export type VoyagePromptKind = 'theaters' | 'gratitude';

export interface VoyagePromptCopy {
  close: string;
  theaters: {
    eyebrow: string;
    title: string;
    confirm: string;
  };
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
  theaterDescription,
  onClose,
  onShare,
}: {
  prompt: VoyagePromptKind | null;
  copy: VoyagePromptCopy;
  theaterDescription: string;
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

          {prompt === 'theaters' ? (
            <TheaterPrompt copy={copy} description={theaterDescription} />
          ) : null}

          {prompt === 'gratitude' ? (
            <GratitudePrompt copy={copy} onShare={onShare} />
          ) : null}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function TheaterPrompt({
  copy,
  description,
}: {
  copy: VoyagePromptCopy;
  description: string;
}) {
  return (
    <>
      <PromptSeal>
        <MapPin aria-hidden="true" />
      </PromptSeal>
      <p className="voyage-prompt-eyebrow">{copy.theaters.eyebrow}</p>
      <DialogTitle>{copy.theaters.title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
      <DialogClose
        render={<Button className="voyage-prompt-primary" size="lg" />}
      >
        <Check aria-hidden="true" />
        {copy.theaters.confirm}
      </DialogClose>
    </>
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
