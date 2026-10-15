# Project Rules & Architecture Constraints: Trivia Cyber Hack

Este archivo define las reglas inmutables, convenciones arquitectónicas y directrices del proyecto para que cualquier agente o desarrollador mantenga la coherencia técnica y de diseño.

---

## 1. Reglas de Código, Legibilidad y Modularización (Estricto)

1. **Límite de Líneas por Archivo:** Intentar **no superar las 100 líneas de código por archivo** siempre que sea posible.
2. **Alta Modularidad:** 
   - Separar lógica en pequeños servicios, componentes, DTOs e interfaces independientes.
   - Cada componente o servicio debe tener una única responsabilidad (Single Responsibility Principle).
3. **Simplicidad y Soluciones Conocidas:**
   - Evitar patrones esotéricos o sobreingeniería. Usar las soluciones estándar y canónicas de NestJS y Angular.
   - Código autodocumentado con nombres claros en inglés o español coherente, fácil de mantener y aprender.

---

## 2. Stack Tecnológico Obligatorio

- **Frontend:** Angular PWA (Progressive Web App).
  - Mobile-First con controles táctiles de 64px de alto mínimo.
  - Estilo: *Terminal Hacker Minimalista & Security Console* (Paleta Matrix: `#0a0d0f`, `#12181c`, `#00ff88`, `#ff003c`).
  - Sincronización de 20 avatares locales SVG mediante `avatarId: number` (1..20).
  - Los 3 minijuegos de defensa (`app-defense-matrix`, `app-defense-simon`, `app-defense-slider`) se implementan como componentes nativos de Angular con CSS y eventos táctiles (SIN Phaser ni librerías pesadas).
- **Backend:** NestJS con WebSockets (Socket.io Gateway).
  - 100% TypeScript estricto.
  - Modelo de estado híbrido: Partidas en vivo residen **100% en memoria RAM** (`GameRoom`, `PlayerLiveState`).
  - PostgreSQL se consulta únicamente al iniciar la sala (cargar 120 preguntas) y al finalizar la partida (guardar auditoría y podio).
  - Throttling del Leaderboard: El ranking de la sala se emite con un tick de 1 segundo (`setInterval(..., 1000)`).
- **Base de Datos:** PostgreSQL en contenedor Docker aislado.
  - Extensión `pg_trgm` habilitada para deduplicación de preguntas.
  - Persistencia en volumen Docker independiente (`postgres_data`).
- **Integración con IA:** Proveedores gratuitos con fallback (Groq como principal por velocidad + Google Gemini como secundario).

---

## 3. Infraestructura VPS y Despliegue (Nginx Nativo + CI/CD)

1. **Nginx Nativo en el Host (VPS):**
   - La VPS corre Nginx nativo en el sistema operativo con Certbot para la gestión de certificados SSL (HTTPS).
   - Nginx actúa como Reverse Proxy apuntando a los puertos expuestos de los contenedores Docker en `localhost` (`127.0.0.1`).
2. **Aislamiento de la Base de Datos:**
   - La base de datos corre en un servicio/contenedor independiente de PostgreSQL.
   - **Regla de CI/CD:** Los despliegues continuos (CI/CD) reconstruyen y reinician **únicamente el Backend y el Frontend**, dejando la base de datos intacta, corriendo y sin desconexiones.

---

## 4. Reglas del Core Gameplay y Roles

1. **Modalidad del Host (Observador o Jugador):**
   - El anfitrión cuenta con un selector visible con dos modos claros: **"Solo Proyectar"** o **"Jugar en esta Sala"**.
   - Si decide jugar, se le despliega el selector de avatar y apodo para confirmar su unión; al unirse, se suma de inmediato al Lobby como nodo activo y cuenta en el aforo.
   - **Mínimo de Jugadores:** Con el anfitrión jugando y 1 participante adicional (**2 personas en total**), la partida ya puede iniciar.
2. **Resiliencia de Sala y Tiempos de Desconexión:**
   - **Tolerancia al refresco del Host:** Si el Host recarga la página o se desconecta, el servidor espera **20 segundos** antes de transferir la propiedad al siguiente jugador.
   - **Persistencia de sesión:** Al recargar la página en el Lobby, el host o jugador se reengancha a su sala existente sin generar un nuevo código PIN.
   - **Sala abandonada:** Si una sala queda vacía o inactiva en el lobby, se esperan únicamente **5 minutos** para destruirla y declararla terminada.
3. **Feed Global de Sucesos en Vivo (Ticker para Todos):**
   - Durante la partida, todos los jugadores ven los mismos eventos clave en un banner superior/ticker de su pantalla (ej: *"CYBER_MAX duplicó x2"*, *"VALENTINA hackeó a NEO_99"*).
4. **Resumen de Partida, Podio y Auto-Redirección (2 Minutos):**
   - Al finalizar, todos los participantes (incluido el anfitrión) pasan a la pantalla de resumen.
   - Se destaca el **Top 3** en un podio visual y debajo la lista completa de posiciones con etiqueta `[ TÚ ]`.
   - **Temporizador de Salida Automática:** Cuenta con un botón manual de `[ VOLVER AL INICIO ]` y un temporizador regresivo de **2 minutos (120s)** que redirige automáticamente a todos a la pantalla principal.
5. **Rol del Jugador y Sala de Espera (Player Lobby):**
   - Apodo en partida de **hasta 20 caracteres**.
   - Tras ingresar PIN, apodo y avatar, cae en el Lobby interactivo y ve a los demás entrar en tiempo real.
6. **Avatares Estilo Stickers Cibernéticos:**
   - 20 avatares sticker de robots/androides (DiceBear Bottts y SVGs locales).
7. **Selector y Animación 3D de Cartas:**
   - Animación de volteo 3D corta (flip card) con chip holográfico que revela el premio.
8. **Mecánica del Hackeo (PvP):**
   - 3 opciones de contraseña (33.3%) y 5 segundos. Si falla o vence el tiempo, la víctima pierde 0 puntos.
   - Si la víctima resuelve el minijuego antes de que el atacante acierte, el hackeo queda abortado.
9. **Salón de la Fama Arcade (Sin Login):**
   - Tags únicos de hasta 10 letras sellados por el servidor.
10. **Pruebas Unitarias Obligatorias:**
   - Cobertura con `spec.ts` verificable con `npm test`.

