module.exports = {
    module: {
        rules: [
            {
            test: /\.(png|jpe?g|gif|jp2|webp|svg)$/,
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
            },
            },
        ],
    }
}