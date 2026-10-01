import machine
import time
from lib.threading import Thread
from lib.wifi_module import ConnectWiFi, leds
##from screen.screen_module import test
from lib.speaker_module import play_wav
time.sleep(3)
red = "Mega_2.4G_B5D7"
password = "RtTSugDe"

def wifi_task():
    result = ConnectWiFi(red, password)
    if result:
        play_wav("./src/Conectado.wav")
        print("✅")
    else:
        play_wav("./src/Desconectado.wav")
        print("❌")

def count_task():
    test()
    for i in range(1, 10):
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
