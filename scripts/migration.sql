-- Migration generated at 2026-01-29T03:17:20.348Z

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = 'COD') THEN
        UPDATE clients SET name='NOMBRE Y APELLIDO', phone='BARRIO', email='CALLE', ruc='CI/RUC', address='CIUDAD', details='TELEFONO R1' WHERE ci = 'COD';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', 'COD', 'NOMBRE Y APELLIDO', 'CI/RUC', 'CIUDAD', 'BARRIO', 'CALLE', 'TELEFONO R1');
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '1') THEN
        UPDATE clients SET name='RODOLFO RENE VELAZQUEZ VERDUN', phone='XXX', email='14 DE FEBERO C/ ESTRELLA DEL SUR', ruc='2878801', address='SAN LORENZO', details=NULL WHERE ci = '1';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '1', 'RODOLFO RENE VELAZQUEZ VERDUN', '2878801', 'SAN LORENZO', 'XXX', '14 DE FEBERO C/ ESTRELLA DEL SUR', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '2') THEN
        UPDATE clients SET name='OSCAR ALFREDO CACERES VAZQUEZ', phone='MARIA AUXILIADORA', email='AVDA. LA VICTORIA', ruc='5155318', address='SAN LORENZO', details=NULL WHERE ci = '2';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '2', 'OSCAR ALFREDO CACERES VAZQUEZ', '5155318', 'SAN LORENZO', 'MARIA AUXILIADORA', 'AVDA. LA VICTORIA', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '3') THEN
        UPDATE clients SET name='HILARIO MONZON FERREIRA', phone=NULL, email='COLONIA SAN JOSE', ruc='7166075', address='VELLA VISTA NORTE', details=NULL WHERE ci = '3';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '3', 'HILARIO MONZON FERREIRA', '7166075', 'VELLA VISTA NORTE', NULL, 'COLONIA SAN JOSE', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '4') THEN
        UPDATE clients SET name='GREGORIA CANTERO', phone='YVY SUNU', email=NULL, ruc='2578579', address='GUARAMBARE', details=NULL WHERE ci = '4';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '4', 'GREGORIA CANTERO', '2578579', 'GUARAMBARE', 'YVY SUNU', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '5') THEN
        UPDATE clients SET name='EDGAR ARIEL PORTILLO TALAVERA', phone='SAN ANTONIO', email='MANUEL ORTIZ GUERRERO', ruc='3904741', address='SAN LORENZO', details=NULL WHERE ci = '5';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '5', 'EDGAR ARIEL PORTILLO TALAVERA', '3904741', 'SAN LORENZO', 'SAN ANTONIO', 'MANUEL ORTIZ GUERRERO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '6') THEN
        UPDATE clients SET name='DAHIANA JANET TORRES', phone='SICOMAR', email='AVDA SAN JOSE', ruc='6570339', address='LIMPIO', details=NULL WHERE ci = '6';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '6', 'DAHIANA JANET TORRES', '6570339', 'LIMPIO', 'SICOMAR', 'AVDA SAN JOSE', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '7') THEN
        UPDATE clients SET name='HUGO ALBERTO GONZALEZ BARRIOS', phone=NULL, email='MCAL LOPEZ Y DON BOSCO', ruc='5087817', address='FERNANDO DE LA MORA', details=NULL WHERE ci = '7';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '7', 'HUGO ALBERTO GONZALEZ BARRIOS', '5087817', 'FERNANDO DE LA MORA', NULL, 'MCAL LOPEZ Y DON BOSCO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '8') THEN
        UPDATE clients SET name='HUGO DANIEL BENITEZ', phone='SAN PEDRO', email='JUAN GILL Y SEBASTIAN GABOTO', ruc='3710488', address='SAN LORENZO', details=NULL WHERE ci = '8';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '8', 'HUGO DANIEL BENITEZ', '3710488', 'SAN LORENZO', 'SAN PEDRO', 'JUAN GILL Y SEBASTIAN GABOTO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '9') THEN
        UPDATE clients SET name='FRANZ LOENVEN LOENVEN', phone='COLONIA RIO VERDE', email=NULL, ruc='3723472', address='SANTA ROSA DEL AGUARAY', details=NULL WHERE ci = '9';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '9', 'FRANZ LOENVEN LOENVEN', '3723472', 'SANTA ROSA DEL AGUARAY', 'COLONIA RIO VERDE', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '10') THEN
        UPDATE clients SET name='DERLIS VICENTE PORTILLO GARCIA', phone='FATIMA', email='JOVENES MARANDU C/ PROF MINGUEL', ruc='6961438', address='CONCEPCION', details=NULL WHERE ci = '10';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '10', 'DERLIS VICENTE PORTILLO GARCIA', '6961438', 'CONCEPCION', 'FATIMA', 'JOVENES MARANDU C/ PROF MINGUEL', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '11') THEN
        UPDATE clients SET name='CESAR ENRIQUE LEGUIZAMON CANO', phone='PANCHITO LOPEZ', email='RUTA 5TA GRAL BERNARDINO C. KM 8', ruc='4674829', address='CONCEPCION', details=NULL WHERE ci = '11';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '11', 'CESAR ENRIQUE LEGUIZAMON CANO', '4674829', 'CONCEPCION', 'PANCHITO LOPEZ', 'RUTA 5TA GRAL BERNARDINO C. KM 8', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '12') THEN
        UPDATE clients SET name='DIANA BUENA VENTURA SERVIAN BARIERO', phone=NULL, email='TRIESTE C/BICENTENARIO', ruc='3740689', address='SAN LORENZO', details=NULL WHERE ci = '12';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '12', 'DIANA BUENA VENTURA SERVIAN BARIERO', '3740689', 'SAN LORENZO', NULL, 'TRIESTE C/BICENTENARIO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '13') THEN
        UPDATE clients SET name='ALCIDES RAMON RUIZ BENITEZ', phone='SAN LUIS', email=NULL, ruc='3517045', address='SAN LORENZO', details=NULL WHERE ci = '13';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '13', 'ALCIDES RAMON RUIZ BENITEZ', '3517045', 'SAN LORENZO', 'SAN LUIS', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '14') THEN
        UPDATE clients SET name='JESSICA MARLENE BOVEDA JARA', phone='SAN LUIS', email='CHINA N° 180 C/ TAILANDIA', ruc='6785258', address='SAN LORENZO', details='994716447' WHERE ci = '14';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '14', 'JESSICA MARLENE BOVEDA JARA', '6785258', 'SAN LORENZO', 'SAN LUIS', 'CHINA N° 180 C/ TAILANDIA', '994716447');
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '15') THEN
        UPDATE clients SET name='LETICIA PAOLA ARMOHA VILLALBA', phone='SOLDADO OVELAR C/ ASUNCION', email=NULL, ruc='5005292', address='FERNANDO DE LA MORA', details=NULL WHERE ci = '15';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '15', 'LETICIA PAOLA ARMOHA VILLALBA', '5005292', 'FERNANDO DE LA MORA', 'SOLDADO OVELAR C/ ASUNCION', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '16') THEN
        UPDATE clients SET name='MARCELO MIGUEL ARGAÑA ROMERO', phone='MBAYUE', email='AVDA SAN FRANCISCO', ruc='6090415', address='LIMPIO', details=NULL WHERE ci = '16';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '16', 'MARCELO MIGUEL ARGAÑA ROMERO', '6090415', 'LIMPIO', 'MBAYUE', 'AVDA SAN FRANCISCO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '17') THEN
        UPDATE clients SET name='GIL LEONOR LARREA BENITEZ', phone=NULL, email='CALLE JAZMIN', ruc='3920009', address='LOMA PLATA', details=NULL WHERE ci = '17';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '17', 'GIL LEONOR LARREA BENITEZ', '3920009', 'LOMA PLATA', NULL, 'CALLE JAZMIN', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '18') THEN
        UPDATE clients SET name='FERNANDO JOSE CENTURION CHAPARRO', phone='ISLA BOGADO', email='FOTOGRAFOS DEL CHACO', ruc='6114053', address='LUQUE', details=NULL WHERE ci = '18';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '18', 'FERNANDO JOSE CENTURION CHAPARRO', '6114053', 'LUQUE', 'ISLA BOGADO', 'FOTOGRAFOS DEL CHACO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '19') THEN
        UPDATE clients SET name='NERY DELVALLE', phone='SAN SEBASTIAN', email='GRAL DIAZ', ruc='4002652', address='CAPIATA', details=NULL WHERE ci = '19';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '19', 'NERY DELVALLE', '4002652', 'CAPIATA', 'SAN SEBASTIAN', 'GRAL DIAZ', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '20') THEN
        UPDATE clients SET name='OSVALDO RENE ESPINOLA', phone='VIRGEN DEL ROSARIO', email=NULL, ruc='4081438', address='SAN LORENZO', details=NULL WHERE ci = '20';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '20', 'OSVALDO RENE ESPINOLA', '4081438', 'SAN LORENZO', 'VIRGEN DEL ROSARIO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '21') THEN
        UPDATE clients SET name='ADOLFO RAMON BAREIRO', phone=NULL, email='MANUEL ORTIZ GUERRERO', ruc='5433056', address='SAN LORENZO', details=NULL WHERE ci = '21';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '21', 'ADOLFO RAMON BAREIRO', '5433056', 'SAN LORENZO', NULL, 'MANUEL ORTIZ GUERRERO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '22') THEN
        UPDATE clients SET name='LORENZO ALVARENGA', phone='MARIN KAAGUY', email='CAMINO A SAN BERNARDINO', ruc='5268395', address='LUQUE', details=NULL WHERE ci = '22';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '22', 'LORENZO ALVARENGA', '5268395', 'LUQUE', 'MARIN KAAGUY', 'CAMINO A SAN BERNARDINO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '23') THEN
        UPDATE clients SET name='BIENVENIDA SAMUDIO', phone='SANTA CRUZ', email='AROMITA', ruc='5099029', address='LUQUE', details=NULL WHERE ci = '23';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '23', 'BIENVENIDA SAMUDIO', '5099029', 'LUQUE', 'SANTA CRUZ', 'AROMITA', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '24') THEN
        UPDATE clients SET name='JUSTA ORUE', phone='SAN JUAN 2', email='PACHOLI', ruc='2353655', address='CAPIATA', details=NULL WHERE ci = '24';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '24', 'JUSTA ORUE', '2353655', 'CAPIATA', 'SAN JUAN 2', 'PACHOLI', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '25') THEN
        UPDATE clients SET name='LIZ MABEL ALCARAZ', phone='BARRIO NRO 1', email='PIRAYU', ruc='3265409', address='PIRAYU', details=NULL WHERE ci = '25';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '25', 'LIZ MABEL ALCARAZ', '3265409', 'PIRAYU', 'BARRIO NRO 1', 'PIRAYU', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '26') THEN
        UPDATE clients SET name='VIVIAN ESTELA FIGUEREDO', phone='GLORIA MARIA', email='ECUADOR CASI CHILE', ruc='4628060', address='VILLA ELISA', details=NULL WHERE ci = '26';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '26', 'VIVIAN ESTELA FIGUEREDO', '4628060', 'VILLA ELISA', 'GLORIA MARIA', 'ECUADOR CASI CHILE', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '27') THEN
        UPDATE clients SET name='MIGUEL ANGEL SILVA NUÑEZ', phone='SAN CARLOS', email='15 DE MAYO', ruc='1193055', address='LUQUE', details=NULL WHERE ci = '27';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '27', 'MIGUEL ANGEL SILVA NUÑEZ', '1193055', 'LUQUE', 'SAN CARLOS', '15 DE MAYO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '28') THEN
        UPDATE clients SET name='DAYSI VARGAS RODRIGUEZ', phone='SANTA ROSA', email='AVDA SAN JOSE', ruc='4407340', address='LIMPIO', details=NULL WHERE ci = '28';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '28', 'DAYSI VARGAS RODRIGUEZ', '4407340', 'LIMPIO', 'SANTA ROSA', 'AVDA SAN JOSE', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '29') THEN
        UPDATE clients SET name='JUAN ANTUNEZ ARRUA', phone='SAN FRANCISCO', email='14 DE MAYO', ruc='1749830', address='SAN LORENZO', details=NULL WHERE ci = '29';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '29', 'JUAN ANTUNEZ ARRUA', '1749830', 'SAN LORENZO', 'SAN FRANCISCO', '14 DE MAYO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '30') THEN
        UPDATE clients SET name='OSCAR ALFREDO CACERES', phone='MARIA AUXILIADORA', email='AVDA LA VICTORIA Y M. AUXILIADORA', ruc='5155318', address='SAN LORENZO', details=NULL WHERE ci = '30';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '30', 'OSCAR ALFREDO CACERES', '5155318', 'SAN LORENZO', 'MARIA AUXILIADORA', 'AVDA LA VICTORIA Y M. AUXILIADORA', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '31') THEN
        UPDATE clients SET name='MATIAS JAVIER GONZALEZ', phone='CUARTO', email='FELIPE GONZALEZ Y DEL MAESTRO', ruc='3763024', address='LUQUE', details='981538755' WHERE ci = '31';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '31', 'MATIAS JAVIER GONZALEZ', '3763024', 'LUQUE', 'CUARTO', 'FELIPE GONZALEZ Y DEL MAESTRO', '981538755');
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '32') THEN
        UPDATE clients SET name='SERGIO FABIAN LOPEZ VEGA', phone='ACHUCARRO', email=NULL, ruc='4873651', address='SAN ANTONIO', details=NULL WHERE ci = '32';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '32', 'SERGIO FABIAN LOPEZ VEGA', '4873651', 'SAN ANTONIO', 'ACHUCARRO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '33') THEN
        UPDATE clients SET name='LIZ PEREIRA', phone='CACIQUE', email='RIO APA NRO 651', ruc='7105879', address='LAMBARE', details=NULL WHERE ci = '33';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '33', 'LIZ PEREIRA', '7105879', 'LAMBARE', 'CACIQUE', 'RIO APA NRO 651', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '34') THEN
        UPDATE clients SET name='ALFREDO MATIAS MEDINA BENITEZ', phone='SAN MIGUEL', email='KM26 RUTA 1', ruc='6130314', address='J.A.SALDIVAR', details=NULL WHERE ci = '34';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '34', 'ALFREDO MATIAS MEDINA BENITEZ', '6130314', 'J.A.SALDIVAR', 'SAN MIGUEL', 'KM26 RUTA 1', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '35') THEN
        UPDATE clients SET name='GERARDO AVALOS', phone='TAYUAZAPE', email=NULL, ruc='3450785', address='SAN LORENZO', details=NULL WHERE ci = '35';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '35', 'GERARDO AVALOS', '3450785', 'SAN LORENZO', 'TAYUAZAPE', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '36') THEN
        UPDATE clients SET name='FEDERICO MAQUEDA', phone='VILLA REAL', email='CAPITAN PEREIRA', ruc='4869282', address='SAN BERNARDINO', details=NULL WHERE ci = '36';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '36', 'FEDERICO MAQUEDA', '4869282', 'SAN BERNARDINO', 'VILLA REAL', 'CAPITAN PEREIRA', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '37') THEN
        UPDATE clients SET name='GABRIEL BENJAMIN GONZALEZ', phone='RINCON', email='NILFIO VLADEZ CASI TIMBO', ruc='1988943', address='ÑEMBY', details=NULL WHERE ci = '37';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '37', 'GABRIEL BENJAMIN GONZALEZ', '1988943', 'ÑEMBY', 'RINCON', 'NILFIO VLADEZ CASI TIMBO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '38') THEN
        UPDATE clients SET name='PETER SCHMITT', phone='COLONIA RIO VERDE', email=NULL, ruc='6312689', address='SANTA ROSA DEL AGUARAY', details=NULL WHERE ci = '38';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '38', 'PETER SCHMITT', '6312689', 'SANTA ROSA DEL AGUARAY', 'COLONIA RIO VERDE', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '39') THEN
        UPDATE clients SET name='MARIA LANERI', phone='SAN ISIDRO', email=NULL, ruc='4940652', address='SAN LORENZO', details=NULL WHERE ci = '39';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '39', 'MARIA LANERI', '4940652', 'SAN LORENZO', 'SAN ISIDRO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '40') THEN
        UPDATE clients SET name='PAULINA ELIZABETH PORTILLO', phone='MBOKAJATY', email='6 DE ENERO CASI LA PAZ', ruc='5124213', address='ÑEMBY', details=NULL WHERE ci = '40';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '40', 'PAULINA ELIZABETH PORTILLO', '5124213', 'ÑEMBY', 'MBOKAJATY', '6 DE ENERO CASI LA PAZ', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '41') THEN
        UPDATE clients SET name='ALBARO ANTONIO VILLALBA', phone='ITA ENRAMADA', email='SEIBO Y LOS LAURELES', ruc='4501575', address='ASUNCION', details='5491139274866' WHERE ci = '41';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '41', 'ALBARO ANTONIO VILLALBA', '4501575', 'ASUNCION', 'ITA ENRAMADA', 'SEIBO Y LOS LAURELES', '5491139274866');
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '42') THEN
        UPDATE clients SET name='RODOLFO RENE VELAZQUEZ', phone=NULL, email='14 DE FEBRERO C/ ESTRELLA DEL SUR', ruc='2878801', address='SAN LORENZO', details=NULL WHERE ci = '42';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '42', 'RODOLFO RENE VELAZQUEZ', '2878801', 'SAN LORENZO', NULL, '14 DE FEBRERO C/ ESTRELLA DEL SUR', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '44') THEN
        UPDATE clients SET name='CELSO RAMON ARCE', phone='TERRAZA 2', email=NULL, ruc='6160221', address='PEDRO JUAN CABALLERO', details=NULL WHERE ci = '44';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '44', 'CELSO RAMON ARCE', '6160221', 'PEDRO JUAN CABALLERO', 'TERRAZA 2', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '45') THEN
        UPDATE clients SET name='GUSTAVO BENITEZ', phone='SAN ISIDRO', email=NULL, ruc='4967069', address='SAN LORENZO', details=NULL WHERE ci = '45';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '45', 'GUSTAVO BENITEZ', '4967069', 'SAN LORENZO', 'SAN ISIDRO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '46') THEN
        UPDATE clients SET name='EMILCE JOHANA SOSA GONZALEZ', phone='YKUA PA.I', email='INDEPENDENCIA NACIONAL 359', ruc='6107052', address='SAN ESTANISLAO', details=NULL WHERE ci = '46';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '46', 'EMILCE JOHANA SOSA GONZALEZ', '6107052', 'SAN ESTANISLAO', 'YKUA PA.I', 'INDEPENDENCIA NACIONAL 359', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '47') THEN
        UPDATE clients SET name='LUCIA ZORAIDA ZARATE', phone='LAURELTY', email=NULL, ruc='3844403', address='SAN LORENZO', details=NULL WHERE ci = '47';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '47', 'LUCIA ZORAIDA ZARATE', '3844403', 'SAN LORENZO', 'LAURELTY', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '48') THEN
        UPDATE clients SET name='FREDY CARDOZO', phone=NULL, email='AVDA JUAN PABLO OCAMPOS', ruc='6765778', address='SAN LORENZO', details=NULL WHERE ci = '48';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '48', 'FREDY CARDOZO', '6765778', 'SAN LORENZO', NULL, 'AVDA JUAN PABLO OCAMPOS', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '49') THEN
        UPDATE clients SET name='ANGEL RAMON MONTIEL', phone='CAACUPEMI', email=NULL, ruc='3238656', address='AREGUA', details=NULL WHERE ci = '49';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '49', 'ANGEL RAMON MONTIEL', '3238656', 'AREGUA', 'CAACUPEMI', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '50') THEN
        UPDATE clients SET name='GUILLERMO JAVIER BOGADO', phone='SAN ISIDRO', email=NULL, ruc='3218388', address='SAN LORENZO', details=NULL WHERE ci = '50';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '50', 'GUILLERMO JAVIER BOGADO', '3218388', 'SAN LORENZO', 'SAN ISIDRO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '51') THEN
        UPDATE clients SET name='MARIA SOLIS GUZMAN', phone='MARIA AUXILIADORA', email='RUTA 2 CALLE PEDRO VERA', ruc='6080191', address='CAPIATA', details='982435690' WHERE ci = '51';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '51', 'MARIA SOLIS GUZMAN', '6080191', 'CAPIATA', 'MARIA AUXILIADORA', 'RUTA 2 CALLE PEDRO VERA', '982435690');
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '52') THEN
        UPDATE clients SET name='ROSANA MELGAREJO', phone='LOTE GUAZU', email='24 DE JUNIO Y JUAN PATIÑO', ruc='3382420', address='SAN LORENZO', details=NULL WHERE ci = '52';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '52', 'ROSANA MELGAREJO', '3382420', 'SAN LORENZO', 'LOTE GUAZU', '24 DE JUNIO Y JUAN PATIÑO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '53') THEN
        UPDATE clients SET name='FRANCISCO THIESSEN', phone=NULL, email='COLONIA NUEVA DURANGO', ruc='3644660', address='MARACANA', details=NULL WHERE ci = '53';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '53', 'FRANCISCO THIESSEN', '3644660', 'MARACANA', NULL, 'COLONIA NUEVA DURANGO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '54') THEN
        UPDATE clients SET name='MARIANO CARDOZO', phone=NULL, email='CNEL MARTINEZ', ruc='2018885', address='LUQUE', details='971936054' WHERE ci = '54';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '54', 'MARIANO CARDOZO', '2018885', 'LUQUE', NULL, 'CNEL MARTINEZ', '971936054');
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '55') THEN
        UPDATE clients SET name='JAVIER BENITO JARA CACERES', phone=NULL, email=NULL, ruc='3904348', address='PEDRO JUAN CABALLERO', details=NULL WHERE ci = '55';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '55', 'JAVIER BENITO JARA CACERES', '3904348', 'PEDRO JUAN CABALLERO', NULL, NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '56') THEN
        UPDATE clients SET name='JENIFER TORALES', phone='MBOTY', email=NULL, ruc='4669341', address='ITAUGUA', details=NULL WHERE ci = '56';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '56', 'JENIFER TORALES', '4669341', 'ITAUGUA', 'MBOTY', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '57') THEN
        UPDATE clients SET name='CRISTINO AGUILAR', phone='SAN MIGUEL', email='MBOIY KM25', ruc='1891129', address='ITAUGUA', details=NULL WHERE ci = '57';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '57', 'CRISTINO AGUILAR', '1891129', 'ITAUGUA', 'SAN MIGUEL', 'MBOIY KM25', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '58') THEN
        UPDATE clients SET name='PABLO RODOLFO AYALA', phone='SAN ISIDRO', email=NULL, ruc='4227505', address='SAN LORENZO', details=NULL WHERE ci = '58';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '58', 'PABLO RODOLFO AYALA', '4227505', 'SAN LORENZO', 'SAN ISIDRO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '59') THEN
        UPDATE clients SET name='MARIA SIXTA RIVEROS', phone='SAN LUIS', email='LAS RESIDENTAS Y SAN NICOLAS', ruc='2508966', address='AREGUA', details=NULL WHERE ci = '59';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '59', 'MARIA SIXTA RIVEROS', '2508966', 'AREGUA', 'SAN LUIS', 'LAS RESIDENTAS Y SAN NICOLAS', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '60') THEN
        UPDATE clients SET name='ELISA MARIA AGUIRRE', phone='VILLA PAULINA', email='ADELA SPERATI NRO 2060', ruc='3793956', address='FERNANDO DE LA MORA', details=NULL WHERE ci = '60';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '60', 'ELISA MARIA AGUIRRE', '3793956', 'FERNANDO DE LA MORA', 'VILLA PAULINA', 'ADELA SPERATI NRO 2060', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '61') THEN
        UPDATE clients SET name='CRISTIAN ELOY CACERES', phone='SANTA ROSA', email='RUTA 2 KM 20', ruc='3758152', address='CAPIATA', details=NULL WHERE ci = '61';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '61', 'CRISTIAN ELOY CACERES', '3758152', 'CAPIATA', 'SANTA ROSA', 'RUTA 2 KM 20', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '62') THEN
        UPDATE clients SET name='LUIS CARLOS BENITEZ LARRAMENDIA', phone=NULL, email='MAXIMO LUGO C/ JUAN PABLO II', ruc='618712', address='ÑEMBY', details=NULL WHERE ci = '62';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '62', 'LUIS CARLOS BENITEZ LARRAMENDIA', '618712', 'ÑEMBY', NULL, 'MAXIMO LUGO C/ JUAN PABLO II', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '63') THEN
        UPDATE clients SET name='JOHANA MISSELIN ABENTE MOREIRA', phone='TRES TAPIRACUAI', email='HUMAITA 503', ruc='4610061', address='SAN ESTANISLAO', details=NULL WHERE ci = '63';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '63', 'JOHANA MISSELIN ABENTE MOREIRA', '4610061', 'SAN ESTANISLAO', 'TRES TAPIRACUAI', 'HUMAITA 503', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '64') THEN
        UPDATE clients SET name='IDALINO BARRIOS ALVAREZ', phone='29 DE AGOSTO', email=NULL, ruc='6250093', address='YPANE', details=NULL WHERE ci = '64';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '64', 'IDALINO BARRIOS ALVAREZ', '6250093', 'YPANE', '29 DE AGOSTO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '65') THEN
        UPDATE clients SET name='LILIANA ROMERO', phone='LUCERITO', email=NULL, ruc='4017399', address='SAN LORENZO', details=NULL WHERE ci = '65';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '65', 'LILIANA ROMERO', '4017399', 'SAN LORENZO', 'LUCERITO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '66') THEN
        UPDATE clients SET name='NELSON OSVALDO GAMARRA PEÑA', phone=NULL, email='ÑANDYPA 1185', ruc='2501630', address='LUQUE', details=NULL WHERE ci = '66';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '66', 'NELSON OSVALDO GAMARRA PEÑA', '2501630', 'LUQUE', NULL, 'ÑANDYPA 1185', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '67') THEN
        UPDATE clients SET name='MARIA OLAZAR', phone='LOS ALURELES', email=NULL, ruc='3177188', address='ASUNCION', details=NULL WHERE ci = '67';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '67', 'MARIA OLAZAR', '3177188', 'ASUNCION', 'LOS ALURELES', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '68') THEN
        UPDATE clients SET name='NESTOR GAMARRA', phone='RINCON', email=NULL, ruc='2693662', address='ÑEMBY', details=NULL WHERE ci = '68';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '68', 'NESTOR GAMARRA', '2693662', 'ÑEMBY', 'RINCON', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '69') THEN
        UPDATE clients SET name='LUCERO VAZQUEZ', phone='SAN VICENTE', email=NULL, ruc='4418112', address='ASUNCION', details=NULL WHERE ci = '69';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '69', 'LUCERO VAZQUEZ', '4418112', 'ASUNCION', 'SAN VICENTE', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '70') THEN
        UPDATE clients SET name='ANTONIO QUINTANA', phone='ROJAS CAÑADA', email=NULL, ruc='3792134', address='CAPIATA', details=NULL WHERE ci = '70';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '70', 'ANTONIO QUINTANA', '3792134', 'CAPIATA', 'ROJAS CAÑADA', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '71') THEN
        UPDATE clients SET name='MARLENE BOGADO', phone='VALLE PUCU', email=NULL, ruc='4992091', address='AREGUA', details=NULL WHERE ci = '71';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '71', 'MARLENE BOGADO', '4992091', 'AREGUA', 'VALLE PUCU', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '72') THEN
        UPDATE clients SET name='FLORENTINA GARICOX', phone='SAN PABLO', email=NULL, ruc='2627980', address='SANTA ROSA', details=NULL WHERE ci = '72';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '72', 'FLORENTINA GARICOX', '2627980', 'SANTA ROSA', 'SAN PABLO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '73') THEN
        UPDATE clients SET name='DOMINGA RODAS', phone='ISLA BOGADO', email=NULL, ruc='6012379', address='LUQUE', details=NULL WHERE ci = '73';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '73', 'DOMINGA RODAS', '6012379', 'LUQUE', 'ISLA BOGADO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '74') THEN
        UPDATE clients SET name='DIEGO MARCELO MEDINA ACOSTA', phone='MISIONES', email=NULL, ruc='2926187', address='AYOLAS', details=NULL WHERE ci = '74';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '74', 'DIEGO MARCELO MEDINA ACOSTA', '2926187', 'AYOLAS', 'MISIONES', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '75') THEN
        UPDATE clients SET name='JUAN RAMON BARUA', phone='CALLE.I', email=NULL, ruc='3762124', address='SAN LORENZO', details=NULL WHERE ci = '75';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '75', 'JUAN RAMON BARUA', '3762124', 'SAN LORENZO', 'CALLE.I', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '76') THEN
        UPDATE clients SET name='MARIO ANDRES CABRAL RIZUELA', phone='CÑIA AVEIRO', email=NULL, ruc='1977063', address='ITA', details=NULL WHERE ci = '76';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '76', 'MARIO ANDRES CABRAL RIZUELA', '1977063', 'ITA', 'CÑIA AVEIRO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '77') THEN
        UPDATE clients SET name='FELIX LEZCANO', phone='NUESTRA SEÑORA DE LA ASUNCION', email=NULL, ruc='2300707', address='ASUNCION', details=NULL WHERE ci = '77';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '77', 'FELIX LEZCANO', '2300707', 'ASUNCION', 'NUESTRA SEÑORA DE LA ASUNCION', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '78') THEN
        UPDATE clients SET name='VICTOR BRITEZ', phone=NULL, email=NULL, ruc='2026113', address='ASUNCION', details=NULL WHERE ci = '78';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '78', 'VICTOR BRITEZ', '2026113', 'ASUNCION', NULL, NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '79') THEN
        UPDATE clients SET name='PETRONA MARTINEZ MARTINEZ', phone='REPUBLICANO', email='CALLE 31 Y GRAL AQUINO', ruc='1946063', address='ASUNCION', details=NULL WHERE ci = '79';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '79', 'PETRONA MARTINEZ MARTINEZ', '1946063', 'ASUNCION', 'REPUBLICANO', 'CALLE 31 Y GRAL AQUINO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '80') THEN
        UPDATE clients SET name='JOSE SIXTO BENITEZ FERNANDEZ', phone=NULL, email='AVDA SAN ANTONIO E 10 DE JULIO', ruc='4575798', address='SAN ANTONIO', details=NULL WHERE ci = '80';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '80', 'JOSE SIXTO BENITEZ FERNANDEZ', '4575798', 'SAN ANTONIO', NULL, 'AVDA SAN ANTONIO E 10 DE JULIO', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '81') THEN
        UPDATE clients SET name='DELIA MARISA MARTINEZ MENDEZ', phone='LAGUNA GRANDE', email='ADELA SPERATI C/ RIO PARAGUAY', ruc='2041331', address='FERNANDO DE LA MORA', details=NULL WHERE ci = '81';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '81', 'DELIA MARISA MARTINEZ MENDEZ', '2041331', 'FERNANDO DE LA MORA', 'LAGUNA GRANDE', 'ADELA SPERATI C/ RIO PARAGUAY', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '82') THEN
        UPDATE clients SET name='FERMINA RIOS', phone='SANTO TOMAS', email='AVDA STO TOMAS C/ PIRIZAL', ruc='5866035', address='SAN LORENZO', details=NULL WHERE ci = '82';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '82', 'FERMINA RIOS', '5866035', 'SAN LORENZO', 'SANTO TOMAS', 'AVDA STO TOMAS C/ PIRIZAL', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '83') THEN
        UPDATE clients SET name='ROBERTO OCAMPOS ALFONZO', phone='VIÑAS KUE', email='CORONEL BOVEDA C/ JOVENES UNIDOS', ruc='1440057', address='ASUNCION', details=NULL WHERE ci = '83';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '83', 'ROBERTO OCAMPOS ALFONZO', '1440057', 'ASUNCION', 'VIÑAS KUE', 'CORONEL BOVEDA C/ JOVENES UNIDOS', NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '84') THEN
        UPDATE clients SET name='SANDRA LEDESMA', phone=NULL, email=NULL, ruc='5668818', address='3 DE FEBRERO', details=NULL WHERE ci = '84';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '84', 'SANDRA LEDESMA', '5668818', '3 DE FEBRERO', NULL, NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '85') THEN
        UPDATE clients SET name='ISABEL RAMOS', phone='REDUCTO', email=NULL, ruc='5057808', address='SAN LORENZO', details=NULL WHERE ci = '85';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '85', 'ISABEL RAMOS', '5057808', 'SAN LORENZO', 'REDUCTO', NULL, NULL);
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM clients WHERE ci = '86') THEN
        UPDATE clients SET name='MILCIADES PAREDES', phone=NULL, email=NULL, ruc='2990633', address='SAN LORENZO', details=NULL WHERE ci = '86';
    ELSE
        INSERT INTO clients (organization_id, ci, name, ruc, address, phone, email, details)
        VALUES ('28dabdb4-8728-4365-a898-1a15df4f599d', '86', 'MILCIADES PAREDES', '2990633', 'SAN LORENZO', NULL, NULL, NULL);
    END IF;
