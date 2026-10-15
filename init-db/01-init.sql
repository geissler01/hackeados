-- ====================================================================
-- HACKEADOS - INICIALIZACIÓN DE BASE DE DATOS POSTGRESQL
-- ====================================================================

-- 1. Habilitar extensión para deduplicación por trigramas
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Tabla de Categorías Principales
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_pool_size INT DEFAULT 200,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Subtemas (Guía para balancear prompts de IA)
CREATE TABLE IF NOT EXISTS subtopics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    prompt_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Banco de Preguntas Permanente
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id VARCHAR(50) REFERENCES categories(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES subtopics(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL UNIQUE,
    options JSONB NOT NULL,
    correct_index SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
    difficulty VARCHAR(10) DEFAULT 'medium',
    times_used INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_lookup ON questions(category_id, times_used);

-- 5. Historial de Sesiones de Juego (Auditoría)
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(6) NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id),
    total_players INT NOT NULL,
    duration_seconds INT NOT NULL,
    winner_nickname VARCHAR(10),
    winner_score BIGINT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Salón de la Fama Arcade (Top Récords Históricos)
CREATE TABLE IF NOT EXISTS arcade_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
    category_id VARCHAR(50) REFERENCES categories(id),
    arcade_tag VARCHAR(10) NOT NULL UNIQUE,
    score BIGINT NOT NULL,
    accuracy_percentage NUMERIC(5,2),
    hacks_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arcade_top ON arcade_leaderboard(category_id, score DESC);

-- ====================================================================
-- SEED DATA INICIAL (Para jugar y probar inmediatamente sin API Keys)
-- ====================================================================

-- Categorías
INSERT INTO categories (id, name, description) VALUES
('tecnologia', 'Tecnología & Ciberseguridad', 'Programación, redes, historia de la computación y seguridad'),
('cultura_general', 'Cultura General', 'Geografía, historia, arte, cine y conocimiento universal'),
('ciencia', 'Ciencia & Naturaleza', 'Astronomía, física, biología y química')
ON CONFLICT (id) DO NOTHING;

-- Subtemas de Tecnología
INSERT INTO subtopics (id, category_id, name, prompt_keywords) VALUES
('a0000000-0000-0000-0000-000000000001', 'tecnologia', 'Ciberseguridad y Redes', 'firewall, phishing, malware, puertos, protocolos'),
('a0000000-0000-0000-0000-000000000002', 'tecnologia', 'Desarrollo Web y Software', 'javascript, api, git, html, bases de datos'),
('a0000000-0000-0000-0000-000000000003', 'tecnologia', 'Hardware y Sistemas Operativos', 'cpu, ram, linux, kernel, arquitectura')
ON CONFLICT DO NOTHING;

-- Preguntas iniciales de prueba (Tecnología)
INSERT INTO questions (category_id, subtopic_id, question_text, options, correct_index, difficulty) VALUES
('tecnologia', 'a0000000-0000-0000-0000-000000000001', '¿Cuál es el puerto estándar por defecto para conexiones seguras HTTPS?', '["80", "443", "8080", "22"]', 1, 'easy'),
('tecnologia', 'a0000000-0000-0000-0000-000000000001', '¿Qué ataque consiste en suplantar la identidad de una entidad de confianza mediante correo electrónico?', '["DDoS", "Phishing", "Ransomware", "Man-in-the-Middle"]', 1, 'easy'),
('tecnologia', 'a0000000-0000-0000-0000-000000000001', '¿Qué tipo de malware cifra los archivos de la víctima y exige un pago para recuperarlos?', '["Spyware", "Adware", "Ransomware", "Trojan"]', 2, 'easy'),
('tecnologia', 'a0000000-0000-0000-0000-000000000002', '¿Qué comando de Git se utiliza para descargar cambios remotos e incorporarlos a la rama actual?', '["git push", "git pull", "git clone", "git commit"]', 1, 'easy'),
('tecnologia', 'a0000000-0000-0000-0000-000000000002', '¿Qué significa el acrónimo API en desarrollo de software?', '["Application Programming Interface", "Advanced Protocol Internet", "Automated Program Integration", "Applied Process Instance"]', 0, 'easy'),
('tecnologia', 'a0000000-0000-0000-0000-000000000002', 'En JavaScript, ¿qué método convierte un objeto en una cadena de texto JSON?', '["JSON.parse()", "JSON.stringify()", "JSON.encode()", "JSON.toString()"]', 1, 'easy'),
('tecnologia', 'a0000000-0000-0000-0000-000000000003', '¿Quién es considerado el creador original del kernel de Linux?', '["Steve Jobs", "Bill Gates", "Linus Torvalds", "Richard Stallman"]', 2, 'easy'),
('tecnologia', 'a0000000-0000-0000-0000-000000000003', '¿Qué componente del ordenador almacena los datos de forma temporal y ultrarrápida para la CPU?', '["Disco SSD", "Memoria RAM", "Fuente de poder", "Tarjeta de red"]', 1, 'easy'),
('tecnologia', 'a0000000-0000-0000-0000-000000000001', '¿Qué protocolo de red se utiliza comúnmente para la comunicación bidireccional en tiempo real en la web?', '["FTP", "SMTP", "WebSocket", "SNMP"]', 2, 'medium'),
('tecnologia', 'a0000000-0000-0000-0000-000000000002', '¿Cuál de las siguientes bases de datos es relacional y de código abierto?', '["MongoDB", "PostgreSQL", "Redis", "Cassandra"]', 1, 'easy')
ON CONFLICT (question_text) DO NOTHING;
