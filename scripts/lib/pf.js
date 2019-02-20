!function() {
	if(!Date.now) {
		Date.now = function() { return new Date().getTime() }
	}
	if(!window.performance) {
		window.performance = {}
	}
	if(!window.performance.now) {
		var offset = window.performance.timing && window.performance.timing.navigationStart
			? window.performance.timing.navigationStart
			: Date.now()
		window.performance.now = function() { return Date.now() - offset }
	}
}()

!function() {
	var mouse = {
		startPoint: null,
		startEvent: null,
		endPoint: null,
		endEvent: null,
		touch: false,
		moves: 0
	}
	var touch = {
		startPoint: null,
		startEvent: null,
		endPoint: null,
		endEvent: null,
		touch: true,
		moves: 0
	}
	var timelast

	try {
		new MouseEvent('tap')

	} catch(e) {
		window.MouseEvent = function(type, e) {
			var tap = document.createEvent('MouseEvents')

			tap.initMouseEvent(type, e.bubbles, e.cancelable, e.view,
				e.detail, e.screenX, e.screenY, e.clientX, e.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				e.button, e.relatedTarget)

			return tap
		}
	}

	function onmousedown(e) {
		if(e.which !== 1) return
		mouse.moves = 0
		mouse.startEvent = e
		mouse.startPoint = e
		document.addEventListener('mousemove', onmousemove, true)
	}
	function onmousemove(e) {
		if(mouse.startPoint.pageX !== e.pageX
		|| mouse.startPoint.pageY !== e.pageY) mouse.moves++
	}
	function onmouseup(e) {
		document.removeEventListener('mousemove', onmousemove, true)
		mouse.endPoint = e
		mouse.endEvent = e
		ontap(mouse)
	}

	function ontouchstart(e) {
		touch.startPoint = e.changedTouches[0]
		touch.startEvent = e
		touch.moves = 0
	}
	function ontouchmove(e) {
		if(touch.startPoint.pageX !== e.pageX
		|| touch.startPoint.pageY !== e.pageY) touch.moves++
	}
	function ontouchend(e) {
		touch.endPoint = e.changedTouches[0]
		touch.endEvent = e
		ontap(touch)
	}

	function ontap(ptr) {
		if(!ptr.startPoint || !ptr.endPoint || ptr.moves > 2) return

		var dx = ptr.endPoint.pageX - ptr.startPoint.pageX
		,   dy = ptr.endPoint.pageY - ptr.startPoint.pageY
		,   ds = ptr.touch ? 64 : 25

		if(dx * dx + dy * dy > ds) return

		var ct = window.performance.now()
		if(ct - timelast < 50 && ptr.endEvent.isTrusted) return

		timelast = ct

		var tap = new MouseEvent('tap', {
			bubbles: true,
			cancelable: true,

			pageX: ptr.endPoint.pageX,
			pageY: ptr.endPoint.pageY,
			screenX: ptr.endPoint.screenX,
			screenY: ptr.endPoint.screenY,
			clientX: ptr.endPoint.clientX,
			clientY: ptr.endPoint.clientY,

			altKey: ptr.endEvent.altKey,
			ctrlKey: ptr.endEvent.ctrlKey,
			shiftKey: ptr.endEvent.shiftKey,
			metaKey: ptr.endEvent.metaKey,
			view: ptr.endEvent.view
		})

		tap.touch = ptr.touch
		tap.timeDelta = ptr.endEvent.timeStamp - ptr.startEvent.timeStamp

		var target = ptr.endEvent.target

		ptr.startPoint = null
		ptr.endPoint = null
		ptr.startEvent = null
		ptr.endEvent = null

		target.dispatchEvent(tap)
	}

	document.addEventListener('touchstart', ontouchstart, true)
	document.addEventListener('touchmove',  ontouchmove,  true)
	document.addEventListener('touchend',   ontouchend,   true)
	document.addEventListener('mousedown',  onmousedown,  true)
	document.addEventListener('mouseup',    onmouseup,    true)
}()

if(!Function.prototype.bind) {
	Function.prototype.bind = function(scope) {
		var bound_args = Array.prototype.slice.call(arguments, 1),
			func = this

		return function() {
			var passed_args = Array.prototype.slice.call(arguments)
			return func.apply(scope, bound_args.concat(passed_args))
		}
	}
}

window.requestAnimationFrame =
	window.      requestAnimationFrame ||
	window.     ORequestAnimationFrame ||
	window.    msRequestAnimationFrame ||
	window.   mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	function(fn) { return setTimeout(fn, 1000/60) }

window.cancelAnimationFrame =
	window.      cancelAnimationFrame ||
	window.     OCancelAnimationFrame ||
	window.    msCancelAnimationFrame ||
	window.   mozCancelAnimationFrame ||
	window.webkitCancelAnimationFrame ||
	window.clearTimeout
