Block.RangeInput = f.proto(Block, {
	PROTO: 'UI_RangeInput',
	ename: 'range-input',

	easingClass: 'out-00',
	divisions: 1,

	min: 0,
	max: 1,

	position: 0,
	value: 0,

	wheelElement: null,
	wheelStep: 1/12,
	wheelTimeLast: -1,
	wheelTimeDelta: 200,

	trunc: f.hround,

	round: function(v) {
		return f.mround(v, 2)
	},

	create: function() {
		this.wrap = dom.div('range-wrap', this.element)
		this.hit  = dom.div('range-hit absmid hand', this.wrap)
		this.div  = dom.div('range-div-list', this.wrap)
		this.box  = dom.div('range-box absmid', this.wrap)
		this.bar  = dom.div('range-bar absmid '+ this.easingClass, this.wrap)

		this.setDivisions(this.divisions)
		this.setLimits(this.min, this.max)
		this.setPins()

		this.postEnd = f.postpone(500, this.onEnd, this)

		this.watchEvents.push(
			new EventHandler(this.onDown, this).listen('mousedown',  this.hit),
			new EventHandler(this.onDown, this).listen('touchstart', this.hit),
			new EventHandler(this.onWheel, this).listen('wheel', this.wheelElement || this.element),
			new EventHandler(this.onDivDown, this).listen('tap', this.div))
	},

	setPins: function() {
		this.drag = this.createPin(this.value)
		this.setValue(this.value, false, true)
	},

	createPin: function(initialValue) {
		var drag = new Drag(dom.div('range-pin hand '+ this.easingClass, this.wrap))
		drag.elementLabel = dom.div('range-pin-text', drag.element)
		drag.point.x = f.clamp(this.round(initialValue), this.min, this.max)

		drag.events.when({
			'start': this.onDragStart,
			'drag': this.onDragMove,
			'end': this.onDragEnd
		}, this)

		drag.events.on('start', dom.addclass, null, [drag.element, 'active'])
		drag.events.on('end',   dom.remclass, null, [drag.element, 'active'])

		return drag
	},

	getPoint: function(ev) {
		var offset = dom.offset(this.wrap)
		,   width  = this.wrap.offsetWidth
		,   height = this.wrap.offsetHeight
		,   point  = ev.touches ? ev.touches[0] : ev

		var px = (point.pageX - offset.x) / width
		,   py = (point.pageY - offset.y) / height

		return {
			x: f.clamp(px, 0, 1),
			y: f.clamp(py, 0, 1)
		}
	},

	onWheel: function(e) {
		var delta = e.wheelDeltaY || -e.deltaY
		if(!delta || e.timeStamp - this.wheelTimeLast < this.wheelTimeDelta) return

		this.wheelTimeLast = e.timeStamp

		var change = delta / Math.abs(delta)
		,   step = this.divisions > 1 ? 1 / this.divisions : this.wheelStep

		this.onStart()
		this.setPosition(this.position - change * step, true)
		this.postEnd()
	},

	onDown: function(e) {
		this.drag.point.x = this.getPoint(e).x * this.len + this.min
		this.drag.handleEvent(e)
		this.onDragMove()
	},

	onDivDown: function(e) {
		var div = e.target
		while(div && div !== this.div) {
			var position = +div.dataset.position
			if(position === position) {
				this.setPosition(position, true)
				break
			}

			div = div.parentNode
		}
	},

	onStart: function() {
		if(!this.started) {
			this.started = true

			dom.addclass(this.element, 'hold')
			this.events.emit('start', this.value)
		}
	},

	onEnd: function() {
		if(this.started) {
			this.started = false

			dom.remclass(this.element, 'hold')
			this.events.emit('end', this.value)
		}
	},

	onDragStart: function(drag) {
		drag.min.x = this.min
		drag.max.x = this.max
		drag.scale.x = this.len / this.wrap.offsetWidth
		dom.addclass(drag.element, 'hold')
		this.onStart()
	},

	onDragMove: function() {
		this.setValue(this.drag.point.x, true)
	},

	onDragEnd: function(drag) {
		dom.remclass(drag.element, 'hold')
		this.onEnd()
	},

	setValue: function(value, emitEvent, force) {
		var next = f.clamp(this.round(value), this.min, this.max)
		if(next === this.value && !force) return

		this.value = next
		this.position = (this.value - this.min) / this.len
		this.value = this.position * this.len + this.min

		this.bar.style.left  = 0 +'%'
		this.bar.style.right = this.trunc((1 - this.position) * 100) +'%'

		this.drag.element.style.left = this.trunc(this.position * 100) +'%'
		dom.text(this.drag.elementLabel, this.round(this.value))

		if(emitEvent) this.events.emit('change', this.value)
	},

	set: function() {
		return this.setPosition.apply(this, arguments)
	},

	setItem: function() {
		return this.setValue.apply(this, arguments)
	},

	setPosition: function(position, emitEvent) {
		this.drag.point.x = position * this.len + this.min
		this.setValue(this.drag.point.x, emitEvent)
	},

	setDivisions: function(divisions) {
		divisions = +divisions || 0
		// if(divisions === this.divisions) return

		this.divisions = divisions
		this.divisionElems = []
		this.divisionTexts = []
		dom.html(this.box, '')

		if(this.divisions < 1) return

		var d = this.divisions
		for(var i = 0; i <= d; i++) {
			var div = dom.div('range-div hand', this.div)
			,   txt = dom.div('range-div-text', div)

			div.style.left = this.trunc(i / d * 100) +'%'
			txt.dataset.position = i / d

			if(i === 0) dom.addclass(div, 'range-div-min')
			if(i === d) dom.addclass(div, 'range-div-max')

			this.divisionElems.push(div)
			this.divisionTexts.push(txt)
		}
	},

	setLimits: function(min, max) {
		min = +min || 0
		max = +max || 0
		// if(min === this.min && max === this.max) return

		this.min = Math.min(min, max)
		this.max = Math.max(min, max)
		this.len = this.max - this.min

		var d = this.divisions
		for(var i = 0; i < this.divisionTexts.length; i++) {
			dom.text(this.divisionTexts[i], this.round(i / d * this.len + this.min))
		}
	}
})


