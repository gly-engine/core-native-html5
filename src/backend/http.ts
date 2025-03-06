export function native_http_handler(self) {
    const method = self.method
    const headers = new Headers(self.header_dict)
    const params = new URLSearchParams(self.param_dict)
    const url = params.toString() ? `${self.url}?${params.toString()}` : self.url;
    const body = ['HEAD', 'GET'].includes(method) ? null : self.body_content
    self.promise()
    fetch(url, {
        body: body,
        method: method,
        headers: headers
    })
    .then((response) => {
        self.set('ok', response.ok)
        self.set('status', response.status)
        return response.text()
    })
    .then((content) => {
        self.set('body', content)
        self.resolve()
    })
    .catch((error) => {
        self.set('ok', false)
        self.set('error', `${error}`)
        self.resolve()
    })
}
