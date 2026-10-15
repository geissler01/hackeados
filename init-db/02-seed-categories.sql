-- Subtemas de Cultura General y Ciencia
INSERT INTO subtopics (id, category_id, name, prompt_keywords) VALUES
('b0000000-0000-0000-0000-000000000001', 'cultura_general', 'Historia y Geografía Universal', 'historia, paises, capitales, guerras, civilizaciones'),
('b0000000-0000-0000-0000-000000000002', 'cultura_general', 'Arte, Literatura y Cine', 'novelas, pintores, directores, cine, mitologia'),
('c0000000-0000-0000-0000-000000000001', 'ciencia', 'Astronomía y Física', 'planetas, estrellas, gravedad, velocidad de luz, atomos'),
('c0000000-0000-0000-0000-000000000002', 'ciencia', 'Biología y Química', 'adn, celulas, organos, elementos, reacciones')
ON CONFLICT (id) DO NOTHING;

-- Preguntas Cultura General
INSERT INTO questions (category_id, subtopic_id, question_text, options, correct_index, difficulty) VALUES
('cultura_general', 'b0000000-0000-0000-0000-000000000001', '¿Cuál es el río más largo del mundo?', '["Amazonas", "Nilo", "Yangtsé", "Misisipi"]', 0, 'easy'),
('cultura_general', 'b0000000-0000-0000-0000-000000000001', '¿En qué año cayó el Muro de Berlín?', '["1989", "1991", "1975", "1985"]', 0, 'easy'),
('cultura_general', 'b0000000-0000-0000-0000-000000000002', '¿Quién pintó la famosa obra La noche estrellada?', '["Vincent van Gogh", "Claude Monet", "Pablo Picasso", "Salvador Dalí"]', 0, 'easy'),
('cultura_general', 'b0000000-0000-0000-0000-000000000001', '¿Cuál es el país más extenso del planeta por superficie territorial?', '["Rusia", "Canadá", "China", "Estados Unidos"]', 0, 'easy'),
('cultura_general', 'b0000000-0000-0000-0000-000000000001', '¿Qué civilización antigua construyó la mítica ciudadela de Machu Picchu?', '["Inca", "Maya", "Azteca", "Olmeca"]', 0, 'easy'),
('cultura_general', 'b0000000-0000-0000-0000-000000000002', '¿Quién escribió la célebre novela Cien años de soledad?', '["Gabriel García Márquez", "Mario Vargas Llosa", "Julio Cortázar", "Jorge Luis Borges"]', 0, 'easy'),
('cultura_general', 'b0000000-0000-0000-0000-000000000001', '¿Cuál es la capital oficial de Australia?', '["Canberra", "Sídney", "Melbourne", "Brisbane"]', 0, 'medium'),
('cultura_general', 'b0000000-0000-0000-0000-000000000001', '¿En qué océano se encuentra la Fosa de las Marianas?', '["Océano Pacífico", "Océano Atlántico", "Océano Índico", "Océano Ártico"]', 0, 'medium'),
('cultura_general', 'b0000000-0000-0000-0000-000000000002', '¿Qué filósofo griego fue tutor y maestro de Alejandro Magno?', '["Aristóteles", "Platón", "Sócrates", "Pitágoras"]', 0, 'medium'),
('cultura_general', 'b0000000-0000-0000-0000-000000000001', '¿Cuál de las siguientes maravillas del mundo antiguo sigue en pie hoy en día?', '["La Gran Pirámide de Guiza", "El Coloso de Rodas", "El Faro de Alejandría", "Los Jardines Colgantes"]', 0, 'easy'),
('cultura_general', 'b0000000-0000-0000-0000-000000000001', '¿Qué país ganó la primera Copa Mundial de Fútbol en 1930?', '["Uruguay", "Argentina", "Brasil", "Italia"]', 0, 'medium'),
('cultura_general', 'b0000000-0000-0000-0000-000000000002', '¿En qué museo de París se encuentra la pintura de la Mona Lisa?', '["Museo del Louvre", "Museo de Orsay", "Centro Pompidou", "Museo Rodin"]', 0, 'easy'),

