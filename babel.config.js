module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                loose: true,
                targets: {
                    node: 'current',
                    edge: '17',
                    ie: '11',
                    ios: '11.3',
                    safari: '13',
                },
                exclude: [
                    'transform-async-to-generator',
                    'transform-regenerator',
                ],
            },
        ],
    ],
}
