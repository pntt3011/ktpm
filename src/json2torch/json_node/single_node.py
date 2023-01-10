from json_node.json_node import JsonNode
from info.code_info_factory import get_torch_info


class SingleNode(JsonNode):
    def __init__(self, id, label, params, inputs, outputs):
        self.id = id
        self.label = label
        self.params = params
        self.inputs = inputs
        self.outputs = outputs

    def generate_code(self):
        code_generator = get_torch_info(self.label)
        return code_generator.generate_code(self)