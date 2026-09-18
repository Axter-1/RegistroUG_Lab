from machine import Pin
import network
import time

ELed = Pin(14, Pin.OUT)
WLed = Pin(12, Pin.OUT)
SLed = Pin(27, Pin.OUT)

PReset = Pin(36, Pin.IN)
leds = [ELed, WLed, SLed]

for led in leds:
    led.value(0)

def ConnectWiFi(ssid, pswd) -> bool:
    for led in leds:
        led.value(0)  # Apagar todos los LEDs al inicil

    # Conexión WiFi
    sta = network.WLAN(network.STA_IF)
    sta.active(True)
    if not sta.isconnected():
        sta.connect(ssid, pswd)

    while not sta.isconnected():
        time.sleep(0.5)
        WLed.value(1)
        print("Intentando conectar... estado:", sta.status())
        time.sleep(0.5)
        WLed.value(0)

    if sta.isconnected():
        print(f"\n\nConectado a WiFi: {ssid}\nIPv4 -> {sta.ifconfig()[0]}\nMáscara de red -> {sta.ifconfig()[1]}")
        SLed.value(1)
        return True
    else:
        WLed.value(0)
        SLed.value(0)
        ELed.value(1)
        print("No se pudo conectar a la red WiFi.")
        return False

