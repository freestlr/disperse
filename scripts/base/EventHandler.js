function EventHandler(func, scope, data, once) {
	if(typeof func !== 'function') {
		throw Error('EventHandler expects function as 1st argument')
	}

	this.func  = func
	this.scope = scope
	this.data  = data == null ? [] : [].concat(data)
	this.once  = once

	this.listens = []
}

EventHandler.prototype = {
	handleEvent: function(e) {
		return this.apply(e)
	},

	apply: function(data) {
		if(this.once) this.release()
		return this.func.apply(this.scope, [].concat(this.data, data || []))
	},

	listen: function(type, element, capture) {
		if(this.element) this.release()

		this.type    = type
		this.element = element
		this.capture = !!capture

		if(this.element && this.element.addEventListener) {
			this.element.addEventListener(this.type, this, this.capture)
		}

		return this
	},

	release: function() {
		if(this.element && this.element.removeEventListener) {
			this.element.removeEventListener(this.type, this, this.capture)
		}

		delete this.element
		return this
	}
}
