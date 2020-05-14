const path = require("path");
const {
  override,
  fixBabelImports,
  addWebpackAlias,
  addWebpackPlugin,
  useEslintRc,
} = require("customize-cra");
const AntdDayjsWebpackPlugin = require("antd-dayjs-webpack-plugin");

//解决 addLessLoader bug，待作者更新customize-cra包后可删除
const addLessLoader = (loaderOptions = {}) => (config) => {
  const mode = process.env.NODE_ENV === "development" ? "dev" : "prod";
  // Need these for production mode, which are copied from react-scripts
  const publicPath = require("react-scripts/config/paths").servedPath;
  const shouldUseRelativeAssetPaths = publicPath === "./";
  const shouldUseSourceMap =
    mode === "prod" && process.env.GENERATE_SOURCEMAP !== "false";
  const lessRegex = /\.less$/;
  const lessModuleRegex = /\.module\.less$/;
  const localIdentName =
    loaderOptions.localIdentName || "[path][name]__[local]--[hash:base64:5]";

  const getLessLoader = (cssOptions) => {
    return [
      mode === "dev"
        ? require.resolve("style-loader")
        : {
            loader: require("mini-css-extract-plugin").loader,
            options: Object.assign(
              {},
              shouldUseRelativeAssetPaths ? { publicPath: "../../" } : undefined
            ),
          },
      {
        loader: require.resolve("css-loader"),
        options: cssOptions,
      },
      {
        loader: require.resolve("postcss-loader"),
        options: {
          ident: "postcss",
          plugins: () => [
            require("postcss-flexbugs-fixes"),
            require("postcss-preset-env")({
              autoprefixer: {
                flexbox: "no-2009",
              },
              stage: 3,
            }),
          ],
          sourceMap: shouldUseSourceMap,
        },
      },
      {
        loader: require.resolve("less-loader"),
        options: Object.assign(loaderOptions, {
          sourceMap: shouldUseSourceMap,
        }),
      },
    ];
  };

  const loaders = config.module.rules.find((rule) => Array.isArray(rule.oneOf))
    .oneOf;

  // Insert less-loader as the penultimate item of loaders (before file-loader)
  loaders.splice(
    loaders.length - 1,
    0,
    {
      test: lessRegex,
      exclude: lessModuleRegex,
      use: getLessLoader({
        importLoaders: 2,
      }),
      sideEffects: mode === "prod",
    },
    {
      test: lessModuleRegex,
      use: getLessLoader({
        importLoaders: 2,
        modules: true,
        localIdentName: localIdentName,
      }),
    }
  );

  return config;
};

module.exports = override(
  useEslintRc(),
  addWebpackAlias({
    "@": path.resolve("./src"),
  }),
  addWebpackPlugin(new AntdDayjsWebpackPlugin()), //使用 antd-dayjs-webpack-plugin 插件用 Day.js 替换 momentjs 来大幅减小打包大小
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true,
  }),
  addLessLoader({
    lessOptions: {
      // 自定义主题,如果使用less-loader@5，请移除 lessOptions 这一级直接配置选项。
      javascriptEnabled: true,
      modifyVars: { "@primary-color": "#1DA57A" },
    },
  })
);
