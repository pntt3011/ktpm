from abc import ABC, abstractmethod


class CodeInfo(ABC):
    @abstractmethod
    def generate_code(cls, single_node):
        pass

class ModuleImportInfo:
    def __init__(self, import_code, alias) -> None:
        self.import_code = import_code
        self.alias = alias
