(function($){
  $.getScript(moment_js_path, function(){
    var url = 'https://api.twitter.com/1/statuses/user_timeline/' + twitter_stream[0] + '.json?count=' + twitter_stream[1] + '&exclude_replies=' + (twitter_stream[2] ? 0 : 1) + '&trim_user=true&callback=?';

    var linkify = function(text){
      text = text
        .replace(/(https?:\/\/)([\w\-:;?&=+.%#\/]+)/gi, '<a href="$1$2">$2</a>')
        .replace(/(^|\W)@(\w+)/g, '$1<a href="//twitter.com/$2">@$2</a>')
        .replace(/(^|\W)#(\w+)/g, '$1<a href="//search.twitter.com/search?q=%23$2">#$2</a>');

      return text;
    };

    $.getJSON(url, function(json){
      var result = '';

      for (var i=0, len=json.length; i<len; i++){
        var item = json[i];
        result += '<li>' + linkify(item.text) + '<small>' + moment(item.created_at).fromNow() + '</small></li>';
      }

      $('#tweets').html(result);
    });
  });
})(jQuery);
