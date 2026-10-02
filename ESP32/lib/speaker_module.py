from machine import I2S, Pin
import time

# 1. Configurar los pines I2S
sck_pin = Pin(26)  # BCLK
ws_pin = Pin(25)   # LRC
sd_pin = Pin(22)   # DIN

# 2. Inicializar el periférico I2S en el ESP32 (I2S canal 0)
audio_out = I2S(
    0,
    sck=sck_pin,
    ws=ws_pin,
    sd=sd_pin,
    mode=I2S.TX,       # Modo transmisión
    bits=16,           # Resolución de 16 bits (estándar para archivos WAV)
    format=I2S.MONO,   # El NS4168 es un amplificador mono
    rate=44100,        # Frecuencia de muestreo (debe coincidir con tu archivo de audio)
    ibuf=20000         # Tamaño del buffer interno
)

# 3. Reproducir un archivo WAV
def play_wav(ruta_archivo):
    print("Reproduciendo:", ruta_archivo)
    
    # Abrir el archivo en modo lectura binaria
    with open(ruta_archivo, 'rb') as f:
        # Saltar la cabecera del archivo WAV (normalmente los primeros 44 bytes)
        f.seek(44) 
        
        # Crear un buffer para leer los trozos de audio
        buffer_audio = bytearray(1024)
        
        while True:
            try:
                # Leer un fragmento del archivo
                num_leido = f.readinto(buffer_audio)
                
                # Si no hay más datos, terminamos
                if num_leido == 0:
                    break
                
                # Enviar el fragmento de audio al bus I2S
                # memoryview asegura que solo enviemos los bytes que realmente se leyeron
                audio_out.write(memoryview(buffer_audio)[:num_leido])
                
            except Exception as e:
                print("Error durante la reproducción:", e)
                break

    print("Reproducción finalizada.")
    audio_out.deinit()