import type { ReactNode } from 'react';
import {
  Anchor,
  Check,
  LocateFixed,
  Navigation,
  Route as RouteIcon,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

export type VoyagePromptKind = 'welcome' | 'gratitude';

export interface VoyagePromptCopy {
  close: string;
  welcome: {
    eyebrow: string;
    title: string;
    description: string;
    steps: Array<{ title: string; body: string }>;
    blessingLabel: string;
    blessings: string[];
    cta: string;
  };
  gratitude: {
    eyebrow: string;
    title: string;
    description: string;
    share: string;
    later: string;
  };
}

const welcomeStepIcons = [RouteIcon, LocateFixed, Check];

export function VoyagePrompts({
  prompt,
  copy,
  blessingIndex,
  onClose,
  onShare,
}: {
  prompt: VoyagePromptKind | null;
  copy: VoyagePromptCopy;
  blessingIndex: number;
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

          {prompt === 'welcome' ? (
            <WelcomePrompt copy={copy} blessingIndex={blessingIndex} />
          ) : null}

          {prompt === 'gratitude' ? (
            <GratitudePrompt copy={copy} onShare={onShare} />
          ) : null}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function WelcomePrompt({
  copy,
  blessingIndex,
}: {
  copy: VoyagePromptCopy;
  blessingIndex: number;
}) {
  return (
    <>
      <PromptSeal>
        <Anchor aria-hidden="true" />
      </PromptSeal>
      <p className="voyage-prompt-eyebrow">{copy.welcome.eyebrow}</p>
      <DialogTitle>{copy.welcome.title}</DialogTitle>
      <DialogDescription>{copy.welcome.description}</DialogDescription>

      <ol className="voyage-prompt-steps">
        {copy.welcome.steps.map((step, index) => {
          const Icon = welcomeStepIcons[index] ?? Sparkles;
          return (
            <li key={step.title}>
              <span className="voyage-prompt-step-icon">
                <Icon aria-hidden="true" />
              </span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <blockquote className="voyage-blessing">
        <span>{copy.welcome.blessingLabel}</span>
        <p>{copy.welcome.blessings[blessingIndex]}</p>
      </blockquote>

      <DialogClose
        render={<Button className="voyage-prompt-primary" size="lg" />}
      >
        <Navigation aria-hidden="true" />
        {copy.welcome.cta}
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
