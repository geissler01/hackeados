-- ====================================================================
-- HACKEADOS - SEED DEFINITIVO: 10 CATEGORÍAS Y 100 SUBTEMAS
-- Ejecutar en DBeaver sobre la base de datos hackeados_db
-- ====================================================================

-- 1. INSERTAR O ACTUALIZAR LAS 10 CATEGORÍAS PRINCIPALES
INSERT INTO categories (id, name, description, target_pool_size) VALUES
('tecnologia', 'Tecnología & Ciberseguridad', 'Programación, redes, hardware, ciberseguridad e internet', 200),
('cultura_general', 'Cultura General & Curiosidades', 'Saberes del mundo, mitología, literatura, inventos y curiosidades', 200),
('ciencia', 'Ciencia & Naturaleza', 'Física, química, biología, astronomía, el cuerpo humano y ecosistemas', 200),
('entretenimiento', 'Entretenimiento & Pop Culture', 'Cine clásico y moderno, series de televisión, superhéroes y animación', 200),
('musica', 'Música & Ritmos del Mundo', 'Rock, pop, salsa, vallenato, baladas, leyendas e instrumentos', 200),
('historia', 'Historia Universal', 'Grandes civilizaciones, guerras, independencias, Colombia y personajes clave', 200),
('biblia', 'La Biblia & Relatos Sagrados', 'Génesis, patriarcas, reyes, profetas, vida de Jesús, milagros y parábolas', 200),
('campo_agro', 'El Campo, Agro & Ganadería', 'Café, ganadería, cultivos, flores, vida campesina de Colombia y el agro global', 200),
('deportes', 'Deportes & Grandes Campeonatos', 'Fútbol mundial y colombiano, ciclismo, Juegos Olímpicos, básquetbol y tenis', 200),
('geografia_mundo', 'Geografía, Países & Maravillas', 'Capitales, banderas, cordilleras, ríos, islas y monumentos del planeta', 200)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    target_pool_size = EXCLUDED.target_pool_size;

-- 2. LIMPIAR SUBTEMAS PREVIOS PARA GARANTIZAR LOS 100 EXACTOS
DELETE FROM subtopics WHERE category_id IN (
    'tecnologia', 'cultura_general', 'ciencia', 'entretenimiento', 'musica',
    'historia', 'biblia', 'campo_agro', 'deportes', 'geografia_mundo'
);

-- 3. INSERTAR 100 SUBTEMAS (10 POR CADA UNA DE LAS 10 CATEGORÍAS)
INSERT INTO subtopics (category_id, name, prompt_keywords) VALUES

-- ----------------------------------------------------
-- CATEGORÍA 1: TECNOLOGÍA & CIBERSEGURIDAD
-- ----------------------------------------------------
('tecnologia', 'Ciberseguridad y Hacking Ético', 'firewall, phishing, malware, ransomware, ataques ddos, vulnerabilidades zero-day, contraseñas seguras'),
('tecnologia', 'Desarrollo Web y Apps Móviles', 'javascript, typescript, html5, css, react, flutter, navegadores web, apis rest'),
('tecnologia', 'Redes, Internet y Telecomunicaciones', 'tcp/ip, dns, wifi, fibra optica, routers, protocolos http https, redes 5g'),
('tecnologia', 'Hardware y Componentes del Computador', 'procesadores cpu, tarjeta grafica gpu, memoria ram, discos ssd nvme, placas madre'),
('tecnologia', 'Inteligencia Artificial y Robótica', 'chatgpt, redes neuronales, machine learning, androides, automatizacion industrial'),
('tecnologia', 'Sistemas Operativos y Linux', 'comandos linux, windows, macos, terminal bash, distribuciones ubuntu debian, permisos'),
('tecnologia', 'Bases de Datos y Servidores en la Nube', 'postgresql, mysql, consultas sql, cloud computing, aws, servidores backend'),
('tecnologia', 'Historia de la Computación y Pioneros', 'alan turing, ada lovelace, primeros computadores eniac, microchips, bill gates steve jobs'),
('tecnologia', 'Criptografía y Monedas Digitales', 'bitcoin, blockchain, cifrado rsa, billeteras digitales, funciones hash'),
('tecnologia', 'Herramientas Digitales y Ofimática', 'excel formulas, procesadores de texto word, correo electronico, navegacion y seguridad digital'),