END $$;


DO $$
DECLARE
    v_org_id uuid := '28dabdb4-8728-4365-a898-1a15df4f599d';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = 'UNKNOWN' LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, 'UNKNOWN') RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = 'UNKNOWN' LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, 'UNKNOWN') RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = 'DETALLES DE COSTOS' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, 'DETALLES DE COSTOS', v_brand_id, v_model_id, 0, NULL, NULL, NULL, NULL, NULL, 0, 0, 'available', 'UNKNOWN', 'UNKNOWN')
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = 'available', list_price = 0, total_cost = 0 WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF 'available' = 'sold' THEN


    END IF;
END $$;


DO $$
DECLARE
    v_org_id uuid := '28dabdb4-8728-4365-a898-1a15df4f599d';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = 'CUENTA' LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, 'CUENTA') RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = 'UNKNOWN' LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, 'UNKNOWN') RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = 'COD' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, 'COD', v_brand_id, v_model_id, 0, 'TOTAL', NULL, NULL, NULL, NULL, 0, 0, 'available', 'CUENTA', 'UNKNOWN')
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = 'available', list_price = 0, total_cost = 0 WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF 'available' = 'sold' THEN


    END IF;
END $$;


DO $$
DECLARE
    v_org_id uuid := '28dabdb4-8728-4365-a898-1a15df4f599d';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = 'COSTO ORIGEN' LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, 'COSTO ORIGEN') RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = 'UNKNOWN' LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, 'UNKNOWN') RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = '1' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, '1', v_brand_id, v_model_id, 0, '0', NULL, NULL, NULL, NULL, 0, 0, 'available', 'COSTO ORIGEN', 'UNKNOWN')
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = 'available', list_price = 0, total_cost = 0 WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF 'available' = 'sold' THEN


    END IF;
