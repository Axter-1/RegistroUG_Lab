import urequests
import json

class APIHandler:
    BASE_URL = "https://dae.ugto.mx/ServiciosExternos/Estudiantes/Default.aspx?"

    def __init__(self, api_endpoint="http://10.74.57.226:3000/"):
        self.api_endpoint = api_endpoint
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-KEY': '1234567890'
        }

    def extract_nua(self, qr_text):
        if not qr_text:
            return None
        if qr_text.startswith(self.BASE_URL):
            try:
                return qr_text.split("NUA=")[1].split("&")[0]
            except IndexError:
                print("[API] Error: Parámetro NUA no encontrado en la URL")
                return None
        return qr_text.strip()

    def send_request(self, qr_text):
        nua = self.extract_nua(qr_text)

        if not nua or not nua.isdigit() or len(nua) > 8 or not (1 <= int(nua) <= 16777215):
            print("[API] Ignorando envío: NUA no válido.")
            return False

        url = self.api_endpoint.rstrip("/") + "/api/accesos/qr?NUA=" + nua
        headers = {
            "X-Device-Token": "0175f20e8c433a3ed0d9a01d4425d5045e9bda9d0394377211c9ebd599854986"
        }

        response = None
        try:
            response = urequests.post(url, headers=headers)
            print(f"[API] Estado HTTP: {response.status_code}")
            print(f"[API] Respuesta: {response.text}")
            return 200 <= response.status_code < 300
        except Exception as e:
            print(f"[API] Error de conexión: {e}")
            return False
        finally:
            if response:
                response.close()