-- ----------------------------------------------------
-- CATEGORÍA 2: CULTURA GENERAL & CURIOSIDADES
-- ----------------------------------------------------
('cultura_general', 'Curiosidades del Mundo y Récords', 'records guinness, datos insolitos mundiales, fenomenos naturales extraños, medidas extremas'),
('cultura_general', 'Tradiciones y Fiestas de las Naciones', 'carnavales mundiales, dias festivos, costumbres populares, ceremonias ancestrales'),
('cultura_general', 'Grandes Inventos de la Humanidad', 'la rueda, la imprenta gutenberg, la penicilina, la brujula, el telescopio'),
('cultura_general', 'Mitología Griega, Romana y Nórdica', 'zeus, olimpo, odin, thor ragnarok, anubis mitologia egipcia, criaturas mitologicas'),
('cultura_general', 'Idiomas, Lenguaje y Expresiones', 'idiomas mas hablados, familias linguisticas, origenes del latin, jeroglificos, modismos'),
('cultura_general', 'Filosofía Clásica y Dilemas Éticos', 'socrates, platon, aristoteles, dilemas morales, logica basica y pensamiento critico'),
('cultura_general', 'Maravillas del Mundo y Arquitectura', 'piramides de egipto, machu picchu, coliseo romano, taj mahal, gran muralla china'),
('cultura_general', 'Literatura Universal y Autores Célebres', 'gabriel garcia marquez, cervantes don quijote, shakespeare, homero la odisea, novelas iconicas'),
('cultura_general', 'Gastronomía y Origen de los Alimentos', 'origen de comidas del mundo, ingredientes y especias, platos representativos internacionales'),
('cultura_general', 'Premios Nobel y Galardones Históricos', 'premio nobel de la paz, premios de literatura y fisica, figuras galardonadas del siglo xx'),

-- ----------------------------------------------------
-- CATEGORÍA 3: CIENCIA & NATURALEZA
-- ----------------------------------------------------
('ciencia', 'Astronomía, Planetas y Sistema Solar', 'el sol, la luna, marte, jupiter, eclipses solares y lunares, asteroides, orbita terrestre'),
('ciencia', 'El Cosmos, Galaxias y Agujeros Negros', 'telescopio espacial james webb, supernovas, velocidad de la luz, via lactea, estrellas fugaces'),
('ciencia', 'Anatomía y el Cuerpo Humano', 'corazon sistema circulatorio, cerebro neuronas, huesos y esqueleto, globulos rojos y blancos'),
('ciencia', 'Física Cotidiana y Leyes del Movimiento', 'gravedad de newton, velocidad aceleracion, electricidad estatica, magnetismo imanes, luz y sonido'),
('ciencia', 'Química y Elementos de la Materia', 'tabla periodica, agua h2o, oxigeno hidrogeno, estados solido liquido gaseoso, reacciones quimicas'),
('ciencia', 'Reino Animal: Mamíferos y Depredadores', 'leones felinos, elefantes, ballenas jorobadas, osos, adaptaciones biologicas y camuflaje'),
('ciencia', 'Océanos, Peces y Fauna Marina', 'tiburones, arrecifes de coral coralinos, pulpos y calamares, fosas abisales profundas, medusas'),
('ciencia', 'Insectos, Aves y Vuelo Animal', 'abejas y polinizacion, hormigas colonias, rapaces aguilas halcones, alas y migracion de aves'),
('ciencia', 'Genética, ADN y Evolución', 'charles darwin seleccion natural, adn doble helice, celulas vivas, herencia biologica cromosomas'),
('ciencia', 'Ecología, Clima y Medio Ambiente', 'capa de ozono, efecto invernadero, glaciares, biodiversidad bosques selvas, reciclaje'),

