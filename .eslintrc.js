module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'standard',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        indent: ['error', 4],
        'comma-dangle': ['error', 'always-multiline'],
        'space-before-function-paren': ['error', {
            anonymous: 'always',
            named: 'never',
            asyncArrow: 'always',
        }],
    },
    globals: {
        Alpine: 'readonly',
    },
}