-- Preguntas Ciencia
('ciencia', 'c0000000-0000-0000-0000-000000000001', '¿Cuál es el elemento químico más abundante en el universo observable?', '["Hidrógeno", "Helio", "Oxígeno", "Carbono"]', 0, 'easy'),
('ciencia', 'c0000000-0000-0000-0000-000000000001', '¿Qué partícula subatómica posee carga eléctrica negativa?', '["Electrón", "Protón", "Neutrón", "Positrón"]', 0, 'easy'),
('ciencia', 'c0000000-0000-0000-0000-000000000001', '¿Cuál es la velocidad aproximada de la luz en el vacío?', '["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "3,000 km/s"]', 0, 'easy'),
('ciencia', 'c0000000-0000-0000-0000-000000000001', '¿Cuál es el planeta más grande del Sistema Solar?', '["Júpiter", "Saturno", "Neptuno", "Urano"]', 0, 'easy'),
('ciencia', 'c0000000-0000-0000-0000-000000000002', '¿Qué molécula almacena la información genética en los seres vivos?', '["ADN", "ARN", "ATP", "Glucosa"]', 0, 'easy'),
('ciencia', 'c0000000-0000-0000-0000-000000000002', '¿Cuál es el órgano más grande del cuerpo humano?', '["La piel", "El hígado", "El cerebro", "Los pulmones"]', 0, 'easy'),
('ciencia', 'c0000000-0000-0000-0000-000000000001', '¿Qué ley física afirma que la energía no se crea ni se destruye, solo se transforma?', '["Primera ley de la termodinámica", "Segunda ley de Newton", "Ley de gravitación universal", "Ley de Coulomb"]', 0, 'medium'),
('ciencia', 'c0000000-0000-0000-0000-000000000001', '¿Cuál es la unidad básica del Sistema Internacional para medir la fuerza?', '["Newton", "Joule", "Pascal", "Watt"]', 0, 'easy'),
('ciencia', 'c0000000-0000-0000-0000-000000000002', '¿Qué componente sanguíneo es el principal encargado de transportar oxígeno?', '["Glóbulos rojos (Eritrocitos)", "Glóbulos blancos", "Plaquetas", "Plasma"]', 0, 'easy'),
('ciencia', 'c0000000-0000-0000-0000-000000000001', '¿A qué temperatura hierve el agua al nivel del mar en la escala Celsius?', '["100 °C", "90 °C", "120 °C", "212 °C"]', 0, 'easy'),
('ciencia', 'c0000000-0000-0000-0000-000000000001', '¿Qué científico formuló la teoría de la Relatividad General?', '["Albert Einstein", "Isaac Newton", "Nikola Tesla", "Galileo Galilei"]', 0, 'easy'),
('ciencia', 'c0000000-0000-0000-0000-000000000001', '¿Cuál es el satélite natural más grande del planeta Saturno?', '["Titán", "Europa", "Ganimedes", "Ío"]', 0, 'medium'),

-- Más preguntas Tecnología
('tecnologia', 'a0000000-0000-0000-0000-000000000002', '¿Qué estructura de datos opera bajo el principio LIFO (Last In, First Out)?', '["Pila (Stack)", "Cola (Queue)", "Lista enlazada", "Árbol binario"]', 0, 'easy'),
('tecnologia', 'a0000000-0000-0000-0000-000000000001', '¿Qué significa HTTP en redes y navegación web?', '["Hypertext Transfer Protocol", "High Technology Test Port", "Hyper Technical Process", "Hybrid Traffic Protocol"]', 0, 'easy'),
('tecnologia', 'a0000000-0000-0000-0000-000000000002', '¿Cuál es la complejidad temporal promedio de búsqueda en una tabla Hash balanceada?', '["O(1)", "O(n)", "O(log n)", "O(n^2)"]', 0, 'medium'),
('tecnologia', 'a0000000-0000-0000-0000-000000000002', '¿Qué lenguaje de programación es el más utilizado en scripts de Inteligencia Artificial?', '["Python", "Ruby", "PHP", "Perl"]', 0, 'easy'),
('tecnologia', 'a0000000-0000-0000-0000-000000000001', '¿Qué técnica criptográfica utiliza un par de llaves: una pública y una privada?', '["Criptografía asimétrica", "Criptografía simétrica", "Hashing", "Esteganografía"]', 0, 'easy')
ON CONFLICT (question_text) DO NOTHING;
