import machine
import time
from lib.threading import Thread
from lib.wifi_module import ConnectWiFi, leds
from lib.Queue_safe import ThreadSafeQueue
from lib.speaker_module import play_wav
from api_handler import APIHandler
from scanner_module import QRScanner

# 1. Corrección de sintaxis en el for
for i in range(1, 4):
    print("Hilos libres para escapado.")
    time.sleep(1)

red = "Mega_2.4G_B5D7"
password = "RtTSugDe"

# Declaración global con nombre consistente
qr_queue = ThreadSafeQueue(maxsize=10)
api = APIHandler(api_endpoint="http://10.74.57.226:3000/api/asistencia")


def task_api_requester():
    """Consumidor: Lee la cola y realiza peticiones HTTP."""
    while True:
        if not qr_queue.empty():
            qr_data = qr_queue.get()
            if qr_data:
                exito = api.send_request(qr_data)
                if exito:
                    play_wav("./src/Credencial-valida.wav")
                else:
                    play_wav("./src/Credencial-invalida.wav")
        time.sleep_ms(50)  # Evita sobrecargar el CPU


def setup_task() -> bool:
    """Configuración inicial e intento de conexión a Wi-Fi."""
    result = ConnectWiFi(red, password)
    if result:
        play_wav("./src/Conectado.wav")
        time.sleep(0.5)
        return True
    else:
        play_wav("./src/Desconectado.wav")
        print("Reiniciado...")
        time.sleep(2)
        machine.reset()
        return False


def scanner_task():
    """Productor: Escucha la UART y encola lecturas de QR."""
    scanner = QRScanner(uart_id=2, rx_pin=16, tx_pin=17)
    # Pasar la cola al scanner para que pueda colocar los códigos
    scanner.start_listening(qr_queue)


def main() -> None:
    # 1. Ejecutar Setup primero
    if setup_task():
        # 2. Instanciar hilos
        scanner_thread = Thread(target=scanner_task)
        api_thread = Thread(target=task_api_requester)

        # 3. Iniciar hilos
        scanner_thread.start()
        api_thread.start()


if __name__ == "__main__":
    main()

# Bucle de mantenimiento para evitar que el script principal finalice
while True:
    time.sleep(1)