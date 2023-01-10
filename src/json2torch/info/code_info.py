from abc import ABC, abstractmethod


class ModuleImportInfo:
    def __init__(self, import_code, alias) -> None:
        self.import_code = import_code
        self.alias = alias


class CodeInfo(ABC):
    module = ModuleImportInfo
    torch_name: str
    params_mapping: dict

    @abstractmethod
    def generate_code(cls, single_node):
        pass