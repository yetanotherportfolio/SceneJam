export default class Component {
    constructor (elem) {
        this.elem = document.querySelector(elem)

        this.handlers = []
        this._add_event_handlers()
    }

    on (query, event, func) {
        this.handlers.push([query, event, func])
        this._add_event_handler(query, event, func)
    }

    tpl () { return '' }

    render (...args) {
        this.render_tpl(...args)
        this._add_event_handlers()
    }

    _add_event_handler (query, event, func) {
        const elems = this.elem.querySelectorAll(query)
        elems.forEach((elem) => {
            elem.addEventListener(event, func)
        })
    }

    _add_event_handlers () {
        for (const i in this.handlers) {
            this._add_event_handler(
                this.handlers[i][0],
                this.handlers[i][1],
                this.handlers[i][2]
            )
        }
    }

    get_tpl_context (...args) {
        return args
    }

    render_tpl (...args) {
        this.elem.innerHTML = this.tpl(
            ...this.get_tpl_context(...args)
        )
    }
}
