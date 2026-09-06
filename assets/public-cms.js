(function(){
  var raw=localStorage.getItem('kk_cms_content');if(!raw)return;
  try{var d=JSON.parse(raw),q=function(s){return document.querySelector(s)},qa=function(s){return document.querySelectorAll(s)};
    var logo=q('.logo b'),sub=q('.logo small');if(logo)logo.textContent=d.site.name;if(sub)sub.textContent=d.site.tagline;
    var hero=q('.hero h1'),heroEy=q('.hero .kicker'),heroBody=q('.hero__copy>p:not(.kicker)');if(hero)hero.textContent=d.hero.title;if(heroEy)heroEy.textContent=d.hero.eyebrow;if(heroBody)heroBody.textContent=d.hero.body;
    var stats=qa('.trust strong');if(stats.length>3){stats[0].textContent=d.site.employees;stats[1].textContent=d.site.rating+' ★';stats[2].textContent=d.site.reviews;}
    var cards=qa('.product-card h3');d.products.slice(0,cards.length).forEach(function(p,i){cards[i].textContent=p.name;var copy=cards[i].nextElementSibling;if(copy)copy.textContent='Available from KK ENTERPRISES.'});
  }catch(e){}
})();
