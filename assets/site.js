(function(){
  var menu=document.getElementById('menu'),nav=document.getElementById('nav');
  if(menu)menu.addEventListener('click',function(){nav.classList.toggle('open')});
  document.querySelectorAll('nav a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open')})});
  var links=document.querySelectorAll('nav a');
  window.addEventListener('scroll',function(){var y=window.scrollY+130;links.forEach(function(a){var id=a.getAttribute('href');if(id&&id.charAt(0)==='#'){var el=document.querySelector(id);if(el&&y>=el.offsetTop&&y<el.offsetTop+el.offsetHeight){links.forEach(function(x){x.classList.remove('active')});a.classList.add('active')}}})});
})();
