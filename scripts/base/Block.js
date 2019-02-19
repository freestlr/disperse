Block = f.proto({
	PROTO: 'Block',

	etag: 'div',
	ename: 'block',
	einam: 'absmid',
	center: false,
	cacheSize: true,

	bus: null,
	clock: null,
	events: null,
	element: null,
	visible: null,
	template: null,

	init: function(options) {
		f.copy(this, options)
		// this.template = options
		// f.copy(this, f.protomerge(this, 'template'))
		// maybe ?

		this.watchAtlas  = []
		this.watchLocale = []
		this.watchEvents = []
		this.watchBlocks = []

		f.protocall(this, 'create')
		f.protocall(this, 'createPost')
	},

	create: function() {
		if(!this.events || !this.events.emit) {
			this.events = new EventEmitter(this.events, this.eventScope || this)
		}
		if(!this.visible) {
			this.visible = new Gate(Gate.AND, !this.hidden)
			// this.visible = new Gate(Gate.MULTIPLY, !this.hidden)
		}
		if(!this.element) {
			this.element = dom.elem(this.etag)
		}
		if(this.eroot) {
			dom.append(this.eroot.element || this.eroot, this.element)
		}
		if(!this.bus) {
			this.bus = this.events
		}

		this.content = this.element
	},

	createPost: function() {
		dom.addclass(this.element, this.ename)


		if(typeof this.data === 'string') {
			dom.addclass(this.element, this.data)
		}
		if(this.listens) for(var i = 0; i < this.listens.length; i++) {
			this.events.on.apply(this.events, this.listens[i])
		}

		if(this.text) {
			// console.warn('Block::text is [deprecated], use ::attr.text')
			this.setAttribute('text', this.text)
			// dom.text(this.content, this.text)
		}
		if(this.title) {
			// console.warn('Block::title is [deprecated], use ::attr.title')
			this.setAttribute('title', this.title)
			// attr.title = this.title
			// dom.attr(this.content, 'title', this.title)
			// this.element.setAttribute('title', this.title)
		}
		if(this.label) {
			this.setAttribute('label', this.label)
		}
		if(this.elabel) {
			// console.warn('Block::elabel is [deprecated], use ::eattr.label')
			this.setAttributeLocale('label', this.elabel)
			// this.setLabel(this.elabel)
			// dom.addclass(this.element, 'labeled')
			// this.watchLocale.push(
			// 	Locale.setText(dom.div('block-label', this.content), this.elabel))
		}
		if(this.etext) {
			// console.warn('Block::etext is [deprecated], use ::eattr.text')
			this.setAttributeLocale('text', this.etext)
			// this.setAttributesLocale({ textContent: this.etext })
			// this.watchLocale.push(
			// 	Locale.setText(this.content, this.etext))
		}
		if(this.etitle) {
			// console.warn('Block::etitle is [deprecated], use ::eattr.title')
			this.setAttributeLocale('title', this.etitle)
			// this.setAttributesLocale({ title: this.etitle })
			// this.watchLocale.push(
			// 	Locale.setTitle(this.content, this.etitle))
		}
		if(this.eicon) {
			// console.warn('Block::eicon is [deprecated], use ::attr.icon')
			this.setAttribute('icon', this.eicon)
			// this.setIcon(this.eicon)
			// dom.addclass(this.element, 'eicon')
			// if(typeof Atlas !== 'undefined') this.watchAtlas.push(
			// 	Atlas.set(this.content, this.eicon, this.einam))
		}


		this.setAttributes(this.attr)
		this.setAttributesLocale(this.eattr)

		this.visible.events.on('change', this.visibleMethod, this, this.element)
		if(this.clock && this.visible.value) this.visible.check(true)
	},

	visibleMethod: function(element, visible) {
		dom.display(element, visible)
		this.autoresize()

		if(this.clock) this.clock.set(this, visible)
	},

	setIcon: function(value) {
		dom.togclass(this.element, 'eicon', !!value)

		if(typeof Atlas === 'undefined') return

		if(value != null) {
			if(!this.atlasElement) {
				this.atlasElement = this.content
				this.watchAtlas.push(this.atlasElement)
			}
			this.atlasIcon = value
			Atlas.set(this.atlasElement, this.atlasIcon, this.einam)

		} else if(this.atlasElement) {
			Atlas.free(this.atlasElement)
			f.adrop(this.watchAtlas, this.atlasElement)
			this.atlasElement = null
		}
	},

	setLabel: function(value) {
		if(value != null) {
			if(!this.labelElement) {
				this.labelElement = dom.div('block-label', this.content)
				dom.addclass(this.element, 'labeled')
			}

			dom.text(this.labelElement, value)

		} else if(this.labelElement) {
			dom.remclass(this.element, 'labeled')
			dom.remove(this.labelElement)
			this.labelElement = null
		}
	},

	setAttribute: function(name, value) {
		switch(name) {
			case 'text':
				dom.text(this.content, value)
			break

			case 'icon':
				this.setIcon(value)
			break

			case 'label':
				this.setLabel(value)
			break

			default:
				dom.attr(this.content, name, value)
			break
		}
	},

	setAttributeLocale: function(name, value) {
		this.watchLocale.push(Locale.setAttribute(name, this, value))
	},

	setAttributes: function(attr) {
		for(var name in attr) this.setAttribute(name, attr[name])
	},

	setAttributesLocale: function(attr) {
		for(var name in attr) this.setAttributeLocale(name, attr[name])
	},

	destroy: function() {
		if(this.clock) this.clock.set(this, false)

		if(typeof Atlas !== 'undefined') {
			this.watchAtlas.forEach(Atlas.free)
			this.watchAtlas = []
		}

		if(typeof Locale !== 'undefined') {
			this.watchLocale.forEach(Locale.unwatch)
			this.watchLocale = []
		}

		this.watchEvents.forEach(f.func('release'))
		this.watchEvents = []

		this.watchBlocks.forEach(f.func('destroy'))
		this.watchBlocks = []

		this.events.off()

		dom.remove(this.element)
	},

	resize: function(w, h) {
		w = (w |0) || 1
		h = (h |0) || 1

		if(this.cacheSize
		&& this.width  === w
		&& this.height === h) return

		this.element.style.width  = w +'px'
		this.element.style.height = h +'px'

		if(this.center) {
			this.element.style.marginLeft = -(w / 2) +'px'
			this.element.style.marginTop  = -(h / 2) +'px'
		}

		this.width  = w
		this.height = h
		this.onResize()
	},

	autoresize: function() {
		this.element.style.width  = ''
		this.element.style.height = ''

		var w = this.element.offsetWidth  || 1
		,   h = this.element.offsetHeight || 1

		if(this.cacheSize
		&& this.needsResize === false
		&& this.width  === w
		&& this.height === h) return

		this.needsResize = false
		this.width  = w
		this.height = h
		this.onResize()
	},

	onResize: function() {

	}
})


