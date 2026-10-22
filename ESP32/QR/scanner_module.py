from machine import UART, Pin
import time

class QRScanner:
    def __init__(self, uart_id=2, rx_pin=16, tx_pin=17, baudrate=9600, debounce_ms=3000):
        self.uart = UART(uart_id, baudrate=baudrate, tx=Pin(tx_pin), rx=Pin(rx_pin), timeout=200)
        self.last_code = ""
        self.last_scan_time = 0
        self.debounce_ms = debounce_ms

    def start_listening(self, queue):
        """Bucle continuo de lectura UART para ejecutarse en un hilo secundario."""
        print("[SCANNER] Escáner QR listo y escuchando...")
        
        while True:
            if self.uart.any():
                raw_data = self.uart.readline()
                if raw_data:
                    try:
                        decoded_str = raw_data.decode('utf-8').strip()
                        if decoded_str:
                            now = time.ticks_ms()
                            
                            # Filtro antirrebote para no duplicar escaneos continuos
                            if decoded_str != self.last_code or time.ticks_diff(now, self.last_scan_time) > self.debounce_ms:
                                if queue.put(decoded_str):
                                    print("[SCANNER] Código encolado:", decoded_str)
                                else:
                                    print("[SCANNER] Advertencia: Cola llena, código descartado")
                                
                                self.last_code = decoded_str
                                self.last_scan_time = now

                    except UnicodeDecodeError:
                        print("[SCANNER] Error de decodificación. Bytes crudos:", raw_data)

            time.sleep_ms(50)  # Liberar tiempo de CPU