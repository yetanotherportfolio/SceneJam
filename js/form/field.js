import MagicForm from './form.js'

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
export class Field {
    constructor (type, params, value, usedefault) {
        this.type = type || 'text'
        this.value = value || ''
        this.usedefault = usedefault !== undefined

        this.params = {}
        if (params) Object.assign(this.params, params)
    }

    copy () {
        return new this.constructor(
            this.type,
            this.params,
            this.value,
            this.usedefault
        )
    }

    get_class (form_name, name) {
        return `form-input ${form_name}-input ${form_name}-${name}`
    }

    get_dataset (form_name, name) {
        return `data-form-name="${form_name}" data-form-input-name="${name}"`
    }

    get_bound_block (open) {
        if (open) return '<p><label>'
        else return '</p></label>'
    }

    get_attr (_value) {
        let attr_txt = ''
        for (const k in this.params) {
            const val = this.params[k]
            attr_txt += `${k}="${val}" `
        }

        const value = _value !== undefined ? _value : this.value

        attr_txt += `type="${this.type}" `
        attr_txt += `value="${value}" `

        // FIXME
        if (this.type === 'checkbox') {
            if (value) {
                attr_txt += 'checked '
            }
        }

        return attr_txt
    }

    render (form_name, name, value) {
        return `${this.get_bound_block(true)}${name}:
            <input
             class="${this.get_class(form_name, name)}"
             ${this.get_dataset(form_name, name)}
             ${this.get_attr(value)}>${this.get_bound_block(false)}`
    }

    validate (elem, form_name, name) {
        const subelem = elem.querySelector(`.${form_name}-${name}`)

        if (subelem.validity.valid === false) {
            console.error(subelem, subelem.validity)
            throw new Error('invalid')
        }

        if (this.type === 'number') {
            const num = subelem.valueAsNumber
            if (!isNaN(num)) return num
        } else return subelem.value
    }
}

export class FieldBool extends Field {
    constructor (params, value) {
        super('checkbox', params, value)
    }

    copy () {
        return new this.constructor(
            this.params,
            this.value
        )
    }

    validate (elem, form_name, name) {
        const subelem = elem.querySelector(`.${form_name}-${name}`)
        return subelem.checked
    }
}

export class FieldNumBool extends FieldBool {
    validate (elem, form_name, name) {
        const subelem = elem.querySelector(`.${form_name}-${name}`)
        return subelem.checked ? -1 : 0
    }
}

export class FieldJSON extends Field {
    constructor (params, value, usedefault) {
        super('text', params, value, usedefault)
    }

    copy () {
        return new this.constructor(
            this.params,
            this.value,
            this.usedefault
        )
    }

    render (form_name, name, value) {
        const _value = JSON.stringify(
            value || this.value
        ).replaceAll('"', '&quot;')
        return super.render(form_name, name, _value)
    }

    validate (elem, form_name, name) {
        const subelem = elem.querySelector(`.${form_name}-${name}`)
        return JSON.parse(subelem.value.replaceAll('&quot;', '"'))
    }
}

export class FieldChoice extends Field {
    constructor (params, value) {
        super('', params, value || [])
    }

    copy () {
        return new this.constructor(
            this.params,
            this.value
        )
    }

    render (form_name, name, _value) {
        let options = ''

        for (const i in this.value) {
            const choice = this.value[i]
            options += `<option value="${choice}" ${choice === _value ? 'selected' : ''}>${choice}</option>`
        }

        return `${this.get_bound_block(true)}${name}:
            <select
             class="${this.get_class(form_name, name)}"
             ${this.get_dataset(form_name, name)}
             ${this.get_attr()}>${options}</select>${this.get_bound_block(false)}`
    }
}

/* export class FieldArray {
    constructor (form) {
        this.form = form
        this.forms = []
    }

    copy () {
        let f = new FieldArray()
        f.form = this.form
        f.forms = this.forms
        return f
    }

    get_sub_name (name, i) {
        return name + "-" + i
    }

    render (form_name, name, _values) {
        let content = ""
        let values = _values || []

        for (let i in this.forms) {
            const sub_name = this.get_sub_name(name, i)
            if (values[i]) this.forms[i].values = values[i]
            let form_content = this.forms[i].render(form_name, sub_name)
            if (!form_content) continue
            content += `<div class="form-array-container ${form_name}-${sub_name}-container">
                    <div>${form_content}</div><div>
                    <button class="form-array-remove"
                            data-array-i="${i}"
                            data-array-name="${name}">remove</button></div></div>`
        }

        return `<div class="${form_name} ${form_name}-container form-container">
            <div class="${form_name}-controls form-controls">${name}
                <button class="${form_name}-add form-array-add"
                 data-form-name="${form_name}"
                 data-form-array-name="${name}">add</button>
            </div>
            <div class="${form_name}-content form-content">${content}</div>
            </div>`
    }

    validate (elem, form_name, name) {
        let values = []
        for (let i in this.forms) {
            values.push(this.forms[i].validate(
                elem
            ))
        }
        return values
    }

    on_array_add (_name) {
        let i = this.forms.length

        let form_copy = {}
        for (let name in this.form) {
            form_copy[name] = this.form[name].copy()
        }

        this.forms.push(
            new MagicForm(
                null,
                form_copy,
                this.get_sub_name(_name, i),
                {}
            )
        )
    }

    array_remove (index, values) {
        this.forms.splice(index, 1)
        values.splice(index, 1)
    }
} */

export class FieldDict {
    constructor (form, key) {
        this.form = form
        this.forms = []
        this.key = key
    }

    copy () {
        const form_copy = {}
        for (const name in this.form) {
            form_copy[name] = this.form[name].copy()
        }

        const f = new FieldDict(form_copy, this.key)
        return f
    }

    get_sub_name (name, i) {
        return name + '-' + i
    }

    get_index (name) {
        return name.split('-')[1]
    }

    render (form_name, name, _values) {
        let content = ''
        const values = []
        for (const k in _values) {
            values.push(_values[k])
        }

        // this.forms = []
        while (this.forms.length < values.length) {
            this.on_array_add(name)
        }

        for (const i in this.forms) {
            const sub_name = this.get_sub_name(name, i)
            if (values[i]) this.forms[i].values = values[i]

            const form_content = this.forms[i].render()
            if (!form_content) continue

            content += `<div class="form-array-container ${form_name}-${sub_name}-container">
                    <div>${form_content}</div><div>
                    <button class="form-array-remove"
                            data-array-i="${i}"
                            data-array-name="${name}">remove</button></div></div>`
        }

        return `<div class="${form_name} ${form_name}-container form-container">
            <div class="${form_name}-controls form-controls">${name}
                <button class="${form_name}-add form-array-add"
                 data-form-name="${form_name}"
                 data-form-array-name="${name}">add</button>
            </div>
            <div class="${form_name}-content form-content">${content}</div>
            </div>`
    }

    validate (elem, form_name, name) {
        const values = {}
        for (const k in this.forms) {
            const val = this.forms[k].validate(
                elem
            )
            values[val[this.key]] = val
        }
        return values
    }

    on_array_add (_name) {
        const form_copy = {}
        for (const name in this.form) {
            form_copy[name] = this.form[name].copy()
        }
        const fk = this.forms.length

        this.forms.push(new MagicForm(
            null,
            form_copy,
            this.get_sub_name(_name, fk),
            {}
        ))
    }

    array_remove (index, values) {
        if (values) delete values[this.forms[index].values[this.key]]
        this.forms.splice(index, 1)
    }
}
