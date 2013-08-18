// paranoid-auto-spacing by gibuloto
// https://github.com/gibuloto/paranoid-auto-spacing

var config = hexo.config;

module.exports = function(data, callback){
  if (!config.auto_spacing) return callback();

  // 英文、數字、符號 ([a-z0-9~!@#&;=_\$\%\^\*\-\+\,\.\/(\\)\?\:\'\"\[\]\(\)])
  // 中文 ([\u4E00-\u9FFF])
  // 日文 ([\u3040-\u30FF])
  data.content = data.content
    // 中文在前
    .replace(/([\u4e00-\u9fa5\u3040-\u30FF])([a-z0-9@#&;=_\[\$\%\^\*\-\+\(\/])/ig, '$1 $2')
    // 中文在後
    .replace(/([a-z0-9#!~&;=_\]\,\.\:\?\$\%\^\*\-\+\)\/])([\u4e00-\u9fa5\u3040-\u30FF])/ig, '$1 $2')
    // 字"字"字 >> 字 "字" 字
    .replace(/([\u4e00-\u9fa5\u3040-\u30FF])(\"|\'(\S+))/ig, '$1 $2')
    .replace(/((\S+)\'|\")([\u4e00-\u9fa5\u3040-\u30FF])/ig, '$1 $3'); // $2 是 (\S+)

  callback(null, data);
};