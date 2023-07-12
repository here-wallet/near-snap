import path from 'path';

export const onCreateWebpackConfig = ({ actions }: any) => {
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        assert: path.resolve('assert/'),
        crypto: path.resolve('crypto-browserify'),
        buffer: path.resolve('buffer/'),
        http: false,
        https: false,
        os: false,
        stream: false,
      },
    },
  });
};