Block.Toggle = f.proto(Block, {
	PROTO: 'Block_Toggle',
	ename: 'toggle',

	auto: true,
	active: false,
	reset: false,
	resetTime: 100,
	disabled: false,
	deselect: true,

	hoverable: true,
	hovered: false,

	holdable: false,
	holded: false,

	create: function() {
		if(this.auto) this.watchEvents.push(
			new EventHandler(this.ontap, this).listen('tap', this.element))

		if(this.hoverable) this.watchEvents.push(
			new EventHandler(this.onhover, this,  true).listen('mouseenter', this.element),
			new EventHandler(this.onhover, this, false).listen('mouseleave', this.element))

		if(this.holdable) this.watchEvents.push(
			new EventHandler(this.onhold, this, true).listen('mousedown', this.element),
			new EventHandler(this.onhold, this, true).listen('touchstart', this.element))
	},

	createPost: function() {
		this.updateActive()
	},

	ontap: function(e) {
		this.toggle(true)
		// e.stopPropagation()
	},

	onhover: function(enabled) {
		this.hover(enabled, true)
	},

	onhold: function(enabled, e) {
		this.hold(enabled, true)
		e.preventDefault()
	},

	hold: function(enabled, emitEvent) {
		if(this.holded === !!enabled) return
		this.holded = !!enabled

		if(enabled) {
			this.hHoldUpM = new EventHandler(this.onhold, this, false).listen('mouseup', window)
			this.hHoldUpT = new EventHandler(this.onhold, this, false).listen('touchend', window)

		} else {
			this.hHoldUpM.release()
			this.hHoldUpT.release()
		}

		dom.togclass(this.element, 'holded', this.holded)
		if(emitEvent) this.events.emit('hold', this.holded)
	},

	hover: function(enabled, emitEvent) {
		if(this.hovered === !!enabled) return
		this.hovered = !!enabled

		// dom.togclass(this.element, 'hover', this.hovered)
		if(emitEvent) this.events.emit('hover', this.hovered)
	},

	toggle: function(emitEvent) {
		this.set(!this.active, emitEvent)
	},

	set: function(active, emitEvent, force) {
		var prev = !!this.active
		,   next = !!active
		if(!force) {
			if(this.disabled || prev === next
			|| (this.reset && this.active)
			|| (!this.deselect && !active)) return false
		}

		this.active = next
		this.updateActive()

		if(emitEvent) {
			this.events.emit('change', next)
			this.events.emit(next ? 'active' : 'inactive', next)
		}

		var scope = this
		if(!force && this.reset) setTimeout(function() {
			scope.set(prev, emitEvent, true)

		}, this.resetTime)

		return true
	},

	destroy: function() {
		if(this.hHoldUpM) this.hHoldUpM.release()
		if(this.hHoldUpT) this.hHoldUpT.release()

		Block.prototype.destroy.apply(this, arguments)
	},

	updateActive: function() {
		dom.togclass(this.element, 'active',   this.active)
		dom.togclass(this.element, 'disabled', this.disabled)
		dom.togclass(this.element, 'hand', this.auto && !this.disabled && (!this.active || this.deselect))
	}
})


