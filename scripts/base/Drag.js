function Drag(element) {
	this.element = element
	this.events  = new EventEmitter

	this.offset = { x: 0, y: 0 }
	this.origin = { x: 0, y: 0 }
	this.point  = { x: 0, y: 0 }
	this.mouse  = { x: 0, y: 0 }
	this.begin  = { x: 0, y: 0 }
	this.delta  = { x: 0, y: 0 }
	this.scale  = { x: 1, y: 1 }
	this.moves  = 0

	this.min = { x: -Infinity, y: -Infinity }
	this.max = { x:  Infinity, y:  Infinity }

	this.bind('mousedown',  this.element)
	this.bind('touchstart', this.element)
}

Drag.prototype = {
	active: false,
	disabled: false,

	start: function(x, y) {
		this.active = true
		this.moves = 0

		this.begin.x = x
		this.begin.y = y

		this.origin.x = this.point.x
		this.origin.y = this.point.y

		this.offset.x = this.delta.x = 0
		this.offset.y = this.delta.y = 0
	},

	move: function(x, y) {
		if(!this.active) return

		this.moves++

		this.delta.x = -this.point.x
		this.delta.y = -this.point.y

		this.offset.x = (x - this.begin.x) * this.scale.x
		this.offset.y = (y - this.begin.y) * this.scale.y

		this.point.x = Math.min(this.max.x, Math.max(this.min.x, this.origin.x + this.offset.x))
		this.point.y = Math.min(this.max.y, Math.max(this.min.y, this.origin.y + this.offset.y))

		this.delta.x += this.point.x
		this.delta.y += this.point.y
	},

	end: function() {
		this.active = false
	},


	enable: function() {
		this.disabled = false
	},

	disable: function() {
		this.active && this.end()
		this.disabled = true
	},


	bind: function(type, elem) {
		if(elem) elem.addEventListener(type, this)
	},

	unbind: function(type, elem) {
		if(elem) elem.removeEventListener(type, this)
	},


	handleEvent: function(e) {
		if(this.disabled) return

		this.mouse.x = 0
		this.mouse.y = 0

		if(e.touches) {
			var l = e.touches.length
			for(var i = 0; i < l; i++) {
				var p = e.touches[i]

				this.mouse.x += p.pageX
				this.mouse.y += p.pageY
			}

			this.mouse.x /= l
			this.mouse.y /= l

		} else {
			this.mouse.x = e.pageX
			this.mouse.y = e.pageY
		}


		var emitEvent
		switch(e.type) {
			case 'mousedown':
				if(e.which !== 1) return

				if(!this.mouseActive) {
					this.mouseActive = true
					this.bind('mousemove', window)
					this.bind('mouseup', window)
				}
				this.start(this.mouse.x, this.mouse.y)
				emitEvent = 'start'
			break

			case 'mousemove':
				if(!this.mouseActive) return

				this.move(this.mouse.x, this.mouse.y)
				emitEvent = 'drag'
			break

			case 'mouseup':
				if(!this.mouseActive) return
				this.mouseActive = false
				this.unbind('mousemove', window)
				this.unbind('mouseup', window)

				this.end()
				emitEvent = 'end'
			break



			case 'touchstart':
				if(!this.touchActive) {
					this.touchActive = true
					this.bind('touchstart', window)
					this.bind('touchmove', window)
					this.bind('touchend', window)
					this.unbind('touchstart', this.element)
				}
				this.start(this.mouse.x, this.mouse.y)
				emitEvent = 'start'
			break

			case 'touchmove':
				if(!this.touchActive) return

				this.move(this.mouse.x, this.mouse.y)
				emitEvent = 'drag'
			break

			case 'touchend':
				if(!this.touchActive) return

				if(e.touches.length) {
					this.start(this.mouse.x, this.mouse.y)

				} else {
					this.touchActive = false
					this.unbind('touchstart', window)
					this.unbind('touchmove', window)
					this.unbind('touchend', window)
					this.bind('touchstart', this.element)

					this.end()
					emitEvent = 'end'
				}
			break
		}

		if(emitEvent) this.events.emit(emitEvent, [this, e])

		e.preventDefault()
	}
}
