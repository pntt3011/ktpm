from abc import ABC, abstractmethod

class JsonNode(ABC):
    id: str
    label: str
    params: dict
    inputs: dict
    outputs: dict

    @abstractmethod
    def generate_code(self):
        pass




