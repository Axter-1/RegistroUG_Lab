import _thread
import gc
import machine
import utime as time

from QR.scanner_module import QRScanner
from lib.Queue_safe import ThreadSafeQueue
from lib.speaker_module import play_wav
from lib.threading import Thread
from lib.wifi_module import ConnectWiFi
from request_handler.api_handler import APIHandler
from screen.display_ui import DisplayUI



red = "Loona"
password = "contrafuerte"

gc.collect()
result = ConnectWiFi(red, password)

# 1. Se inicializa DisplayUI con el buffer ultra-reducido (ahora sí cabe con el Wi-Fi)
ui = DisplayUI(fox_path="/bitmap/fox.argb8888")

qr_queue = ThreadSafeQueue(maxsize=10)
api = APIHandler(api_endpoint="http://10.74.57.226:3000/api/accesos/qr")


def esperar_pantalla(ms):
    inicio = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), inicio) < ms:
        ui.update()


def task_api_requester():
    """Consumidor: Lee la cola, contacta la API y muestra la retroalimentación."""
    while True:
        if not qr_queue.empty():
            qr_data = qr_queue.get()
            if qr_data:
                ui.show_loading("Validando credencial...")

                exito = api.send_request(qr_data)
                if exito:
                    ui.show_success("Credencial Válida")
                    play_wav("./src/Credencial-valida.wav")
                else:
                    ui.show_error("Credencial Inválida")
                    play_wav("./src/Credencial-invalida.wav")

                esperar_pantalla(2000)
                ui.show_loading("Listo: Escanee QR")

        time.sleep_ms(50)


def setup_task() -> bool:
    """Configuración inicial y conexión Wi-Fi con el zorro en pantalla."""
    ui.show_loading("Conectando Wi-Fi...")
    ui.update()

    # Asegurar la mayor cantidad de memoria contigua libre para la radio
    gc.collect()

 
    if result:
        ui.show_loading("Listo: Escanee QR")
        play_wav("./src/Conectado.wav")
        esperar_pantalla(500)
        return True
    else:
        ui.show_error("Error Wi-Fi")
        play_wav("./src/Desconectado.wav")
        esperar_pantalla(2000)
        machine.reset()
        return False


def scanner_task():
    """Productor: Lee por UART el módulo de escáner QR."""
    scanner = QRScanner(uart_id=2, rx_pin=16, tx_pin=17)
    scanner.start_listening(qr_queue)


def main() -> None:
    if setup_task():
        scanner_thread = Thread(target=scanner_task)
        api_thread = Thread(target=task_api_requester)

        scanner_thread.start()
        api_thread.start()


if __name__ == "__main__":
    main()

# Bucle infinito del hilo principal para alimentar continuamente LVGL
while True:
    ui.update()