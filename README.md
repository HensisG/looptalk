TRY YOUR NEW LANGUAGE — inglés conversando, gratis
===================================================

Qué es
- Una app web instalable (PWA) para practicar inglés conversando con personajes en un mundo 3D.
- Dos "cerebros" para el tutor:
  · EN LA NUBE (recomendado): conversación natural y rápida. Usa tu propio servidor gratuito
    (Cloudflare Workers) conectado a Google Gemini (plan gratuito). Necesita internet.
  · EN EL TELÉFONO: la IA (Llama 3.2 o Qwen 2.5) corre dentro del teléfono con WebGPU, sin internet.
    Si la nube falla por falta de internet y tienes un modelo descargado, la app lo usa como respaldo.

Qué trae
- Mundo 3D: Ollie, el búho profesor, y un personaje animado en cada lugar.
- Tarjeta de sugerencias bajo cada respuesta: una frase que puedes decir, con
  · Escuchar · Español (traducción) · Otra opción
  · Practicar: lees la frase en voz alta y cada palabra se pone verde (bien) o roja (repítela).
    Toca una palabra roja para escucharla despacio.
  · "Di en español…": escribes o dices tu idea en español y te dice cómo decirla en inglés.
  · Decirlo: la envía al personaje.
- El texto del personaje se resalta palabra por palabra mientras habla. Toca cualquier palabra para ver
  qué significa y guardarla.
- Al salir: estrellas, puntos (con récord por lugar), evaluación de vocabulario, gramática, fluidez y
  estilo, tus errores, y lo que contaste de ti (los personajes lo recuerdan la próxima vez).
- Paquetes de escenas: Día a día, Medicina, Camiones, Contabilidad, Escuela, Vida en EE. UU. y "Mis escenas".
- Manos libres: conversas solo con la voz ("repeat", "slower", "translate", "help", "stop").


CÓMO CONECTAR LA IA GRATIS EN LA NUBE (una sola vez, ~15 minutos)
-----------------------------------------------------------------
Necesitas una cuenta de Google y una cuenta gratuita de Cloudflare. No hace falta tarjeta de crédito
para el plan gratuito de ninguna de las dos (revisa las condiciones al registrarte, pueden cambiar).
Nota: en el plan gratuito de Gemini, Google puede usar tus conversaciones para mejorar sus modelos.

1) Clave de Google Gemini
   - Entra a https://aistudio.google.com con tu cuenta de Google.
   - Busca "Get API key" → "Create API key". Copia la clave (empieza con "AIza…").
   - No la compartas con nadie ni la pegues en la app: va solo en Cloudflare.

2) Servidor en Cloudflare
   - Crea una cuenta en https://dash.cloudflare.com (plan Free).
   - Ve a "Workers & Pages" → "Create" → "Create Worker" (plantilla "Hello World").
     Ponle un nombre, por ejemplo: tynl-ia → "Deploy".
   - "Edit code": borra todo, pega el contenido de server/worker.js de este repositorio → "Deploy".

3) Variables del servidor (en tu Worker → "Settings" → "Variables and Secrets" → "Add")
   - AI_KEY        tipo Secret  → la clave de Gemini del paso 1
   - APP_CODE      tipo Secret  → un código que tú inventes (p. ej. una frase larga). Evita que otros
                                  usen tu servidor y gasten tu límite gratuito.
   - ALLOW_ORIGIN  tipo Text    → https://hensisg.github.io
   Guarda y vuelve a desplegar ("Deploy").
   Opcional: AI_MODEL (por defecto gemini-2.5-flash) si Google cambia el nombre del modelo gratuito.

4) En la app
   - Ajustes → "Cambiar cerebro de la IA" → "En la nube".
   - Dirección: la que te dio Cloudflare, p. ej. https://tynl-ia.TU-NOMBRE.workers.dev
   - Código de acceso: el mismo APP_CODE → "Conectar y empezar".

Si aparece "Se acabó el límite gratuito", espera un minuto (o hasta el día siguiente).


Publicar la app
- Está en GitHub Pages: https://hensisg.github.io/looptalk/ (Settings → Pages → main / root).
- Ábrela en Chrome del teléfono → menú ⋮ → "Instalar app" / "Agregar a pantalla principal".

Notas sobre la IA dentro del teléfono
- Requiere WebGPU: Chrome Android reciente en teléfonos de gama media/alta, o iPhone con iOS 26+.
- La app bloquea los modelos que no caben en la tarjeta gráfica del teléfono (si no, escriben texto sin
  sentido) y corta la espera si la tarjeta gráfica se traba.
- Abre la app en UNA sola pestaña: dos pestañas usando la tarjeta gráfica a la vez la traban.
- Si se traba: cierra Chrome por completo desde apps recientes y vuelve a abrir.
- Voz: usa las voces del sistema. El reconocimiento de voz del navegador a veces necesita internet.
