const types = require('@babel/types');

const miniModules = [
  '@alipay/o3',
  '@alipay/o3-adapter-miniprogram',
  '@alipay/o3-tween',
  '@alipay/o3-controls',
  '@alipay/o3-framebuffer-picker',
  '@alipay/post-processing',
  '@alipay/o3-decal',
  '@alipay/o3-renderer-oit',
  '@alipay/o3-screenshot',
  '@alipay/o3-fsm',
  '@alipay/o3-draco',
  '@alipay/o3-hud',
];

const coreModules = [
  '@alipay/o3-math',
  '@alipay/o3-rhi-webgl',
  '@alipay/o3-loader',
  '@alipay/o3-math',
  '@alipay/o3-core',
];

module.exports = {
  visitor: {
    ImportDeclaration(path) {
      const node = path.node;
      let value = node.source.value;
      if (coreModules.indexOf(value) > -1) {
        value = '@alipay/o3';
      }
      if (miniModules.indexOf(value) > -1) {
        value = value + '/dist/miniprogram';
      } else if (value === 'dat.gui') {
        value = '/pages/playground/common/dat-mock';
      } else if (value === '@alipay/o3-engine-stats') {
        path.remove();
      }
    },
    NewExpression(path) {
      const node = path.node;
      if (node.callee.name === 'WebGLEngine') {
        node.arguments[0] = types.identifier('canvas');
      }
    },
  },
};
