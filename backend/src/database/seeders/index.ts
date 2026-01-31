import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * SEEDER - DATOS FICTICIOS PARA DESARROLLO
 * Agricultor: Juan Mamani Quispe de Achocalla, La Paz
 */

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeder de AgroBolivia...');
  
  // ============================================
  // LIMPIAR DATOS EXISTENTES
  // ============================================
  console.log('🧹 Limpiando datos existentes...');
  await prisma.lecturaIoT.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.alerta.deleteMany();
  await prisma.jornada.deleteMany();
  await prisma.trabajador.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.movimientoInventario.deleteMany();
  await prisma.inventario.deleteMany();
  await prisma.transaccion.deleteMany();
  await prisma.cultivo.deleteMany();
  await prisma.parcela.deleteMany();
  await prisma.tarea.deleteMany();
  await prisma.configuracionUsuario.deleteMany();
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.precioMercado.deleteMany();
  await prisma.user.deleteMany();
  
  // ============================================
  // CREAR USUARIO PRINCIPAL
  // ============================================
  console.log('👨‍🌾 Creando usuario Juan Mamani...');
  const passwordHash = await bcrypt.hash('JuanMamani2024!', 12);
  
  const juan = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'juan.mamani@agrobolivia.bo',
      passwordHash,
      nombre: 'Juan',
      apellido: 'Mamani Quispe',
      telefono: '+59171234567',
      departamento: 'La Paz',
      comunidad: 'Achocalla',
      role: 'AGRICULTOR',
      activo: true,
      emailVerificado: true,
      twoFactorEnabled: false,
    },
  });
  
  // Usuario admin para pruebas
  const adminPasswordHash = await bcrypt.hash('Admin2024!@#', 12);
  const admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'admin@agrobolivia.bo',
      passwordHash: adminPasswordHash,
      nombre: 'Administrador',
      apellido: 'Sistema',
      role: 'ADMIN',
      activo: true,
      emailVerificado: true,
      twoFactorEnabled: true,
    },
  });
  
  // ============================================
  // CONFIGURACIÓN DE USUARIO
  // ============================================
  await prisma.configuracionUsuario.create({
    data: {
      userId: juan.id,
      notifSMS: true,
      notifWhatsApp: true,
      idioma: 'es',
      unidadArea: 'ha',
      unidadPeso: 'qq',
      alertaHumedad: 30,
      alertaTemperatura: -2,
    },
  });
  
  // ============================================
  // CREAR PARCELAS
  // ============================================
  console.log('🗺️ Creando parcelas...');
  
  const parcelaNorte = await prisma.parcela.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Parcela Norte',
      ubicacion: 'Sector Norte, Achocalla',
      tamanioHectareas: 1.0,
      tipoSuelo: 'Franco arcilloso',
      latitud: -16.5833,
      longitud: -68.1667,
      altitudMsnm: 3850,
      activa: true,
    },
  });
  
  const parcelaSur = await prisma.parcela.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Parcela Sur',
      ubicacion: 'Sector Sur, Achocalla',
      tamanioHectareas: 0.5,
      tipoSuelo: 'Franco arenoso',
      latitud: -16.5850,
      longitud: -68.1680,
      altitudMsnm: 3820,
      activa: true,
    },
  });
  
  // ============================================
  // CREAR CULTIVOS
  // ============================================
  console.log('🌿 Creando cultivos...');
  
  const cultivoPapa = await prisma.cultivo.create({
    data: {
      id: uuidv4(),
      parcelaId: parcelaNorte.id,
      nombre: 'Papa',
      variedad: 'Huaycha',
      fechaSiembra: new Date('2025-10-15'),
      fechaCosechaEstimada: new Date('2026-03-15'),
      areaCultivada: 0.8,
      rendimientoEsperado: 800, // kg
      estado: 'EN_CRECIMIENTO',
      notas: 'Sembrado después de las primeras lluvias. Buen desarrollo inicial.',
    },
  });
  
  const cultivoHaba = await prisma.cultivo.create({
    data: {
      id: uuidv4(),
      parcelaId: parcelaSur.id,
      nombre: 'Haba',
      variedad: 'Criolla',
      fechaSiembra: new Date('2025-09-01'),
      fechaCosechaEstimada: new Date('2026-02-01'),
      areaCultivada: 0.4,
      rendimientoEsperado: 200, // kg
      estado: 'LISTO_COSECHA',
      notas: 'Lista para cosechar. Buen rendimiento esperado.',
    },
  });
  
  // Cultivo anterior (cosechado)
  const cultivoPapaAnterior = await prisma.cultivo.create({
    data: {
      id: uuidv4(),
      parcelaId: parcelaNorte.id,
      nombre: 'Papa',
      variedad: 'Imilla',
      fechaSiembra: new Date('2025-03-01'),
      fechaCosechaEstimada: new Date('2025-07-15'),
      fechaCosechaReal: new Date('2025-07-20'),
      areaCultivada: 0.8,
      rendimientoEsperado: 750,
      rendimientoReal: 820,
      estado: 'COSECHADO',
      notas: 'Excelente cosecha, superó expectativas.',
    },
  });
  
  // ============================================
  // CREAR INVENTARIO
  // ============================================
  console.log('📦 Creando inventario...');
  
  // Insumos
  const semillaPapa = await prisma.inventario.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Semilla Papa Huaycha',
      tipo: 'INSUMO',
      cantidad: 50,
      unidad: 'kg',
      precioUnitario: 15,
      stockMinimo: 20,
    },
  });
  
  const fertilizante = await prisma.inventario.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Fertilizante 18-46-0',
      tipo: 'INSUMO',
      cantidad: 2,
      unidad: 'qq',
      precioUnitario: 240,
      stockMinimo: 1,
    },
  });
  
  const insecticida = await prisma.inventario.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Insecticida Cipermetrina',
      tipo: 'INSUMO',
      cantidad: 1,
      unidad: 'litro',
      precioUnitario: 85,
      stockMinimo: 2,
    },
  });
  
  const abonoOrganico = await prisma.inventario.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Abono Orgánico',
      tipo: 'INSUMO',
      cantidad: 20,
      unidad: 'qq',
      precioUnitario: 20,
      stockMinimo: 5,
    },
  });
  
  // Producción almacenada
  const papaAlmacenada = await prisma.inventario.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      cultivoId: cultivoPapaAnterior.id,
      nombre: 'Papa Huaycha',
      tipo: 'PRODUCCION',
      cantidad: 15,
      unidad: 'qq',
      precioUnitario: 100,
    },
  });
  
  const habaAlmacenada = await prisma.inventario.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Haba Seca',
      tipo: 'PRODUCCION',
      cantidad: 8,
      unidad: '@',
      precioUnitario: 80,
    },
  });
  
  // Herramientas
  await prisma.inventario.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Azadón',
      tipo: 'HERRAMIENTA',
      cantidad: 3,
      unidad: 'unidad',
      precioUnitario: 45,
    },
  });
  
  await prisma.inventario.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Pala',
      tipo: 'HERRAMIENTA',
      cantidad: 2,
      unidad: 'unidad',
      precioUnitario: 55,
    },
  });
  
  // ============================================
  // CREAR CLIENTES
  // ============================================
  console.log('👥 Creando clientes...');
  
  const clienteRoberto = await prisma.cliente.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Don Roberto Condori',
      telefono: '+59172345678',
      direccion: 'Mercado Rodriguez, Puesto 45',
      tipo: 'MAYORISTA',
    },
  });
  
  const clienteFeria = await prisma.cliente.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Casera María (Feria 16)',
      telefono: '+59173456789',
      direccion: 'Feria 16 de Julio, El Alto',
      tipo: 'FERIA',
    },
  });
  
  const clienteRestaurante = await prisma.cliente.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Restaurante Doña Petrona',
      telefono: '+59174567890',
      direccion: 'Calle Comercio 123, La Paz',
      tipo: 'RESTAURANTE',
    },
  });
  
  // ============================================
  // CREAR TRANSACCIONES FINANCIERAS - ENERO 2026
  // ============================================
  console.log('💰 Creando transacciones financieras...');
  
  // INGRESOS - Enero 2026
  await prisma.transaccion.create({
    data: {
      userId: juan.id,
      tipo: 'INGRESO',
      categoria: 'VENTA_COSECHA',
      monto: 1200,
      fecha: new Date('2026-01-05'),
      descripcion: 'Venta Papa - Feria 16 de Julio (10 qq x 120 Bs)',
    },
  });
  
  await prisma.transaccion.create({
    data: {
      userId: juan.id,
      tipo: 'INGRESO',
      categoria: 'VENTA_COSECHA',
      monto: 400,
      fecha: new Date('2026-01-12'),
      descripcion: 'Venta Haba - Don Roberto (5 @ x 80 Bs)',
    },
  });
  
  await prisma.transaccion.create({
    data: {
      userId: juan.id,
      tipo: 'INGRESO',
      categoria: 'VENTA_COSECHA',
      monto: 920,
      fecha: new Date('2026-01-20'),
      descripcion: 'Venta Papa - Mercado Rodriguez (8 qq x 115 Bs)',
    },
  });
  
  // GASTOS - Enero 2026
  await prisma.transaccion.create({
    data: {
      userId: juan.id,
      tipo: 'GASTO',
      categoria: 'MANO_OBRA',
      monto: 360,
      fecha: new Date('2026-01-03'),
      descripcion: 'Jornaleros - Aporque (3 días x 120 Bs)',
    },
  });
  
  await prisma.transaccion.create({
    data: {
      userId: juan.id,
      tipo: 'GASTO',
      categoria: 'FERTILIZANTES',
      monto: 480,
      fecha: new Date('2026-01-08'),
      descripcion: 'Fertilizante 18-46-0 (2 qq x 240 Bs)',
    },
  });
  
  await prisma.transaccion.create({
    data: {
      userId: juan.id,
      tipo: 'GASTO',
      categoria: 'TRANSPORTE',
      monto: 100,
      fecha: new Date('2026-01-15'),
      descripcion: 'Transporte a feria (2 viajes x 50 Bs)',
    },
  });
  
  await prisma.transaccion.create({
    data: {
      userId: juan.id,
      tipo: 'GASTO',
      categoria: 'MANO_OBRA',
      monto: 150,
      fecha: new Date('2026-01-22'),
      descripcion: 'Fumigación (1 día)',
    },
  });
  
  await prisma.transaccion.create({
    data: {
      userId: juan.id,
      tipo: 'GASTO',
      categoria: 'PESTICIDAS',
      monto: 85,
      fecha: new Date('2026-01-28'),
      descripcion: 'Insecticida Cipermetrina (1 lt)',
    },
  });
  
  // Transacciones históricas 2025
  const meses2025 = [
    { mes: 1, ingresos: 1800, gastos: 900 },
    { mes: 2, ingresos: 2100, gastos: 1200 },
    { mes: 3, ingresos: 3500, gastos: 1800 },
    { mes: 4, ingresos: 4200, gastos: 2000 },
    { mes: 5, ingresos: 2800, gastos: 1100 },
    { mes: 6, ingresos: 1500, gastos: 800 },
    { mes: 7, ingresos: 1200, gastos: 600 },
    { mes: 8, ingresos: 900, gastos: 1500 },
    { mes: 9, ingresos: 1100, gastos: 1800 },
    { mes: 10, ingresos: 2000, gastos: 1200 },
    { mes: 11, ingresos: 2500, gastos: 1000 },
    { mes: 12, ingresos: 3200, gastos: 1400 },
  ];
  
  for (const data of meses2025) {
    await prisma.transaccion.create({
      data: {
        userId: juan.id,
        tipo: 'INGRESO',
        categoria: 'VENTA_COSECHA',
        monto: data.ingresos,
        fecha: new Date(`2025-${String(data.mes).padStart(2, '0')}-15`),
        descripcion: `Ingresos consolidados - ${data.mes}/2025`,
      },
    });
    
    await prisma.transaccion.create({
      data: {
        userId: juan.id,
        tipo: 'GASTO',
        categoria: 'OTROS',
        monto: data.gastos,
        fecha: new Date(`2025-${String(data.mes).padStart(2, '0')}-15`),
        descripcion: `Gastos consolidados - ${data.mes}/2025`,
      },
    });
  }
  
  // ============================================
  // CREAR VENTAS
  // ============================================
  console.log('🛒 Creando ventas...');
  
  await prisma.venta.create({
    data: {
      userId: juan.id,
      inventarioId: papaAlmacenada.id,
      clienteId: clienteFeria.id,
      cantidad: 10,
      precioUnitario: 120,
      total: 1200,
      fecha: new Date('2026-01-05'),
      lugarVenta: 'Feria 16 de Julio',
    },
  });
  
  await prisma.venta.create({
    data: {
      userId: juan.id,
      inventarioId: habaAlmacenada.id,
      clienteId: clienteRoberto.id,
      cantidad: 5,
      precioUnitario: 80,
      total: 400,
      fecha: new Date('2026-01-12'),
      lugarVenta: 'Mercado Rodriguez',
    },
  });
  
  // ============================================
  // CREAR TRABAJADORES
  // ============================================
  console.log('👷 Creando trabajadores...');
  
  const trabajador1 = await prisma.trabajador.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'Pedro Choque',
      telefono: '+59175678901',
      especialidad: 'Siembra y aporque',
      tarifaDiaria: 120,
    },
  });
  
  const trabajador2 = await prisma.trabajador.create({
    data: {
      id: uuidv4(),
      userId: juan.id,
      nombre: 'María Quispe',
      telefono: '+59176789012',
      especialidad: 'Cosecha',
      tarifaDiaria: 100,
    },
  });
  
  // Jornadas de trabajo
  await prisma.jornada.create({
    data: {
      trabajadorId: trabajador1.id,
      parcelaId: parcelaNorte.id,
      fecha: new Date('2026-01-03'),
      horasTrabajadas: 8,
      actividad: 'Aporque de papa',
      montoAPagar: 120,
      pagado: true,
      fechaPago: new Date('2026-01-03'),
    },
  });
  
  await prisma.jornada.create({
    data: {
      trabajadorId: trabajador1.id,
      parcelaId: parcelaNorte.id,
      fecha: new Date('2026-01-04'),
      horasTrabajadas: 8,
      actividad: 'Aporque de papa',
      montoAPagar: 120,
      pagado: true,
      fechaPago: new Date('2026-01-04'),
    },
  });
  
  // ============================================
  // CREAR SENSORES IOT
  // ============================================
  console.log('📡 Creando sensores IoT...');
  
  const sensorTempSuelo = await prisma.sensor.create({
    data: {
      id: uuidv4(),
      parcelaId: parcelaNorte.id,
      tipo: 'TEMPERATURA_SUELO',
      nombre: 'Termómetro Suelo Norte',
      codigo: 'TEMP-SUELO-001',
      ubicacion: 'Centro parcela',
      activo: true,
      intervaloLectura: 300,
      umbralMinimo: 5,
      umbralMaximo: 25,
    },
  });
  
  const sensorHumSuelo = await prisma.sensor.create({
    data: {
      id: uuidv4(),
      parcelaId: parcelaNorte.id,
      tipo: 'HUMEDAD_SUELO',
      nombre: 'Higrómetro Suelo Norte',
      codigo: 'HUM-SUELO-001',
      ubicacion: 'Centro parcela',
      activo: true,
      intervaloLectura: 300,
      umbralMinimo: 30,
      umbralMaximo: 80,
    },
  });
  
  const sensorTempAmb = await prisma.sensor.create({
    data: {
      id: uuidv4(),
      parcelaId: parcelaNorte.id,
      tipo: 'TEMPERATURA_AMBIENTE',
      nombre: 'Termómetro Ambiente',
      codigo: 'TEMP-AMB-001',
      ubicacion: 'Estación meteorológica',
      activo: true,
      intervaloLectura: 300,
      umbralMinimo: -5,
      umbralMaximo: 30,
    },
  });
  
  const sensorHumAmb = await prisma.sensor.create({
    data: {
      id: uuidv4(),
      parcelaId: parcelaNorte.id,
      tipo: 'HUMEDAD_AMBIENTE',
      nombre: 'Higrómetro Ambiente',
      codigo: 'HUM-AMB-001',
      ubicacion: 'Estación meteorológica',
      activo: true,
      intervaloLectura: 300,
    },
  });
  
  const sensorLluvia = await prisma.sensor.create({
    data: {
      id: uuidv4(),
      parcelaId: parcelaNorte.id,
      tipo: 'LLUVIA',
      nombre: 'Pluviómetro',
      codigo: 'LLUVIA-001',
      ubicacion: 'Estación meteorológica',
      activo: true,
      intervaloLectura: 600,
    },
  });
  
  // ============================================
  // CREAR LECTURAS IOT (últimas 24 horas)
  // ============================================
  console.log('📊 Generando lecturas IoT...');
  
  const ahora = new Date();
  const lecturas = [
    { hora: 0, tempSuelo: 10, humSuelo: 42, tempAmb: 8, humAmb: 72, lluvia: 2 },
    { hora: 6, tempSuelo: 8, humSuelo: 45, tempAmb: 5, humAmb: 78, lluvia: 0 },
    { hora: 12, tempSuelo: 18, humSuelo: 38, tempAmb: 22, humAmb: 45, lluvia: 0 },
    { hora: 18, tempSuelo: 15, humSuelo: 35, tempAmb: 16, humAmb: 55, lluvia: 0 },
  ];
  
  for (const lectura of lecturas) {
    const timestamp = new Date(ahora);
    timestamp.setHours(lectura.hora, 0, 0, 0);
    timestamp.setDate(timestamp.getDate() - 1);
    
    await prisma.lecturaIoT.createMany({
      data: [
        {
          sensorId: sensorTempSuelo.id,
          valor: lectura.tempSuelo,
          unidad: '°C',
          timestamp,
          bateria: 85,
          senal: 95,
        },
        {
          sensorId: sensorHumSuelo.id,
          valor: lectura.humSuelo,
          unidad: '%',
          timestamp,
          bateria: 82,
          senal: 92,
        },
        {
          sensorId: sensorTempAmb.id,
          valor: lectura.tempAmb,
          unidad: '°C',
          timestamp,
          bateria: 90,
          senal: 98,
        },
        {
          sensorId: sensorHumAmb.id,
          valor: lectura.humAmb,
          unidad: '%',
          timestamp,
          bateria: 88,
          senal: 96,
        },
        {
          sensorId: sensorLluvia.id,
          valor: lectura.lluvia,
          unidad: 'mm',
          timestamp,
          bateria: 95,
          senal: 99,
        },
      ],
    });
  }
  
  // ============================================
  // CREAR ALERTAS
  // ============================================
  console.log('🚨 Creando alertas...');
  
  await prisma.alerta.create({
    data: {
      userId: juan.id,
      parcelaId: parcelaNorte.id,
      tipo: 'CLIMA',
      prioridad: 'ALTA',
      titulo: 'Posible helada mañana',
      mensaje: 'El pronóstico indica temperatura mínima de -2°C para mañana. Se recomienda proteger los cultivos.',
      activa: true,
    },
  });
  
  await prisma.alerta.create({
    data: {
      userId: juan.id,
      parcelaId: parcelaNorte.id,
      cultivoId: cultivoPapa.id,
      tipo: 'RIEGO',
      prioridad: 'MEDIA',
      titulo: 'Humedad del suelo baja',
      mensaje: 'La humedad del suelo está al 35%, por debajo del umbral recomendado (40%). Considere regar hoy.',
      activa: true,
    },
  });
  
  await prisma.alerta.create({
    data: {
      userId: juan.id,
      tipo: 'INVENTARIO',
      prioridad: 'MEDIA',
      titulo: 'Stock bajo de insecticida',
      mensaje: 'El insecticida Cipermetrina tiene solo 1 litro. El stock mínimo es 2 litros.',
      activa: true,
    },
  });
  
  await prisma.alerta.create({
    data: {
      userId: juan.id,
      parcelaId: parcelaNorte.id,
      cultivoId: cultivoPapa.id,
      tipo: 'PLAGA',
      prioridad: 'ALTA',
      titulo: 'Posible gorgojo detectado',
      mensaje: 'El sistema de IA ha detectado posibles signos de gorgojo en la Parcela Norte. Inspección recomendada.',
      activa: true,
    },
  });
  
  // ============================================
  // CREAR TAREAS
  // ============================================
  console.log('📋 Creando tareas...');
  
  await prisma.tarea.create({
    data: {
      userId: juan.id,
      titulo: 'Revisar parcela por gorgojo',
      descripcion: 'Inspeccionar visualmente la Parcela Norte por signos de gorgojo',
      fechaLimite: new Date('2026-02-01'),
      prioridad: 'ALTA',
    },
  });
  
  await prisma.tarea.create({
    data: {
      userId: juan.id,
      titulo: 'Comprar insecticida',
      descripcion: 'Reponer stock de Cipermetrina',
      fechaLimite: new Date('2026-02-05'),
      prioridad: 'MEDIA',
    },
  });
  
  await prisma.tarea.create({
    data: {
      userId: juan.id,
      titulo: 'Cosechar haba',
      descripcion: 'La haba en Parcela Sur está lista para cosecha',
      fechaLimite: new Date('2026-02-10'),
      prioridad: 'ALTA',
    },
  });
  
  await prisma.tarea.create({
    data: {
      userId: juan.id,
      titulo: 'Preparar tierra para siguiente siembra',
      descripcion: 'Después de cosechar haba, preparar terreno para rotación',
      fechaLimite: new Date('2026-02-20'),
      prioridad: 'MEDIA',
    },
  });
  
  // ============================================
  // PRECIOS DE MERCADO
  // ============================================
  console.log('💹 Creando precios de mercado...');
  
  const productos = [
    { producto: 'Papa Huaycha', precio: 120, unidad: 'qq' },
    { producto: 'Papa Imilla', precio: 110, unidad: 'qq' },
    { producto: 'Haba Seca', precio: 80, unidad: '@' },
    { producto: 'Cebolla', precio: 60, unidad: '@' },
    { producto: 'Zanahoria', precio: 50, unidad: '@' },
  ];
  
  const mercados = ['Feria 16 de Julio', 'Mercado Rodriguez', 'Mercado Lanza'];
  
  for (const producto of productos) {
    for (const mercado of mercados) {
      // Precio varía por mercado
      const variacion = Math.random() * 20 - 10; // ±10 Bs
      await prisma.precioMercado.create({
        data: {
          producto: producto.producto,
          precio: producto.precio + variacion,
          unidad: producto.unidad,
          mercado,
          ciudad: 'La Paz',
          fecha: new Date(),
        },
      });
    }
  }
  
  console.log('✅ Seeder completado exitosamente!');
  console.log('');
  console.log('📧 Usuarios creados:');
  console.log('   - juan.mamani@agrobolivia.bo / JuanMamani2024!');
  console.log('   - admin@agrobolivia.bo / Admin2024!@#');
}

main()
  .catch((e) => {
    console.error('❌ Error en seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
