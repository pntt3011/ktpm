def IntType(value):
    return { "type" : "integer", "value": int(value) }


def BooleanType(value):
    return { "type" : "boolean", "value": bool(value) }


def IntListType(value):
    return { "type": "list_integer", "value": value }


def StringListType(value):
    return { "type": "list_string", "value": value }


def Node(name: str, short_name: str = None, params: dict = {}, shape: str = None):
    result = {
        "name": name,
        "short_name": short_name,
        "params": params,
        "shape": shape
    } 
    
    if short_name is None:
        result["short_name"] = name

    if params is None:
        result["params"] = {}

    if shape is None:
        result["shape"] = "rect"

    return result


nodes = {
    "input": Node("Input", shape = "circle"),
    "output": Node("Output", shape = "circle"),
    "conv2d": Node(
        "Convolution", 
        "Conv",
        { 
        "in_channel": IntType(3),
            "out_channel": IntType(3),
            "kernel_size": IntType(1),
            "stride": IntType(1),
            "padding": IntType(0),
            "bias": BooleanType(True),
        }
    ),
    "batchnorm2d": Node(
        "Batch Norm",
        "BN", 
        { 
            "channel": IntType(3) 
        } 
    ),
    "relu": Node("ReLU"),
    "elewise_plus": Node("Plus", shape="circle"),
    "composite": Node(
        "Composite",
        "Comp", 
        { 
            "children": StringListType([]) 
        }
    ),
    "avgpool2d": Node(
        "Avg Pooling",
        "AvgPool",
        {
            "output_size": IntListType([1, 1]) 
        }
    ),
    "flatten": Node(
        "Flatten", 
        params = { 
            "start_dim": IntType(1) 
        }, 
    ),
    "fc": Node(
        "Fully-connected",
        "FC",
        {
            "in_dim": IntType(100),
            "out_dim": IntType(1),
        }
    ),
    "sigmoid": Node("Sigmoid")
}