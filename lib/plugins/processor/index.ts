import type Hexo from '../../hexo/index.js';
import asset from './asset.js';
import data from './data.js';
import post from './post.js';

const processorIndex = (ctx: Hexo) => {
  const { processor } = ctx.extend;

  const assetObj = asset(ctx);
  processor.register(assetObj.pattern, assetObj.process);

  const dataObj = data(ctx);
  processor.register(dataObj.pattern, dataObj.process);

  const postObj = post(ctx);
  processor.register(postObj.pattern, postObj.process);
};

export default processorIndex;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = processorIndex;
  module.exports.default = processorIndex;
}
