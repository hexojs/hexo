import { gravatar } from 'hexo-util';
export default gravatar;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = gravatar;
  module.exports.default = gravatar;
}