END $$;


DO $$
DECLARE
    v_org_id uuid := '28dabdb4-8728-4365-a898-1a15df4f599d';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = 'FLETE MARITIMO' LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, 'FLETE MARITIMO') RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = 'UNKNOWN' LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, 'UNKNOWN') RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = '2' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, '2', v_brand_id, v_model_id, 0, '0', NULL, NULL, NULL, NULL, 0, 0, 'available', 'FLETE MARITIMO', 'UNKNOWN')
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = 'available', list_price = 0, total_cost = 0 WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF 'available' = 'sold' THEN


    END IF;
END $$;


DO $$
DECLARE
    v_org_id uuid := '28dabdb4-8728-4365-a898-1a15df4f599d';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = 'GASTOS ADUNEROS' LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, 'GASTOS ADUNEROS') RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = 'UNKNOWN' LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, 'UNKNOWN') RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = '3' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, '3', v_brand_id, v_model_id, 0, '0', NULL, NULL, NULL, NULL, 0, 0, 'available', 'GASTOS ADUNEROS', 'UNKNOWN')
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = 'available', list_price = 0, total_cost = 0 WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF 'available' = 'sold' THEN


    END IF;
END $$;


DO $$
DECLARE
    v_org_id uuid := '28dabdb4-8728-4365-a898-1a15df4f599d';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = 'AJUSTES Y REPARACIONES' LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, 'AJUSTES Y REPARACIONES') RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = 'UNKNOWN' LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, 'UNKNOWN') RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = '4' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, '4', v_brand_id, v_model_id, 0, '0', NULL, NULL, NULL, NULL, 0, 0, 'available', 'AJUSTES Y REPARACIONES', 'UNKNOWN')
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = 'available', list_price = 0, total_cost = 0 WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF 'available' = 'sold' THEN


    END IF;
