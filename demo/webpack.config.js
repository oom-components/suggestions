const path = require('path');

module.exports = {
    context: __dirname,
    entry: './script.js',
    output: {
        filename: 'demo/script.dist.js'
    },
    devtool: 'source-map',
    node: false,
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    }
}