Block.List = f.proto(Block, {
	PROTO: 'Block_List',
	ename: 'list',
	cname: 'list-item',

	blocks: null,
	items: null,

	template: {
		factory: Block,
		ename: 'list-item'
	},

	create: function() {
		this.blocks = []
		this.template = f.protomerge(this, 'template')
		this.container = this.element
	},

	createPost: function() {
		this.addItemList(this.items)
	},

	addItemList: function(items) {
		if(items) items.forEach(this.addItem, this)
	},

	addItem: function(item) {
		if(typeof item !== 'object') {
			item = { data: item }
		}

		var options = f.merge({ eroot: this.container }, this.template, item)
		var Factory = options.factory || Block

		return this.addBlock(new Factory(options))
	},

	addBlock: function(block) {
		this.blocks.push(block)
		this.events.emit('block_add', block)
		return block
	},

	removeBlock: function(block, destroy) {
		var index = this.blocks.indexOf(block)
		if(index === -1) return false

		this.blocks.splice(index, 1)

		if(destroy) block.destroy()
		else dom.remove(block.element)

		return true
	},

	getIndex: function(data) {
		for(var i = 0; i < this.blocks.length; i++) {
			var block = this.blocks[i]
			if(block.hasOwnProperty('data') && block.data === data) return i
		}
		return -1
	},

	getBlock: function(data) {
		return this.blocks[this.getIndex(data)]
	},

	destroy: function() {
		Block.prototype.destroy.call(this)

		this.clearBlocks(true)
	},

	clearBlocks: function(destroy) {
		for(var i = this.blocks.length -1; i >= 0; i--) {
			this.removeBlock(this.blocks[i], destroy)
		}
	}
})