END $$;


DO $$
DECLARE
    v_org_id uuid := '28dabdb4-8728-4365-a898-1a15df4f599d';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = 'VIATICOS' LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, 'VIATICOS') RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = 'UNKNOWN' LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, 'UNKNOWN') RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = '5' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, '5', v_brand_id, v_model_id, 0, '0', NULL, NULL, NULL, NULL, 0, 0, 'available', 'VIATICOS', 'UNKNOWN')
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = 'available', list_price = 0, total_cost = 0 WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF 'available' = 'sold' THEN


    END IF;
END $$;


DO $$
DECLARE
    v_org_id uuid := '28dabdb4-8728-4365-a898-1a15df4f599d';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = 'PASAJES' LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, 'PASAJES') RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = 'UNKNOWN' LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, 'UNKNOWN') RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = '6' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, '6', v_brand_id, v_model_id, 0, '0', NULL, NULL, NULL, NULL, 0, 0, 'available', 'PASAJES', 'UNKNOWN')
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = 'available', list_price = 0, total_cost = 0 WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF 'available' = 'sold' THEN


    END IF;
END $$;


DO $$
DECLARE
    v_org_id uuid := '28dabdb4-8728-4365-a898-1a15df4f599d';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = 'COMISIÓN IMPORTADOR' LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, 'COMISIÓN IMPORTADOR') RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = 'UNKNOWN' LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, 'UNKNOWN') RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = '7' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, '7', v_brand_id, v_model_id, 0, '0', NULL, NULL, NULL, NULL, 0, 0, 'available', 'COMISIÓN IMPORTADOR', 'UNKNOWN')
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = 'available', list_price = 0, total_cost = 0 WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF 'available' = 'sold' THEN


    END IF;
