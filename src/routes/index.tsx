import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import {
  defaultSocialImage,
  localizedPageLinks,
  publicRobotsMeta,
} from '@/lib/seo';
import { getLocale } from '@/paraglide/runtime.js';
import { Voyage } from '@/blocks/voyage';
import * as m from '@/blocks/voyage-messages';

/**
 * Default landing page — demo content. Rewrite this file (and the blocks in
 * src/blocks/) for your project. The primitives in src/components/ stay.
 * See /quick-start or /clone-website to automate the rewrite.
 */
function HomePage() {
  return <Voyage />;
}

export const Route = createFileRoute('/')({
  loader: async () => {
    const locale = getLocale();
    return { locale };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title = m['voyage.metadata.title']({}, { locale: locale as any });
    const description = m['voyage.metadata.description'](
      {},
      { locale: locale as any }
    );
    const { canonical: canonicalUrl, links } = localizedPageLinks('/', locale);
    const socialImage = defaultSocialImage();
    return {
      meta: [
        { title },
        {
          name: 'description',
          content: description,
        },
        publicRobotsMeta(),
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:site_name', content: envConfigs.app_name },
        { property: 'og:locale', content: locale === 'zh' ? 'zh_CN' : 'en_US' },
        { property: 'og:image', content: socialImage },
        {
          property: 'og:image:alt',
          content: m['voyage.metadata.image_alt'](
            {},
            { locale: locale as any }
          ),
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: socialImage },
      ],
      links,
    };
  },
  component: HomePage,
});
