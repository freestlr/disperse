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
var useNormal = false

var g = {}



var mt = new MersenneTwister



// var g0 = makeCanvasSet(s, s, { imageRendering: 'auto' })
var g1 = makeCanvasSet(s, s)
var g4 = makeCanvasSet(s, s * i)
var g2 = makeCanvasSet(s * i, s)
var g3 = makeCanvasSet(s * i, s * i)


function run() {
	mt.init(seed)

	generate(g1)
	interh(g2, g1, filter)
	interv(g4, g1, filter)
	interv(g3, g2, filter)

	// draw(g0, g1.dat)
	draw(g1, g1)
	draw(g2, g2)
	draw(g3, g3)
	draw(g4, g4)

	backgroundCapture()
}

function rerun(set) {
	seed ++
	run()
}






new EventHandler(onResize).listen('resize', window)
new EventHandler(onKey).listen('keydown', window)



onResize()
backgroundCapture(null)
backgroundResize(1)
run()




function makeCanvasSet(w, h, options) {
	var opt = options || {}
	var cvs = dom.elem('canvas', null, document.body)
	var ctx = cvs.getContext('2d')
	// var dat = new Float32Array(w * h)
	var pix = ctx.createImageData(w, h)

	var vx = new Float32Array(w * h)
	var vy = new Float32Array(w * h)

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
		vx: vx,
		vy: vy,
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


function wrap(i, s) {
	return edgeRepeat ? ((i % s) + s) % s : Math.max(0, Math.min(s - 1, i))
}

function draw(g, gs) {
	var d = g.pix.data
	var vx = gs.vx
	var vy = gs.vy
	for(var y = 0; y < g.h; y++)
	for(var x = 0; x < g.w; x++) {
		var i = y * g.w + x
		var o = i * 4
		// var v = dat[i] *.5 +.5
		var cx = vx[i]
		var cy = vy[i]
		var cz = -1
		var ca = 1


		if(useComponent < 2) {
			var v = [vx, vy][useComponent]

			if(useNormal) {
				var pxi = wrap(x + 1, g.w)
				var nxi = wrap(x - 1, g.w)
				var pyi = wrap(y + 1, g.h)
				var nyi = wrap(y - 1, g.h)

				var nx = v[nxi + y * g.w]
				var px = v[pxi + y * g.w]
				var ny = v[x + nyi * g.w]
				var py = v[x + pyi * g.w]
				var dx = (px - nx)// / 2
				var dy = (py - ny)// / 2
				var norm = vnor(vvcross(vnor([1, 0, dx]), vnor([0, 1, dy])))

				cx = norm[0]
				cy = norm[1]
				cz = norm[2]
			} else {
				cx = cy = cz = v[i]
			}

		} else {
			if(useNormal) {
				var pl = Math.min(1, cx * cx + cy * cy)
				cz = Math.sqrt(1 - pl)
				var dl = 1 / Math.sqrt(cx * cx + cy * cy + cz * cz)
				cx *= dl
				cy *= dl
				cz *= dl
			} else {

			}
		}

		d[o +0] = (cx *.5 +.5) * 255 |0
		d[o +1] = (cy *.5 +.5) * 255 |0
		d[o +2] = (cz *.5 +.5) * 255 |0
		d[o +3] = ca * 255 |0
	}

	g.ctx.putImageData(g.pix, 0, 0)
}

function generate(g) {
	for(var y = 0; y < g.h; y++)
	for(var x = 0; x < g.w; x++) {
		var i = y * g.w + x

		// g.dat[i] = mt.random() * 2 - 1

		var px = mt.random() * 2 - 1
		var py = mt.random() * 2 - 1
		var pl = 1 / Math.max(1, Math.sqrt(px * px + py * py))

		g.vx[i] = px // * pl
		g.vy[i] = py // * pl
	}
}

function interh(dst, src, func) {
	var sw = dst.w / src.w
	var sh = dst.h / src.h
	var svx = src.vx
	var svy = src.vy
	var dvx = dst.vx
	var dvy = dst.vy

	for(var y = 0; y < dst.h; y++)
	for(var x = 0; x < dst.w; x++) {
		var i = y * dst.w + x

		var x1 = x / sw |0
		var y1 = y / sh |0

		var px = (x - x1 * sw) / sw

		var xa = wrap(x1 - 1, src.w)
		var xb = x1
		var xc = wrap(x1 + 1, src.w)
		var xd = wrap(x1 + 2, src.w)

		var ai = y1 * src.w + xa
		var bi = y1 * src.w + xb
		var ci = y1 * src.w + xc
		var di = y1 * src.w + xd

		// var a = src.dat[y1 * src.w + xa]
		// var b = src.dat[y1 * src.w + xb]
		// var c = src.dat[y1 * src.w + xc]
		// var d = src.dat[y1 * src.w + xd]

		// dst.dat[i] = func(px, a, b, c, d)

		dst.vx[i] = func(px, src.vx[ai], src.vx[bi], src.vx[ci], src.vx[di])
		dst.vy[i] = func(px, src.vy[ai], src.vy[bi], src.vy[ci], src.vy[di])
	}
}

function interv(dst, src, func) {
	var sw = dst.w / src.w
	var sh = dst.h / src.h

	for(var y = 0; y < dst.h; y++)
	for(var x = 0; x < dst.w; x++) {
		var i = y * dst.w + x

		var x1 = x / sw |0
		var y1 = y / sh |0

		var py = y / sh - y1

		var ya = wrap(y1 - 1, src.h)
		var yb = y1
		var yc = wrap(y1 + 1, src.h)
		var yd = wrap(y1 + 2, src.h)

		var ai = ya * src.w + x1
		var bi = yb * src.w + x1
		var ci = yc * src.w + x1
		var di = yd * src.w + x1

		// var a = src.dat[ya * src.w + x1]
		// var b = src.dat[yb * src.w + x1]
		// var c = src.dat[yc * src.w + x1]
		// var d = src.dat[yd * src.w + x1]

		// dst.dat[i] = func(py, a, b, c, d)

		dst.vx[i] = func(py, src.vx[ai], src.vx[bi], src.vx[ci], src.vx[di])
		dst.vy[i] = func(py, src.vy[ai], src.vy[bi], src.vy[ci], src.vy[di])
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

function onKey(e) {
	var cod = e.keyCode
	var key = String.fromCharCode(cod).toLowerCase()
	if(cod >= 49 && cod <= 57) {
		filter = filters[cod - 49] || nearest
		run()

	} else switch(cod) {
		case 189: // -
			backgroundResize(1/2)
		break

		case 187: // =
			backgroundResize(2)
		break

		case 32: // space
			rerun()
		break

		case 69: // e
			edgeRepeat = !edgeRepeat
			run()
		break

		case 88: // x
			useComponent = (useComponent + 1) % 3
			run()
		break

		case 90: // z
			useNormal = !useNormal
			run()
		break

		default:
			console.log('key', e.keyCode, key)
	}
}

function onResize() {
	var w = window.innerWidth
	,   h = window.innerHeight
}
