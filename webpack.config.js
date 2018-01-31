const config = {
    entry: {
      final: './build/final.js'
    },
    output: {
      filename: '[name].js',
      path: __dirname + '/dist'
    }
}

module.exports = config;