const config = {
    entry: {
      final: './build/final.js',
      double: './build/double.js'
    },
    output: {
      filename: '[name].js',
      path: __dirname + '/dist'
    }
}

module.exports = config;