Block.Menu = f.proto(Block.List, {
	PROTO: 'Block_Menu',
	ename: 'menu',
	active: -1,
	multiple: false,

	template: {
		ename: 'menu-item',
		factory: Block.Toggle
	},

	createPost: function() {
		this.set(this.active)
	},

	addBlock: function(block) {
		block.events.when({
			change: this.onitemchange,
			hover: this.onitemhover,
			hold: this.onitemhold
		}, this, block)

		block.set(0)

		return Block.List.prototype.addBlock.call(this, block)
	},

	removeBlock: function(block, destroy) {
		var ok = Block.List.prototype.removeBlock.call(this, block, destroy)
		if(ok) block.events.off(null, null, this)

		return ok
	},

	updateActive: function() {
		this.active = -1
		this.activeBlock = null
		this.activeItem  = null
		this.activeList  = []

		for(var i = this.blocks.length -1; i >= 0; i--) {
			var block = this.blocks[i]

			if(block.active) {
				this.active = i
				this.activeBlock = block
				this.activeItem = block.data
				this.activeList.push(i)
			}
		}
	},

	onitemchange: function(block, active) {
		if(this.multiple && kbd.state.SHIFT) {

		} else {
			if(active) this.unsetBlocks(block, true)
		}

		var last = this.active

		this.updateActive()
		if(last !== this.active) {
			this.events.emit('change', this.activeItem)
		}
	},

	onitemhover: function(block, enabled) {
		this.events.emit('hover', [block, enabled])
	},

	onitemhold: function(block, enabled) {
		this.events.emit('hold', [block, enabled])
	},

	set: function(index, emitEvent, multiple) {
		var block = this.blocks[index]
		if(block === this.activeBlock) return false

		if(!block || block.set(1, emitEvent)) {
			if(!multiple) this.unsetBlocks(block, emitEvent)

			this.updateActive()
			return true
		}

		return false
	},

	setItem: function(data, emitEvent, multiple) {
		return this.set(this.getIndex(data), emitEvent, multiple)
	},

	unsetBlocks: function(except, emitEvent) {
		for(var i = 0; i < this.blocks.length; i++) {
			var block = this.blocks[i]
			if(!block.active || block === except) continue

			block.set(0, emitEvent, true)
		}
	}
})


Block.Fade = f.proto(Block, {
	PROTO: 'Block_Fade',
	ename: 'block-fade',

	fadeTime: 300,
	fadeOffsetX: 0,
	fadeOffsetY: 0,
	fadeScale: 1,
	fadeEasing: TWEEN.Easing.Cubic.Out,
	autoCheck: true,

	create: function() {
		this.fadeTween = new TWEEN.Tween({ v: 0 }).to({ v: 0 })
			.onStart(this.onTransitionStart, this)
			.onUpdate(this.onTransitionUpdate, this)
			.onComplete(this.onTransitionEnd, this)
	},

	createPost: function() {
		this.fadeTween.source.v = +!this.hidden
		this.fadeTween.target.v = +!this.hidden
		if(this.autoCheck) this.visible.check(true)
		// this.onTransitionUpdate()
		// this.onTransitionEnd()
	},

	appearMethod: function(visible) {
		dom.display(this.element, visible)
	},

	visibleMethod: function() {
		this.fadeTween.target.v = +this.visible.value

		this.fadeTween
			.onUpdate(this.onTransitionUpdate, this)
			.easing(this.fadeEasing)
			.duration(this.fadeTime)
			.start()
	},

	onTransitionStart: function() {
		if(this.visible.value) {
			this.appearMethod(true)
			this.autoresize()
		}
		this.inTransition = true

		this.events.emit('transition_start', this.visible.value)
		this.events.emit(this.visible.value ? 'open' : 'close')
	},

	onTransitionUpdate: function(v) {
		var x = (1 - v) * (this.fadeOffsetX || 0)
		,   y = (1 - v) * (this.fadeOffsetY || 0)
		,   s = 1 + v * (this.fadeScale || 0)
		// ,   o = Math.max(0, v * v * 2 - 1)
		,   o = v

		this.element.style.opacity = o
		this.transform(this.element, x, y, s)
	},

	onTransitionEnd: function() {
		if(!this.visible.value) this.appearMethod(false)
		this.inTransition = false

		this.events.emit('transition_end', this.visible.value)
		this.events.emit(this.visible.value ? 'visible' : 'hidden', this.visible.value)
	},

	transform: function(element, x, y, s) {
		var style = ' translateX('+ f.hround(x || 0) +'px)'
		          + ' translateY('+ f.hround(y || 0) +'px)'
		          + '      scale('+ f.hround(s || 1) +')'

		element.style.webkitTransform = style
		element.style.   mozTransform = style
		element.style.    msTransform = style
		element.style.     OTransform = style
		element.style.      transform = style
	}
})


