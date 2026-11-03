import gc
from machine import Pin
import network
import time


def ConnectWiFi(ssid, pswd) -> bool:
    # 1. Limpieza de memoria previa
    gc.collect()

    # 2. Inicializar directamente la estación STA sin tocar AP_IF
    sta = network.WLAN(network.STA_IF)
    if not sta.active():
        sta.active(True)

    if not sta.isconnected():
        sta.connect(ssid, pswd)

    MAX_ATTEMPTS = 10
    for attempt in range(MAX_ATTEMPTS):
        if sta.isconnected():
            break
        print(
            f"Intentando conectar ({attempt + 1}/{MAX_ATTEMPTS})... estado:",
            sta.status(),
        )
        time.sleep(1)
    else:
        print("Error: Tiempo de espera agotado. No se pudo conectar a Wi-Fi.")

    if sta.isconnected():
        print(
            f"\n\nConectado a WiFi: {ssid}\nIPv4 -> {sta.ifconfig()[0]}\nMáscara de red -> {sta.ifconfig()[1]}"
        )
        return True
    else:
        print("No se pudo conectar a la red WiFi.")
        return False