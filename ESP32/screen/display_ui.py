import math
import utime as time
import machine
import lcd_bus
import jd9853
import lvgl as lv
import gc


class DisplayUI:
    STATE_LOADING = 0
    STATE_SUCCESS = 1
    STATE_ERROR = 2

    def __init__(
        self,
        width=240,
        height=296,
        mosi=33,
        sck=32,
        dc=26,
        cs=25,
        rst=26,
        bl=13,
        host=1,
        freq=20000000,
        fox_path="/bitmap/fox.argb8888",
    ):
        self.step_ms = 90
        self.fox_path = fox_path

        # 1. Hardware y bus SPI
        # Inicialización de hardware y LVGL
        lv.init()
        self.spi_bus = machine.SPI.Bus(host=host, mosi=mosi, sck=sck)
        self.display_bus = lcd_bus.SPIBus(
            spi_bus=self.spi_bus, freq=freq, dc=dc, cs=cs
        )

        # Buffer mínimo de 1 línea de escaneo (240 * 1 * 2 = 480 bytes)
        # Libera exactamente los ~1.5 KB de memoria DMA que le faltan al buffer RX 10 de Wi-Fi
        _BUF_SIZE = width * 1 * 2
        try:
            fb1 = self.display_bus.allocate_framebuffer(
                _BUF_SIZE, lcd_bus.MEMORY_INTERNAL | lcd_bus.MEMORY_DMA
            )
        except (TypeError, AttributeError):
            fb1 = self.display_bus.allocate_framebuffer(_BUF_SIZE)

        self.display = jd9853.JD9853(
            data_bus=self.display_bus,
            display_width=width,
            display_height=height,
            frame_buffer1=fb1,
            backlight_pin=bl,
            reset_pin=rst,
            reset_state=jd9853.STATE_LOW,
            backlight_on_state=jd9853.STATE_HIGH,
            color_space=lv.COLOR_FORMAT.RGB565,
            color_byte_order=jd9853.BYTE_ORDER_BGR,
            rgb565_byte_swap=True,
            offset_x=0,
            offset_y=0,
        )
        self.display.init()
        self.display.set_color_inversion(True)
        self.display.set_backlight(100)

        self._last_step = time.ticks_ms()
        self._time_passed = 1000
        self.current_state = self.STATE_LOADING

        # 2. Pantalla de carga activa inmediatamente
        self.scr_loading = lv.screen_active()
        self.scr_loading.set_style_bg_color(lv.color_hex(0x000000), 0)
        self.scr_loading.set_style_bg_opa(lv.OPA.COVER, 0)

        # Cargar zorro y spinner
        self._setup_fox()
        self._setup_spinner()

        # Las pantallas de éxito/error se crearán bajo demanda para ahorrar RAM
        self.scr_success = None
        self.scr_error = None

        # Render inicial inmediato para quitar estática
        for _ in range(3):
            lv.tick_inc(30)
            lv.task_handler()

    def _setup_fox(self):
        try:
            with open(self.fox_path, "rb") as f:
                data = f.read()

            self.fox_dsc = lv.image_dsc_t(
                {
                    "header": {
                        "magic": lv.IMAGE_HEADER_MAGIC,
                        "w": 43,
                        "h": 37,
                        "cf": lv.COLOR_FORMAT.ARGB8888,
                    },
                    "data_size": len(data),
                    "data": data,
                }
            )
            del data
            gc.collect()

            self.fox = lv.image(self.scr_loading)
            self.fox.set_src(self.fox_dsc)
            self.fox.set_antialias(False)
            self.fox.set_scale(256 * 4)
            self.fox.align(lv.ALIGN.CENTER, 0, 40)
        except Exception as e:
            print(f"[Display] Error al cargar fox bitmap: {e}")

    def _setup_spinner(self):
        self.n_dots = 10
        self.radius = 30
        self.dot_size = 10
        self.fade = (255, 190, 130, 80, 40)
        self.dots = []
        center_x = 0
        center_y = 44

        for i in range(self.n_dots):
            angle = (2 * math.pi * i) / self.n_dots
            x = center_x + int(self.radius * math.cos(angle))
            y = center_y + int(self.radius * math.sin(angle))

            dot = lv.obj(self.scr_loading)
            dot.set_size(self.dot_size, self.dot_size)
            dot.set_style_radius(0, 0)
            dot.set_style_bg_color(lv.color_hex(0xFFFFFF), 0)
            dot.set_style_border_width(0, 0)
            dot.set_style_bg_opa(self.fade[-1], 0)
            dot.align(lv.ALIGN.TOP_MID, x, y)
            self.dots.append(dot)

        self.head = 0
        self.lbl_loading = lv.label(self.scr_loading)
        self.lbl_loading.set_text("Iniciando...")
        self.lbl_loading.set_style_text_color(lv.color_hex(0xAAAAAA), 0)
        self.lbl_loading.align(lv.ALIGN.BOTTOM_MID, 0, -20)

    # --- Creación bajo demanda (Lazy loading) ---
    def show_success(self, detail="Acceso Correcto"):
        self.current_state = self.STATE_SUCCESS
        if self.scr_success is None:
            self.scr_success = lv.obj()
            self.scr_success.set_style_bg_color(lv.color_hex(0x0E3A1A), 0)

            box = lv.obj(self.scr_success)
            box.set_size(70, 70)
            box.set_style_radius(10, 0)
            box.set_style_bg_color(lv.color_hex(0x27AE60), 0)
            box.align(lv.ALIGN.CENTER, 0, -30)

            lbl = lv.label(self.scr_success)
            lbl.set_text("EXITO")
            lbl.set_style_text_color(lv.color_hex(0xFFFFFF), 0)
            lbl.align(lv.ALIGN.CENTER, 0, 30)

            self.lbl_success_detail = lv.label(self.scr_success)
            self.lbl_success_detail.set_style_text_color(
                lv.color_hex(0xBDC3C7), 0
            )
            self.lbl_success_detail.align(lv.ALIGN.CENTER, 0, 55)

        self.lbl_success_detail.set_text(detail)
        lv.screen_load(self.scr_success)

    def show_error(self, detail="Error"):
        self.current_state = self.STATE_ERROR
        if self.scr_error is None:
            self.scr_error = lv.obj()
            self.scr_error.set_style_bg_color(lv.color_hex(0x3B1111), 0)

            box = lv.obj(self.scr_error)
            box.set_size(70, 70)
            box.set_style_radius(10, 0)
            box.set_style_bg_color(lv.color_hex(0xE74C3C), 0)
            box.align(lv.ALIGN.CENTER, 0, -30)

            lbl = lv.label(self.scr_error)
            lbl.set_text("ERROR")
            lbl.set_style_text_color(lv.color_hex(0xFFFFFF), 0)
            lbl.align(lv.ALIGN.CENTER, 0, 30)

            self.lbl_error_detail = lv.label(self.scr_error)
            self.lbl_error_detail.set_style_text_color(
                lv.color_hex(0xBDC3C7), 0
            )
            self.lbl_error_detail.align(lv.ALIGN.CENTER, 0, 55)

        self.lbl_error_detail.set_text(detail)
        lv.screen_load(self.scr_error)

    def show_loading(self, message="Cargando..."):
        self.current_state = self.STATE_LOADING
        self.lbl_loading.set_text(message)
        lv.screen_load(self.scr_loading)

    def _update_dots(self):
        fade_len = len(self.fade)
        for i, dot in enumerate(self.dots):
            back = (self.head - i) % self.n_dots
            opa = self.fade[back] if back < fade_len else 0
            dot.set_style_bg_opa(opa, 0)

    def update(self):
        start = time.ticks_ms()
        time.sleep_ms(1)

        lv.tick_inc(self._time_passed)
        lv.task_handler()

        if self.current_state == self.STATE_LOADING:
            now = time.ticks_ms()
            if time.ticks_diff(now, self._last_step) >= self.step_ms:
                self.head = (self.head + 1) % self.n_dots
                self._update_dots()
                self._last_step = now

        end = time.ticks_ms()
        self._time_passed = time.ticks_diff(end, start)