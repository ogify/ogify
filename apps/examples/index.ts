import { createRenderer, type OgFontConfig } from '@ogify/core';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import template from '@ogify/templates/basic';
import type { TemplateParams } from '@ogify/templates/basic';

type DemoCase = {
  output: string;
  label: string;
  description: string;
  params: TemplateParams;
  isRTL?: boolean;
};

const SUBTITLE_BODY =
  'dynamic Open Graph images for Next.js, Nuxt, Remix, and more. Just copy & paste the production-ready templates.';

const BASE: Omit<TemplateParams, 'layout' | 'subtitle'> = {
  title: 'Generate beautiful OG images in minutes',
  brandLogo: 'https://ogify.dev/logo.svg',
  brandName: '@ogify',
  extras: ['#zero-config', '#production-ready'],
  cta: 'Get started',
};

const layoutDemos: DemoCase[] = (['aligned', 'centered', 'split'] as const).flatMap((layout) =>
  ([false, true] as const).map((isRTL) => ({
    output: `layout/${layout}-${isRTL ? 'rtl' : 'ltr'}.png`,
    label: `${layout} ${isRTL ? 'RTL' : 'LTR'}`,
    description: `Basic template · layout="${layout}" · ${isRTL ? 'RTL' : 'LTR'}`,
    params: {
      ...BASE,
      layout,
      subtitle: `<span class="font-bold">Zero-config</span> ${SUBTITLE_BODY}`,
    },
    isRTL,
  }))
);

const subtitleDemos: DemoCase[] = [
  {
    output: 'subtitle/plain.png',
    label: 'plain mode',
    description: 'Plain string subtitle — no HTML tags',
    params: {
      ...BASE,
      layout: 'aligned',
      subtitle: `Zero-config ${SUBTITLE_BODY}`,
    },
  },
  {
    output: 'subtitle/html.png',
    label: 'html mode',
    description: 'HTML subtitle — htmlSnippet word-split flex layout',
    params: {
      ...BASE,
      layout: 'aligned',
      subtitle: `<span class="font-bold">Zero-config</span> ${SUBTITLE_BODY}`,
    },
  },
  {
    output: 'subtitle/html-centered.png',
    label: 'html mode centered',
    description: 'HTML subtitle on centered layout',
    params: {
      ...BASE,
      layout: 'centered',
      subtitle: `<span class="font-bold">Zero-config</span> for <span class="opacity-80">Next.js</span>, <span class="opacity-80">Nuxt</span> & <span class="opacity-80">Remix</span>. ${SUBTITLE_BODY.split('.')[0]}.`,
    },
  },
];

const paramDemos: DemoCase[] = [
  {
    output: 'params/custom-theme.png',
    label: 'custom theme',
    description: 'primaryColor, secondaryColor, textColor overrides',
    params: {
      ...BASE,
      layout: 'aligned',
      subtitle: `<span class="font-bold">Ocean theme</span> — custom brand colors for your OG cards.`,
      primaryColor: '#0f4c75',
      secondaryColor: '#bbe1fa',
      textColor: '#ffffff',
    },
  },
  {
    output: 'params/minimal.png',
    label: 'minimal',
    description: 'No logo, CTA, or extras — title + subtitle only',
    params: {
      title: 'Minimal OG card',
      layout: 'centered',
      subtitle: `<span class="font-bold">Clean</span> and focused — no footer chrome.`,
      brandLogo: '',
      brandName: '',
      extras: [],
      cta: '',
    },
  },
  {
    output: 'params/split-no-subtitle.png',
    label: 'split no subtitle',
    description: 'Split layout with title only (subtitle omitted)',
    params: {
      ...BASE,
      layout: 'split',
      subtitle: undefined,
      cta: '',
    },
  },
];

const allDemos: DemoCase[] = [...layoutDemos, ...subtitleDemos, ...paramDemos];

const handler = createRenderer<{ basic: TemplateParams }>({
  templates: { basic: template },
  cache: { type: 'memory' },
  sharedParams: {},
  // resvg omitted — auto-selects Node backend via createAutoResvg()
});

const FONT_OPTIONS: OgFontConfig[] = [
  { name: 'JetBrains Mono', weight: 400, style: 'normal' },
  { name: 'JetBrains Mono', weight: 700, style: 'normal' },
];

function subtitleMode(subtitle?: string): 'none' | 'plain' | 'html' {
  if (!subtitle) return 'none';
  if (!/<[a-z]/i.test(subtitle)) return 'plain';
  return 'html';
}

async function writeOutput(relativePath: string, buffer: Uint8Array): Promise<void> {
  const fullPath = join('outputs', relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, buffer);
}

async function renderDemo(demo: DemoCase): Promise<void> {
  const start = Date.now();

  console.log(`→ ${demo.label}`);
  console.log(`  ${demo.description}`);
  console.log(`  subtitle: ${subtitleMode(demo.params.subtitle)}`);

  const imageBuffer = await handler.renderToImage('basic', demo.params, {
    isRTL: demo.isRTL ?? false,
    fonts: FONT_OPTIONS,
  });

  await writeOutput(demo.output, imageBuffer);

  console.log(`  ✓ outputs/${demo.output} (${Date.now() - start}ms)\n`);
}

async function main(): Promise<void> {
  console.log(`\nOGify examples — ${allDemos.length} demos\n`);

  const failed: string[] = [];

  for (const demo of allDemos) {
    try {
      await renderDemo(demo);
    } catch (error) {
      failed.push(demo.output);
      console.error(`  ✗ ${demo.output}`, error);
      console.log();
    }
  }

  console.log('Summary');
  console.log('───────');
  console.log(`  layout/     ${layoutDemos.length} images — aligned · centered · split × LTR/RTL`);
  console.log(`  subtitle/   ${subtitleDemos.length} images — plain · html modes`);
  console.log(
    `  params/     ${paramDemos.length} images — theme · minimal · split without subtitle`
  );

  if (failed.length > 0) {
    console.error(`\nFailed (${failed.length}): ${failed.join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${allDemos.length} demos generated under apps/examples/outputs/\n`);
  }
}

await main();
