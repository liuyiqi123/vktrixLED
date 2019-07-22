const path = require('path');
const webpack = require("webpack");
const nodeExternals = require('webpack-node-externals');
const EncodingPlugin = require('webpack-encoding-plugin');

module.exports = {
    mode: "development",
    entry: './app.js',
    output: {
        filename: 'bundle.js',
        publicPath: "/",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new EncodingPlugin({
            encoding: 'GBK'
        }),
        new webpack.NormalModuleReplacementPlugin(/^mqtt$/, "mqtt/dist/mqtt.js")
    ],
    externals: [nodeExternals()],
    target: "node",
    node: {
        __filename: true,
        __dirname: false
    }
};