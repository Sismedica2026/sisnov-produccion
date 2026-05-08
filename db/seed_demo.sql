-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Contraseña por defecto: "sismedica123" (hasheada con bcrypt)
-- En producción el admin debe cambiarlas desde el panel

INSERT INTO usuarios (username, password_hash, nombre, rol, zona, activo) VALUES
-- ADMINS
('admin1',    '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Carlos Ramírez',           'admin',             NULL,    true),
('admin2',    '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'María Gómez',              'admin',             NULL,    true),
-- GERENTE
('gerente',   '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Andrés Martínez',          'gerente',           NULL,    true),
-- DIRECTORES
('dir.norte', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Juan Herrera',             'director-norte',    'NORTE', true),
('dir.sur',   '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Sofía Mendoza',            'director-sur',      'SUR',   true),
-- COORDINADORES
('coord.norte','$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO','Coordinador Zona Norte',  'coordinador-norte', 'NORTE', true),
('coord.sur',  '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO','Coordinador Zona Sur',    'coordinador-sur',   'SUR',   true),
-- SUPERVISORES
('sup01', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Luis Manjarres',      'supervisor', 'NORTE', true),
('sup02', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Jefferson Quintero',  'supervisor', 'NORTE', true),
('sup03', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Carolina Moreno',     'supervisor', 'NORTE', true),
('sup04', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Tatiana Ricardo',     'supervisor', 'NORTE', true),
('sup05', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Janner Abdo',         'supervisor', 'NORTE', true),
('sup06', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Zharick Silva',       'supervisor', 'NORTE', true),
('sup07', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Yohany Toro',         'supervisor', 'NORTE', true),
('sup08', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Sebastian Gamboa',    'supervisor', 'NORTE', true),
('sup09', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Yeny Hernandez',      'supervisor', 'NORTE', true),
('sup10', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Nicolas Peña',        'supervisor', 'NORTE', true),
('sup11', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Arnovy Vega',         'supervisor', 'SUR',   true),
('sup12', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Cristina Londoño',    'supervisor', 'SUR',   true),
('sup13', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Lisbeth Berrio',      'supervisor', 'SUR',   true),
('sup14', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Rosa Penagos',        'supervisor', 'SUR',   true),
('sup15', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Alejandro Tamayo',    'supervisor', 'SUR',   true),
('sup16', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Leidi Correa',        'supervisor', 'SUR',   true),
('sup17', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Sergio Cano',         'supervisor', 'SUR',   true),
('sup18', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Jhon Arevalo',        'supervisor', 'SUR',   true),
('sup19', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Alvaro Grajales',     'supervisor', 'SUR',   true),
('sup20', '$2a$10$xQKp/GmVlEFf7YLSR5Y1kOGI7h6.P1mQ8YIWBqN3mHe9dXn4kzVQO', 'Milena Hernandez',    'supervisor', 'SUR',   true)
ON CONFLICT (username) DO NOTHING;

-- Asignaciones iniciales de concesiones
INSERT INTO asignaciones (username, concesion, asignado_por) VALUES
('sup01','AUTOPISTA DEL CARIBE','admin1'),
('sup02','RUTA AL MAR ANTIOQUIA','admin1'),('sup02','YUMA','admin1'),
('sup03','YUMA','admin1'),
('sup04','PERIMETRAL','admin1'),('sup04','SISGA','admin1'),
('sup05','COSTERA','admin1'),
('sup06','RUTAS DEL CACAO','admin1'),
('sup07','ACCENORTE','admin1'),('sup07','AUTOPISTA DEL CARIBE','admin1'),
('sup08','AUTOPISTA DEL RIO GRANDE','admin1'),
('sup09','COVIANDINA','admin1'),
('sup10','SISGA','admin1'),('sup10','NORDESTE','admin1'),
('sup11','PACIFICO 3','admin1'),
('sup12','RUTAS DEL VALLE','admin1'),('sup12','PACIFICO 3','admin1'),
('sup13','COVIORIENTE','admin1'),
('sup14','TUNEL DE LA LINEA','admin1'),
('sup15','PACIFICO 2 - LA PINTADA','admin1'),('sup15','TUNEL DE LA LINEA','admin1'),
('sup16','PERIMETRAL','admin1'),('sup16','RUTA BOGOTA NORTE','admin1'),
('sup17','COVIANDINA','admin1'),
('sup18','PANAMERICANA','admin1'),
('sup19','VIAL DEL NUS','admin1'),
('sup20','UNION DEL SUR','admin1')
ON CONFLICT (username, concesion) DO NOTHING;
