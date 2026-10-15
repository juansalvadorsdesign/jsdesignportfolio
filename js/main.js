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
   2. Cabecera: se esconde al bajar y reaparece en cuanto se sube.
   3. Recursos de tinta: al pulsarlos, la animación se repite.
   4. Ámbitos de conocimiento de AJÁ!: las cinco franjas se dibujan, se
      rotulan y se recogen en bucle mientras la pieza está a la vista. En
      pantallas estrechas la pieza se recompone en vertical.

   Con «reducir movimiento» activado en el sistema (iPhone: Ajustes › Accesibilidad ›
   Movimiento, o el modo de bajo consumo), todo se queda en fundidos de opacidad, sin
   desplazamientos. Sin JavaScript, la web se ve quieta y completa. */
(function () {
  'use strict';

  var raiz = document.documentElement;
  raiz.classList.add('animado');

  // «Reducir movimiento» (iPhone: Ajustes › Accesibilidad › Movimiento, o el modo de bajo
  // consumo): las animaciones se quedan en fundidos de opacidad, sin desplazamientos.
  var reducir = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var puedeAnimar = 'IntersectionObserver' in window && typeof Element.prototype.animate === 'function';

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
    var tipo = el.getAttribute('data-anim');
    if (reducir) {
      // Solo opacidad: cada palabra o línea se funde por turnos; lo demás, entero
      var piezas = (tipo === 'palabras' || tipo === 'lineas') ? lista('.palabra__interior, .linea__interior', el) : [el];
      piezas.forEach(function (pieza, i) {
        animar(pieza, [{ opacity: 0 }, { opacity: 1 }], 700, 'ease-out', retardo + i * 60);
      });
      el.classList.add('revelado');
      return;
    }
    switch (tipo) {
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
    // Lo que no se muestra en esta pantalla (p. ej. la invitación a bajar en el móvil) queda ya revelado
    animables = animables.filter(function (el) {
      if (el.getClientRects().length) return true;
      el.classList.add('revelado');
      return false;
    });
    var pendientes = animables.slice();
    var quitar = function (el) {
      var i = pendientes.indexOf(el);
      if (i > -1) pendientes.splice(i, 1);
    };

    // ¿Está lo bastante a la vista? Una parte de su alto (el 15 %; la tinta, la mitad)
    // o, si es más alto que la pantalla, al menos un cuarto de ella.
    var aLaVista = function (entrada, parte) {
      if (!entrada.isIntersecting) return false;
      if (entrada.intersectionRatio >= parte) return true;
      var pantalla = entrada.rootBounds ? entrada.rootBounds.height : window.innerHeight;
      return entrada.intersectionRect.height >= pantalla * 0.25;
    };

    var alEntrar = function (parte) {
      return function (entradas, observador) {
        var orden = 0;
        entradas.forEach(function (entrada) {
          var el = entrada.target;
          var pasado = entrada.boundingClientRect.bottom < 0;
          if (!pasado && !aLaVista(entrada, parte)) return;
          observador.unobserve(el);
          quitar(el);
          if (pasado) { el.classList.add('revelado'); return; }  // ya quedó atrás: sin animación
          revelar(el, Math.min(orden++, PASO_MAX) * PASO);
        });
      };
    };

    var observador = new IntersectionObserver(alEntrar(0.15), { threshold: [0, 0.05, 0.1, 0.15, 0.3, 0.6, 1] });
    var observadorTinta = new IntersectionObserver(alEntrar(0.5), { threshold: [0, 0.25, 0.5, 0.75, 1] });
    animables.forEach(function (el) {
      (el.getAttribute('data-anim') === 'tinta' ? observadorTinta : observador).observe(el);
    });

    // Al llegar al final de la página, aparece todo lo que esté en pantalla
    // (lo último, como el logotipo del faldón, nunca puede subir más)
    var alFinal = function () {
      if (!pendientes.length) { window.removeEventListener('scroll', alFinal); return; }
      var raizDoc = document.documentElement;
      if (window.innerHeight + window.pageYOffset < raizDoc.scrollHeight - 4) return;
      var orden = 0;
      pendientes.slice().forEach(function (el) {
        var caja = el.getBoundingClientRect();
        if (caja.top >= window.innerHeight || caja.bottom <= 0) return;
        observador.unobserve(el);
        observadorTinta.unobserve(el);
        quitar(el);
        revelar(el, Math.min(orden++, PASO_MAX) * PASO);
      });
    };
    window.addEventListener('scroll', alFinal, { passive: true });
    alFinal();
  }

  /* 2. Cabecera: se esconde al bajar y vuelve en cuanto se sube ------------- */
  var cabecera = document.querySelector('.cabecera-web');
  if (cabecera) {
    var UMBRAL = 6;          // px de recorrido antes de reaccionar (evita temblores)
    var ultimaY = Math.max(window.pageYOffset, 0);
    var enCola = false;
    var quietaHasta = 0;     // tras un enlace interno, sigue escondida mientras se desplaza

    var poner = function (oculta) {
      cabecera.classList.toggle('cabecera--oculta', oculta);
    };
    var actualizar = function () {
      enCola = false;
      var y = Math.max(window.pageYOffset, 0);
      var alto = cabecera.offsetHeight;
      var recorrido = y - ultimaY;
      cabecera.classList.toggle('cabecera--flotante', y > alto);
      if (y <= alto) { poner(false); ultimaY = y; return; }
      if (Date.now() < quietaHasta) { poner(true); ultimaY = y; return; }
      if (Math.abs(recorrido) < UMBRAL) return;
      poner(recorrido > 0);
      ultimaY = y;
    };
    window.addEventListener('scroll', function () {
      if (!enCola) { enCola = true; window.requestAnimationFrame(actualizar); }
    }, { passive: true });

    // Enlaces a otra parte de la misma página (PROYECTOS, CONTACTO, carteles…):
    // la cabecera se aparta para no tapar el destino
    document.addEventListener('click', function (evento) {
      var enlace = evento.target.closest && evento.target.closest('a[href^="#"]');
      if (!enlace || enlace.getAttribute('href').length < 2) return;
      quietaHasta = Date.now() + 1200;
      poner(true);
    });
    // Con el teclado, la cabecera aparece al llegar a sus enlaces
    cabecera.addEventListener('focusin', function () { poner(false); });

    // Si la página se abre ya desplazada (por ejemplo, index.html#proyectos), empieza escondida
    if (ultimaY > cabecera.offsetHeight) {
      cabecera.classList.add('cabecera--flotante');
      poner(true);
    }
  }

  /* 3. Recursos de tinta: al pulsar, se repite ----------------------------- */
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

  /* 4. Ámbitos de conocimiento de AJÁ! ------------------------------------ */
  lista('[data-ambitos]').forEach(function (figura) {
    var svg = figura.querySelector('svg');
    if (!svg) return;

    // En pantallas estrechas, composición vertical: textos arriba, franjas y logotipo al pie
    // (los grupos se recolocan en estilos.css con .ambitos-aja--estrecho)
    var COMPLETO = '95 93 1636 895';
    var VERTICAL = '1020 -403 722 1554';
    var estrecho = window.matchMedia ? window.matchMedia('(max-width: 600px)') : null;
    var encuadrar = function () {
      var si = !!(estrecho && estrecho.matches);
      svg.setAttribute('viewBox', si ? VERTICAL : COMPLETO);
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
      if (reducir) {
        // Con «reducir movimiento», cada franja aparece y se va fundiéndose, sin dibujarse
        trazo.style.opacity = '0';
        animaciones.push(trazo.animate([
          { offset: 0, opacity: 0 },
          { offset: t(entra(i)), opacity: 0, easing: 'ease-out' },
          { offset: t(entra(i) + DIBUJO), opacity: 1 },
          { offset: t(recoge(i)), opacity: 1, easing: 'ease-in' },
          { offset: t(recoge(i) + RECOGIDA), opacity: 0 },
          { offset: 1, opacity: 0 }
        ], { duration: CICLO, iterations: Infinity }));
        return;
      }
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
