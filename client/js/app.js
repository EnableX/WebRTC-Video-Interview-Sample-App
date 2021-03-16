$(document).ready(function(){
	/* */
	
	/* Content appear */
	if($('body').hasClass('content-appear')) {
		$('body').addClass('content-appearing')
		setTimeout(function() {
			$('body').removeClass('content-appear content-appearing');
		}, 800);
	}


	/* Scroll */
	// if(jQuery.browser.mobile == false) {
	// 	function initScroll(){
	// 		$('.custom-scroll').jScrollPane({
	// 			autoReinitialise: true,
	// 			autoReinitialiseDelay: 100,
    //             maintainPosition: true,
    //             stickToBottom: true
	// 		});
	// 	}
	//
	// 	initScroll();
	//
	// 	$(window).resize(function() {
	// 		initScroll();
	// 	});
	// }

	/* Scroll - if mobile */
	if(jQuery.browser.mobile == true) {
		$('.custom-scroll').css('overflow-y','scroll');
		$("#share_screen_btn").hide();
	}


    $('.chat').scrollbar({
        autoBottom: true
    });
    $('#second_sidebar').scrollbar({
        autoBottom: true
    });

    var sitebar_height = $(".site-sidebar").innerHeight() - $("#first_sidebar").innerHeight() -  $("#third_sidebar").innerHeight();
    $("#second_sidebar").css("height",sitebar_height-25);
	/********Chat UI Bot height calculation *************/
	var container = $(".site-header").innerHeight() + $(".footer").innerHeight() + $(".scw-header").innerHeight()+$(".scw-form").innerHeight();
	var inner_height = $(window).innerHeight() -container ;


    $( window ).resize(function() {
        container = $(".site-header").innerHeight() + $(".footer").innerHeight() + $(".scw-header").innerHeight()+$(".scw-form").innerHeight();
        inner_height = $(window).innerHeight() -container ;

    });
    $(".chat").css("height",inner_height);

    /********Layout manager height calculation *************/

    var conf_container_height = $(".site-header").innerHeight() + $(".footer").innerHeight();
    var conf_container_inner_height = $(window).innerHeight() -conf_container_height ;
    $( window ).resize(function() {
        conf_container_height = $(".site-header").innerHeight() + $(".footer").innerHeight();
        conf_container_inner_height = $(window).innerHeight() -conf_container_height ;

    });
    $("#layout_manager").css("height",conf_container_inner_height-30);
    $(".watermark").css("height",conf_container_inner_height-30);
    /********Layout manager width calculation *************/
    if(jQuery.browser.mobile == true) {
        var conf_container_inner_width = $(window).innerWidth();
    }
    else
	{
        var conf_container_width = $(".site-sidebar").innerWidth();
        var conf_container_inner_width = $(window).innerWidth() -conf_container_width ;
        $( window ).resize(function() {
            conf_container_width = $(".site-sidebar").innerWidth();
            conf_container_inner_width = $(window).innerWidth() -conf_container_width ;

        });
	}
    $("#layout_manager").css("width",conf_container_inner_width-30);
    $(".watermark").css("width",conf_container_inner_width-30);
    /* Switch sidebar to compact */
	if (matchMedia) {
		var mq = window.matchMedia("(min-width: 768px) and (max-width: 991px)");
		mq.addListener(WidthChange);
		WidthChange(mq);
	}
	//
	function WidthChange(mq) {
		if (mq.matches) {
			$('body').addClass('compact-sidebar');
			$('.site-sidebar li.with-sub').find('>ul').slideUp();
		} else {
			$('body').removeClass('compact-sidebar');
			sidebarIfActive();
		}
	}

	/* Fullscreen */
	$('.toggle-fullscreen').click(function() {
		$(document).toggleFullScreen();
	});

    /* Sidebar - on click */
	$('.site-sidebar li.with-sub > a').click(function() {
		if (!$('body').hasClass('compact-sidebar')) {
			if ($(this).parent().hasClass('active')) {
				$(this).parent().removeClass('active');
				$(this).parent().find('>ul').slideUp();
			} else {
				if (!$(this).parent().parent().closest('.with-sub').length) {
					$('.site-sidebar li.with-sub').removeClass('active').find('>ul').slideUp();
				}
				$(this).parent().addClass('active');
				$(this).parent().find('>ul').slideDown();
			}
		}
	});

	/* Sidebar - if active */
	function sidebarIfActive(){
		$('.site-sidebar ul > li:not(.with-sub)').removeClass('active');
		var url = window.location;
	    var element = $('.site-sidebar ul > li > a').filter(function () {
	        return this.href == url || url.href.indexOf(this.href) == 0;
	    });
		element.parent().addClass('active');

		$('.site-sidebar li.with-sub').removeClass('active').find('>ul').hide();
		var url = window.location;
	    var element = $('.site-sidebar ul li ul li a').filter(function () {
	        return this.href == url || url.href.indexOf(this.href) == 0;
	    });
		element.parent().addClass('active');
		element.parent().parent().parent().addClass('active');

	    if(!$('body').hasClass('compact-sidebar')) {
			element.parent().parent().slideDown();
	    }
	}

	sidebarIfActive();

	/* Sidebar - show and hide */
	$('.site-header .sidebar-toggle-first').click(function() {
		if ($('body').hasClass('site-sidebar-opened')) {
			$('body').removeClass('site-sidebar-opened');
			if(jQuery.browser.mobile == false){
				$('html').css('overflow','auto');
			}
		} else {
			$('body').addClass('site-sidebar-opened');
			if(jQuery.browser.mobile == false){
				$('html').css('overflow','hidden');
			}
		}
	});

	$('.site-header .sidebar-toggle-second').click(function() {
		var compact = 'compact-sidebar';

		if($('body').hasClass(compact)) {
			$('body').removeClass(compact);
			sidebarIfActive();
            $("#chat_notify").html(0)
		} else {
			$('body').addClass(compact);
			$('.site-sidebar li.with-sub').find('>ul').slideUp();
            $("#chat_notify").html(0)
		}
	});

	/* Sidebar - overlay */
	$('.site-overlay').click(function() {
		$('.site-header .sidebar-toggle-first').removeClass('active');
		$('body').removeClass('site-sidebar-opened');
		if(jQuery.browser.mobile == false){
			$('html').css('overflow','auto');
		}
	});

	/* Sidebar second - toggle */

	/* Template options - toggle */
	$('.template-options .to-toggle').click(function() {
        getDevice(function () {
        });
		$('.template-options').toggleClass('opened');
	});

	/* Chat */
	$('.sidebar-chat a, .sidebar-chat-window a').click(function() {
		$('.sidebar-chat').toggle();
		$('.sidebar-chat-window').toggle();
	});

	/* Switchery */
	// $('.js-switch').each(function() {
	// 	new Switchery($(this)[0], $(this).data());
	// });

	/* Template options */




	/* Hide on outside click */
	$(document).mouseup(function (e) {
	    var container = $('.template-options, .site-sidebar-second, .toggle-button-second');

	    if (!container.is(e.target) && container.has(e.target).length === 0) {
	        container.removeClass('opened');
			$('.template-options').show();
			$('.toggle-button-second').removeClass('active');
	    }
	});

	/*  Tooltip */
	$('[data-toggle="tooltip"]').tooltip();

	/*  Popover */
	$('[data-toggle="popover"]').popover();

});