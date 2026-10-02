from machine import Pin, SoftI2C
import sh1106

def test():
    i2c = SoftI2C(scl=Pin(22), sda=Pin(21), freq=100000)

    # Inicialización con el driver SH1106
    oled = sh1106.SH1106_I2C(128, 64, i2c, addr=0x3c)
    oled.sleep(False)  # Asegurar que el display salga de modo reposo

    oled.fill(0)
    oled.text("¡Hola SH1106!", 0, 0)
    oled.text("MN096-12864 OK", 0, 20)
    oled.show()
    print("🖥️ Comandos enviados a SH1106.")