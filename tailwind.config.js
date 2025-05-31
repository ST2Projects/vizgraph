import { join } from 'path';
import { skeleton } from '@skeletonlabs/skeleton/tailwind/skeleton.cjs';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
  ],
  theme: {
    extend: {}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    ...skeleton({
      themes: {
        preset: [
          {
            name: 'cerberus',
            enhancements: true,
            properties: {
              '--theme-font-family-base': 'system-ui',
              '--theme-font-family-heading': 'system-ui',
              '--theme-background': '0 0 0',
              '--theme-bg-1': '0 0 0',
              '--theme-bg-2': '0 0 0'
            }
          }
        ]
      }
    })
  ]
};
