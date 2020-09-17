import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const createConfig = (filename) => ({
  input: `src/${filename}.js`,
  output: [
    {
      file: `dist/${filename}.js`,
      format: 'umd',
      sourcemap: true,
      name: `${filename}`,
    }
  ],
  external: false,
  treeshake: {
    propertyReadSideEffects: false,
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    resolve({
      mainFields: ['module', 'jsnext', 'main'],
      browser: true,
      extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
      preferBuiltins: false
    }),
    commonjs({
      include: /\/node_modules\//,
    }),
    json(),
    terser({
      compress: {
        keep_infinity: true,
        pure_getters: true,
        passes: 10,
      },
      output: {
        wrap_func_args: false,
        comments: false,
      },
      ecma: 5
    }),
    filesize(),
  ]
})

export default [
  'index',
  'component',
  'fetch',
  'interval',
  'truncate'
].map(createConfig)
