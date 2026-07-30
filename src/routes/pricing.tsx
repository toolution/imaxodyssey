import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import {
  defaultSocialImage,
  localizedPageLinks,
  publicRobotsMeta,
} from '@/lib/seo';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Pricing } from '@/blocks/pricing';

export const Route = createFileRoute('/pricing')({
  loader: () => {
    const locale = getLocale();
    return {
      locale,
      title: m['landing.pricing.title']({}, { locale }),
      description: m['landing.pricing.description']({}, { locale }),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { canonical, links } = localizedPageLinks(
      '/pricing',
      loaderData.locale
    );
    const socialImage = defaultSocialImage();
    return {
      meta: [
        { title: loaderData.title },
        { name: 'description', content: loaderData.description },
        publicRobotsMeta(),
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: loaderData.title },
        { property: 'og:description', content: loaderData.description },
        { property: 'og:url', content: canonical },
        { property: 'og:site_name', content: envConfigs.app_name },
        { property: 'og:image', content: socialImage },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: loaderData.title },
        { name: 'twitter:description', content: loaderData.description },
        { name: 'twitter:image', content: socialImage },
      ],
      links,
    };
  },
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
