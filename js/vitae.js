// using "jQuery" here instead of the dollar sign will protect against conflicts with other libraries like MooTools
jQuery(document).ready(function () {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  jQuery.init();
});

// plugin structure used so we can use the "$" sign safely
(function ($) {
  //main vars
  var mainContainer;
  var win;
  var contWidth;
  var prevContWidth;
  var animateSkills = false;

  $.init = function () {

    //Save DOM elements
    win = $(window);
    win.scrollTop(0);

    mainContainer = $('.container');
    contWidth = mainContainer.width();
    prevContWidth = contWidth;

    //handle window events
    $(window).resize(function () {
      handleWindowResize();
    });
    handleWindowResize();

    $(window).on('scroll', function () {
      if (isElementInViewport($('.progress-circles'))) {
        $(window).off('scroll');
        animateSkills = true;
        initSkills();
      }
    });

    //Init
    initMenu();
    initAccordion();
    initTabs();
    scaleIframes();
    initContactForm();
  };

  function isElementInViewport(el) {
    // Special bonus for those using jQuery
    if (typeof jQuery === 'function' && el instanceof jQuery) {
      el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) /* or $(window).height() */ &&
      rect.right <=
      (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //MENU
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  function initMenu() {
    var menuList = $('nav.main ul');
    var menuBtn = $('nav.main button');
    var menuItems = menuList.find('li a');

    menuBtn.click(function () {
      if (menuList.hasClass('open')) {
        menuList.removeClass('open');
        $(this).removeClass('closed');
      } else {
        menuList.addClass('open');
        $(this).addClass('closed');
      }
    });

    menuItems.on('click', function () {
      menuItems.removeClass('selected');
      $(this).addClass('selected');
      menuList.removeClass('open');
      menuBtn.removeClass('closed');
      $.scrollTo($(this).find('a').attr('href'), 1000, { offset: contWidth < 767 ? -60 : -20 });
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  //Init skills
  /////////////////////////////////////////////////////////////////////////////

  function initSkills() {
    if ($('.progress-circles').length) {
      $('.progress-circles').find('svg').remove();

      $('.progress-circles').each(function (i) {
        var s = $(this);
        var contWidth = s.width();
        var arc = s.find('.arc');
        arc.attr('id', 'arc' + i);

        var amount = arc.attr('data-percent');
        var strkw = arc.attr('data-stokewidth');
        var sign = arc.attr('data-sign');
        var fontSize = arc.attr('data-fontSize');
        var circleColor = arc.attr('data-circleColor');
        var strokeInnerColor = arc.attr('data-innerStrokeColor');
        var strokeColor = arc.attr('data-strokeColor');
        var textColor = arc.attr('data-textColor');
        var circleSize = arc.attr('data-size');

        if (parseInt(circleSize, 10) + parseInt(strkw, 10) > contWidth) {
          circleSize = contWidth - strkw;
        }

        var fullSize = parseInt(circleSize, 10) + parseInt(strkw, 10);

        //Create raphael object
        var r = Raphael('arc' + i, fullSize, fullSize);

        //draw inner circle
        r.circle(fullSize / 2, fullSize / 2, circleSize / 2).attr({
          stroke: strokeInnerColor,
          'stroke-width': strkw,
          fill: circleColor,
        });

        //add text to inner circle
        var title = r
          .text(fullSize / 2, fullSize / 2, 0 + sign)
          .attr({
            font: fontSize + 'px Roboto Slab',
            fill: textColor,
          })
          .toFront();

        r.customAttributes.arc = function (xloc, yloc, value, total, R) {
          var alpha = (360 / total) * value,
            a = ((90 - alpha) * Math.PI) / 180,
            x = xloc + R * Math.cos(a),
            y = yloc - R * Math.sin(a),
            path;
          if (total == value) {
            path = [
              ['M', xloc, yloc - R],
              ['A', R, R, 0, 1, 1, xloc - 0.01, yloc - R],
            ];
          } else {
            path = [
              ['M', xloc, yloc - R],
              ['A', R, R, 0, +(alpha > 180), 1, x, y],
            ];
          }
          return {
            path: path,
          };
        };

        //make an arc at 150,150 with a radius of 110 that grows from 0 to 40 of 100 with a bounce
        var my_arc = r.path().attr({
          stroke: strokeColor,
          'stroke-width': strkw,
          arc: [fullSize / 2, fullSize / 2, 0, 100, circleSize / 2],
        });

        var anim = Raphael.animation(
          {
            arc: [fullSize / 2, fullSize / 2, amount, 100, circleSize / 2],
          },
          1500,
          'easeInOut'
        );

        eve.on('raphael.anim.frame.*', onAnimate);

        function onAnimate() {
          var howMuch = my_arc.attr('arc');
          title.attr('text', Math.floor(howMuch[2]) + sign);
        }

        if (animateSkills) {
          my_arc.animate(anim.delay(i * 200));
        }
      });
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //TABS
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  function initTabs() {
    if ($('.tabs').length) {
      var coolTabs = $('.tabs');
      var auto = coolTabs.attr('data-autoPlay') == 'true' ? true : false;
      var delay = parseInt(coolTabs.attr('data-autoDelay'), 10);

      coolTabs.tabs({
        show: function (event, ui) {
          var lastOpenedPanel = $(this).data('lastOpenedPanel');
          if (!$(this).data('topPositionTab')) {
            $(this).data('topPositionTab', $(ui.panel).position().top);
          }
          // do crossfade of tabs
          $(ui.panel)
            .hide()
            .css('z-index', 2)
            .fadeIn(300, function () {
              $(this).css('z-index', '');
              if (lastOpenedPanel) {
                lastOpenedPanel.toggleClass('ui-tabs-hide').hide();
              }
            });

          $(this).data('lastOpenedPanel', $(ui.panel));
        },
      });

      if (auto) {
        coolTabs.tabs('rotate', delay);
      }
    }

    checkTabSize();
  }

  function checkTabSize() {
    if ($('.tabs').length) {
      $('.tabs').each(function (i) {
        var t = $(this);
        var pw = t.parent().width();
        var list = t.find('ul').first();
        var items = list.find('li');
        var last = list.find('li:last-child');
        var a = t.find('ul li a');
        var itemsw = 0;

        items.each(function (i) {
          var l = $(this);
          var w = textWidth(l.find('a'), 14, true) + 30;
          itemsw += w;
        });

        if (itemsw >= pw) {
          list.css({
            height: 'auto',
          });

          items.css({
            marginBottom: '2px',
            float: 'none',
          });

          a.css({
            display: 'block',
            float: 'none',
          });
        } else {
          list.css({
            height: '37px',
          });

          items.not(last).css({
            borderRight: 'none',
          });

          items.css({
            marginBottom: 0,
            float: 'left',
          });

          a.css({
            display: 'inline',
            float: 'left',
          });
        }
      });
    }
  }

  function textWidth(txt, fontSize, isHtml) {
    var html_calc;

    if (isHtml) {
      html_calc = $('<span>' + txt.html() + '</span>');
    } else {
      html_calc = $('<span>' + txt + '</span>');
    }
    html_calc.css('font-size', fontSize + 'px').hide();
    html_calc.prependTo('body');
    var width = html_calc.width();
    html_calc.remove();
    return width;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //ACCORDION
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  function initAccordion() {
    if ($('.acc').length) {
      //var accordion;

      $('.acc').each(function (i) {
        var ac = $(this);
        var as = ac.find('.acc-section');
        var h = ac.find('h4');
        var activeS = null;
        var activeH = null;

        //collapse all content
        as.css('display', 'none');

        //click
        h.click(function () {
          var c = $(this);
          var s = c.parent().find('.acc-section');

          if (!c.hasClass('acc-selected')) {
            if (activeS) {
              activeH.removeClass('acc-selected');
              activeS.slideUp();
            }

            c.addClass('acc-selected');
            s.slideDown();
            activeS = s;
            activeH = c;
          } else {
            c.removeClass('acc-selected');
            s.slideUp();
            activeS = null;
            activeH = null;
          }
        });
      });
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  //Init progress bars
  /////////////////////////////////////////////////////////////////////////////

  function initProgressBars() {
    if ($('.progressbars').length) {
      $('.progressbars').each(function () {
        var s = $(this);
        var w = s.width();

        s.find('.over').each(function (i) {
          var o = $(this);
          var pct = o.attr('data-percentage');
          var tip = o.parent().find('.tooltip');
          var txt = tip.find('span');

          tip.css({
            opacity: 0,
            left: 0,
          });

          o.css('width', 0);

          tip.delay(100 * (i + 1)).animate(
            {
              opacity: 1,
            },
            2000
          );

          o.delay(200 * (i + 1)).animate(
            {
              width: pct + '%',
            },
            {
              duration: 2000,
              step: function (now, fx) {
                var data = fx.elem.id + ' ' + fx.prop + ': ' + now;

                var destX = Math.round((now * w) / 100) - 15 + 'px';

                tip.css('left', destX);
                txt.text(Math.round(now) + '%');
              },
            }
          );
        });
      });
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //PORTFOLIO
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  function scaleIframes() {
    if ($('.scaleframe').length) {
      $('.scaleframe').fitVids();
    }
  }

  $('.portfolio-container').each(function () {
    var portfolio = $(this);
    var portfolioSingle = portfolio.find('.portfolio-single');
    var portfolioItems = portfolio.find('.portfolio-item');
    var portfolioSingleMedia = portfolioSingle.find('.portfolio-single-media');
    var portfolioSingleText = portfolioSingle.find('.portfolio-single-text');
    var currentPortfolioSingle = 0;
    var currentPortfolioTotal = portfolioItems.length;

    var pHeading = $('<h4 />').appendTo(portfolioSingleText);
    var pPara = $('<p />').appendTo(portfolioSingleText);

    portfolio.find('figure').each(function (i) {
      $(this).on('click', function () {
        currentPortfolioSingle = i;
        loadPortfolioSingle();
      });
    });

    portfolio.on('click', '.close', function () {
      portfolioSingle.slideUp(500, function () {
        if (portfolioSingle.find('iframe').length) {
          portfolioSingleMedia.html('');
        }
      });
    });

    portfolio.on('click', '.next', function () {
      currentPortfolioSingle =
        currentPortfolioSingle < currentPortfolioTotal - 1
          ? (currentPortfolioSingle = currentPortfolioSingle + 1)
          : (currentPortfolioSingle = 0);
      loadPortfolioSingle();
    });

    portfolio.on('click', '.prev', function () {
      currentPortfolioSingle =
        currentPortfolioSingle > 0
          ? (currentPortfolioSingle = currentPortfolioSingle - 1)
          : (currentPortfolioSingle = currentPortfolioTotal - 1);
      loadPortfolioSingle();
    });

    portfolio.on('click', '.link', function () {
      var porfolioItem = portfolioItems.eq(currentPortfolioSingle).find('figure');
      var url = porfolioItem.attr('data-url');
      var target = porfolioItem.attr('data-target');
      window.open(url, target);
    });

    function emptySinglePortfolio() {
      portfolioSingleMedia.add(portfolioSingleText).css('opacity', 0);
      $('<div class="one sPreloader row"><div class="preloader"></div></div>').insertBefore(
        portfolioSingle
      );
      portfolioSingle.addClass('hidden').slideUp();
      $.scrollTo(portfolioItems.eq(currentPortfolioSingle), 500);

      portfolioSingle.find('img').remove();
      portfolioSingleMedia.html('');
    }

    function loadPortfolioSingle() {
      var porfolioItem = portfolioItems.eq(currentPortfolioSingle).find('figure');
      portfolio.find('figure').removeClass('selected');
      porfolioItem.addClass('selected');

      var media = porfolioItem.attr('data-largeMedia');
      var flexSliderItems = media.split(',');
      var type = porfolioItem.attr('data-mediaType');
      pHeading.html(porfolioItem.attr('data-largeTitle'));
      pPara.html(porfolioItem.attr('data-largeDesc'));

      emptySinglePortfolio();

      if (type == 'image') {
        if (flexSliderItems.length > 1) {
          loadFlexSlider(flexSliderItems);
        } else {
          loadPortfolioImage(media);
        }
      } else if (type === 'youtube' || type === 'vimeo') {
        var htm =
          type === 'youtube'
            ? '<iframe width="640" height="360" src="https://www.youtube.com/embed/' +
            media +
            '?hd=1&amp;wmode=opaque&amp;showinfo=0" allowfullscreen></iframe>'
            : '<iframe width="640" height="360" src="https://player.vimeo.com/video/' +
            media +
            '" allowfullscreen></iframe>';

        portfolioSingleMedia.html(htm);
        scaleIframes();
        $('.sPreloader').remove();
        var pos = calculateSinglePos();
        portfolioSingle.remove().insertAfter(pos).removeClass('hidden').slideDown();
        portfolioSingleMedia.add(portfolioSingleText).animate({ opacity: 1 }, 1000);
      }
    }

    function loadPortfolioImage(path, cont) {
      var img = $('<img />').addClass('img-fluid').appendTo(portfolioSingleMedia);
      img.attr('src', path);

      if ($(img)[0].complete) {
        initPortfolioItem();
      } else {
        img.on('load', initPortfolioItem);
      }
    }

    function loadFlexSlider(items) {
      var flexSliderContainer = $('<div/>')
        .addClass('flexslider arrowvisible')
        .attr('data-arrows', true)
        .attr('data-thumbnail', false);
      var flexSliderList = $('<ul/>').addClass('slides').appendTo(flexSliderContainer);

      for (var i = 0; i < items.length; i++) {
        var li = $('<li/>').appendTo(flexSliderList);
        $('<img/>').attr('src', items[i]).appendTo(li);
      }

      flexSliderContainer.appendTo(portfolioSingleMedia);
      initPortfolioItem();
      startPortfolioFlex(flexSliderContainer);
    }

    function initPortfolioItem() {
      $('.sPreloader').remove();
      var pos = calculateSinglePos();
      portfolioSingle.remove().insertAfter(pos).removeClass('hidden').slideDown();
      portfolioSingleMedia.add(portfolioSingleText).animate({ opacity: 1 }, 1000);
    }

    function startPortfolioFlex(flexSliderContainer) {
      flexSliderContainer.css('opacity', 0);
      var useArrows = flexSliderContainer.attr('data-arrows') == 'true' ? true : false;
      var useThumbs = flexSliderContainer.attr('data-thumbnail') == 'true' ? true : false;

      flexSliderContainer.flexslider({
        animation: 'slide',
        video: false,
        directionNav: useArrows,
        controlNav: useThumbs,
        pauseOnAction: true,
        pauseOnHover: true,
        slideshow: true,
        start: function () {
          flexSliderContainer.animate({ opacity: 1 }, 1000);
          $('<i class="bi bi-chevron-left"></i>').appendTo(flexSliderContainer.find('.flex-prev'));
          $('<i class="bi bi-chevron-right"></i>').appendTo(flexSliderContainer.find('.flex-next'));
        },
      });
    }

    function calculateSinglePos() {
      var cols = contWidth < 767 ? 2 : 4;
      var row = Math.floor(currentPortfolioSingle / cols);
      var last = (row + 1) * cols - 1;
      return portfolioItems.eq(last);
    }

  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //CONTACT FORM
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  var emailregex = /^(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/i;

  function initContactForm() {
    var form = $('form');
    var formButton = form.find('button');
    var formMessage = $('.form-message');

    form.on('submit', function (e) {
      e.preventDefault();

      var nameValue = form.find('[name="name"]').val();
      var emailValue = form.find('[name="email"]').val();
      var messageValue = form.find('[name="message"]').val();

      if (nameValue === '' || emailValue === '' || messageValue === '') {
        return formMessage.html('<p>Please fill in all the required fields</p>').slideDown('slow');
      } else if(!emailregex.test(emailValue)) {
        return formMessage.html('<p>Please enter a valid email address</p>').slideDown('slow');
      }

      var action = $(this).attr('action');
      var values = $(this).serialize();
      formButton.attr('disabled', 'disabled');

      formMessage.slideUp(750, function () {
        formMessage.hide();
        $.post(action, values, function (response) {
          console.log('response', response)
          formMessage.html(response).slideDown('slow');
          formButton.removeAttr('disabled');
        });
      });

      return false;
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  //handleWindowResize
  /////////////////////////////////////////////////////////////////////////////
  function handleWindowResize() {
    contWidth = mainContainer.width();

    if (contWidth != prevContWidth) {
      prevContWidth = contWidth;
      initSkills();
      initProgressBars();
    }
  }

  /////////////////////////////////
  //End document
})(jQuery);
