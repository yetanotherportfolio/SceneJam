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
            const form_add_elems = this.elem.querySelectorAll(`.form-array-add`)
            form_add_elems.forEach((elem) => {
                elem.addEventListener('click', (evt) => {
                    this.on_array_add(evt)
                })
            })

            // remove array elem
            const form_array_btns = this.elem.querySelectorAll('.form-array-remove')
            form_array_btns.forEach((elem) => {
                elem.addEventListener('click', (evt) => {
                    this.on_array_remove(evt, true)
                })
            })

            // input changes
            const form_input_elems = this.elem.querySelectorAll('.form-input')
            form_input_elems.forEach((elem) => {
                elem.addEventListener('change', (evt) => {
                    this.on_change(evt)
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
        if (this.elem === null && elem === undefined) return

        for (const name in this.form) {
            if (this.form[name].validate === undefined) continue

            const _value = this.form[name].validate(
                this.elem ? this.elem : elem, this.form_name, name
            )

            if (_value !== undefined) form_values[name] = _value
        }
        return form_values
    }

    on_change (evt) {
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
    }

    on_array_remove (evt, update_values) {
        const i = parseInt(evt.target.dataset.arrayI, 10)
        const name = evt.target.dataset.arrayName
        const formName = evt.target.dataset.formName

        if (formName == this.form_name) {
            this.form[name].array_remove(i, this.values[name])
        } else {
            const parts = formName.split('-')
            this.form[parts[0]].forms[parts[1]].on_array_remove(evt, false)

            this.update_values()

        }

        this.render()
        this.on_change(evt)
    }

    on_array_add (evt) {
        const arrName = evt.target.dataset.formArrayName
        const formName = evt.target.dataset.formName

        if (formName == this.form_name) {
            this.form[arrName].on_array_add(arrName)
        } else {
            const parts = formName.split('-')
            this.form[parts[0]].forms[parts[1]].on_array_add(evt)
        }

        this.render()
        this.on_change(evt)
    }

    reset () {
        for (const name in this.form) {
            if (this.form[name].forms !== undefined) {
                this.form[name].forms = []
            }
        }
    }
}