-- ----------------------------------------------------
-- CATEGORÍA 4: ENTRETENIMIENTO & POP CULTURE
-- ----------------------------------------------------
('entretenimiento', 'Cine Clásico y Películas Legendarias', 'el padrino, titanic, jurassic park, volver al futuro, peliculas de culto de hollywood'),
('entretenimiento', 'Series de Televisión y Éxitos de Streaming', 'breaking bad, juego de tronos westeros, stranger things, friends, series de drama y ficcion'),
('entretenimiento', 'Superhéroes y Cómics (Marvel y DC)', 'batman el caballero de la noche, spiderman, iron man avengers, superman, villanos celebres'),
('entretenimiento', 'Cine de Animación y Películas Familiares', 'pixar toy story, peliculas disney clasicas, shrek dreamworks, el rey leon, busqueda de nemo'),
('entretenimiento', 'Videojuegos y Consolas Populares', 'mario bros nintendo, playstation, gta grand theft auto, minecraft bloques, pokemon sagas'),
('entretenimiento', 'Ciencia Ficción y Películas Espaciales', 'matrix neo, star wars jedi, avatar pandora, terminator robots, alien, viajes en el tiempo'),
('entretenimiento', 'Cine de Terror, Suspenso y Monstruos', 'peliculas de dracula monstruos, stephen king adaptaciones, suspenso psicologico, casas embrujadas'),
('entretenimiento', 'Premios Óscar y Ceremonias del Espectáculo', 'estatuillas doradas de la academia, alfombra roja, directores ganadores, mejores actores'),
('entretenimiento', 'Comedias, Sitcoms y Momentos Virales', 'sitcoms clasicas divertidas, comediantes mundiales, programas de concursos y television'),
('entretenimiento', 'Bandas Sonoras y Música de Películas', 'john williams star wars, hans zimmer bandas sonoras, temas musicales de cine iconicos'),

-- ----------------------------------------------------
-- CATEGORÍA 5: MÚSICA & RITMOS DEL MUNDO
-- ----------------------------------------------------
('musica', 'Rock Clásico y Bandas Inmortales', 'queen freddie mercury, the beatles lennon mccartney, the rolling stones, led zeppelin, pink floyd'),
('musica', 'Pop Internacional y Estrellas Mundiales', 'michael jackson rey del pop, madonna, shakira exitos, elton john, pop de los años 80 y 90'),
('musica', 'Salsa y Ritmos Caribeños', 'fania all stars, hector lavoe, joe arroyo salsa colombiana, celia cruz azucar, son cubano, timbales'),
('musica', 'Vallenato y Folclor Colombiano', 'diomedes diaz, rafael escalona, acordeon caja y guacharaca, carlos vives clasicos de la provincia'),
('musica', 'Baladas Románticas en Español', 'juan gabriel, roberto carlos, luis miguel boleros, jose jose el triste, baladistas de oro'),
('musica', 'Instrumentos Musicales y Acústica', 'guitarra acustica y electrica, piano de cola, bateria percusion, saxofon, tipos de cuerdas'),
('musica', 'Música Clásica y Grandes Maestros', 'beethoven novena sinfonia, mozart serenata nocturna, bach barroco, vivaldi las cuatro estaciones'),
('musica', 'Hip-Hop, Rap y Cultura Urbana', 'tupac shakur, eminem rap god, bases y ritmos urbanos, historia del hip hop, batallas de rimas'),
('musica', 'Música Urbana Latina y Reguetón Clásico', 'daddy yankee gasolina, don omar, regueton clasico 2000s, fusiones latinas bailables'),
('musica', 'Álbumes Históricos y Conciertos Legendarios', 'album thriller michael jackson mas vendido, festival woodstock 1969, concierto live aid 1985'),

-- ----------------------------------------------------
-- CATEGORÍA 6: HISTORIA UNIVERSAL
-- ----------------------------------------------------
('historia', 'Egipto Antiguo y Mesopotamia', 'faraones tutankamon ramses, rio nilo, jeroglificos egipcios, babilonia cuna de la civilizacion'),
('historia', 'Grecia Clásica y el Imperio Romano', 'julio cesar idus de marzo, atenas democracia, gladiadores coliseo, espartanos, caida de roma'),
('historia', 'La Edad Media, Castillos y Caballeros', 'feudalismo caballeros armaduras, cruzadas medievales, peste negra 1348, castillos fortalezas'),
('historia', 'Descubrimiento de América y Culturas Precolombinas', 'cristobal colon 1492 carabelas, imperio inca machu picchu, aztecas tenochtitlan, templos mayas'),
('historia', 'Independencia y Fundación de Colombia', 'simon bolivar libertador, batalla de boyaca 1819, policarpa salavarrieta, 20 de julio 1810'),
('historia', 'Revolución Francesa y la Era Napoleónica', 'toma de la bastilla 1789, napoleon bonaparte imperio frances, revolucion industrial vapor maquinas'),
('historia', 'Primera Guerra Mundial (1914-1918)', 'guerra de trincheras, asesinato archiduque francisco fernando, tratado de versalles, fin de imperios'),
('historia', 'Segunda Guerra Mundial (1939-1945)', 'dia d desembarco de normandia, batalla de stalingrado, ataque a pearl harbor, victoria aliada 1945'),
('historia', 'Guerra Fría y la Carrera Espacial', 'muro de berlin division alemania, llegada a la luna apolo 11 1969, tension eeuu y union sovietica'),
('historia', 'Grandes Líderes y Figuras por la Paz', 'nelson mandela sudafrica, martin luther king marchas civiles, mahatma gandhi no violencia india'),

