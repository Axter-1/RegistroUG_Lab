import machine
import time
from lib.threading import Thread
from lib.wifi_module import ConnectWiFi, leds

red = "Nombre_de_red"
password = "Contraseña"

def wifi_task():
    result = ConnectWiFi(red, password)
    if result:
        print("✅")
    else:
        print("❌")

def count_task():
    for i in range(1, 101):
        print("Número:", i)
        time.sleep(0.2)

def setup() -> None:
    wifi_thread = Thread(target=wifi_task)
    count_thread = Thread(target=count_task)

    wifi_thread.start()
    count_thread.start()

setup()

while True:
    time.sleep(1)
