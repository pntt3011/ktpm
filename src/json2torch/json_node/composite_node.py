from json_node.json_node import JsonNode

class CompositeNode(JsonNode):
    def __init__(self, id, label, params, inputs, outputs):
        self.id = id
        self.label = label
        self.params = params
        self.inputs = inputs
        self.outputs = outputs

    def generate_code(self):
        lib_import, declaration, usage = [], [], []

        ready_var = {id: len(node.inputs) for id, node in self.params.items()}
        stack = [inode for inode in self.params.values() if inode.label=='input_node']

        while stack:
            current_node = stack.pop()

            if ready_var[current_node.id]==0:
                c = current_node.generate_code()
                lib_import.append(c['import'])
                declaration.append(c['declaration'])
                usage.append(c['usage'])

                for next_id in current_node.outputs.keys():
                    if ready_var[next_id] > 0:
                        ready_var[next_id] -= 1
                        if self.params[next_id] in stack: 
                            stack.remove(self.params[next_id])
                        stack.append(self.params[next_id])

            elif ready_var[current_node.id] > 0:
                stack.insert(0, current_node)

        lib_import = set('\n'.join(lib_import).split('\n'))
        lib_import = '\n'.join([s for s in lib_import if s])
        declaration = '\n'.join([s for s in declaration if s])
        usage = '\n'.join([s for s in usage if s])

        return {
            'import': lib_import,
            'declaration': declaration,
            'usage': usage
        }