-- ----------------------------------------------------
-- CATEGORÍA 7: LA BIBLIA & RELATOS SAGRADOS
-- ----------------------------------------------------
('biblia', 'Génesis y la Creación del Mundo', 'los 7 dias de la creacion, adan y eva en el eden, el arca de noe diluvio, la torre de babel'),
('biblia', 'Patriarcas y el Éxodo de Egipto', 'abraham padre de la fe, moises liberacion, las 10 plagas de egipto, paso del mar rojo, tabernaculo'),
('biblia', 'Los Diez Mandamientos y la Ley de Moisés', 'monte sinai tablas de la ley, mandamientos honrar padre y madre, arca de la alianza pacto'),
('biblia', 'Reyes y Jueces de Israel', 'el rey david y el gigante goliat, rey salomon templo y sabiduria, sanson fuerza, profeta samuel'),
('biblia', 'Profetas del Antiguo Testamento', 'elias y los profetas de baal, daniel foso de los leones, jonas y el gran pez, profeta isaias'),
('biblia', 'Nacimiento e Infancia de Jesús', 'anunciacion angel gabriel a maria, nacimiento en belen estrella de oriente, reyes magos pesebre'),
('biblia', 'Milagros y Sanidades de Jesús', 'conversion del agua en vino bodas de cana, multiplicacion panes y peces, caminar sobre el mar, lazaro'),
('biblia', 'Parábolas y Enseñanzas del Evangelio', 'parabola del buen samaritano, el hijo prodigo, el sembrador y la semilla, la oveja perdida'),
('biblia', 'Pasión, Muerte y Resurrección de Jesús', 'la ultima cena pan y vino, getsemani oracion, juicio de pilatos, la cruz calvario, el sepulcro vacio'),
('biblia', 'Hechos de los Apóstoles y Cartas', 'pentecostes venida del espiritu santo, conversion de pablo en damasco, cartas a los corintios'),

-- ----------------------------------------------------
-- CATEGORÍA 8: EL CAMPO, AGRO & GANADERÍA
-- ----------------------------------------------------
('campo_agro', 'Cultura Cafetera y Producción de Café', 'cafe de colombia suave arabica, eje cafetero quindio antioquia, recoleccion grano rojo cereza, secado y tostion'),
('campo_agro', 'Ganadería Bovina y Pastos de Engorde', 'ganado cebu brahman, razas lecheras holstein girolando, llanos orientales sabanas, ordeño y pastoreo'),
('campo_agro', 'Plátano, Banano y Frutales Tropicales', 'platano verde y maduro, banano de uraba y magdalena exportacion, aguacate hass, citricos naranja limon'),
('campo_agro', 'Floricultura y Cultivo de Flores', 'rosas y claveles sabana de bogota exportacion, orquidea cattleya flor nacional, san valentin'),
('campo_agro', 'Cacao y Producción Chocolatera', 'mazorca de cacao fino de aroma, fermentacion del grano, chocolate artesanal campesino, cultivos de sombrio'),
('campo_agro', 'Maquinaria, Herramientas y Riego Agrícola', 'tractores de campo, arado de disco, azadon machete herramientas, sistemas de riego por goteo, fumigacion'),
('campo_agro', 'Caballos, Mulares y Faenas Rurales', 'caballo criollo colombiano paso fino, mulas de carga arrieria paisa, sillas de montar, establos y pesebreras'),
('campo_agro', 'Avicultura y Animales de Corral', 'gallinas ponedoras huevos de campo, pollos de engorde, cerdos porcicultura, pisicultura trucha tilapia'),
('campo_agro', 'Suelos, Abonos y Agricultura Sostenible', 'compost organico gallinaza, lombricultura abono solido liquido, rotacion de siembra, cuidado de quebradas y nacimientos'),
('campo_agro', 'Tradiciones Campesinas y Mercados del Pueblo', 'mercados campesinos plazas de mercado, buses escalera chivas, ruanas ruanas de lana boyacense, sombreros vueltiaos'),

