var seed = 543334



var pb = 8
var pi = 32
var pz = 2




var filter = filterCubic
var filters = [
	filterNearest,
	filterLinear,
	filterQuadratic,
	filterCubic,
	filterCubicManual,
]

var easing = TWEEN.EasingEnum.LinearNone
var easings = [
	TWEEN.EasingEnum.LinearNone,
	TWEEN.EasingEnum.QuadraticInOut,
	TWEEN.EasingEnum.CubicInOut,
	easingSmoothstep,
	easingSmootherstep,
	easingTangent1,
	easingTangent2,
	easingTangent4,
]

var backgroundSize = pb * pi
var backgroundScale = 1
var backgroundCanvas = null
var edgeRepeat = true
var drawNormal = true
var normalHeight = -1.4
var currentZ = 0
var moveByZ = 0
var interZ = 0


var needsRedraw = false
var needsUpdateStats = false


/**
 *
 * z axis is done as ring buffer
 * given 8 keypoints by 4 interpolants
 *
 * 0   1   2   3   4   5   6   7
 * |---|---|---|---|---|---|---|---
 *         a---b-x-c---d   -   cubic spline
 *
 *
 *
 * modification affects
 *
 * |---|---|---|---|---|---|---|---
 * +---+---+---m---+---+---+
 *
 * |---|---|---|---|---|---|---|---
 *     +---+---+---m---+---+---+
 *
 * |---|---|---|---|---|---|---|---
 * +       +---+---+---m---+---+---
 *
 * |---|---|---|---|---|---|---|---
 * +---+       +---+---+---m---+---
 *
 *
 *
 */


var mt = new MersenneTwister




var g1 = makeSet3(pb, pb, pb)
var g2 = makeSet3(pb * pi, pb, pb)
var g3 = makeSet3(pb * pi, pb * pi, pb)
var g4 = makeSet3(pb * pi, pb * pi, pb * pi * pz)

var can1 = makeCanvas(pb * pi, pb * pi, { center: true })


// var get3 = perf.wrap(get3)
var generate = perf.wrap(generate)
// var inter = perf.wrap(inter)
var draw = perf.wrap(draw)
var run = perf.wrap(run)


function run() {
	mt.init(seed)

	generate(g1)



	inter(g2, g1, easing, filter, 1, 0, 0)
	inter(g3, g2, easing, filter, 0, 1, 0)
	// inter(g4, g3, easing, filter, 0, 0, 1)
	startZ = currentZ
	interZ = 0

	needsRedraw = true
}

function drawSlice() {
	draw(can1, g4, currentZ)

	backgroundUpdate()

	needsUpdateStats = true
}

function rerun(set) {
	seed ++
	run()
}




var outStats = dom.div('out', document.body)
f.copy(outStats.style, {
	position: 'absolute',
	right: '0px',
	top: '8px',
	padding: '4px 8px',
	backgroundColor: 'rgba(0, 0, 0, 0.7)',
	color: 'white',
	font: '12px monospace',
	whiteSpace: 'pre'
})
function updateStats() {
	dom.text(outStats, perf.getall(['last', '%l', 'avg', '%a', 'best', '%b', 'worst', '%w', 'cycles', '%c', 'time', '%s', '| %n'])
		.concat(['', '',
			'easing: '+ easing.name,
			'filter: '+ filter.name,
		].join('\n')))
}

var inputHeight = new Block.RangeInput({
	// eroot: document.body,
	min: -2,
	max: 0,
	// position: 0.5,
	value: normalHeight,
	wheelStep: 1/24,
	wheelElement: window,
	wheelTimeDelta: 33
})

inputHeight.events.on('change', function(v) {
	normalHeight = v
	needsRedraw = true
})

new EventHandler(onKey).listen('keydown', window)
new EventHandler(onKey).listen('keyup', window)



backgroundCapture(null)
backgroundResize(1)
run()
loop()




function makeSet3(w, h, d) {
	return {
		w: w,
		h: h,
		d: d,
		vx: new Float32Array(w * h * d),
	}
}
function makeCanvas(w, h, options) {
	var opt = options || {}
	var cvs = dom.elem('canvas', null, document.body)
	var ctx = cvs.getContext('2d')
	var pix = ctx.createImageData(w, h)


	cvs.width = w
	cvs.height = h


	f.copy(cvs.style, {
		imageRendering: opt.imageRendering || 'pixelated',
	})

	if(opt.center) f.copy(cvs.style, {
		position: 'absolute',
		left: '50%',
		top: '50%',
	})

	var set = {
		w: w,
		h: h,
		cvs: cvs,
		ctx: ctx,
		pix: pix,
		center: opt.center,
	}

	return set
}


function backgroundCapture(set) {
	var prev = backgroundCanvas
	if(prev) {
		prev.cvs.style.display = ''
	}
	backgroundCanvas = set
	if(set) {
		set.cvs.style.display = 'none'
	}
	backgroundUpdate()
}

