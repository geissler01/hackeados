# Trivia Cyber Hack (Hackeados)

Plataforma multijugador en tiempo real de trivia y estrategia cibernética inspirada en temáticas hacker y consolas de seguridad. Los jugadores compiten respondiendo preguntas, obteniendo bonificaciones tácticas y hackeando contraseñas defensivas de otros participantes en duelos PvP en vivo.

---

## 1. Direcciones del Entorno de Producción

- **Frontend (Aplicación Web PWA):** [https://hackeados.geislera.com](https://hackeados.geislera.com)
- **Backend API & WebSockets:** [https://hackeados.api.geislera.com](https://hackeados.api.geislera.com)

---

## 2. Arquitectura General y Tecnologías

El sistema sigue una arquitectura desacoplada y diseñada para baja latencia:

- **Frontend:** Angular 19+ (Standalone Components, Signals, Reactive State, CSS nativo con variables temáticas).
  - Enfoque mobile-first con controles táctiles de al menos 64px de alto.
  - Sincronización de 20 avatares cibernéticos en SVG.
  - Minijuegos de defensa nativos (`matrix`, `simon`, `slider`) implementados en Angular sin librerías externas pesadas.
  - Alojado y distribuido a través de **Cloudflare Pages**.
- **Backend:** NestJS 11+ con Gateway de WebSockets sobre Socket.IO.
  - TypeScript en modo estricto.
  - **Estado Híbrido en RAM:** La partida transcurre 100% en memoria para responder en milisegundos (`GameRoom`, `PlayerLiveState`). PostgreSQL solo interviene para cargar preguntas al iniciar la sala y registrar estadísticas finales.
  - Alojado en un **VPS Lightsail (Ubuntu)** dentro de un contenedor Docker gestionado con Nginx nativo como reverse proxy y Certbot SSL.
- **Base de Datos:** PostgreSQL 16 con extensión `pg_trgm` para deduplicación.
  - Corre en un contenedor Docker con volumen persistente (`postgres_data`), aislado del ciclo de despliegue continuo (CI/CD) para garantizar cero pérdida de datos o desconexiones.
- **Inteligencia Artificial (Generación de Preguntas):**
  - **Proveedor Primario:** Groq API con el modelo `qwen/qwen3.8-27b` (generación ultrarrápida en formato JSON estricto).
  - **Proveedor de Respaldo:** Google Gemini API con el modelo `gemini-2.5-flash` mediante `@google/genai`.

---

## 3. Lógica de Negocio y Reglas de Juego

### 3.1 Roles del Anfitrión (Host)
- **Modo Proyector (Observador):** Diseñado para pantallas de TV, proyectores o auditorios. Muestra el PIN de acceso, código QR, ranking en vivo y eventos globales sin participar en las preguntas.
- **Modo Jugador:** Permite al anfitrión elegir apodo y avatar para jugar directamente desde su misma pantalla mientras coordina la sala.
- **Mínimo de Jugadores:** Se requieren al menos **2 participantes** para iniciar la partida.
- **Resiliencia de Sala:** Si el Host se desconecta o recarga el navegador, el servidor mantiene un margen de gracia de **20 segundos** antes de transferir el rol al siguiente jugador conectado.

### 3.2 Categorías y Subtemas
El sistema cuenta con **10 categorías generales** (no nicho) y **100 subtemas** (10 por categoría) sembrados en la base de datos:
1. Tecnología & Ciberseguridad
2. Cultura General & Curiosidades
3. Ciencia & Naturaleza
4. Entretenimiento & Pop Culture
5. Música & Ritmos del Mundo
6. Historia Universal
7. La Biblia & Relatos Sagrados
8. El Campo, Agro & Ganadería
9. Deportes & Grandes Campeonatos
10. Geografía, Países & Maravillas

### 3.3 Gestión del Banco de Preguntas
- **Capacidad Máxima:** Hasta **100 preguntas por categoría** (10 preguntas equilibradas por subtema).
- **Mínimo para Iniciar:** El backend y el frontend bloquean el inicio de la partida si la categoría seleccionada no cuenta con al menos **50 preguntas disponibles** en base de datos.
- **Preguntas por Partida:** Cada partida carga exactamente **50 preguntas**, seleccionadas según menor uso y aleatoriedad:
  ```sql
  ORDER BY q.times_used ASC, RANDOM() LIMIT 50
  ```
- **Mazo Individual por Jugador:** Cada jugador recibe una permutación aleatoria única del banco (`questionOrder`). Dos jugadores sentados juntos nunca reciben la misma pregunta al mismo tiempo.
- **Eliminación de Sesgos:**
  - El prompt exige que todas las opciones mantengan longitud y nivel de detalle similares.
  - El backend baraja programáticamente las 4 opciones antes de persistirlas, garantizando una probabilidad exacta del **25%** para cada letra (`A`, `B`, `C`, `D`).

### 3.4 Flujo de Juego
1. **Configuración de Contraseñas (10s):** Al iniciar, cada jugador elige una contraseña secreta de una lista de opciones.
2. **Ronda de Preguntas:**
   - Si el jugador acierta: feedback visual en **verde neón** (700ms), sonido de acierto, vibración háptica y avance a la ruleta de cartas.
   - Si el jugador falla: feedback en **rojo** sobre la opción seleccionada y **verde sobre la opción correcta** (1.6s) para facilitar el aprendizaje.
3. **Ruleta de Cartas:** Al acertar, el jugador elige una de tres cartas holográficas:
   - **Multiplicador de puntos:** Duplica o triplica el puntaje obtenido.
   - **Puntos directos:** Suma bonificaciones al marcador.
   - **Hackeo (PvP):** Inicia una intrusión a un rival aleatorio.
4. **Mecánica de Hackeo (Duelo PvP):**
   - El atacante tiene 5 segundos para adivinar la clave de la víctima entre 3 opciones (33% de probabilidad).
   - Simultáneamente, la víctima recibe una alerta y un minijuego defensivo (Matrix, Simon Dice o Slider de calibración). Si la víctima completa el minijuego antes del acierto, el ataque es neutralizado.
5. **Fin de Partida y Podio:**
   - Al cumplirse el tiempo o llegar a 0s, la vista se bloquea de manera definitiva en el estado `ENDED` (ningún evento asíncrono puede regresar a las preguntas).
   - Se presenta el podio con el Top 3 y la clasificación general con la etiqueta identificadora `[ TÚ ]`.
   - Incluye un temporizador regresivo de **2 minutos (120s)** para retorno automático al menú principal y botón manual de salida.

---

## 4. Estructura del Repositorio

```text
├── backend/                  # Servidor NestJS (TypeScript, TypeORM, Socket.IO)
│   ├── src/
│   │   ├── config/           # Configuraciones de base de datos y entorno
│   │   ├── database/         # Entidades de TypeORM (Category, Subtopic, Question, Room)
│   │   └── modules/
│   │       ├── ai/           # Servicio de generación con Groq y Gemini (fallback)
│   │       ├── game/         # Gateway WebSocket, timers, motores de cartas y hackeo
│   │       ├── questions/    # Carga de preguntas, endpoints REST y estadísticas
│   │       └── rooms/        # Gestión de salas en memoria y reconexiones
├── frontend/                 # Cliente Angular PWA (Standalone, Signals)
│   └── src/app/
│       ├── components/       # Componentes modulares (settings, ticker, cartas, defensa)
│       ├── pages/            # Vistas principales (home, host, player, join)
│       └── services/         # Servicios de Socket.IO, audio, hápticos y lógica
├── init-db/                  # Scripts SQL de inicialización y semillas de subtemas
├── docker-compose.app.yml    # Orquestación del contenedor Backend
├── docker-compose.db.yml     # Orquestación del contenedor PostgreSQL persistente
└── .github/workflows/        # Pipeline de CI/CD para despliegue automatizado
```

---

## 5. Guía de Replicación Local

### 5.1 Requisitos Previos
- Node.js 22 LTS o superior
- Docker y Docker Compose
- Git
- Claves de API de IA: Groq API Key (gratuita en [console.groq.com](https://console.groq.com)) y opcionalmente Gemini API Key.

### 5.2 Clonar el Repositorio
```bash
git clone https://github.com/geissler01/hackeados.git
cd hackeados
```

### 5.3 Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto tomando como referencia el siguiente esquema:

```env
# Puertos
APP_HOST_PORT=3001
PORT=3000
DB_HOST_PORT=5441
DB_PORT=5432

# Base de datos
DB_HOST=localhost
DB_USER=hackeados_admin
DB_PASSWORD=hackeados_secret_segura
DB_NAME=hackeados_db

# Configuración del servidor
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200,http://127.0.0.1:4200

# Proveedores de Inteligencia Artificial
GROQ_API_KEY=tu_clave_de_groq_aqui
GROQ_MODEL=qwen/qwen3.8-27b
GEMINI_API_KEY=tu_clave_de_gemini_aqui
GEMINI_MODEL=gemini-2.5-flash

# Parámetros del Juego
MAX_QUESTIONS_PER_CATEGORY=100
MATCH_QUESTIONS_COUNT=50
ROOM_CODE_LENGTH=6
HOST_GRACE_PERIOD_MS=20000
```

### 5.4 Iniciar la Base de Datos con Docker
```bash
docker compose -f docker-compose.db.yml up -d
```

Para aplicar los 10 temas y 100 subtemas iniciales:
```bash
docker exec -i hackeados_postgres psql -U hackeados_admin -d hackeados_db < init-db/03-seed-100-subtopics.sql
```

### 5.5 Iniciar el Backend
```bash
cd backend
npm install
npm run start:dev
```
El servidor estará disponible en `http://localhost:3000` (o el puerto configurado).

### 5.6 Iniciar el Frontend
En una nueva terminal:
```bash
cd frontend
npm install
npm start
```
Abre tu navegador en `http://localhost:4200`.

---

## 6. Pruebas Unitarias

El backend cuenta con cobertura de pruebas unitarias sobre los módulos críticos (servicio de salas, desconexión con tiempos de gracia, motor de cartas y resolución de hackeos):

```bash
cd backend
npm test
```

---

## 7. Despliegue en Servidor VPS

El despliegue en producción está automatizado mediante GitHub Actions bajo las siguientes pautas:

1. **Aislamiento de la Base de Datos:** `docker-compose.db.yml` se ejecuta de forma independiente y nunca se reinicia con los cambios de código.
2. **Reconstrucción del Backend:** Cada push a la rama `main` dispara el flujo `.github/workflows/deploy.yml`, el cual ejecuta los tests unitarios, conecta al VPS vía SSH, actualiza los cambios de Git y reconstruye únicamente el contenedor `backend`.
3. **Nginx como Reverse Proxy:** Nginx en el host recibe las conexiones HTTPS en los puertos 80 y 443 con certificados SSL de Let's Encrypt y redirige internamente a `127.0.0.1:3001` para el Backend y WebSockets.
4. **Frontend en Cloudflare Pages:** Compilación automatizada en cada commit conectada al dominio personalizado `hackeados.geislera.com`.
