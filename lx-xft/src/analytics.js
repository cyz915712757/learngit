window._hmt = window._hmt || [];
(function() {
  var hm = document.createElement('script');
  hm.src = 'https://hm.baidu.com/hm.js?104ec7b2af51a1ea36ea2699497dc3c6';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(hm, s);
})();

$('body').on('click', '[data-track]', function() {
  var label = $(this).data('track');
  window._hmt && window._hmt.push(['_trackEvent', label, 'click']);
});
