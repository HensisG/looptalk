LOOPTALK — inglés con IA sin internet
=====================================

Qué es
- Una app web instalable (PWA). La IA (Llama 3.2 o Qwen 2.5) corre DENTRO del teléfono con WebGPU.
- Se descarga una sola vez (0.9–2.3 GB). Después abre y conversa sin internet.
- Nada de lo que escribes sale del teléfono. Sin suscripciones.

Cómo publicarla (una sola vez, gratis). Necesita HTTPS para instalarse:
Opción A — Netlify Drop (lo más fácil, desde la computadora)
  1. Descomprime el zip.
  2. Entra a https://app.netlify.com/drop y arrastra la carpeta "looptalk".
  3. Te da un enlace https://algo.netlify.app → ábrelo en el teléfono.
Opción B — GitHub Pages
  1. Crea un repositorio, sube TODOS los archivos de la carpeta (sin la carpeta).
  2. Settings → Pages → Deploy from branch → main / root.
  3. Abre https://TU_USUARIO.github.io/NOMBRE_REPO/ en el teléfono.

Instalar en el teléfono
- Android (Chrome actualizado): abre el enlace → menú ⋮ → "Instalar app" / "Agregar a pantalla principal".
- iPhone (iOS 26 o superior, Safari): Compartir → "Agregar a inicio". Usa el modelo "Ligero".
- Abre la app, elige modelo, pulsa "Descargar y empezar" con wifi. Cuando llegue al 100 % ya funciona en modo avión.

Qué trae
- Mundo 3D: Ollie, el búho profesor, te recibe en una calle de noche; cada lugar tiene su escenario y
  su personaje animado (parpadea, mueve la boca al hablar, saluda). Todo se dibuja en el teléfono (three.js).
- Cada visita trae una personalidad distinta del personaje, para que las charlas no se repitan.
- Al salir: evaluación de vocabulario, gramática, fluidez y estilo, tus errores y la transcripción.
- Paquetes de escenas: Día a día, Medicina, Camiones, Contabilidad, Escuela, Vida en EE. UU. y "Mis escenas"
  (describe cualquier situación y el tutor hace el otro papel).
- Correcciones (Ajustes): "Siempre" (bajo cada frase tuya), "Solo resumen" (al salir) o "No corregir".
  El personaje no corta la charla; la corrección aparece aparte. Guarda tus errores en "Mis correcciones".
- Perfil: tu trabajo y tus gustos; el tutor y las historias los usan.
- Manos libres: conversas solo con la voz. Comandos: "repeat", "slower", "translate", "help", "stop".
  Mantiene la pantalla encendida; si la bloqueas, el navegador detiene el micrófono.

Notas
- Requiere WebGPU: Chrome Android reciente en teléfonos de gama media/alta, o iPhone con iOS 26+.
- Voz que habla: usa las voces del sistema (funcionan sin internet si están instaladas en el teléfono).
- Micrófono: el reconocimiento de voz del navegador a veces necesita internet. Sin conexión, usa el
  dictado del teclado (botón de micrófono del teclado) o, en Chrome, Ajustes → "Descargar paquete de voz".
- Si el teléfono se queda sin memoria al cargar, cambia al modelo "Ligero".
