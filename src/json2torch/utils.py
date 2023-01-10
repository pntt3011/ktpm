def list_to_dict(list_data, key_field):
    return dict({item[key_field]: item for item in list_data})
