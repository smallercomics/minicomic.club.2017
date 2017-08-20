Zepto(function($){
  
    var $header_img = $('#main-header');
    var $header_small = $('#scroll-header');

	function on_scroll(){
        if ($(window).scrollTop() > $header_img.height()){
            $header_small.addClass('visible');
        }else{
            $header_small.removeClass('visible');
        }

    }
    $(window).scroll( debounce(on_scroll, 100, false));

    $('.fb-link').click(function(e){
        e.preventDefault();
        FB.ui({
                method: 'share',
                href: window.location.href,
        }, function(response){});
    });
});
