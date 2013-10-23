(function($){
  $('#banner-getting-started-input').on('click', function(){
    $(this).select();
  });

  $('#page-mobile-menu').on('change', function(){
    var val = $(this).find(':selected').val();

    if (val) location.href = val;
  });
})(jQuery);