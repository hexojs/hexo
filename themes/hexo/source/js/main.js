(function($){
  var base = 'http://zespia.tw/hexo/';

  $('#lang-select').change(function(){
    var lang = $(this).children(':selected').prop('value');
    location.href = base + lang;
  });
})(jQuery);