Block.Tip = f.proto(Block.Fade, {
	PROTO: 'Block_Tip',
	ename: 'tip',

	hidden: true,
	align: null,
	preferAlign: null,
	tipRoot: null,
	tipTarget: null,
	integerPosition: true,
	distance: 8,
	arrowPadding: 8,
	animationTime: 200,

	create: function() {
		this.arrow   = dom.div('tip-arrow', this.element)
		this.content = dom.div('tip-content', this.element)

		if(!this.tipRoot) {
			this.tipRoot = this.eroot || this.element.parentNode
		}

		this.arrowPoint   = { x: 0, y: 0 }
		this.elementPoint = { x: 0, y: 0 }
	},

	getElementBox: function(element, relative) {
		if(!element) return null

		if(element.getBoundingClientRect) {
			var rect = element.getBoundingClientRect()

			if(relative && relative.getBoundingClientRect) {
				var offset = relative.getBoundingClientRect()
				return {
					x: rect.left - offset.left,
					y: rect.top  - offset.top,
					w: rect.width,
					h: rect.height
				}

			} else return {
				x: rect.left,
				y: rect.top,
				w: rect.width,
				h: rect.height
			}

		} else {
			var offset = dom.offparent(element, relative)

			return {
				x: offset.x,
				y: offset.y,
				w: element.offsetWidth,
				h: element.offsetHeight
			}
		}
	},

	moveToElement: function(element, align, distance) {
		if(!element) return


		var box = this.getElementBox(element, this.element.offsetParent)

		if(align == null) {
			align = this.align || this.getAlign(box.x, box.y, box.w, box.h)
		}

		var x = box.x
		,   y = box.y
		switch(align) {
			case 'left':
				y += box.h / 2
			break

			case 'right':
				x += box.w
				y += box.h / 2
			break

			case 'top':
				x += box.w / 2
			break

			case 'bottom':
				x += box.w / 2
				y += box.h
			break
		}

		this.move(x, y, align, distance)
	},

	move: function(x, y, align, distance) {
		if(align == null) {
			align = this.align || this.getAlign(x, y, 0, 0)
		}

		var re = this.element.offsetParent
		if(!re) return

		var aw = this.arrow.offsetWidth
		,   ah = this.arrow.offsetHeight
		,   ad = Math.sqrt(aw * aw + ah * ah) / 2
		,   ap = this.arrowPadding
		,   ao = distance || this.distance
		,   ew = this.element.offsetWidth
		,   eh = this.element.offsetHeight
		,   cw = this.content.offsetWidth
		,   ch = this.content.offsetHeight
		,   rw = re.offsetWidth
		,   rh = re.offsetHeight

		var ecx = Math.floor(ew / 2)
		,   ecy = Math.floor(eh / 2)
		,   ccx = Math.floor(cw / 2)
		,   ccy = Math.floor(ch / 2)

		var vertical
		var epl, ept, apl, apt
		switch(align) {
			case 'left':
				vertical = false
				epl = x - ew - ao
				ept = y - ecy
				apl = cw
				apt = ccy
			break

			case 'right':
				vertical = false
				epl = x + ao
				ept = y - ecy
				apl = 0
				apt = ccy
			break

			case 'top':
				vertical = true
				epl = x - ecx
				ept = y - ao - eh
				apl = ccx
				apt = ch
			break

			case 'bottom':
				vertical = true
				epl = x - ecx
				ept = y + ao
				apl = ccx
				apt = 0
			break

			default: return
		}

		var eol = Math.max(0, -epl)
		if(eol) {
			if(vertical) apl -= Math.min(ccx - ad - ap, eol)
			epl += eol
		}

		var eor = Math.max(0, epl + ew - rw)
		if(eor) {
			if(vertical) apl += Math.min(ccx - ad - ap, eor)
			epl -= eor
		}

		var eot = Math.max(0, -ept)
		if(eot) {
			if(!vertical) apt -= Math.min(ccy - ad - ap, eot)
			ept += eot
		}

		var eob = Math.max(0, ept + eh - rh)
		if(eob) {
			if(!vertical) apt += Math.min(ccy - ad - ap, eob)
			ept -= eob
		}

		switch(align) {
			case 'left':
				ao += eor - eol
			break

			case 'right':
				ao += eol - eor
			break

			case 'top':
				ao += eob - eot
			break

			case 'bottom':
				ao += eot - eob
			break
		}

		if(this.integerPosition) {
			epl = Math.round(epl)
			ept = Math.round(ept)
			apl = Math.round(apl)
			apt = Math.round(apt)
			ao  = Math.round(ao)
		}

		if(this.arrowPoint.x === apl
		&& this.arrowPoint.y === apt
		&& Math.abs(this.elementPoint.x - epl) < 2
		&& Math.abs(this.elementPoint.y - ept) < 2
		&& this.lastDistance === ao
		&& this.lastAlign === align) return

		this.arrowPoint.x = apl
		this.arrowPoint.y = apt
		this.arrow.style.left = apl +'px'
		this.arrow.style.top  = apt +'px'

		this.elementPoint.x = epl
		this.elementPoint.y = ept

		this.lastDistance = ao
		this.lastAlign = align

		this.fadeAxis = this.alignAxes[this.lastAlign || this.align]
		this.updateTransform()
	},

	getAlign: function(x, y, w, h) {
		var re = this.element.offsetParent
		if(!re) return null

		var rw = re.offsetWidth
		,   rh = re.offsetHeight

		var ew = this.element.offsetWidth
		,   eh = this.element.offsetHeight

		var ot = y
		,   or = rw - x - w
		,   ob = rh - y - h
		,   ol = x

		var aligns = ['top', 'right', 'bottom', 'left']
		,   spaces = [ot - eh, or - ew, ob - eh, ol - ew]

		if(this.preferAlign && spaces[aligns.indexOf(this.preferAlign)] > 0) {
			return this.preferAlign
		}

		var maxspace = Math.max.apply(null, spaces)
		,   index = spaces.indexOf(maxspace)

		return aligns[index]
	},

	alignAxes: {
		left   : { x:  1, y:  0 },
		right  : { x: -1, y:  0 },
		top    : { x:  0, y:  1 },
		bottom : { x:  0, y: -1 }
	},

	appearMethod: function(visible) {
		if(visible) {
			dom.append(this.tipRoot, this.element)
		} else {
			dom.remove(this.element)
		}
	},

	updateTransform: function() {
		var d = (1 - this.fadeTween.source.v) * this.fadeDistance
		,   e = this.elementPoint
		,   a = this.fadeAxis || { x: 0, y: 0 }

		this.transform(this.element, e.x + d * a.x, e.y + d * a.y)
	},

	onTransitionUpdate: function() {
		this.element.style.opacity = this.fadeTween.source.v
		this.updateTransform()
	}
})


