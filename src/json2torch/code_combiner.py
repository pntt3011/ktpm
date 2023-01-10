class CodeCombiner:
    tab = ['\t'*k for k in range(6)]

    @classmethod
    def combine(cls, model_name, code_parts, io_forward):
        class_declaration_code = f'class {model_name}(nn.Module):'
        import_code = code_parts['import']
        init_code = cls.generate_init_code(code_parts['declaration'])
        forward_code = cls.generate_forward_code(code_parts['usage'], ', '.join(io_forward['in']), ', '.join(io_forward['out']))

        final_code = f'{import_code}\
            \n\n\n{class_declaration_code}\
            \n{init_code}\
            \n\n{forward_code}'
        
        return final_code

    @classmethod
    def generate_init_code(cls, declaration):
        l0 = 'def __init__(self):'
        l1 = 'super().__init__()'
        ld = declaration.replace('\n', f'\n{cls.tab[2]}')
        return f'{cls.tab[1]}{l0}\n{cls.tab[2]}{l1}\n{cls.tab[2]}{ld}'

    @classmethod
    def generate_forward_code(cls, usage, input_string, output_string=''):
        li = f'def forward(self, {input_string}):'
        lo = f'return {output_string}'
        lu = usage.replace('\n', f'\n{cls.tab[2]}')
        return f'{cls.tab[1]}{li}\n{cls.tab[2]}{lu}\n{cls.tab[2]}{lo}'