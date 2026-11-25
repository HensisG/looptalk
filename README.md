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
- Camino por barrios (Llegada, Mi barrio, Trabajo, Comunidad, Vida real). Cada parada es una persona con
  su propia vida; la amistad sube en 5 niveles y con ella la dificultad (A1 → A2 → B1 → B2 → C1).
- Nova, el robot guía, te propone la siguiente misión.
- Videollamada: el personaje a pantalla completa, tu cámara en una esquina (no se graba nada) y
  subtítulos dobles (la frase y su traducción). El mundo 3D sigue disponible en Ajustes.
- Voz natural distinta para cada personaje (Gemini, por tu servidor) y la voz del teléfono de respaldo.
- Tarjeta de respuestas posibles bajo cada pregunta: escuchar, traducir, practicar pronunciación
  (palabras verdes/rojas), «Di en español…» y «Decirlo».
- Clases con Nova: 23 clases de A1 a B2 con pizarra, momentos de «cópialo en tu cuaderno», ejercicios,
  «Tengo una duda» y repaso espaciado (1, 3, 7, 14 y 30 días).
- Repaso rápido: tus palabras guardadas y tus errores vuelven justo antes de olvidarlos.
- Al terminar una charla: estrellas, puntos, evaluación, tus errores y lo que contaste de ti.
- Familia: perfiles con PIN opcional, test de nivel («contesta solo lo que sabes») y tabla de progreso
  que incluye a quienes usan su propio teléfono o tablet.
- Idiomas: inglés para hispanohablantes, español para rusohablantes (textos en ruso) e inglés para
  rusohablantes.
- Letra grande (Ajustes → Tamaño de letra) para quien no ve bien de cerca.

Invitar a la familia
- En tu teléfono: Ajustes → Familia → «Invitar a la familia» (o 👤 → «Invitar»). Se abre WhatsApp con un
  enlace. Compártelo solo con tu familia: incluye el código de tu servidor.
- En el otro teléfono o tablet: abrir el enlace en Chrome → escribir su nombre, su idioma y si quiere
  letra grande → test de nivel → listo. Después: menú ⋮ → «Instalar app».
- Varias personas en el mismo teléfono: 👤 → «Nuevo perfil».


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
   Opcional: AI_MODEL (por defecto gemini-flash-lite-latest, el más rápido) y AI_MODEL_FALLBACK (por defecto
   gemini-flash-latest, que se usa solo si el principal está saturado).

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
