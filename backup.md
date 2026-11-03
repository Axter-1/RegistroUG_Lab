```python
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
```
