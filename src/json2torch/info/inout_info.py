from info.code_info import CodeInfo


class InputInfo(CodeInfo):
    @classmethod
    def generate_code(cls, single_node):
        codes = {
            'import': '',
            'declaration': '',
            'usage': '',
        }
        first_key = sorted(single_node.outputs.keys())[0]
        first_val = single_node.outputs[first_key]
        
        codes['usage'] = '\n'.join([f'{val} = {first_val}' for val in single_node.outputs.values() if val != first_val])

        return codes


class OutputInfo(CodeInfo):
    @classmethod
    def generate_code(cls, single_node):
        codes = {
            'import': '',
            'declaration': '',
            'usage': '',
        }

        # output_string = ', '.join(single_node.inputs.values())
        # codes['usage'] = f'return {output_string}'

        return codes