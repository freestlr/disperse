function Gate(method, value) {
	this.inputs = {}
	this.method = method
	this.value  = value
	this.events = new EventEmitter
}

Gate.prototype = {

	on: function(pin) {
		this.set(true, pin)
	},

	off: function(pin) {
		this.set(false, pin)
	},

	set: function(state, pin) {
		if(this.inputs[pin] === state) return

		this.inputs[pin] = state
		this.check()
	},

	will: function(state, pin) {
		var self = this
		return function() { self.set(state, pin) }
	},

	check: function(force) {
		var value

		var pins = Object.keys(this.inputs)
		if(pins.length) {
			value = this.inputs[pins[0]]
			for(var i = 1; i < pins.length; i++) {
				value = this.method(value, this.inputs[pins[i]])
			}
		} else {
			value = this.value
		}

		if(!this.value !== !value || force) {
			this.events.emit(value ? 'opened' : 'closed', !!value)
		}

		if(this.value !== value || force) {
			this.value = value
			this.events.emit('change', value)
		}
	},

	constructor: Gate
}

Gate.MULTIPLY = function(a, b) { return a *  b }
Gate.ADD      = function(a, b) { return a +  b }
Gate.AND      = function(a, b) { return a && b }
Gate.OR       = function(a, b) { return a || b }
