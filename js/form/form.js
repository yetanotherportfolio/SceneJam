export default class MagicForm {
    constructor (elem, form, form_name, values, cb) {
        this.elem = elem ? document.querySelector(elem) : null
        this.form_name = form_name
        this.form = form
        this.values = values
        this.cb = cb
    }

    add_event_handlers (elem) {
        if (this.elem !== null) {

            // add array elem
            const form_add_elems = this.elem.querySelectorAll(`.${this.form_name}-add`)
            form_add_elems.forEach((elem) => {
                elem.addEventListener('click', (evt) => {
                    this.on_array_add(evt)
                })
            })

            // remove array elem
            const form_array_btns = this.elem.querySelectorAll('.form-array-remove')
            form_array_btns.forEach((elem) => {
                elem.addEventListener('click', (evt) => {
                    const i = parseInt(evt.target.dataset.arrayI, 10)
                    const name = evt.target.dataset.arrayName
                    this.form[name].array_remove(i, this.values[name])
                    this.render()
                    this.update_values()
                })
            })

            // input changes
            const form_input_elems = this.elem.querySelectorAll('.form-input')
            form_input_elems.forEach((elem) => {
                elem.addEventListener('change', (evt) => {
                    const form_name = evt.target.dataset.formName
                    const input_name = evt.target.dataset.formInputName
                    this.update_values()
                    if (this.cb) {
                        let k = null

                        // FIXME
                        const splited = form_name.split('-')
                        if (splited.length > 1) {
                            const _form_name = splited[0]

                            k = _form_name
                        } else {
                            k = input_name
                        }

                        /* if (old_value != this.values[k]) */this.cb(k, this.values[k])
                    }
                })
            })
        }

        // custom event listerner
        for (const name in this.form) {
            if (this.form[name].add_event_handlers !== undefined) {
                this.form[name].add_event_handlers(this.elem || elem)
            }
        }
    }

    update_values () {
        try {
            const _values = this.validate()
            for (const k in _values) {
                if (this.form[k].usedefault) {
                    this.values[k] = _values[k]
                } else if (this.form[k].value === _values[k]) {
                    delete this.values[k]
                } else if (this.form[k].value !== _values[k]) {
                    this.values[k] = _values[k]
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    render () {
        let form_txt = ''
        for (const name in this.form) {
            form_txt += this.form[name].render(
                this.form_name, name, this.values[name]
            )
        }

        if (this.elem) {
            this.elem.innerHTML = form_txt
            this.add_event_handlers()
        }

        return form_txt
    }

    validate (elem) {
        const form_values = {}
        for (const name in this.form) {
            if (this.form[name].validate === undefined) continue

            const _value = this.form[name].validate(
                this.elem ? this.elem : elem, this.form_name, name
            )

            if (_value !== undefined) form_values[name] = _value
        }
        return form_values
    }

    on_array_add (evt) {
        const name = evt.target.dataset.formArrayName
        this.form[name].on_array_add(name)
        this.render()
    }

    reset () {
        for (const name in this.form) {
            if (this.form[name].forms !== undefined) {
                this.form[name].forms = []
            }
        }
    }
}
