import backend_builder from './backend'

export function native_core_html5() {

    const backend = backend_builder(document.createElement('canvas'))

    return {
        backend
    }
}
