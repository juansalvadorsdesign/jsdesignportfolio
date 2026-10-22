# jsdesignportfolio.com

Webfolio de Juan Salvador Aguilar Gómez, diseñador gráfico y fotógrafo. Web estática: HTML, CSS y JavaScript sin dependencias ni paso de compilación.

## Estructura

```
index.html                     Inicio
sangre-del-sur.html            Una mano · 01
lanjaron.html                  Una mano · 02
life-interchanging-films.html  Una mano · 03
creativelab.html               Mil manos · 01
congreso-aja.html              Mil manos · 02 (incluye la pieza animada de los ámbitos)
surtopias.html                 Mil manos · 03
404.html                       Página no encontrada
en/                            Versión en inglés: las mismas páginas, traducidas (con su propia 404)
css/estilos.css                Variables y tipografía del sistema Juan Salvador, maquetación y movimiento
js/main.js                     Animaciones (scroll, tinta de Sangre del Sur, ámbitos de AJÁ!)
fonts/                         Zalando Sans SemiExpanded (variable, latín) y su licencia OFL
img/                           Imágenes WebP en varios anchos (nombre-800.webp, nombre-1400.webp…)
img/og/                        Imágenes para compartir en redes (1200 × 630)
docs/cv-juan-salvador.pdf      Currículum descargable
```

## Animaciones

Cada elemento animado lleva `data-anim` con su tipo: `subir`, `mascara`, `telon`, `filete`, `palabras`, `lineas` o `tinta`. Para animar un elemento nuevo basta con añadirle el atributo. Con «reducir movimiento» activado en el sistema (en iPhone: Ajustes › Accesibilidad › Movimiento, o el modo de bajo consumo) las animaciones se convierten en fundidos de opacidad, sin desplazamientos. Sin JavaScript, la web se ve quieta y completa.

Cuando cambien `css/estilos.css` o `js/main.js`, sube el número `?v=` (ahora 6) con el que los enlazan las páginas para que los navegadores no usen la copia antigua.

El retrato de la portada lleva dos fotos encajadas (`retrato-juan-salvador-estudio-*` y `…-alterna-*`): al pasar el cursor, la segunda aparece con un fundido; en el móvil, al tocar la foto.

La cabecera se queda fija arriba: se esconde al bajar y reaparece en cuanto se sube. En las páginas de proyecto con botón, «Conoce el proyecto» invita a seguir bajando.

## Idiomas

La web está en español (raíz) y en inglés (`/en/`). El selector ES / EN de la cabecera lleva a la misma página en el otro idioma; en el móvil se muestra solo el otro idioma. Cada página indica su versión en el otro idioma con `hreflang`, y `sitemap.xml` incluye las dos.

Cuando cambie un texto en español, hay que cambiar también su página en `/en/`. Los textos en inglés siguen la misma regla que en español: nunca en primera persona, siempre impersonales o en pasiva. Los nombres de los proyectos no se traducen.

## Publicación

El dominio jsdesignportfolio.com está en IONOS. La web se publica con IONOS Deploy Now desde este repositorio: cada cambio en la rama principal se publica solo. Es un sitio estático: no necesita comando de compilación y la carpeta de publicación es la raíz del repositorio.
