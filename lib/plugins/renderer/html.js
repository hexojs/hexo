var extend = require('../../extend');

var process_html = function(data) {
	return data.text;
};

extend.renderer.register('html', 'html', process_html, true);
extend.renderer.register('htm', 'html', process_html, true);
