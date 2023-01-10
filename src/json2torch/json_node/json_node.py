from abc import ABC, abstractmethod

class JsonNode(ABC):
    @abstractmethod
    def generate_code(self):
        pass




