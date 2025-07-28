import { relative_url } from 'hexo-util';

const relativeUrlHelper = function(from: string, to: string) {
  return relative_url(from, to);
};

export default relativeUrlHelper;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = relativeUrlHelper;
  module.exports.default = relativeUrlHelper;
}
