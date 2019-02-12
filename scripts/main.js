var seed = 543334



var w1 = 8
var h1 = 8

var sw2 = 16
var sh2 = 1
var w2 = w1 * sw2
var h2 = h1 * sh2

var sw3 = 1
var sh3 = 16
var w3 = w2 * sw3
var h3 = h2 * sh3


var g = {}



var mt = new MersenneTwister



var g0 = makeCanvasSet(w1, h1, { imageRendering: 'auto' })
var g1 = makeCanvasSet(w1, h1)
var g2 = makeCanvasSet(w2, h2)
var g3 = makeCanvasSet(w3, h3)







new EventHandler(onResize).listen('resize', window)



onResize()
run(seed)




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
	capture(set.cvs.toDataURL())
}

function onCanvasLeave(set) {
	capture(null)
}

function onCanvasClick(set) {
	run(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
	onCanvasLeave(set)
	onCanvasEnter(set)
}

function capture(url) {
	f.copy(document.body.style, {
		'background-image': url ? 'url('+ url +')' : '',
		'background-size': '256px 256px',
		'background-position': '0 0',
	})
}


function run(seed) {
	mt.init(seed)

	generate(g1)
	generate2(g2, g1)
	generate3(g3, g2)

	draw(g0, g1.dat)
	draw(g1, g1.dat)
	draw(g2, g2.dat)
	draw(g3, g3.dat)
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

		var v = mt.random()

		g.dat[i] = v
	}
}

function generate2(g, gu) {
	var sw = g.w / gu.w
	var sh = g.h / gu.h

	for(var y = 0; y < g.h; y++)
	for(var x = 0; x < g.w; x++) {
		var i = y * g.w + x

		var x1 = x / sw |0
		var y1 = y / sh |0

		var xp = (x - x1 * sw) / sw
		var yp = (y - y1 * sh) / sh

		var xa = (x1 || gu.w) - 1
		var xb = x1
		var xc = (x1 + 1) % gu.w
		var xd = (x1 + 2) % gu.w

		var ya = y1
		var yb = y1
		var yc = y1
		var yd = y1

		var ia = ya * gu.w + xa
		var ib = yb * gu.w + xb
		var ic = yc * gu.w + xc
		var id = yd * gu.w + xd

		var v = f.cubin(xp, gu.dat[ia], gu.dat[ib], gu.dat[ic], gu.dat[id])

		g.dat[i] = v
	}
}


function generate3(g, gu) {
	var sw = g.w / gu.w
	var sh = g.h / gu.h

	for(var y = 0; y < g.h; y++)
	for(var x = 0; x < g.w; x++) {
		var i = y * g.w + x

		var xu = x / sw |0
		var yu = y / sh |0

		var xp = x / sw - xu
		var yp = y / sh - yu

		var xa = xu
		var xb = xu
		var xc = xu
		var xd = xu

		var ya = (yu || gu.h) - 1
		var yb = yu
		var yc = (yu + 1) % gu.h
		var yd = (yu + 2) % gu.h

		var ia = ya * gu.w + xa
		var ib = yb * gu.w + xb
		var ic = yc * gu.w + xc
		var id = yd * gu.w + xd

		var v = f.cubin(yp, gu.dat[ia], gu.dat[ib], gu.dat[ic], gu.dat[id])

		g.dat[i] = v
	}
}




function onResize() {
	var w = window.innerWidth
	,   h = window.innerHeight
}
