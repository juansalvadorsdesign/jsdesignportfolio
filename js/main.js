/* Webfolio de Juan Salvador — movimiento.

   1. Entradas al hacer scroll. Cada elemento con data-anim aparece cuando
      entra en pantalla; si entran varios a la vez, se escalonan.
        subir     sube un módulo (37 px) y aparece
        mascara   se descubre de izquierda a derecha (imagen principal)
        telon     se descubre de abajo arriba y la foto se asienta (tarjetas, retrato)
        filete    la línea se traza de izquierda a derecha
        palabras  cada palabra del titular sube desde su renglón
        lineas    cada línea del título de sección sube desde su renglón
        tinta     recurso tipográfico de Sangre del Sur: la tinta se expande
   2. Recursos de tinta: al pulsarlos, la animación se repite.
   3. Ámbitos de conocimiento de AJÁ!: las cinco franjas se dibujan, se
      rotulan y se recogen en bucle mientras la pieza está a la vista.

   Sin JavaScript, o con «reducir movimiento» activado en el sistema,
   todo se ve quieto y completo. */
(function () {
  'use strict';

  var raiz = document.documentElement;
  raiz.classList.add('animado');

  var reducir = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var puedeAnimar = !reducir && 'IntersectionObserver' in window &&
    typeof Element.prototype.animate === 'function';

  var SALIDA = 'cubic-bezier(0.2, 0.7, 0.2, 1)';   // suave al llegar
  var CORTINA = 'cubic-bezier(0.65, 0, 0.35, 1)';  // máscaras y trazos
  var PASO = 110;       // ms entre elementos que entran a la vez
  var PASO_MAX = 8;     // el escalonado no supera ~0,9 s

  function lista(sel, dentro) {
    return Array.prototype.slice.call((dentro || document).querySelectorAll(sel));
  }

  function animar(el, fotogramas, duracion, curva, retardo) {
    return el.animate(fotogramas, { duration: duracion, easing: curva, delay: retardo || 0, fill: 'backwards' });
  }

  /* La tinta: el trazo pasa de desenfocado a nítido bajo un umbral de contraste */
  function tinta(figura, retardo) {
    var umbral = figura.querySelector('.recurso-tinta__umbral');
    var trazo = figura.querySelector('.recurso-tinta__trazo');
    if (!umbral || !trazo) return;
    animar(umbral, [{ filter: 'contrast(20)' }, { filter: 'contrast(20)', offset: 0.85 }, { filter: 'contrast(1)' }], 2200, 'linear', retardo);
    animar(trazo, [{ filter: 'blur(14px)' }, { filter: 'blur(0px)' }], 2200, 'cubic-bezier(0.3, 0.5, 0.4, 1)', retardo);
  }

  function revelar(el, retardo) {
    switch (el.getAttribute('data-anim')) {
      case 'subir':
        animar(el, [{ opacity: 0, transform: 'translateY(37px)' }, { opacity: 1, transform: 'none' }], 800, SALIDA, retardo);
        break;
      case 'mascara':
        animar(el, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 1200, CORTINA, retardo);
        break;
      case 'telon':
        animar(el, [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 1100, CORTINA, retardo);
        var foto = el.tagName === 'IMG' ? null : el.querySelector('img');
        if (foto) animar(foto, [{ transform: 'scale(1.15)' }, { transform: 'scale(1)' }], 1600, SALIDA, retardo);
        break;
      case 'filete':
        animar(el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 1000, CORTINA, retardo);
        break;
      case 'palabras':
      case 'lineas':
        lista('.palabra__interior, .linea__interior', el).forEach(function (pieza, i) {
          animar(pieza, [{ transform: 'translateY(115%)' }, { transform: 'none' }], 900, SALIDA, retardo + i * 70);
        });
        break;
      case 'tinta':
        tinta(el, retardo);
        break;
    }
    el.classList.add('revelado');
  }

  /* 1. Entradas al hacer scroll ------------------------------------------ */
  var animables = lista('[data-anim]');

  if (!puedeAnimar) {
    animables.forEach(function (el) { el.classList.add('revelado'); });
  } else {
    var alEntrar = function (observador) {
      return function (entradas) {
        var orden = 0;
        entradas.forEach(function (entrada) {
          var el = entrada.target;
          var pasado = entrada.boundingClientRect.bottom < 0;
          if (!entrada.isIntersecting && !pasado) return;
          observador.unobserve(el);
          if (pasado) { el.classList.add('revelado'); return; }  // ya quedó atrás: sin animación
          revelar(el, Math.min(orden++, PASO_MAX) * PASO);
        });
      };
    };
    var observador = new IntersectionObserver(function (e) { alEntrar(observador)(e); },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    // La tinta espera a estar a la vista en su mitad
    var observadorTinta = new IntersectionObserver(function (e) { alEntrar(observadorTinta)(e); },
      { threshold: 0.5 });
    animables.forEach(function (el) {
      (el.getAttribute('data-anim') === 'tinta' ? observadorTinta : observador).observe(el);
    });
  }

  /* 2. Recursos de tinta: al pulsar, se repite ----------------------------- */
  document.addEventListener('click', function (evento) {
    var boton = evento.target.closest && evento.target.closest('.recurso-tinta__boton');
    if (!boton || reducir || typeof Element.prototype.animate !== 'function') return;
    var figura = boton.closest('.recurso-tinta');
    figura.classList.add('revelado');
    lista('.recurso-tinta__umbral, .recurso-tinta__trazo', figura).forEach(function (nodo) {
      if (nodo.getAnimations) nodo.getAnimations().forEach(function (a) { a.cancel(); });
    });
    tinta(figura, 0);
  });

  /* 3. Ámbitos de conocimiento de AJÁ! ------------------------------------ */
  lista('[data-ambitos]').forEach(function (figura) {
    var svg = figura.querySelector('svg');
    if (!svg) return;

    // En pantallas estrechas, el encuadre se queda solo con las franjas
    var COMPLETO = '95 93 1636 895';
    var SOLO_FRANJAS = '1020 96 722 888';
    var estrecho = window.matchMedia ? window.matchMedia('(max-width: 600px)') : null;
    var encuadrar = function () {
      var si = !!(estrecho && estrecho.matches);
      svg.setAttribute('viewBox', si ? SOLO_FRANJAS : COMPLETO);
      figura.classList.toggle('ambitos-aja--estrecho', si);
    };
    encuadrar();
    if (estrecho) {
      if (estrecho.addEventListener) estrecho.addEventListener('change', encuadrar);
      else if (estrecho.addListener) estrecho.addListener(encuadrar);
    }

    if (!puedeAnimar) return;

    // Guion de un ciclo (ms). Cada franja i (0-4) entra, se rotula, espera y se recoge.
    var CICLO = 9200;
    var entra = function (i) { return 300 + i * 380; };    // empieza a dibujarse
    var DIBUJO = 950;
    var rotula = function (i) { return entra(i) + 750; };  // aparece su rótulo
    var ROTULO = 450;
    var borra = function (i) { return 6100 + i * 120; };   // se va su rótulo
    var BORRADO = 300;
    var recoge = function (i) { return 6300 + i * 260; };  // se recoge la franja
    var RECOGIDA = 850;
    var t = function (ms) { return ms / CICLO; };

    var animaciones = [];
    lista('.ambitos-aja__franja', svg).forEach(function (trazo) {
      var i = +trazo.getAttribute('data-orden');
      var largo = Math.ceil(trazo.getTotalLength()) + 2;
      var oculto = largo + 'px';
      var fuera = -largo + 'px';
      trazo.style.strokeDasharray = largo + 'px ' + largo + 'px';
      trazo.style.strokeDashoffset = oculto;
      animaciones.push(trazo.animate([
        { offset: 0, strokeDashoffset: oculto },
        { offset: t(entra(i)), strokeDashoffset: oculto, easing: CORTINA },
        { offset: t(entra(i) + DIBUJO), strokeDashoffset: '0px' },
        { offset: t(recoge(i)), strokeDashoffset: '0px', easing: CORTINA },
        { offset: t(recoge(i) + RECOGIDA), strokeDashoffset: fuera },
        { offset: 1, strokeDashoffset: fuera }
      ], { duration: CICLO, iterations: Infinity }));
    });
    lista('.ambitos-aja__rotulo', svg).forEach(function (rotulo) {
      var i = +rotulo.getAttribute('data-orden');
      rotulo.style.opacity = '0';
      animaciones.push(rotulo.animate([
        { offset: 0, opacity: 0 },
        { offset: t(rotula(i)), opacity: 0, easing: 'ease-out' },
        { offset: t(rotula(i) + ROTULO), opacity: 1 },
        { offset: t(borra(i)), opacity: 1, easing: 'ease-in' },
        { offset: t(borra(i) + BORRADO), opacity: 0 },
        { offset: 1, opacity: 0 }
      ], { duration: CICLO, iterations: Infinity }));
    });
    animaciones.forEach(function (a) { a.pause(); });

    // Solo se mueve mientras está a la vista
    new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        animaciones.forEach(function (a) { if (entrada.isIntersecting) a.play(); else a.pause(); });
      });
    }, { threshold: 0.25 }).observe(figura);
  });
})();
