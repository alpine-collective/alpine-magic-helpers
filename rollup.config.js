import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'

const createConfig = (filename) => ({
    input: `src/${filename}.js`,
    output: [
        {
            file: `dist/${filename}.js`,
            format: 'umd',
            name: `AlpineMagicHelpers.${filename}`,
        },
    ],
    external: false,
    treeshake: {
        propertyReadSideEffects: false,
    },
    plugins: [
        babel({
            babelHelpers: 'bundled',
            exclude: 'node_modules/**',
        }),
        resolve({
            mainFields: ['module', 'jsnext', 'main'],
            browser: true,
            extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
            preferBuiltins: false,
        }),
        commonjs({
            include: /\/node_modules\//,
        }),
        json(),
        filesize(),
    ],
})

export default [
    'index',
    'component',
    'fetch',
    'interval',
    'range',
    'refresh',
    'screen',
    'scroll',
    'truncate',
    'undo',
    'unsafeHTML',
    'validate',
].map(createConfig)
