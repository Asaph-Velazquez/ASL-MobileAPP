module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Expo Router plugin must be first
      require.resolve('expo-router/babel'),
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          root: ['./'],
          alias: {
            '@': './',
          },
          extensions: ['.tsx', '.ts', '.js', '.json']
        }
      ],
      // Reanimated plugin has to be last
      'react-native-reanimated/plugin',
    ],
  };
};
