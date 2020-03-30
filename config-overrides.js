const { override, fixBabelImports, addWebpackPlugin, addLessLoader, addDecoratorsLegacy, addWebpackAlias } = require('customize-cra');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const rewireCssModules = require('react-app-rewire-css-modules');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const path = require('path');
const resolve = dir => path.join(__dirname, '.', dir)

const addCustomize = () => config => {
  if (process.env.NODE_ENV === 'production') {
    // config.devtool = false; //去掉map文件
    if (config.plugins) {
      config.plugins.push(new BundleAnalyzerPlugin());
    }
    const splitChunksConfig = config.optimization.splitChunks;
    if (config.entry && config.entry instanceof Array) {
      config.entry = {
        main: config.entry,
        vendor: [
          'react',
          'react-dom',
          'react-router-dom',
          'react-redux',
          '@rematch/core',
          'react-router',
          'emotion',
          'axios',
          'js-cookie'
        ]
      };
    } else if (config.entry && typeof config.entry === 'object') {
      config.entry.vendor = [
        'react',
        'react-dom',
        'react-router-dom',
        'react-redux',
        '@rematch/core',
        'react-router',
        'emotion',
        'axios',
        'js-cookie'
      ];
    }

    Object.assign(splitChunksConfig, {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /node_modules/,
          name: 'vendors',
          priority: -10
        },
        common: {
          name: 'common',
          minChunks: 2,
          minSize: 30000,
          chunks: 'all'
        }
      }
    });
  }
  return config;
};

// css modules

const addRewireCssModules = () => (config, env) => {
  config = rewireCssModules(config, env);
  return config;
};

// 关闭CSS sourcemap
process.env.GENERATE_SOURCEMAP = 'false';
module.exports = override(
  fixBabelImports('lodash', {
    libraryDirectory: '',
    camel2DashComponentName: false
  }),
  // 配置路径别名
  addWebpackAlias({
    '@': resolve('src'),
    assets: resolve('src/assets'),
    api: resolve('src/api'),
    _c: resolve('src/components'),
    router: resolve('src/router'),
    store: resolve('src/store'),
    lib: resolve('src/lib')
  }),
  // antd按需加载
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true
  }),
  addLessLoader({
    modifyVars: { '@primary-color': '#52c41a' },
    javascriptEnabled: true,
    localIdentName: '[wm]__[local]-[hash:base64:5]'
  }),
  addDecoratorsLegacy(),
  addCustomize(),
  addRewireCssModules(),
  // 使用 Day.js 替换 momentjs 优化打包大小
  addWebpackPlugin(new AntdDayjsWebpackPlugin())
);