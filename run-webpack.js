const webpack = require('webpack');



const config = require('./webpack.config');

console.log(11)
const compile = webpack(config);
compile.run(()=>{
    console.log('webpackrun起来了')
})