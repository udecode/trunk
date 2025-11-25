import pluginBabel from '@rollup/plugin-babel';
import { defineConfig } from 'tsdown';

const HAS_REACT = false;

export default defineConfig({
  platform: 'neutral',
  target: 'esnext',
  tsconfig: './tooling/tsconfig.build.json',
  exports: true,
  sourcemap: true,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  plugins: HAS_REACT
    ? [
        pluginBabel({
          babelHelpers: 'bundled',
          parserOpts: {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
          },
          plugins: ['babel-plugin-react-compiler'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        }),
      ]
    : [],
});
