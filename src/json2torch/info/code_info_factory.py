import info.inout_info as inout_info
import info.torch_function_info as torch_function_info
import info.torch_layer_info as torch_layer_info

code_info_mapping = {
    # Input/Output
    'input_node': inout_info.InputInfo,
    'output_node': inout_info.OutputInfo,

    # Layer
    'conv2d': torch_layer_info.Conv2dLayerInfo,
    'avgpool2d': torch_layer_info.AdaptiveAvgPool2dLayerInfo,
    'batchnorm2d': torch_layer_info.Batchnorm2dLayerInfo,
    'fc': torch_layer_info.LinearLayerInfo,
    'relu': torch_layer_info.ReLULayerInfo,
    'sigmoid': torch_layer_info.SigmoidLayerInfo,

    # Function
    'elewise_plus': torch_function_info.AddFunctionInfo,
    'flatten': torch_function_info.FlattenFunctionInfo,
}

def get_code_info(label: str):
    return code_info_mapping[label]
