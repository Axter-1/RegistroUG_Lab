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
        
        if not nua:
            print("[API] Ignorando envío: NUA no válido.")
            return False

        # Body JSON que se enviará al servidor
        payload = {
            "nua": nua,
            "auth": "admin",
            "pwd": "p4ssw0rd"
        }

        print(f"[API] Enviando NUA '{nua}' a {self.api_endpoint}...")

        response = None
        try:
            response = urequests.post(
                self.api_endpoint,
                json=payload,
                headers=self.headers
            )
            print(f"[API] Estado HTTP: {response.status_code}")
            print(f"[API] Respuesta: {response.text}")
            
            status = response.status_code
            return (200 <= status < 300)

        except Exception as e:
            print(f"[API] Error de conexión: {e}")
            return False

        finally:
            if response:
                response.close()