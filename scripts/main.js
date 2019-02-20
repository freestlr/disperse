var seed = 543334




var s = 8
var i = 32

var bg = null
var bgSize = 256

var filter = cubic
var filters = [
	nearest,
	linear,
	smoothstep,
	smootherstep,
	cubic,
	tangent
]

var edgeRepeat = true
var useComponent = 0
var useNormal = true
var normalHeight = -1.4
var currentZ = 0



var mt = new MersenneTwister



// var g1 = makeSet2(s, s)
// var g2 = makeSet2(s * i, s)
// var g3 = makeSet2(s * i, s * i)

var g1 = makeSet3(s, s, s)
var g2 = makeSet3(s * i, s, s)
var g3 = makeSet3(s * i, s * i, s)
var g4 = makeSet3(s * i, s * i, s * i)

var can1 = makeCanvas(s * i, s * i)


function run() {
	perf.call(xrun)
}

function xrun() {
	mt.init(seed)

	// generate(g1)
	perf.call(generate, g1)



	perf.call(inter, g2, g1, 1, 0, 0, filter)
	perf.call(inter, g3, g2, 0, 1, 0, filter)
	perf.call(inter, g4, g3, 0, 0, 1, filter)

	// draw(can1, g3)
	drawSlice()

	// updateStats()
}

function drawSlice() {
	perf.call(draw, can1, g4, currentZ)

	backgroundCapture()

	updateStats()
}

function rerun(set) {
	seed ++
	run()
}




var outStats = dom.div('out', document.body)
f.copy(outStats.style, {
	position: 'absolute',
	right: '8px',
	top: '8px',
	padding: '4px 8px',
	backgroundColor: 'rgba(0, 0, 0, 0.7)',
	color: 'white',
	font: '12px monospace',
	whiteSpace: 'pre'
})
function updateStats() {
	var fmt = ['%n:', 'last', '%l', 'avg', '%a', 'best', '%b', 'worst', '%w', 'cycles', '%c', 'time', '%t']

	dom.text(outStats, f.tformat([
		perf.format(fmt, 'xrun'),
		perf.format(fmt, 'generate'),
		perf.format(fmt, 'inter'),
		perf.format(fmt, 'draw'),
	]))
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
	drawSlice()
})

new EventHandler(onKey).listen('keydown', window)



backgroundCapture(null)
backgroundResize(1)
run()
loop()




function makeSet2(w, h) {
	return {
		w: w,
		h: h,
		d: 1,
		vx: new Float32Array(w * h),
		// vy: new Float32Array(w * h),
	}
}
function makeSet3(w, h, d) {
	return {
		w: w,
		h: h,
		d: d,
		vx: new Float32Array(w * h * d),
		// vy: new Float32Array(w * h * d),
	}
}
function makeCanvas(w, h, options) {
	var opt = options || {}
	var cvs = dom.elem('canvas', null, document.body)
	var ctx = cvs.getContext('2d')
	// var dat = new Float32Array(w * h)
	var pix = ctx.createImageData(w, h)

	// var vx = new Float32Array(w * h)
	// var vy = new Float32Array(w * h)

	cvs.width = w
	cvs.height = h


	f.copy(cvs.style, {
		width:  /* w * 32 + */'256px',
		height: /* h * 32 + */'256px',
		imageRendering: opt.imageRendering || 'pixelated',
	})

	var set = {
		w: w,
		h: h,
		// vx: vx,
		// vy: vy,
		cvs: cvs,
		ctx: ctx,
		// dat: dat,
		pix: pix,
	}

	new EventHandler(onCanvasEnter, null, set).listen('mouseenter', cvs)
	new EventHandler(onCanvasLeave, null, set).listen('mouseleave', cvs)
	new EventHandler(onCanvasClick, null, set).listen('click', cvs)

	return set
}

function onCanvasEnter(set) {
	bg = set
	backgroundCapture()
}

function onCanvasLeave(set) {
	bg = null
	backgroundCapture()
}

function onCanvasClick(set) {
	rerun()
}

function backgroundCapture(set) {
	f.copy(document.body.style, {
		'background-image': bg ? 'url('+ bg.cvs.toDataURL() +')' : '',
		'background-position': '0 0',
		'background-color': 'white',
	})
}