Block.DoubleRangeInput = f.proto(Block.RangeInput, {
	PROTO: 'UI_DoubleRangeInput',
	ename: 'double-range-input range-input',

	valueMin: 0,
	valueMax: 1,

	setPins: function() {
		this.dragA = this.createPin(this.valueMin)
		this.dragB = this.createPin(this.valueMax)
		this.setValue(this.valueMin, this.valueMax, false, true)
	},

	onDown: function(e) {
		var pt = this.getPoint(e)
		,   px = pt.x * this.len + this.min
		,   da = Math.abs(px - this.dragA.point.x)
		,   db = Math.abs(px - this.dragB.point.x)

		var drag = da < db ? this.dragA : this.dragB
		drag.point.x = px
		drag.handleEvent(e)
		this.onDragMove()
	},

	onWheel: function(e) {
		var delta  = e.wheelDeltaY || -e.deltaY
		if(!delta) return

		var change = delta / Math.abs(delta)
		,   step = this.divisions > 1 ? 1 / this.divisions : this.wheelStep

		var pt = this.getPoint(e)
		,   px = pt.x * this.len + this.min
		,   da = Math.abs(px - this.dragA.point.x)
		,   db = Math.abs(px - this.dragB.point.x)

		var drag = da < db ? this.dragA : this.dragB
		drag.point.x -= change * step * this.len
		drag.point.x = f.clamp(drag.point.x, this.min, this.max)

		this.onStart()
		this.onDragMove()
		this.postEnd()
	},

	onDragMove: function() {
		var pointA = this.dragA.point
		,   pointB = this.dragB.point

		this.setValue(
			Math.min(pointA.x, pointB.x),
			Math.max(pointA.x, pointB.x), true, false)
	},

	setPosition: function(position, emitEvent) {
		var value = position * this.len + this.min
		,   diffA = Math.abs(value - this.dragA.point.x)
		,   diffB = Math.abs(value - this.dragB.point.x)
		,   drag  = diffA < diffB ? this.dragA : this.dragB

		drag.point.x = value
		this.onDragMove()
	},

	setValue: function(valueMin, valueMax, emitEvent, force) {
		valueMin = f.clamp(this.round(valueMin), this.min, this.max)
		valueMax = f.clamp(this.round(valueMax), this.min, this.max)
		if(valueMin === this.valueMin
		&& valueMax === this.valueMax
		&& !force) return

		this.valueMin = valueMin
		this.valueMax = valueMax

		this.positionMin = (this.valueMin - this.min) / this.len
		this.positionMax = (this.valueMax - this.min) / this.len

		this.bar.style.left  = this.trunc(this.positionMin * 100) +'%'
		this.bar.style.right = this.trunc((1 - this.positionMax) * 100) +'%'

		var valA = this.round(this.dragA.point.x)
		,   valB = this.round(this.dragB.point.x)

		var posA = (valA - this.min) / this.len
		,   posB = (valB - this.min) / this.len

		this.dragA.element.style.left = this.trunc(posA * 100) +'%'
		this.dragB.element.style.left = this.trunc(posB * 100) +'%'

		dom.text(this.dragA.elementLabel, valA)
		dom.text(this.dragB.elementLabel, valB)

		if(emitEvent) this.events.emit('change', [this.valueMin, this.valueMax])
	}
})


