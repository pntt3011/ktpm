from info.code_info import CodeInfo, ModuleImportInfo

class TorchLayerInfo(CodeInfo):
    # module_import = 'torch.nn'
    # torch_name = 'Conv2d'

    # Represented params: Real params
    # params_mapping = {
    #     'in_channel': 'in_channels',
    #     'out_channel': 'out_channel',
    #     'kernel_size': '"kernel_size',
    #     'stride': 'stride',
    #     'bias': 'bias'
    # }

    @classmethod
    def generate_code(cls, single_node):
        codes = {
            'import': '',
            'declaration': '',
            'usage': '',
        }
        codes['import'] = cls.module.import_code
        
        name = f'{cls.torch_name}_{single_node.id}'
        params = ', '.join([f'{cls.params_mapping[p]}={v}' for p, v in single_node.params.items()])
        codes['declaration'] = f'self.{name} = {cls.module.alias}.{cls.torch_name}({params})'

        input = ', '.join([v for k, v in single_node.inputs.items()])
        output = ', '.join([v for k, v in single_node.outputs.items()])
        codes['usage'] = f'{output} = self.{name}({input})'

        return codes
        
        
class Conv2dLayerInfo(TorchLayerInfo):
    module = ModuleImportInfo(import_code='import torch.nn as nn', alias='nn')
    torch_name = 'Conv2d'
    params_mapping = {
        'in_channel': 'in_channels',
        'out_channel': 'out_channels',
        'kernel_size': 'kernel_size',
        'stride': 'stride',
        'padding': 'padding',
        'bias': 'bias',
    }


class Batchnorm2dLayerInfo(TorchLayerInfo):
    module = ModuleImportInfo(import_code='import torch.nn as nn', alias='nn')
    torch_name = 'BatchNorm2d'
    params_mapping = {
        'channel': 'num_features',
    }


class AdaptiveAvgPool2dLayerInfo(TorchLayerInfo):
    module = ModuleImportInfo(import_code='import torch.nn as nn', alias='nn')
    torch_name = 'AdaptiveAvgPool2d'
    params_mapping = {
        'output_size': 'output_size',
    }


# class FlattenLayerInfo(TorchLayerInfo):
#     module = ModuleImportInfo(import_code='import torch.nn as nn', alias='nn')
#     torch_name = 'Flatten'
#     params_mapping = {
#         'start_dim': 'start_dim',
#         'end_dim': 'end_dim'
#     }


class LinearLayerInfo(TorchLayerInfo):
    module = ModuleImportInfo(import_code='import torch.nn as nn', alias='nn')
    torch_name = 'Linear'
    params_mapping = {
        'in_dim': 'in_features', 
        'out_dim': 'out_features',
    }


class ReLULayerInfo(TorchLayerInfo):
    module = ModuleImportInfo(import_code='import torch.nn as nn', alias='nn')
    torch_name = 'ReLU'
    params_mapping = {}


class SigmoidLayerInfo(TorchLayerInfo):
    module = ModuleImportInfo(import_code='import torch.nn as nn', alias='nn')
    torch_name = 'Sigmoid'
    params_mapping = {}






