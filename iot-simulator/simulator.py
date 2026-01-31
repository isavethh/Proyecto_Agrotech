# AgroBolivia IoT Simulator
# Simulador de sensores IoT para el sistema de monitoreo agrícola

import requests
import random
import time
import json
from datetime import datetime
import os
from typing import Dict, List, Optional
import logging

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Configuración
API_URL = os.getenv('API_URL', 'http://localhost:3001/api/v1')
API_KEY = os.getenv('IOT_API_KEY', 'iot-secret-key-2024')
INTERVAL_SECONDS = int(os.getenv('INTERVAL_SECONDS', '60'))

# Sensores simulados
SENSORES = [
    {
        'id': 'sensor-001',
        'tipo': 'HUMEDAD_SUELO',
        'nombre': 'Sensor Humedad - Parcela Norte',
        'parcelaId': 'parcela-norte',
        'unidad': '%',
        'min_valor': 20,
        'max_valor': 90,
        'valor_optimo_min': 40,
        'valor_optimo_max': 70,
    },
    {
        'id': 'sensor-002',
        'tipo': 'TEMPERATURA',
        'nombre': 'Sensor Temperatura - Parcela Norte',
        'parcelaId': 'parcela-norte',
        'unidad': '°C',
        'min_valor': -5,
        'max_valor': 35,
        'valor_optimo_min': 15,
        'valor_optimo_max': 25,
    },
    {
        'id': 'sensor-003',
        'tipo': 'PH_SUELO',
        'nombre': 'Sensor pH - Parcela Norte',
        'parcelaId': 'parcela-norte',
        'unidad': 'pH',
        'min_valor': 4.0,
        'max_valor': 9.0,
        'valor_optimo_min': 5.5,
        'valor_optimo_max': 7.0,
    },
    {
        'id': 'sensor-004',
        'tipo': 'LLUVIA',
        'nombre': 'Pluviómetro - General',
        'parcelaId': 'parcela-sur',
        'unidad': 'mm',
        'min_valor': 0,
        'max_valor': 50,
        'valor_optimo_min': 5,
        'valor_optimo_max': 30,
    },
    {
        'id': 'sensor-005',
        'tipo': 'HUMEDAD_AMBIENTE',
        'nombre': 'Humedad Ambiente - Parcela Sur',
        'parcelaId': 'parcela-sur',
        'unidad': '%',
        'min_valor': 30,
        'max_valor': 95,
        'valor_optimo_min': 50,
        'valor_optimo_max': 80,
    },
    {
        'id': 'sensor-006',
        'tipo': 'LUMINOSIDAD',
        'nombre': 'Sensor Luz - Parcela Norte',
        'parcelaId': 'parcela-norte',
        'unidad': 'lux',
        'min_valor': 0,
        'max_valor': 100000,
        'valor_optimo_min': 10000,
        'valor_optimo_max': 50000,
    },
]

# Estado actual de los sensores (para simular tendencias)
estado_actual: Dict[str, float] = {}

def inicializar_estado():
    """Inicializa el estado de los sensores con valores aleatorios dentro del rango óptimo"""
    for sensor in SENSORES:
        estado_actual[sensor['id']] = random.uniform(
            sensor['valor_optimo_min'],
            sensor['valor_optimo_max']
        )
    logger.info(f"Estado inicial de sensores configurado para {len(SENSORES)} dispositivos")

def generar_valor(sensor: Dict) -> float:
    """Genera un nuevo valor para un sensor basado en su estado anterior"""
    sensor_id = sensor['id']
    valor_actual = estado_actual.get(sensor_id, (sensor['min_valor'] + sensor['max_valor']) / 2)
    
    # Simular variación natural (camino aleatorio con drift)
    variacion = random.gauss(0, (sensor['max_valor'] - sensor['min_valor']) * 0.02)
    
    # Añadir eventos especiales con baja probabilidad
    if random.random() < 0.05:  # 5% de probabilidad de evento especial
        if sensor['tipo'] == 'LLUVIA' and random.random() < 0.3:
            variacion += random.uniform(5, 20)  # Lluvia repentina
        elif sensor['tipo'] == 'TEMPERATURA':
            variacion += random.uniform(-3, 3)  # Cambio brusco de temperatura
    
    nuevo_valor = valor_actual + variacion
    
    # Mantener dentro del rango válido
    nuevo_valor = max(sensor['min_valor'], min(sensor['max_valor'], nuevo_valor))
    
    # Actualizar estado
    estado_actual[sensor_id] = nuevo_valor
    
    return round(nuevo_valor, 2)

