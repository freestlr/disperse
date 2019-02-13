var seed = 543334




var s = 8
var i = 16

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
	draw(g1, g1.dat)
	draw(g2, g2.dat)
	draw(g3, g3.dat)
	draw(g4, g4.dat)

	backgroundCapture()
}

function rerun(set) {
	seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
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
	var dat = new Float32Array(w * h)
	var pix = ctx.createImageData(w, h)

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
		cvs: cvs,
		ctx: ctx,
		dat: dat,
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
	})
}

function backgroundResize(scale) {
	bgSize *= scale

	f.copy(document.body.style, {
		'background-size': bgSize +'px '+ bgSize +'px',
	})
}


function draw(g, dat) {
	var d = g.pix.data
	for(var y = 0; y < g.h; y++)
	for(var x = 0; x < g.w; x++) {
		var i = y * g.w + x
		var o = i * 4
		var v = dat[i]

		d[o +0] = v * 255 |0
		d[o +1] = v * 255 |0
		d[o +2] = v * 255 |0
		d[o +3] = 255
	}

	g.ctx.putImageData(g.pix, 0, 0)
}

function generate(g) {
	for(var y = 0; y < g.h; y++)
	for(var x = 0; x < g.w; x++) {
		var i = y * g.w + x

		g.dat[i] = mt.random()
	}
}

function interh(dst, src, func) {
	var sw = dst.w / src.w
	var sh = dst.h / src.h

	for(var y = 0; y < dst.h; y++)
	for(var x = 0; x < dst.w; x++) {
		var i = y * dst.w + x

		var x1 = x / sw |0
		var y1 = y / sh |0

		var p = (x - x1 * sw) / sw

		var xa = (x1 || src.w) - 1
		var xb = x1
		var xc = (x1 + 1) % src.w
		var xd = (x1 + 2) % src.w

		var a = src.dat[y1 * src.w + xa]
		var b = src.dat[y1 * src.w + xb]
		var c = src.dat[y1 * src.w + xc]
		var d = src.dat[y1 * src.w + xd]

		dst.dat[i] = func(p, a, b, c, d)
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

		var p = y / sh - y1

		var ya = (y1 || src.h) - 1
		var yb = y1
		var yc = (y1 + 1) % src.h
		var yd = (y1 + 2) % src.h

		var a = src.dat[ya * src.w + x1]
		var b = src.dat[yb * src.w + x1]
		var c = src.dat[yc * src.w + x1]
		var d = src.dat[yd * src.w + x1]

		dst.dat[i] = func(p, a, b, c, d)
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
	return linear(x, 0, x * kb, (x - 1) * kc, 0) +.5
	// return (x * kb * (1 - x) + (x - 1) * kc * x) *.5 +.5
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

		default:
			console.log('key', e.keyCode, key)
	}
}

function onResize() {
	var w = window.innerWidth
	,   h = window.innerHeight
}
