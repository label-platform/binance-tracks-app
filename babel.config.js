module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            '@assets': './src/assets',
            '@screens': './src/screens',
            '@components': './src/components',
            '@hooks': './src/hooks',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  }
}