def enviar_lectura(sensor: Dict, valor: float) -> bool:
    """Envía una lectura al servidor"""
    try:
        payload = {
            'sensorId': sensor['id'],
            'tipo': sensor['tipo'],
            'valor': valor,
            'unidad': sensor['unidad'],
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'metadata': {
                'parcelaId': sensor['parcelaId'],
                'nombreSensor': sensor['nombre'],
                'bateria': random.randint(70, 100),
                'signalStrength': random.randint(-70, -30),
            }
        }
        
        headers = {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
            'X-Device-Type': 'IOT-SENSOR',
        }
        
        response = requests.post(
            f'{API_URL}/iot/ingest',
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200 or response.status_code == 201:
            return True
        else:
            logger.warning(f"Error al enviar lectura: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Error de conexión: {e}")
        return False

def detectar_alerta(sensor: Dict, valor: float) -> Optional[Dict]:
    """Detecta si el valor está fuera del rango óptimo y genera una alerta"""
    if valor < sensor['valor_optimo_min']:
        return {
            'tipo': f"{sensor['tipo']}_BAJO",
            'prioridad': 'ALTA' if valor < sensor['min_valor'] * 1.2 else 'MEDIA',
            'mensaje': f"{sensor['nombre']}: Valor bajo ({valor} {sensor['unidad']}). Rango óptimo: {sensor['valor_optimo_min']}-{sensor['valor_optimo_max']} {sensor['unidad']}"
        }
    elif valor > sensor['valor_optimo_max']:
        return {
            'tipo': f"{sensor['tipo']}_ALTO",
            'prioridad': 'ALTA' if valor > sensor['max_valor'] * 0.8 else 'MEDIA',
            'mensaje': f"{sensor['nombre']}: Valor alto ({valor} {sensor['unidad']}). Rango óptimo: {sensor['valor_optimo_min']}-{sensor['valor_optimo_max']} {sensor['unidad']}"
        }
    return None

def simular_ciclo():
    """Ejecuta un ciclo de simulación para todos los sensores"""
    logger.info("=" * 50)
    logger.info(f"Ejecutando ciclo de simulación - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    lecturas_enviadas = 0
    alertas_generadas = 0
    
    for sensor in SENSORES:
        valor = generar_valor(sensor)
        
        # Mostrar lectura en consola
        estado = "✓" if sensor['valor_optimo_min'] <= valor <= sensor['valor_optimo_max'] else "⚠"
        logger.info(f"  {estado} {sensor['nombre']}: {valor} {sensor['unidad']}")
        
        # Enviar al servidor
        if enviar_lectura(sensor, valor):
            lecturas_enviadas += 1
        
        # Detectar alertas
        alerta = detectar_alerta(sensor, valor)
        if alerta:
            alertas_generadas += 1
            logger.warning(f"  🚨 ALERTA: {alerta['mensaje']}")
    
    logger.info(f"Resumen: {lecturas_enviadas}/{len(SENSORES)} lecturas enviadas, {alertas_generadas} alertas")

def main():
    """Función principal del simulador"""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║         🌱 AgroBolivia IoT Simulator v1.0 🌱              ║
    ║                                                           ║
    ║   Simulador de sensores para monitoreo agrícola           ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    logger.info(f"Conectando a: {API_URL}")
    logger.info(f"Intervalo de envío: {INTERVAL_SECONDS} segundos")
    logger.info(f"Sensores configurados: {len(SENSORES)}")
    print()
    
    # Inicializar estado de sensores
    inicializar_estado()
    
    # Mostrar sensores configurados
    logger.info("Sensores configurados:")
    for sensor in SENSORES:
        logger.info(f"  - {sensor['nombre']} ({sensor['tipo']})")
    print()
    
    try:
        while True:
            simular_ciclo()
            logger.info(f"Próxima lectura en {INTERVAL_SECONDS} segundos...")
            print()
            time.sleep(INTERVAL_SECONDS)
    except KeyboardInterrupt:
        logger.info("\n\n🛑 Simulador detenido por el usuario")
        print("¡Hasta luego! 👋")

if __name__ == '__main__':
    main()
