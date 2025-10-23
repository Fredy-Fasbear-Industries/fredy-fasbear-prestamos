const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  console.log('Limpiando base de datos...');
  await prisma.logActividad.deleteMany();
  await prisma.sesionUsuario.deleteMany();
  await prisma.comentarioProducto.deleteMany();
  await prisma.carrito.deleteMany();
  await prisma.detallePedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.visitaCobranza.deleteMany();
  await prisma.rutaCobranza.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.planPagos.deleteMany();
  await prisma.prestamo.deleteMany();
  await prisma.contrato.deleteMany();
  await prisma.avaluo.deleteMany();
  await prisma.productoTienda.deleteMany();
  await prisma.articulo.deleteMany();
  await prisma.solicitudPrestamo.deleteMany();
  await prisma.parametrosSistema.deleteMany();
  await prisma.documento.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.tipoArticulo.deleteMany();

  console.log('Creando tipos de artículo...');
  const tipoArticulos = await Promise.all([
    prisma.tipoArticulo.create({
      data: {
        nombre: 'Autos',
        porcentajeMinAvaluo: 30.00,
        porcentajeMaxAvaluo: 50.00,
        requiereElectronico: false,
        estado: 'Activo'
      }
    }),
    prisma.tipoArticulo.create({
      data: {
        nombre: 'Celulares',
        porcentajeMinAvaluo: 25.00,
        porcentajeMaxAvaluo: 45.00,
        requiereElectronico: true,
        estado: 'Activo'
      }
    }),
    prisma.tipoArticulo.create({
      data: {
        nombre: 'Joyas',
        porcentajeMinAvaluo: 40.00,
        porcentajeMaxAvaluo: 70.00,
        requiereElectronico: false,
        estado: 'Activo'
      }
    }),
    prisma.tipoArticulo.create({
      data: {
        nombre: 'Relojes',
        porcentajeMinAvaluo: 35.00,
        porcentajeMaxAvaluo: 60.00,
        requiereElectronico: false,
        estado: 'Activo'
      }
    }),
    prisma.tipoArticulo.create({
      data: {
        nombre: 'Diamantes',
        porcentajeMinAvaluo: 50.00,
        porcentajeMaxAvaluo: 85.00,
        requiereElectronico: false,
        estado: 'Activo'
      }
    }),
    prisma.tipoArticulo.create({
      data: {
        nombre: 'Monedas',
        porcentajeMinAvaluo: 30.00,
        porcentajeMaxAvaluo: 55.00,
        requiereElectronico: false,
        estado: 'Activo'
      }
    }),
    prisma.tipoArticulo.create({
      data: {
        nombre: 'Electrónicos',
        porcentajeMinAvaluo: 20.00,
        porcentajeMaxAvaluo: 40.00,
        requiereElectronico: true,
        estado: 'Activo'
      }
    }),
    prisma.tipoArticulo.create({
      data: {
        nombre: 'Herramientas',
        porcentajeMinAvaluo: 25.00,
        porcentajeMaxAvaluo: 45.00,
        requiereElectronico: false,
        estado: 'Activo'
      }
    })
  ]);

  console.log('Creando usuarios...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Fredy',
      apellido: 'Fasbear',
      email: 'admin@fredyfasbear.com',
      telefono: '502-1234-5678',
      direccion: 'Oficina Central Fredy Fasbear Industries',
      tipoUsuario: 'Administrador',
      cedula: '1234567890',
      fechaNacimiento: new Date('1990-01-15'),
      passwordHash: passwordHash,
      emailVerificado: true,
      estado: 'Activo'
    }
  });

  const evaluador1 = await prisma.usuario.create({
    data: {
      nombre: 'Carlos',
      apellido: 'Evaluador',
      email: 'evaluador@fredyfasbear.com',
      telefono: '502-2345-6789',
      direccion: 'Zona 10, Ciudad de Guatemala',
      tipoUsuario: 'Evaluador',
      cedula: '2345678901',
      fechaNacimiento: new Date('1988-05-20'),
      passwordHash: passwordHash,
      emailVerificado: true,
      estado: 'Activo'
    }
  });

  const cobrador1 = await prisma.usuario.create({
    data: {
      nombre: 'Luis',
      apellido: 'Cobrador',
      email: 'cobrador@fredyfasbear.com',
      telefono: '502-3456-7890',
      direccion: 'Zona 1, Ciudad de Guatemala',
      tipoUsuario: 'Cobrador',
      cedula: '3456789012',
      fechaNacimiento: new Date('1992-08-10'),
      passwordHash: passwordHash,
      emailVerificado: true,
      estado: 'Activo'
    }
  });

  const cliente1 = await prisma.usuario.create({
    data: {
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@example.com',
      telefono: '502-4567-8901',
      direccion: 'Zona 5, Ciudad de Guatemala',
      tipoUsuario: 'Cliente',
      cedula: '4567890123',
      fechaNacimiento: new Date('1995-03-25'),
      passwordHash: passwordHash,
      emailVerificado: true,
      estado: 'Activo'
    }
  });

  const cliente2 = await prisma.usuario.create({
    data: {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@example.com',
      telefono: '502-5678-9012',
      direccion: 'Zona 7, Mixco',
      tipoUsuario: 'Cliente',
      cedula: '5678901234',
      fechaNacimiento: new Date('1990-11-30'),
      passwordHash: passwordHash,
      emailVerificado: true,
      estado: 'Activo'
    }
  });

  const cliente3 = await prisma.usuario.create({
    data: {
      nombre: 'Ana',
      apellido: 'Martínez',
      email: 'ana.martinez@example.com',
      telefono: '502-6789-0123',
      direccion: 'Zona 11, Villa Nueva',
      tipoUsuario: 'Cliente',
      cedula: '6789012345',
      fechaNacimiento: new Date('1993-07-15'),
      passwordHash: passwordHash,
      emailVerificado: false,
      estado: 'Activo'
    }
  });

  console.log('Creando parámetros del sistema...');
  await Promise.all([
    prisma.parametrosSistema.create({
      data: {
        nombreParametro: 'TASA_INTERES_MENSUAL',
        valorParametro: '5.0',
        descripcion: 'Tasa de interés mensual por defecto',
        tipoDato: 'DECIMAL',
        usuarioModificoId: admin.id
      }
    }),
    prisma.parametrosSistema.create({
      data: {
        nombreParametro: 'PLAZO_MAXIMO_MESES',
        valorParametro: '6',
        descripcion: 'Plazo máximo en meses para préstamos',
        tipoDato: 'INTEGER',
        usuarioModificoId: admin.id
      }
    }),
    prisma.parametrosSistema.create({
      data: {
        nombreParametro: 'COSTO_ALMACENAMIENTO_DIARIO',
        valorParametro: '2.50',
        descripcion: 'Costo diario de almacenamiento',
        tipoDato: 'DECIMAL',
        usuarioModificoId: admin.id
      }
    }),
    prisma.parametrosSistema.create({
      data: {
        nombreParametro: 'NOMBRE_EMPRESA',
        valorParametro: 'Fredy Fasbear Industries',
        descripcion: 'Nombre oficial de la empresa',
        tipoDato: 'STRING',
        usuarioModificoId: admin.id
      }
    }),
    prisma.parametrosSistema.create({
      data: {
        nombreParametro: 'DIAS_DESCUENTO_10',
        valorParametro: '30',
        descripcion: 'Días en inventario para aplicar 10% descuento',
        tipoDato: 'INTEGER',
        usuarioModificoId: admin.id
      }
    }),
    prisma.parametrosSistema.create({
      data: {
        nombreParametro: 'DIAS_DESCUENTO_20',
        valorParametro: '60',
        descripcion: 'Días en inventario para aplicar 20% descuento',
        tipoDato: 'INTEGER',
        usuarioModificoId: admin.id
      }
    })
  ]);

  console.log('Creando solicitudes de préstamo...');

  const solicitud1 = await prisma.solicitudPrestamo.create({
    data: {
      usuarioId: cliente1.id,
      evaluadorId: evaluador1.id,
      estado: 'Aprobada',
      observaciones: 'Solicitud aprobada. Cliente con buen historial.',
      fechaEvaluacion: new Date('2024-10-15'),
      montoSolicitado: 5000.00,
      plazoMeses: 3,
      modalidadPago: 'Mensual',
      totalAPagar: 5750.00,
      tasaInteres: 5.00,
      clienteAceptoOferta: true,
      fechaAceptacion: new Date('2024-10-16')
    }
  });

  const solicitud2 = await prisma.solicitudPrestamo.create({
    data: {
      usuarioId: cliente2.id,
      evaluadorId: evaluador1.id,
      estado: 'Aprobada',
      observaciones: 'Artículo en excelente estado.',
      fechaEvaluacion: new Date('2024-10-18'),
      montoSolicitado: 8000.00,
      plazoMeses: 6,
      modalidadPago: 'Mensual',
      totalAPagar: 10400.00,
      tasaInteres: 5.00,
      clienteAceptoOferta: true,
      fechaAceptacion: new Date('2024-10-19')
    }
  });

  const solicitud3 = await prisma.solicitudPrestamo.create({
    data: {
      usuarioId: cliente3.id,
      estado: 'Pendiente',
      montoSolicitado: 3000.00,
      plazoMeses: 2,
      modalidadPago: 'Mensual'
    }
  });

  const solicitud4 = await prisma.solicitudPrestamo.create({
    data: {
      usuarioId: cliente1.id,
      evaluadorId: evaluador1.id,
      estado: 'Rechazada',
      observaciones: 'Artículo en mal estado, no cumple con requisitos mínimos.',
      fechaEvaluacion: new Date('2024-10-10')
    }
  });

  console.log('Creando artículos...');

  const articulo1 = await prisma.articulo.create({
    data: {
      solicitudId: solicitud1.id,
      tipoArticuloId: tipoArticulos[2].id,
      descripcion: 'Anillo de oro 18K con diamante',
      marca: 'Tiffany & Co',
      modelo: 'Solitaire',
      color: 'Dorado',
      estadoFisico: 'Excelente',
      valorEstimadoCliente: 12000.00,
      especificacionesTecnicas: 'Oro 18K, diamante 1.2 quilates, certificado GIA'
    }
  });

  const articulo2 = await prisma.articulo.create({
    data: {
      solicitudId: solicitud2.id,
      tipoArticuloId: tipoArticulos[0].id,
      descripcion: 'Vehículo Toyota Corolla',
      marca: 'Toyota',
      modelo: 'Corolla 2020',
      color: 'Gris',
      estadoFisico: 'Bueno',
      valorEstimadoCliente: 20000.00,
      especificacionesTecnicas: 'Motor 1.8L, transmisión automática, 45000 km'
    }
  });

  const articulo3 = await prisma.articulo.create({
    data: {
      solicitudId: solicitud3.id,
      tipoArticuloId: tipoArticulos[1].id,
      descripcion: 'iPhone 13 Pro Max',
      marca: 'Apple',
      modelo: 'iPhone 13 Pro Max',
      serie: 'IMEI123456789',
      color: 'Azul',
      estadoFisico: 'Excelente',
      valorEstimadoCliente: 8000.00,
      especificacionesTecnicas: '256GB, batería 98%, sin rayones'
    }
  });

  const articulo4 = await prisma.articulo.create({
    data: {
      solicitudId: solicitud4.id,
      tipoArticuloId: tipoArticulos[3].id,
      descripcion: 'Reloj Casio digital',
      marca: 'Casio',
      modelo: 'G-Shock',
      color: 'Negro',
      estadoFisico: 'Regular',
      valorEstimadoCliente: 500.00
    }
  });

  console.log('Creando avalúos...');

  const avaluo1 = await prisma.avaluo.create({
    data: {
      articuloId: articulo1.id,
      evaluadorId: evaluador1.id,
      valorComercial: 10000.00,
      porcentajeAplicado: 50.00,
      montoPrestamo: 5000.00,
      observaciones: 'Joya en excelente estado, certificado de autenticidad verificado'
    }
  });

  const avaluo2 = await prisma.avaluo.create({
    data: {
      articuloId: articulo2.id,
      evaluadorId: evaluador1.id,
      valorComercial: 18000.00,
      porcentajeAplicado: 44.44,
      montoPrestamo: 8000.00,
      observaciones: 'Vehículo en buen estado, documentación en regla'
    }
  });

  console.log('Creando contratos...');

  const contrato1 = await prisma.contrato.create({
    data: {
      solicitudId: solicitud1.id,
      numeroContrato: 'CTR-2024-001',
      estadoFirma: 'Firmado',
      fechaFirma: new Date('2024-10-16'),
      contenidoContrato: 'Contrato de préstamo prendario entre Fredy Fasbear Industries y María González por un monto de Q5,000.00...',
      hashFirma: 'abc123def456'
    }
  });

  const contrato2 = await prisma.contrato.create({
    data: {
      solicitudId: solicitud2.id,
      numeroContrato: 'CTR-2024-002',
      estadoFirma: 'Firmado',
      fechaFirma: new Date('2024-10-19'),
      contenidoContrato: 'Contrato de préstamo prendario entre Fredy Fasbear Industries y Juan Pérez por un monto de Q8,000.00...',
      hashFirma: 'xyz789uvw012'
    }
  });

  console.log('Creando préstamos...');

  const prestamo1 = await prisma.prestamo.create({
    data: {
      numeroPrestamo: 'PRES-2024-001',
      contratoId: contrato1.id,
      montoPrestado: 5000.00,
      tasaInteres: 5.00,
      plazoMeses: 3,
      modalidadPago: 'Mensual',
      totalAPagar: 5750.00,
      fechaInicio: new Date('2024-10-16'),
      fechaVencimiento: new Date('2025-01-16'),
      estado: 'Activo',
      saldoPendiente: 3833.33,
      costoAlmacenamiento: 0.00
    }
  });

  const prestamo2 = await prisma.prestamo.create({
    data: {
      numeroPrestamo: 'PRES-2024-002',
      contratoId: contrato2.id,
      montoPrestado: 8000.00,
      tasaInteres: 5.00,
      plazoMeses: 6,
      modalidadPago: 'Mensual',
      totalAPagar: 10400.00,
      fechaInicio: new Date('2024-10-19'),
      fechaVencimiento: new Date('2025-04-19'),
      estado: 'Activo',
      saldoPendiente: 10400.00,
      costoAlmacenamiento: 0.00
    }
  });

  console.log('Creando plan de pagos...');

  await Promise.all([
    prisma.planPagos.create({
      data: {
        prestamoId: prestamo1.id,
        numeroCuota: 1,
        fechaVencimiento: new Date('2024-11-16'),
        montoCuota: 1916.67,
        montoCapital: 1666.67,
        montoInteres: 250.00,
        estado: 'Pagado'
      }
    }),
    prisma.planPagos.create({
      data: {
        prestamoId: prestamo1.id,
        numeroCuota: 2,
        fechaVencimiento: new Date('2024-12-16'),
        montoCuota: 1916.67,
        montoCapital: 1666.67,
        montoInteres: 250.00,
        estado: 'Pendiente'
      }
    }),
    prisma.planPagos.create({
      data: {
        prestamoId: prestamo1.id,
        numeroCuota: 3,
        fechaVencimiento: new Date('2025-01-16'),
        montoCuota: 1916.67,
        montoCapital: 1666.67,
        montoInteres: 250.00,
        estado: 'Pendiente'
      }
    }),
    prisma.planPagos.create({
      data: {
        prestamoId: prestamo2.id,
        numeroCuota: 1,
        fechaVencimiento: new Date('2024-11-19'),
        montoCuota: 1733.33,
        montoCapital: 1333.33,
        montoInteres: 400.00,
        estado: 'Pendiente'
      }
    }),
    prisma.planPagos.create({
      data: {
        prestamoId: prestamo2.id,
        numeroCuota: 2,
        fechaVencimiento: new Date('2024-12-19'),
        montoCuota: 1733.33,
        montoCapital: 1333.33,
        montoInteres: 400.00,
        estado: 'Pendiente'
      }
    }),
    prisma.planPagos.create({
      data: {
        prestamoId: prestamo2.id,
        numeroCuota: 3,
        fechaVencimiento: new Date('2025-01-19'),
        montoCuota: 1733.33,
        montoCapital: 1333.33,
        montoInteres: 400.00,
        estado: 'Pendiente'
      }
    }),
    prisma.planPagos.create({
      data: {
        prestamoId: prestamo2.id,
        numeroCuota: 4,
        fechaVencimiento: new Date('2025-02-19'),
        montoCuota: 1733.33,
        montoCapital: 1333.33,
        montoInteres: 400.00,
        estado: 'Pendiente'
      }
    }),
    prisma.planPagos.create({
      data: {
        prestamoId: prestamo2.id,
        numeroCuota: 5,
        fechaVencimiento: new Date('2025-03-19'),
        montoCuota: 1733.33,
        montoCapital: 1333.33,
        montoInteres: 400.00,
        estado: 'Pendiente'
      }
    }),
    prisma.planPagos.create({
      data: {
        prestamoId: prestamo2.id,
        numeroCuota: 6,
        fechaVencimiento: new Date('2025-04-19'),
        montoCuota: 1733.35,
        montoCapital: 1333.35,
        montoInteres: 400.00,
        estado: 'Pendiente'
      }
    })
  ]);

  console.log('Creando pagos...');

  await prisma.pago.create({
    data: {
      prestamoId: prestamo1.id,
      montoPago: 1916.67,
      fechaPago: new Date('2024-11-15'),
      tipoPago: 'Transferencia',
      estadoValidacion: 'Validado',
      validadorId: cobrador1.id,
      observaciones: 'Pago recibido a tiempo',
      fechaDeposito: new Date('2024-11-15'),
      nombreBanco: 'Banco Industrial',
      numeroTransaccion: 'TXN123456789'
    }
  });

  console.log('Creando productos en tienda...');

  const productoTienda1 = await prisma.productoTienda.create({
    data: {
      articuloId: articulo1.id,
      precioVenta: 11000.00,
      categoria: 'Joyería',
      estado: 'Disponible',
      descuentoAplicado: 0,
      diasEnInventario: 0,
      valoracionPromedio: 0
    }
  });

  console.log('Creando rutas de cobranza...');

  const ruta1 = await prisma.rutaCobranza.create({
    data: {
      cobradorId: cobrador1.id,
      fechaRuta: new Date('2024-10-21'),
      zonaAsignada: 'Zona 5 y Zona 7',
      estado: 'Completada'
    }
  });

  console.log('Creando visitas de cobranza...');

  await prisma.visitaCobranza.create({
    data: {
      rutaId: ruta1.id,
      prestamoId: prestamo1.id,
      fechaVisita: new Date('2024-10-21T10:30:00'),
      resultado: 'Pago',
      montoCobrado: 1916.67,
      observaciones: 'Cliente realizó pago completo de cuota mensual',
      ubicacionGps: '14.6340,-90.5069'
    }
  });

  console.log('Creando logs de actividad...');

  await Promise.all([
    prisma.logActividad.create({
      data: {
        usuarioId: admin.id,
        accion: 'LOGIN',
        entidad: 'Usuario',
        entidadId: admin.id.toString(),
        detalles: { mensaje: 'Inicio de sesión exitoso' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0'
      }
    }),
    prisma.logActividad.create({
      data: {
        usuarioId: evaluador1.id,
        accion: 'EVALUAR',
        entidad: 'SolicitudPrestamo',
        entidadId: solicitud1.id.toString(),
        detalles: { estado: 'Aprobada', monto: 5000.00 },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0'
      }
    }),
    prisma.logActividad.create({
      data: {
        usuarioId: cliente1.id,
        accion: 'CREAR',
        entidad: 'SolicitudPrestamo',
        entidadId: solicitud1.id.toString(),
        detalles: { monto: 5000.00, plazo: 3 },
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0'
      }
    })
  ]);

  console.log('Seed completado exitosamente!');
  console.log('\nResumen de datos creados:');
  console.log(`- ${tipoArticulos.length} tipos de artículo`);
  console.log('- 6 usuarios (1 admin, 1 evaluador, 1 cobrador, 3 clientes)');
  console.log('- 6 parámetros del sistema');
  console.log('- 4 solicitudes de préstamo');
  console.log('- 4 artículos');
  console.log('- 2 avalúos');
  console.log('- 2 contratos');
  console.log('- 2 préstamos');
  console.log('- 9 cuotas en plan de pagos');
  console.log('- 1 pago validado');
  console.log('- 1 producto en tienda');
  console.log('- 1 ruta de cobranza');
  console.log('- 1 visita de cobranza');
  console.log('- 3 logs de actividad');
  console.log('\nCredenciales de acceso:');
  console.log('- Admin: admin@fredyfasbear.com / password123');
  console.log('- Evaluador: evaluador@fredyfasbear.com / password123');
  console.log('- Cobrador: cobrador@fredyfasbear.com / password123');
  console.log('- Clientes: maria.gonzalez@example.com, juan.perez@example.com, ana.martinez@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
