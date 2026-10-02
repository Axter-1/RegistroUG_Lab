from machine import UART, Pin
import time

# Configurar UART2 en ESP32
# tx=17, rx=16, baudrate=9600 (valor por defecto del GM861)
uart_qr = UART(2, baudrate=9600, tx=Pin(17), rx=Pin(16), timeout=200)

print("Lector GM861 listo. Esperando escaneo...")

while True:
    # Comprobar si hay bytes disponibles en el buffer
    if uart_qr.any():
        # Lee la línea completa enviada por el sensor
        raw_data = uart_qr.readline()
        
        if raw_data:
            try:
                # Decodifica de bytes a string y elimina \r y \n
                decoded_str = raw_data.decode('utf-8').strip()
                
                if decoded_str:
                    print("Código decodificado:", decoded_str)
            except UnicodeDecodeError:
                # Por si contiene caracteres binarios o configuraciones raras
                print("Error de decodificación. Bytes crudos:", raw_data)
                
    time.sleep_ms(50)