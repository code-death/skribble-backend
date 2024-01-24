const pkg = require('./package.json')

module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: pkg.volta.node,
                },
            },
        ],
    ],
}
