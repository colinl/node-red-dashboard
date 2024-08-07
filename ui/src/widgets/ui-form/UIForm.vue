<template>
    <label v-if="label" class="nrdb-ui-form-label">{{ label }}</label>
    <v-form ref="form" v-model="isValid" :disabled="!state.enabled" validate-on="input" @submit.prevent="onSubmit">
        <div class="nrdb-ui-form-rows" :class="{'nrdb-ui-form-rows--split': props.splitLayout}">
            <div v-for="row in options" :key="row.key" class="nrdb-ui-form-row" :data-form="`form-row-${row.key}`">
                <v-checkbox v-if="row.type === 'checkbox'" v-model="input[row.key]" :label="row.label" hide-details="auto" />
                <v-switch v-else-if="row.type === 'switch'" v-model="input[row.key]" class="nrdb-ui-widget" :label="row.label" :class="{'active': state}" hide-details="auto" color="primary" />
                <v-textarea
                    v-else-if="row.type === 'multiline'"
                    v-model="input[row.key]" :rules="rules(row)"
                    class="nrdb-ui-widget nrdb-ui-text-field" :rows="row.rows"
                    :label="row.label" variant="outlined" hide-details="auto"
                />
                <v-text-field
                    v-else
                    v-model="input[row.key]" :rules="rules(row)"
                    class="nrdb-ui-widget nrdb-ui-text-field"
                    :label="row.label" :type="row.type" variant="outlined" hide-details="auto"
                />
            </div>
        </div>
        <div class="nrdb-ui-form-actions">
            <v-btn data-action="form-submit" type="submit" variant="flat" size="large" :disabled="submitEnabled">{{ props.submit || 'submit' }}</v-btn>
            <v-btn v-if="props.cancel" data-action="form-clear" variant="outlined" :disabled="!state.enabled" size="large" @click="clear">{{ props.cancel }}</v-btn>
        </div>
    </v-form>
</template>

<script>

import { useDataTracker } from '../data-tracker.mjs' // eslint-disable-line import/order
import { mapState } from 'vuex' // eslint-disable-line import/order

export default {
    name: 'DBUIForm',
    inject: ['$socket'],
    props: {
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            input: {},
            isValid: null,
            dynamic: {
                label: null,
                options: null
            }
        }
    },
    computed: {
        ...mapState('data', ['messages']),
        label: function () {
            return this.dynamic.label !== null ? this.dynamic.label : this.props.label
        },
        options: function () {
            return this.dynamic.options !== null ? this.dynamic.options : this.props.options
        },
        submitEnabled: function () {
            return !(this.isValid && !!this.state.enabled)
        }
    },
    created () {
        // can't do this in setup as we are using custom onInput function that needs access to 'this'
        useDataTracker(this.id, this.onInput, null, this.onDynamicProperties)
    },
    mounted () {
        this.reset()
    },
    methods: {
        onSubmit: function () {
            // Prevent sending null for switch and combobox, if type number send as Number or null if nothing present on text field and if other fields not present, send empty string
            const option = this.options
            option.forEach(opt => {
                if (opt.type === 'checkbox' || opt.type === 'switch') {
                    if (typeof (this.input[opt.key]) === 'undefined' || this.input[opt.key] === null) {
                        this.input[opt.key] = false
                    }
                } else if (opt.type === 'number') {
                    if (typeof (this.input[opt.key]) === 'undefined' || this.input[opt.key] === null) {
                        this.input[opt.key] = null
                    } else {
                        if (isNaN(this.input[opt.key])) {
                            this.input[opt.key] = null
                        } else {
                            this.input[opt.key] = Number(this.input[opt.key])
                        }
                    }
                } else {
                    if (typeof (this.input[opt.key]) === 'undefined' || this.input[opt.key] === null) {
                        this.input[opt.key] = ''
                    }
                }
            })

            this.$socket.emit('widget-action', this.id, {
                payload: this.input
            })
            if (this.props.resetOnSubmit) {
                this.reset()
            }
        },
        clear () {
            this.reset()
        },
        reset () {
            this.$refs.form.reset()
        },
        validate () {
            this.$refs.form.validate()
        },
        rules (row) {
            if (row.required) {
                // is required
                return [(v) => {
                    return !!v || row.label + ' is required'
                }]
            } else {
                // no rules
                return []
            }
        },
        onInput (msg) {
            if (msg.payload) {
                const payload = msg.payload
                for (const key in payload) {
                    this.input[key] = payload[key]
                }
                this.$nextTick(() => { this.validate() })
            }
        },
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (typeof updates?.label !== 'undefined') {
                this.dynamic.label = updates.label
            }
            if (typeof updates?.options !== 'undefined') {
                this.dynamic.options = updates.options
            }
        }
    }
}
</script>

<style scoped>
</style>