Block.RadialRangeInput = f.proto(Block.RangeInput, {
	PROTO: 'UI_RadialRangeInput',
	ename: 'radial-range-input range-input',
	cacheSize: false,

	loop: 0,
	divisions: 0,
	rotate: 0,
	circle: 1,
	clockwise: true,
	wheelStep: 1/24,
	hoverThick: 0.6,
	easingClass: '',

	setPins: function() {
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.svg.className.baseVal = 'radial-range-svg absmid'
		this.svg.setAttribute('viewBox', '-1 -1 2 2')

		this.lineA = document.createElementNS('http://www.w3.org/2000/svg', 'line')
		this.lineA.className.baseVal = 'radial-range-line'
		this.lineA.setAttribute('x1', 0)
		this.lineA.setAttribute('y1', 0)

		this.watchEvents.push(
			new EventHandler(this.onHover, this).listen('mousemove', this.hit),
			new EventHandler(this.onLeave, this).listen('mouseleave', this.hit))

		this.canvas = dom.elem('canvas', 'graphics absmid', this.wrap)
		this.context = this.canvas.getContext('2d')

		dom.append(this.wrap, this.svg)
		dom.append(this.svg, this.lineA)


		this.drag = this.createPin(this.value)
		this.setValue(this.value, false, true)
	},

	onHover: function(e) {
		var pt = this.getPoint(e)
		this.setHover(this.xyToPos(pt.x, pt.y))
	},

	onLeave: function() {
		this.setHover(null)
	},

	onDown: function(e) {
		var pt = this.getPoint(e)

		this.drag.point.x = pt.x
		this.drag.point.y = pt.y
		this.drag.handleEvent(e)
		this.onDragMove()
	},

	onDragStart: function(drag) {
		drag.min.x = drag.min.y = 0
		drag.max.x = drag.max.y = 1
		drag.scale.x = 1 / this.wrap.offsetWidth
		drag.scale.y = 1 / this.wrap.offsetHeight
		dom.addclass(drag.element, 'hold')
		this.onStart()
	},

	onDragMove: function() {
		this.setPosition(this.xyToPos(this.drag.point.x, this.drag.point.y), true)
		this.onLeave()
	},


	xyToAngle: function(x, y) {
		var px = x *2 -1
		,   py = y *2 -1
		,   pk = 1 / Math.sqrt(px * px + py * py)
		,   pa = Math.atan2(py * pk, px * pk)

		return pa
	},

	angleToXy: function(angle) {
		return {
			x: Math.cos(angle) / 2 + 0.5,
			y: Math.sin(angle) / 2 + 0.5
		}
	},

	angleToPos: function(angle) {
		return +1/2 + (angle - this.rotate) / Math.PI / 2
	},

	posToAngle: function(pos) {
		return (-1/2 + pos) * Math.PI * 2 + this.rotate
	},

	xyToPos: function(x, y) {
		return this.angleToPos(this.xyToAngle(x, y))
	},

	posToXy: function(pos) {
		return this.angleToXy(this.posToAngle(pos))
	},

	posToValue: function(pos) {
		return (this.clockwise ? 1 - pos : pos) * this.circle
		var sign = this.clockwise ? -1 : 1
		return pos * sign * this.circle
	},

	valueToPos: function(value) {
		var pos = value / this.circle
		return this.clockwise ? 1 - pos : pos
		var sign = this.clockwise ? -1 : 1
		return value * sign / this.circle
	},


	onResize: function() {
		this.element.style.height = this.element.offsetWidth +'px'

		var ww = this.wrap.offsetWidth
		,   wh = this.wrap.offsetHeight

		var hw = Math.floor(ww / 2)
		,   hh = Math.floor(wh / 2)
		// this.svg.setAttribute('viewBox', [-hw, -hh, ww, wh].join(' '))
		this.svg.style.strokeWidth = 4 / ww

		this.activeWidth  = ww
		this.activeHeight = wh

		this.canvas.width  = this.activeWidth
		this.canvas.height = this.activeWidth

		this.setHover(null)
	},

	setHover: function(pos) {
		if(typeof pos !== 'number') {
			pos = null
		}

		if(pos === this.hover) return
		this.hover = pos

		var s = this.activeWidth
		,   l = 2
		,   c = s >> 1
		,   r = c - l / 2

		this.context.clearRect(0, 0, s, s)

		var ha = this.posToAngle(this.hover)
		,   pa = f.radist(this.posToAngle(this.position))
		,   da = f.radist(ha - pa)

		if(this.hover == null || Math.abs(da) < 1e-3) {
			return
		}

		var ir = this.hoverThick * r

		var hc = Math.cos(ha)
		,   hs = Math.sin(ha)
		,   pc = Math.cos(pa)
		,   ps = Math.sin(pa)

		this.context.lineWidth = l
		this.context.strokeStyle = '#0a63ae'
		// this.context.fillStyle = '#90ccff'
		// this.context.fillStyle = 'rgba(0, 138, 255, 0.4)'
		this.context.fillStyle = 'rgba(111, 189, 255, 0.7)'
		this.context.beginPath()
		this.context.moveTo(c + pc * r, c + ps * r)
		this.context.arc(c, c, r, pa, ha, da < 0)
		this.context.lineTo(c + hc * ir, c + hs * ir)
		this.context.arc(c, c, ir, ha, pa, da > 0)
		this.context.lineTo(c + pc * ir, c + ps * ir)
		this.context.fill()
		this.context.stroke()
	},

	setPosition: function(pos, emitEvent, force) {
		var diff = f.radistp(pos - this.position, 1)
		if(Math.abs(diff) < 1e-6) return

		this.position += diff
		this.position = ((this.position % 1) + 1) % 1
		this.value = this.round(this.posToValue(this.position))


		var aa = this.posToAngle(this.position)
		,   ac = Math.cos(aa)
		,   as = Math.sin(aa)

		this.lineA.setAttribute('x1', this.trunc(ac * this.hoverThick))
		this.lineA.setAttribute('y1', this.trunc(as * this.hoverThick))
		this.lineA.setAttribute('x2', this.trunc(ac))
		this.lineA.setAttribute('y2', this.trunc(as))


		var xy = this.angleToXy(aa)


		this.drag.element.style.left = this.trunc(xy.x * 100) +'%'
		this.drag.element.style.top  = this.trunc(xy.y * 100) +'%'

		this.setHover(null)

		// dom.text(this.drag.elementLabel, this.round(this.value))

		if(emitEvent) {
			this.events.emit('change', this.value)

		} else {
			this.drag.point.x = xy.x
			this.drag.point.y = xy.y
		}
	},

	setValue: function(value, emitEvent, force) {
		this.setPosition(this.valueToPos(value), emitEvent, force)
	}
})
