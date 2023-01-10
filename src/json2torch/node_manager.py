import sys
from pathlib import Path
FILE = Path(__file__).resolve()
ROOT = FILE.parents[0]  # YOLOv5 root directory
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))  # add ROOT to PATH

import utils
from json_node.json_node import JsonNode
from json_node.single_node import SingleNode
from json_node.composite_node import CompositeNode
from code_combiner import CodeCombiner


class NodeManager():
    def __init__(self, json_data, name='CustomModel', key_field='id'):
        self.name = name
        self.key_filed = key_field
        self.nodes_info = utils.list_to_dict(json_data, self.key_filed)
        self.create_nodes()
        self.input_nodes = self.find_input_nodes()
        self.output_node = self.find_output_node()
        self.create_model_node()

    def create_nodes(self):
        self._nodes = {}
        self._created = {nid: False for nid in self.nodes_info.keys()} 
        for nid, ninfo in self.nodes_info.items():
            if not self._created[nid]:
                self._nodes[ninfo[self.key_filed]] = self.create_new_node(ninfo)

    def create_model_node(self):
        model_node_info = {
            'id': 0,
            'label': 'composite',
            'params': {nid: node for nid, node in self._nodes.items()},
            'inputs': {},
            'outputs': {},
        }

        self.model_node = CompositeNode(**model_node_info)

    def create_new_node(self, node_info: dict) -> JsonNode:
        if node_info['label'] != 'composite':
            new_node = SingleNode(**node_info)
        else:
            sub_nodes = {}
            composite_node_info = node_info.copy()
            for child_id in composite_node_info['params']['children']:
                if child_id in self._nodes.keys():
                    sub_nodes[child_id] = self._nodes.pop(child_id)
                else:
                    sub_nodes[child_id] = self.create_new_node(self.nodes_info[child_id]) 
            
            composite_node_info['params'] = sub_nodes
            new_node = CompositeNode(**composite_node_info)

        self._created[node_info[self.key_filed]] = True
        return new_node

    def find_input_nodes(self):
        inodes = []
        for id, node in self._nodes.items():
            if node.label == 'input_node':
                inodes.append(node)
        return inodes

    def find_output_node(self):
        for id, node in self._nodes.items():
            if node.label == 'output_node':
                return node
        
        return None

    def export_code(self):
        input_forward = [inode.outputs[sorted(inode.outputs.keys())[0]] for inode in self.input_nodes]
        output_forward = [] if self.output_node==None else [v for v in self.output_node.inputs.values()]

        model_code = self.model_node.generate_code()

        final_code = CodeCombiner.combine(
                        model_name=self.name,
                        code_parts=model_code,
                        io_forward={'in': input_forward, 'out': output_forward},
            )

        return final_code

        
