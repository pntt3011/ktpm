from info.code_info import CodeInfo, ModuleImportInfo


class TorchFunctionInfo(CodeInfo):
    @classmethod
    def generate_code(cls, single_node):
        codes = {
            'import': '',
            'declaration': '',
            'usage': '',
        }
        codes['import'] = cls.module.import_code

        input = ', '.join([v for k, v in single_node.inputs.items()])
        output = ', '.join([v for k, v in single_node.outputs.items()])
        params = ', '.join([f'{cls.params_mapping[p]}={v}' for p, v in single_node.params.items()])
        codes['usage'] = f'{output} = {cls.module.alias}.{cls.torch_name}({input}, {params})'

        return codes


class AddFunctionInfo(TorchFunctionInfo):
    module = ModuleImportInfo(import_code='import torch', alias='torch')
    torch_name = 'add'
    params_mapping = {}


class FlattenFunctionInfo(TorchFunctionInfo):
    module = ModuleImportInfo(import_code='import torch', alias='torch')
    torch_name = 'flatten'
    params_mapping = {
        'start_dim': 'start_dim',
        'end_dim': 'end_dim'
    }