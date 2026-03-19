import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
    basePath: '/brand/',
  },
  preset: minimal2023Preset,
  images: ['public/brand/icon-mh.svg'],
});
