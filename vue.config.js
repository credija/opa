const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function resolve (dir) {
  return path.join(__dirname, dir);
}

const productionConfig = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        styles: {
          name: 'styles',
          test: /\.s?css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@assets': resolve('src/assets'),
      '@components': resolve('src/components'),
      '@components-common': resolve('src/components/common'),
      '@components-admin': resolve('src/components/admin'),
      '@templates': resolve('src/components/templates'),
      '@views': resolve('src/views'),
      '@services': resolve('src/services'),
      '@utils': resolve('src/utils'),
      '@enums': resolve('src/enums'),
      '@store': resolve('src/store'),
      '@strophe': resolve('src/strophe'),
    }
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/element-ui[/\\]lib[/\\]locale[/\\]lang[/\\]zh-CN/, 'element-ui/lib/locale/lang/en')
  ]
};

module.exports = {
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.module
        .rule('string-replace')
        .test(/main\.js/)
        .use('string-replace-loader')
        .loader('string-replace-loader')
        .options({
          search: '../public/config/app-config-dev.json',
          replace: '../public/config/app-config.json',
        })
        .end();
    }
  },
  devServer: {
    https: false,
  },
  runtimeCompiler: true,
  productionSourceMap: false,
  configureWebpack: () => {
    if (process.env.IS_BUILD_TEST === 'true') {
      productionConfig.plugins.push(new BundleAnalyzerPlugin());
      return productionConfig;
    }
    return productionConfig;
  }
};
