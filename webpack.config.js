var path  = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var liveReload = require('webpack-watch-livereload-plugin');
var webpack = require('webpack');

module.exports = function WebpackConfig()
    {

    var config = {};


    config.entry = './app/entry.js';
    config.output = {
        filename:'bundle.js',
        path:path.resolve(__dirname,'dist')
        }

    config.module = {
        rules:[
            {
            'test': /\.scss$/,
            'loaders':ExtractTextPlugin.extract(
                {
                //fallback:'style-loader',
                use:['css-loader','sass-loader']
                })
            }
            ]
        }


    config.plugins = [

        new ExtractTextPlugin('style.css'),
        new liveReload(
            {
             'files':[
                 './dist/*.js',
                 './dist/*.css',
                 './app/views/**/*.html'
             ]
            })

        ]

    return config;


    }