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





var mt = new MersenneTwister(seed)





var cvs = dom.elem('canvas', null, document.body)
var ctx = cvs.getContext('2d')
var dat = new Float32Array(w1 * h1)
var pix = ctx.createImageData(w1, h1)

cvs.width = w1
cvs.height = h1


f.copy(cvs.style, {
	width:  /* w1 * 32 + */'256px',
	height: /* h1 * 32 + */'256px',
	imageRendering: 'pixelated',
})






var cvs2 = dom.elem('canvas', null, document.body)
var ctx2 = cvs2.getContext('2d')
var dat2 = new Float32Array(w2 * h2)
var pix2 = ctx2.createImageData(w2, h2)

cvs2.width = w2
cvs2.height = h2


f.copy(cvs2.style, {
	width:  '256px',
	height: '256px',
	imageRendering: 'pixelated',
})



var cvs3 = dom.elem('canvas', null, document.body)
var ctx3 = cvs3.getContext('2d')
var dat3 = new Float32Array(w3 * h3)
var pix3 = ctx3.createImageData(w3, h3)

cvs3.width = w3
cvs3.height = h3


f.copy(cvs3.style, {
	width:  '256px',
	height: '256px',
	imageRendering: 'pixelated',
})



var cvs0 = dom.elem('canvas', null, document.body)
var ctx0 = cvs0.getContext('2d')

cvs0.width = w1
cvs0.height = h1

f.copy(cvs0.style, {
	width:  '256px',
	height: '256px',
})




new EventHandler(onResize).listen('resize', window)



onResize()
generate()






function generate() {
	var d = pix.data
	for(var y = 0; y < h1; y++)
	for(var x = 0; x < w1; x++) {
		var i = y * w1 + x

		var v = mt.random()

		dat[i] = v

		var o = i * 4
		d[o +0] = v * 255 |0
		d[o +1] = v * 255 |0
		d[o +2] = v * 255 |0
		d[o +3] = 255
	}

	ctx.putImageData(pix, 0, 0)
	ctx0.putImageData(pix, 0, 0)

	generate2()
}

function generate2() {
	var d = pix2.data

	for(var y = 0; y < h2; y++)
	for(var x = 0; x < w2; x++) {
		var i = y * w2 + x

		var x1 = x / sw2 |0
		var y1 = y / sh2 |0

		var xp = (x - x1 * sw2) / sw2
		var yp = (y - y1 * sh2) / sh2

		var xa = (x1 || w1) - 1
		var xb = x1
		var xc = (x1 + 1) % w1
		var xd = (x1 + 2) % w1

		var ya = y1
		var yb = y1
		var yc = y1
		var yd = y1

		var ia = ya * w1 + xa
		var ib = yb * w1 + xb
		var ic = yc * w1 + xc
		var id = yd * w1 + xd

		var v = f.cubin(xp, dat[ia], dat[ib], dat[ic], dat[id])

		dat2[i] = v

		var o = i * 4
		d[o +0] = v * 255 |0
		d[o +1] = v * 255 |0
		d[o +2] = v * 255 |0
		d[o +3] = 255
	}

	ctx2.putImageData(pix2, 0, 0)

	generate3()
}


function generate3() {
	var d = pix3.data

	for(var y = 0; y < h3; y++)
	for(var x = 0; x < w3; x++) {
		var i = y * w3 + x

		var xu = x / sw3 |0
		var yu = y / sh3 |0

		var xp = x / sw3 - xu
		var yp = y / sh3 - yu

		var xa = xu
		var xb = xu
		var xc = xu
		var xd = xu

		var ya = (yu || h2) - 1
		var yb = yu
		var yc = (yu + 1) % h2
		var yd = (yu + 2) % h2

		var ia = ya * w2 + xa
		var ib = yb * w2 + xb
		var ic = yc * w2 + xc
		var id = yd * w2 + xd

		var v = f.cubin(yp, dat2[ia], dat2[ib], dat2[ic], dat2[id])

		dat3[i] = v

		var o = i * 4
		d[o +0] = v * 255 |0
		d[o +1] = v * 255 |0
		d[o +2] = v * 255 |0
		d[o +3] = 255
	}

	ctx3.putImageData(pix3, 0, 0)
}




function onResize() {
	var w = window.innerWidth
	,   h = window.innerHeight


	draw()
}

function draw() {

}