function backgroundUpdate(set) {
	var bg = backgroundCanvas
	f.copy(document.body.style, {
		'background-image': bg ? 'url('+ bg.cvs.toDataURL() +')' : '',
		'background-position': 'center center',
		'background-color': 'white',
	})
}

function backgroundResize(scale) {
	var bk = backgroundScale *= scale
	var bs = backgroundSize * bk

	var can = can1

	f.copy(can.cvs.style, {
		width:  can.w * bk +'px',
		height: can.h * bk +'px',
	})

	if(can.center) f.copy(can.cvs.style, {
		marginTop:  -(can.w * bk) /2 +'px',
		marginLeft: -(can.h * bk) /2 +'px',
	})

	f.copy(document.body.style, {
		'background-size': bs +'px '+ bs +'px',
	})
}


function wrap(i, l) {
	return edgeRepeat ? ((i % l) + l) % l : Math.max(0, Math.min(l - 1, i))
}

function get2(x, y, w, h) {
	return wrap(x, w) + wrap(y, h) * w
}

function get3(x, y, z, w, h, d) {
	return wrap(x, w) + wrap(y, h) * w + wrap(z, d) * w * h
}

function draw(can, g, z) {
	var m = can.pix.data

	var w = g.w
	var h = g.h
	var d = g.d
	var vx = g.vx
	for(var y = 0; y < h; y++)
	for(var x = 0; x < w; x++) {
		var i = z * w * h + y * w + x
		var o = (y * w + x) * 4
		var cx = vx[i]
		var cy = -1
		var cz = -1
		var ca = 1

		var nh = Math.pow(10, normalHeight)


		if(drawNormal) {
			var nx = vx[get3(x - 1, y, z, w, h, d)]
			var px = vx[get3(x + 1, y, z, w, h, d)]
			var ny = vx[get3(x, y - 1, z, w, h, d)]
			var py = vx[get3(x, y + 1, z, w, h, d)]

			var dx = (px - nx)// / 2
			var dy = (py - ny)// / 2
			var norm = vnor(vvcross(vnor([1, 0, dx]), vnor([0, 1, dy])))

			norm[2] *= nh
			norm = vnor(norm)

			cx = norm[0]
			cy = norm[1]
			cz = norm[2]
		} else {
			cx = cy = cz = vx[i]
		}

		m[o +0] = (cx *.5 +.5) * 255 |0
		m[o +1] = (cy *.5 +.5) * 255 |0
		m[o +2] = (cz *.5 +.5) * 255 |0
		m[o +3] = ca * 255 |0
	}

	can.ctx.putImageData(can.pix, 0, 0)
}

function generate(g) {
	var w = g.w
	var h = g.h
	var d = g.d
	for(var z = 0; z < d; z++)
	for(var y = 0; y < h; y++)
	for(var x = 0; x < w; x++) {
		var i = z * w * h + y * w + x
		var v = mt.random() * 2 - 1

		g.vx[i] = v
	}
}


function inter(dst, src, ease, func, dx, dy, dz, sx, sy, sz, cx, cy, cz) {
	var sw = src.w
	var sh = src.h
	var sd = src.d
	var sv = src.vx

	var dw = dst.w
	var dh = dst.h
	var dd = dst.d
	var dv = dst.vx

	if(sx == null) sx = 0
	if(sy == null) sy = 0
	if(sz == null) sz = 0

	if(cx == null) cx = dw - sx
	if(cy == null) cy = dh - sx
	if(cz == null) cz = dd - sx

	var name = 'inter'+ cx +'x'+ cy +'x'+ cz
	perf.start(name)

	var kw = dst.w / src.w
	var kh = dst.h / src.h
	var kd = dst.d / src.d


	var ex = sx + cx
	var ey = sy + cy
	var ez = sz + cz

	for(var z = sz; z < ez; z++)
	for(var y = sy; y < ey; y++)
	for(var x = sx; x < ex; x++) {
		var i = z * dw * dh + y * dw + x

		var x1 = x / kw |0
		var y1 = y / kh |0
		var z1 = z / kd |0

		var px = x / kw - x1
		var py = y / kh - y1
		var pz = z / kd - z1

		var a = sv[get3(x1 - 1 * dx, y1 - 1 * dy, z1 - 1 * dz, sw, sh, sd)]
		var b = sv[get3(x1 - 0 * dx, y1 - 0 * dy, z1 - 0 * dz, sw, sh, sd)]
		var c = sv[get3(x1 + 1 * dx, y1 + 1 * dy, z1 + 1 * dz, sw, sh, sd)]
		var d = sv[get3(x1 + 2 * dx, y1 + 2 * dy, z1 + 2 * dz, sw, sh, sd)]
		var e = sv[get3(x1 + 3 * dx, y1 + 3 * dy, z1 + 3 * dz, sw, sh, sd)]

		dv[i] = func(ease(px * dx + py * dy + pz * dz), a, b, c, d, e)
	}

	perf.end(name)
}



