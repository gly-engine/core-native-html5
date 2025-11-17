export function native_system_get_language()
{
    return navigator.language 
}

export function native_system_get_env(var_name: string)
{
    const hash = location.hash.substring(1); 
    const params = new URLSearchParams(hash);
    return params.get(var_name)
}