function backgroundResize(scale) {
	bgSize *= scale

	f.copy(document.body.style, {
		'background-size': bgSize +'px '+ bgSize +'px',
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
	// var vy = g.vy
	for(var y = 0; y < h; y++)
	for(var x = 0; x < w; x++) {
		var i = z * w * h + y * w + x
		var o = (y * w + x) * 4
		// var v = dat[i] *.5 +.5
		var cx = vx[i]
		// var cy = vy[i]
		var cy = -1
		var cz = -1
		var ca = 1

		var nh = Math.pow(10, normalHeight)

		if(useComponent < 2) {
			// var v = [vx, vy][useComponent]
			var v = vx

			if(useNormal) {
				var nx = v[get3(x - 1, y, z, w, h, d)]
				var px = v[get3(x + 1, y, z, w, h, d)]
				var ny = v[get3(x, y - 1, z, w, h, d)]
				var py = v[get3(x, y + 1, z, w, h, d)]

				var dx = (px - nx)// / 2
				var dy = (py - ny)// / 2
				var norm = vnor(vvcross(vnor([1, 0, dx]), vnor([0, 1, dy])))

				norm[2] *= nh
				norm = vnor(norm)

				cx = norm[0]
				cy = norm[1]
				cz = norm[2]
			} else {
				cx = cy = cz = v[i]
			}

		} else {
			if(useNormal) {
				var pl = Math.min(1, cx * cx + cy * cy)
				cz = Math.sqrt(1 - pl) * nh
				var dl = 1 / Math.sqrt(cx * cx + cy * cy + cz * cz)
				cx *= dl
				cy *= dl
				cz *= dl
			} else {

			}
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


function inter(dst, src, dx, dy, dz, func) {
	var sw = src.w
	var sh = src.h
	var sd = src.d
	var sv = src.vx

	var dw = dst.w
	var dh = dst.h
	var dd = dst.d
	var dv = dst.vx

	var kw = dst.w / src.w
	var kh = dst.h / src.h
	var kd = dst.d / src.d


	for(var z = 0; z < dd; z++)
	for(var y = 0; y < dh; y++)
	for(var x = 0; x < dw; x++) {
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

		dv[i] = func(px * dx + py * dy + pz * dz, a, b, c, d)
	}
}



function nearest(x, a, b, c, d) {
	return x < 0.5 ? b : c
}

function linear(x, a, b, c, d) {
	return (c - b) * x + b
}

function smoothstep(x, a, b, c, d) {
	var t = x * x * (3 - 2 * x)
	return b + (c - b) * t
}

function smootherstep(x, a, b, c, d) {
	var t = x * x * x * (x * (x * 6 - 15) + 10)
	return b + (c - b) * t
}

function cubic(x, a, b, c, d) {
	return b + 0.5 * x*(c - a + x*(2*a - 5*b + 4*c - d + x*(3*(b - c) + d - a)))
}

function tangent(x, a, b, c, d) {
	var kb = b *2 -1
	var kc = c *2 -1
	var t = x - 0.5
	var tb = t * kb
	var tc = (t - 1) * kc
	return t * (tc - tb) + tb + 0.5
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
		filter = filters[kbd.key -1] || nearest
		run()

	} else switch(kbd.key) {
		case '-':
			backgroundResize(1/2)
		break

		case '=':
			backgroundResize(2)
		break

		case 'ENTER':
			for(var name in perf.values) perf.flushLocal(name)
			updateStats()
		break

		case 'SPACE':
			rerun()
		break

		case 'e':
			edgeRepeat = !edgeRepeat
			run()
		break

		case 'x':
			useComponent = (useComponent + 1) % 3
			drawSlice()
		break

		case 'z':
			useNormal = !useNormal
			drawSlice()
		break

		case 'n':
			currentZ = (currentZ + 1) % (s * i)
			drawSlice()
		break

		case 'p':
			currentZ = (currentZ || (s * i)) - 1
			drawSlice()
		break
	}
}





function loop() {
	requestAnimationFrame(loop)

	currentZ = (currentZ || (s * i)) - 1
	drawSlice()
}