function filterNearest(x, a, b, c, d) {
	return x < 0.5 ? b : c
}

function filterLinear(x, a, b, c, d) {
	return (c - b) * x + b
}

function filterQuadratic(x, a, b, c, d) {
	return b + 0.5 * x*(-3*b + 4*c - d + x*(b - 2*c + d))

	var x0 = 0
	var x1 = 1
	var x2 = 2
	var y0 = b
	var y1 = c
	var y2 = d
	return (x-x1)*(x-x2)/(x0-x1)/(x0-x2)*y0
		+  (x-x0)*(x-x2)/(x1-x0)/(x1-x2)*y1
		+  (x-x0)*(x-x1)/(x2-x0)/(x2-x1)*y2
}


function filterCubic(x, a, b, c, d) {
	return b + 0.5 * x*(c - a + x*(2*a - 5*b + 4*c - d + x*(3*(b - c) + d - a)))
}

function filterCubicManual(x, a, b, c, d, e) {
	return b + 1/6 * x*(-2*a -3*b +6*c -d +x*(3*a -6*b +3*c +x*(-a +3*b -3*c +d)))

	// this formula differs from canonic cubic interpolation somehow
	var x0 = -1
	var x1 = 0
	var x2 = 1
	var x3 = 2
	var y0 = a
	var y1 = b
	var y2 = c
	var y3 = d
	return (x-x1)*(x-x2)*(x-x3)/(x0-x1)/(x0-x2)/(x0-x3)*y0
		+  (x-x0)*(x-x2)*(x-x3)/(x1-x0)/(x1-x2)/(x1-x3)*y1
		+  (x-x0)*(x-x1)*(x-x3)/(x2-x0)/(x2-x1)/(x2-x3)*y2
		+  (x-x0)*(x-x1)*(x-x2)/(x3-x0)/(x3-x1)/(x3-x2)*y3

	// forward: x0=0, x1=1, x2=2, x3=3, y0=b, y1=c, y2=d, y3=e
	return b + 1/6 * x*(-11*b + 18*c - 9*d + 2*e + x*(6*b - 15*c + 12*d - 3*e + x*(-b + 3*c - 3*d + e)))
}

function filterCubicHandmade(x, a, b, c, d) {
	return 1/2 * x*(-a +b +c -d + x*(a -b +c +d))
}



function easingSmoothstep(t) {
	return t * t * (3 - 2 * t)
}
function easingSmootherstep(t, a, b, c, d) {
	return t * t * t * (t * (t * 6 - 15) + 10)
}
function easingTangent1(t) {
	return Math.tan(Math.PI * (t - 1/2) * 0.5) / 2 + 1/2
}
function easingTangent2(t) {
	return Math.tan(Math.PI * (t - 1/2) * 0.7048327647) / 4 + 1/2
}
function easingTangent4(t) {
	return Math.tan(Math.PI * (t - 1/2) * 0.844042) / 8 + 1/2
}


function vlen(a) {
	return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
}
function vsdiv(a, v) {
	return [a[0] / v, a[1] / v, a[2] / v]
}
function vnor(a) {
	return vsdiv(a, vlen(a))
}
function vvcross(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]]
}

function onKey() {
	if(/\d/.test(kbd.key)) {

		if(kbd.state.SHIFT) {
			easing = easings[kbd.key -1] || TWEEN.EasingEnum.LinearNone
		} else {
			filter = filters[kbd.key -1] || filterNearest
		}
		run()

	} else if(!kbd.down) switch(kbd.key) {
		case 'n':
			moveByZ = 0
		break

		case 'p':
			moveByZ = 0
		break

	} else if(kbd.changed) switch(kbd.key) {
		case 'n':
			moveByZ = 1
		break

		case 'p':
			moveByZ = -1
		break

		case 'a':
			moveByZ = moveByZ ? 0 : 1
		break

		case '-':
			backgroundResize(1/2)
		break

		case '=':
			backgroundResize(2)
		break

		case 'ENTER':
			for(var name in perf.values) perf.flushLocal(name)
			needsUpdateStats = true
		break

		case 'SPACE':
			rerun()
		break

		case 'e':
			edgeRepeat = !edgeRepeat
			run()
		break

		case 'z':
			drawNormal = !drawNormal
			needsRedraw = true
		break

		case 'b':
			backgroundCapture(backgroundCanvas ? null : can1)
		break
	}
}





function loop() {
	requestAnimationFrame(loop)

	var ring = g4.d

	if(interZ < ring) {
		inter(g4, g3, easing, filter, 0, 0, 1, 0, 0, (startZ + interZ) % ring, null, null, 1)
		interZ++

		needsUpdateStats = true
	}

	if(moveByZ) {
		currentZ = (((currentZ + moveByZ) % ring) + ring) % ring

		needsRedraw = true
	}

	if(needsRedraw) {
		needsRedraw = false

		drawSlice()
	}

	if(needsUpdateStats) {
		needsUpdateStats = false

		updateStats()
	}
}
