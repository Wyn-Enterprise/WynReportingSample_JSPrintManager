const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	resolve: {
		extensions: ['.js'],
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'index.js',
	},
	stats: { modules: false, children: false, entrypoints: false, assets: false },
	devServer: {
		hot: true,
		compress: true,
		port: 3000,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html',
		}),
	],
};