END $$;


DO $$
DECLARE
    v_org_id uuid := '28dabdb4-8728-4365-a898-1a15df4f599d';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = 'PINTURA' LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, 'PINTURA') RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = 'UNKNOWN' LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, 'UNKNOWN') RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = '9' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, '9', v_brand_id, v_model_id, 0, '0', NULL, NULL, NULL, NULL, 0, 0, 'available', 'PINTURA', 'UNKNOWN')
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = 'available', list_price = 0, total_cost = 0 WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF 'available' = 'sold' THEN


    END IF;
END $$;


DO $$
DECLARE
    v_org_id uuid := '28dabdb4-8728-4365-a898-1a15df4f599d';
    v_brand_id uuid;
    v_model_id uuid;
    v_vehicle_id uuid;
    v_client_id uuid;
    v_sale_id uuid;
BEGIN
    -- Ensure Brand
    SELECT id INTO v_brand_id FROM brands WHERE name = 'OTROS' LIMIT 1;
    IF v_brand_id IS NULL THEN
        INSERT INTO brands (organization_id, name) VALUES (v_org_id, 'OTROS') RETURNING id INTO v_brand_id;
    END IF;

    -- Ensure Model
    SELECT id INTO v_model_id FROM models WHERE brand_id = v_brand_id AND name = 'UNKNOWN' LIMIT 1;
    IF v_model_id IS NULL THEN
        INSERT INTO models (organization_id, brand_id, name) VALUES (v_org_id, v_brand_id, 'UNKNOWN') RETURNING id INTO v_model_id;
    END IF;
    
    -- Ensure Vehicle
    SELECT id INTO v_vehicle_id FROM vehicles WHERE cod = '10' LIMIT 1;
    IF v_vehicle_id IS NULL THEN
        INSERT INTO vehicles (organization_id, cod, brand_id, model_id, year, plate, color, chassis_number, motor_number, details, list_price, total_cost, status, brand, model)
        VALUES (v_org_id, '10', v_brand_id, v_model_id, 0, '0', NULL, NULL, NULL, NULL, 0, 0, 'available', 'OTROS', 'UNKNOWN')
        RETURNING id INTO v_vehicle_id;
    ELSE
        UPDATE vehicles SET status = 'available', list_price = 0, total_cost = 0 WHERE id = v_vehicle_id;
    END IF;

    -- Sales Logic
    IF 'available' = 'sold' THEN


    END IF;
END $$;
