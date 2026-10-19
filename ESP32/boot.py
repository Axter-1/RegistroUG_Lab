# boot.py -- Se ejecuta en el arranque antes de main.py
import gc
import esp
import time
from machine import Pin

esp.osdebug(None)
gc.collect()

print("\n--- ESP32 Iniciando ---")
print("Presiona CTRL+C en la consola en los próximos 3 segundos para detener...")
time.sleep(3)

boot_button = Pin(0, Pin.IN, Pin.PULL_UP)
if boot_button.value() == 0:
    print("Deteniendo ejecución para acceso a consola.")
    raise SystemExit