Block.DialogList = []

Block.Dialog = f.proto(Block.Fade, {
	PROTO: 'Block_Dialog',
	ename: 'dialog absmid',

	auto: true,
	hidden: true,

	fadeTime: 600,
	fadeEasing: TWEEN.Easing.Linear.None,

	shadowyDuration: 150,
	scalingDuration: 300,
	opacityDuration: 300,

	backColor: [0, 0, 0],

	create: function() {
		var black = dom.div('dialog-black hand',   this.element)
		,   outer = dom.div('dialog-outer absmid', this.element)
		,   inner = dom.div('dialog-inner',        outer)
		,   close = dom.div('dialog-close hand',   inner)

		this.watchEvents.push(
			new EventHandler('dismiss', this.events).listen('tap', black),
			new EventHandler('dismiss', this.events).listen('tap', close))

		if(this.auto) {
			this.events.on('dismiss', this.visible.off, this.visible, 'dismiss')
		}

		this.content = inner
		this.elements = {
			modal: this.element,
			outer: outer,
			inner: inner,
			close: close,
			black: black
		}

		Block.DialogList.push(this)
	},

	destroy: function() {
		f.adrop(Block.DialogList, this)

		Block.Fade.prototype.destroy.apply(this, arguments)
	},

	onTransitionUpdate: function() {
		var df = this.fadeTime
		,   dt = this.fadeTween.source.v * df
		,   tb = this.shadowyDuration
		,   ts = this.scalingDuration
		,   to = this.opacityDuration

		var ease = TWEEN.Easing.Cubic.InOut

		var shadowy = ease(Math.min(1, Math.max(0, dt / tb))) * 0.5
		,   scaling = ease(Math.min(1, Math.max(0, dt / ts)))
		,   opacity = ease(Math.min(1, Math.max(0, (dt - df + to) / to)))


		var outer = this.elements.outer.style
		,   scale = 'scaleY('+ scaling +')'

		outer.webkitTransform = scale
		outer.   mozTransform = scale
		outer.    msTransform = scale
		outer.     OTransform = scale
		outer.      transform = scale

		this.elements.modal.style.backgroundColor = 'rgba('+ this.backColor.concat(shadowy) +')'
		this.elements.inner.style.opacity = opacity
	}
})
