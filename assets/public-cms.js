(function(){
  var raw;try{raw=localStorage.getItem('k2v_site_content')}catch(e){return}
  if(!raw)return;
  var d;try{d=JSON.parse(raw)}catch(e){return}
  if(!d||!d.site)return;
  function setText(sel,val){if(val==null)return;document.querySelectorAll(sel).forEach(function(el){el.textContent=val})}
  setText('[data-cms="name"]',d.site.name);
  setText('[data-cms="tagline"]',d.site.tagline);
  setText('[data-cms="hours"]',d.site.hours);
  setText('[data-cms="address"]',d.site.address);
  setText('[data-cms="regNo"]',d.site.regNo);
  if(d.site.phone)setText('[data-cms="phone"]','Phone: '+d.site.phone);
  if(d.site.email){document.querySelectorAll('[data-cms="email"]').forEach(function(el){el.textContent=d.site.email;if(el.tagName==='A')el.href='mailto:'+d.site.email})}
  if(d.hero){setText('[data-cms="heroEyebrow"]',d.hero.eyebrow);setText('[data-cms="heroTitle"]',d.hero.title);setText('[data-cms="heroBody"]',d.hero.body)}
  if(Array.isArray(d.categories)){d.categories.slice(0,4).forEach(function(c,i){setText('[data-cms="cat-'+i+'"]',c.name);setText('[data-cms="catd-'+i+'"]',c.description)})}
})();
