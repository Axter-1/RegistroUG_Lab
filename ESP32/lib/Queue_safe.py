class ThreadSafeQueue:
    def __init__(self, maxsize=10):
        self._queue = []
        self._maxsize = maxsize
        self._lock = _thread.allocate_lock()

    def put(self, item):
        with self._lock:
            if len(self._queue) < self._maxsize:
                self._queue.append(item)
                return True
            return False  # Cola llena

    def get(self):
        with self._lock:
            if len(self._queue) > 0:
                return self._queue.pop(0)  # Extrae el primer elemento (FIFO)
            return None

    def empty(self):
        with self._lock:
            return len(self._queue) == 0
