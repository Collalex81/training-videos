/* narration.js — voz del navegador para los módulos de entrenamiento / browser TTS narration.
   Se auto-inyecta un botón "Escuchar / Listen". Con la auto-narración activa, lee el paso
   actual; al dar Next continúa con el siguiente; solo se detiene al pausar (o cambiar idioma/salir).
   No requiere archivos ni conexión: usa las voces del propio dispositivo (Web Speech API).
   Compatible con el motor de módulos del proyecto (#card, .tools, #mStep, #lang). */
(function(){
  "use strict";
  if(!("speechSynthesis" in window)) return;               // navegador sin TTS
  var card=document.getElementById("card");
  if(!card) return;                                        // no es un módulo estándar
  var synth=window.speechSynthesis;
  var auto=false, lastSpoken="", timer=null;

  /* ---- botón ---- */
  var tools=document.querySelector(".tools");
  var btn=document.createElement("button");
  btn.type="button"; btn.className="tbtn"; btn.id="narrateBtn"; btn.style.cursor="pointer";
  var ico=document.createElement("span"), lab=document.createElement("span");
  ico.style.display="inline-flex"; btn.appendChild(ico); btn.appendChild(lab);
  var ref=document.getElementById("tema");
  if(tools && ref){ tools.insertBefore(btn, ref); }
  else if(tools){ tools.appendChild(btn); }
  else { document.body.appendChild(btn); }

  var IC_PLAY='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  var IC_STOP='<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

  function lang(){
    var l=(document.documentElement.lang||"").toLowerCase();
    if(l.indexOf("es")===0) return "es";
    if(l.indexOf("en")===0) return "en";
    var on=document.querySelector("#lang button.on");
    if(on && on.dataset && on.dataset.l) return on.dataset.l;
    return "en";
  }
  function T(en,es){ return lang()==="es"?es:en; }
  function paint(){ ico.innerHTML=auto?IC_STOP:IC_PLAY; lab.textContent=auto?T("Pause","Pausa"):T("Listen","Escuchar"); }

  function sig(){ var m=document.getElementById("mStep"); return (m?m.innerText:card.innerText.slice(0,40))+"|"+lang(); }

  function narrationText(){
    var sel="h1, .lead, .box h3, .box p, .steps .st .txt, li, .note, .case, .q h3, .chk .txt, .ref, .signcard b, .signcard span";
    var nodes=card.querySelectorAll(sel), seen={}, parts=[];
    for(var i=0;i<nodes.length;i++){
      var t=(nodes[i].innerText||"").replace(/\s+/g," ").trim();
      if(t && !seen[t]){ seen[t]=1; parts.push(t); }
    }
    var txt=parts.join(". "), es=lang()==="es";
    txt=txt.replace(/≈/g, es?" aproximadamente ":" about ")
           .replace(/&/g, es?" y ":" and ")
           .replace(/×/g, es?" por ":" times ")
           .replace(/≥/g, es?" al menos ":" at least ")
           .replace(/≤/g, es?" hasta ":" up to ")
           .replace(/→/g, es?" a ":" to ")
           .replace(/[·—–]/g, ", ")
           .replace(/\s+/g," ").replace(/\s+([,.;:])/g,"$1").trim();
    return txt;
  }

  function pickVoice(lg){
    var vs=synth.getVoices()||[], best=null, bs=-1;
    for(var i=0;i<vs.length;i++){
      var v=vs[i]; if(v.lang.toLowerCase().indexOf(lg)!==0) continue;
      var n=(v.name+" "+v.lang).toLowerCase(), s=100;
      if(lg==="es"){ if(/es-mx|es_mx|es-us|es_us|es-419/.test(n)) s+=10; else if(/es-es|es_es/.test(n)) s+=3; }
      if(/natural|neural|premium|enhanced|google|siri/.test(n)) s+=20;
      if(/eloquence|compact|espeak|pico|robo/.test(n)) s-=20;
      if(s>bs){ bs=s; best=v; }
    }
    return best;
  }

  function speakCurrent(){
    synth.cancel();
    var text=narrationText(); if(!text) return;
    var u=new SpeechSynthesisUtterance(text);
    var lg=lang(), v=pickVoice(lg);
    if(v) u.voice=v;
    u.lang=v?v.lang:(lg==="es"?"es-MX":"en-US");
    u.rate=1; u.pitch=1;
    u.onend=function(){ paint(); };
    u.onerror=function(){ paint(); };
    synth.speak(u); paint();
  }

  function maybeSpeak(){ if(!auto) return; var s=sig(); if(s===lastSpoken) return; lastSpoken=s; speakCurrent(); }

  btn.addEventListener("click", function(){
    if(auto){ auto=false; synth.cancel(); paint(); return; }
    auto=true; lastSpoken=""; paint(); maybeSpeak();
  });

  /* al navegar (Next/Back/puntos/idioma) — dentro del gesto del usuario para móvil */
  document.addEventListener("click", function(e){
    if(!auto) return;
    var t=e.target.closest ? e.target.closest("#next,#prev,.dot,#lang button") : null;
    if(t){ setTimeout(maybeSpeak, 40); }
  }, false);

  /* respaldo: cualquier re-render del paso */
  var obs=new MutationObserver(function(){ if(!auto) return; if(timer) clearTimeout(timer); timer=setTimeout(maybeSpeak, 120); });
  obs.observe(card, {childList:true, subtree:true});

  window.addEventListener("pagehide", function(){ try{ synth.cancel(); }catch(e){} });
  document.addEventListener("visibilitychange", function(){ if(document.hidden){ try{ synth.cancel(); }catch(e){} } });
  if(synth.getVoices().length===0 && synth.onvoiceschanged!==undefined){ synth.onvoiceschanged=function(){}; }
  paint();
})();