-- ----------------------------------------------------
-- CATEGORÍA 9: DEPORTES & GRANDES CAMPEONATOS
-- ----------------------------------------------------
('deportes', 'Copas Mundiales de la FIFA', 'campeones del mundo, pele tres copas, maradona mexico 86, messi qatar 2022, goles memorables'),
('deportes', 'Fútbol de Clubes y Torneos Continentales', 'champions league de europa, copa libertadores de america, real madrid, barcelona, leyendas de clubes'),
('deportes', 'Fútbol Colombiano y la Selección Tricolor', 'seleccion colombia mundial italia 90 carlos pibe valderrama, brasil 2014 james rodriguez bota de oro, falcao'),
('deportes', 'Ciclismo de Ruta y Grandes Vueltas', 'tour de francia maillot amarillo, giro de italia maglia rosa, vuelta a españa, escarabajos colombianos lucho herrera egan'),
('deportes', 'Baloncesto y Leyendas de la NBA', 'michael jordan chicago bulls 6 anillos, lebron james maximo anotador, kobe bryant lakers, canastas triples'),
('deportes', 'Juegos Olímpicos Modernos', 'medallas de oro olimpicas, pekin 2008 records, usain bolt rey de la velocidad, michael phelps natacion oro'),
('deportes', 'Tenis y Torneos de Grand Slam', 'wimbledon cancha de hierba, roland garros tierra batida nadal, federer djokovic, saques aces'),
('deportes', 'Fórmula 1 y Automovilismo', 'f1 gran premio monaco, ayrton senna leyenda, michael schumacher ferrari, verstappen hamilton escuderias'),
('deportes', 'Boxeo y Deportes de Combate', 'muhammad ali combate del siglo, mike tyson ko golpes, cinturones mundiales peso pesado, guantes'),
('deportes', 'Atletismo, Maratones y Pruebas de Pista', '100 metros planos velocidad maxima, maraton 42 kilometros carrera clasica, salto con pertiga garrocha'),

-- ----------------------------------------------------
-- CATEGORÍA 10: GEOGRAFÍA, PAÍSES & MARAVILLAS
-- ----------------------------------------------------
('geografia_mundo', 'Capitales de América y Europa', 'bogota colombia, buenos aires argentina, paris francia torre eiffel, madrid espana, londres reino unido, roma italia'),
('geografia_mundo', 'Capitales de Asia, África y Oceanía', 'tokio japon, pekin china, el cairo egipto, canberra australia, seul corea, bangkok tailandia, nairobi kenia'),
('geografia_mundo', 'Banderas del Mundo y sus Símbolos', 'banderas tricolor amarillo azul rojo, estrellas y cruces en banderas, bandera de nepal unica, colores patrios'),
('geografia_mundo', 'Ríos Caudalosos, Lagos y Océanos', 'rio amazonas el mas caudaloso, rio nilo egipto, rio magdalena colombia, oceano pacifico el mas grande, lago titicaca'),
('geografia_mundo', 'Grandes Montañas y Cordilleras', 'monte everest el pico mas alto himalaya, cordillera de los andes sudamérica, cerro aconcagua, los alpes suizos nevados'),
('geografia_mundo', 'Desiertos, Selvas y Paisajes Extremos', 'desierto del sahara dunas gigantes, selva del amazonas pulmon del mundo, la antartida hielos polares, desierto de atacama chile'),
('geografia_mundo', 'Islas, Archipiélagos y Costas', 'islas galapagos ecuador, san andres y providencia mar de 7 colores, hawai volcanes, madagascar, mar caribe playas'),
('geografia_mundo', 'Monumentos Famosos y Obras Humanas', 'estatua de la libertad nueva york, torre de pisa inclinada, puente golden gate san francisco, canales de venecia'),
('geografia_mundo', 'Países Pequeños, Enclaves y Curiosidades', 'el vaticano el estado mas pequeño, monaco, paises sin costa al mar bolivia suiza, islandia tierra de hielo y fuego'),
('geografia_mundo', 'Líneas Imaginarias y Hemisferios', 'linea del ecuador latitud cero, meridiano de greenwich longitud, hemisferio norte y sur, polos norte y sur');
