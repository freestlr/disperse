f = {}

f.nop = function() {}

f.identity = function(a) {
	return a
}

f.nextprime = function(primes) {
	if(!primes) return [2, 3]

	next_number:
	for(var i = primes[primes.length -1] +2; 1; i++) {
		for(var j = 0; j < primes.length; j++) {
			if(i % primes[j] === 0) continue next_number
		}
		primes.push(i)
		return primes
	}
}

f.factorize = function(n, primes) {
	if(!primes) primes = f.nextprime()

	var np = []
	,   nr = n
	,   pi = 0
	while(nr > 1) {
		while(pi > primes.length -1) f.nextprime(primes)

		var pc = 0
		var p = primes[pi]
		while(nr / p % 1 === 0) {
			nr /= p
			pc++
		}

		np.push(pc)
		pi++
	}

	return np
}

f.lcm = function(values) {
	var factors = []
	,   longest = 0
	,   primes = f.nextprime()
	for(var i = 0; i < values.length; i++) {
		var x = f.factorize(values[i], primes)

		var longest = Math.max(x.length, factors.length)
		for(var j = 0; j < longest; j++) {
			factors[j] = Math.max(x[j] || 0, factors[j] || 0)
		}
	}

	var lcm = 1
	for(var i = 0; i < factors.length; i++) {
		lcm *= factors[i] * primes[i]
	}

	return lcm
}

f.sum = function(a, b) {
	return a + b
}
f.sub = function(a, b) {
	return a - b
}

f.nsort = function(name, invert) {
	var v = invert ? -1 : 1
	return function(a, b) {
		return a == null || b == null ? -1 : v * (a[name] - b[name])
	}
}

f.zerosort = function(a, b) {
	return a && b ? a[0] - b[0] : 0
}

f.sort = function(array, func, scope, descending) {
	var l = array.length
	,   m = descending ? -1 : 1
	,   r = []
	for(var i = 0; i < l; i++) {
		var e = array[i]
		r.push( [m * func.call(scope, e), e] )
	}
	r.sort(f.zerosort)
	for(var i = 0; i < l; i++) {
		array[i] = r[i][1]
	}
	return array
}

f.max = function(array) {
	return Math.max.apply(0, array)
}

f.min = function(array) {
	return Math.min.apply(0, array)
}

f.amap = function(array, func, scope, a, b, c) {
	if(array && array.length && typeof func === 'function') {

		for(var i = 0, r = []; i < array.length; i++) {
			r.push(func.call(scope, array[i], a, b, c))
		}
	}

	return r
}

f.atog = function(array, value, enabled) {
	if(!array) return
	for(var i = array.length -1; i >= 0; i--) {
		if(array[i] === value) {
			if(enabled) return
			else array.splice(i, 1)
		}
	}
	if(enabled) array.push(value)
}
f.apick = function(array, name, value, negate) {
	if(array) for(var i = 0, l = array.length, item; i < l; i++) {
		item = array[i]
		if((item && item[name] === value) ^ negate) return item
	}
}
f.apickf = function(array, func, scope, negate) {
	if(array) for(var i = 0, l = array.length, item; i < l; i++) {
		item = array[i]
		if(func.call(scope, item) ^ negate) return item
	}
}

f.afind = function(array, name, value, negate) {
	if(array) for(var i = 0, l = array.length, item, r = []; i < l; i++) {
		item = array[i]
		if((item && item[name] === value) ^ negate) r.push(item)
	}
	return r
}
f.afindf = function(array, func, scope, negate) {
	if(array) for(var i = 0, l = array.length, item, r = []; i < l; i++) {
		item = array[i]
		if(func.call(scope, item) ^ negate) r.push(item)
	}
	return r
}

f.adiff = function(next, prev) {
	var diff = {
		prev : prev || [],
		next : next || [],
		rem  : [],
		remi : [],
		remc : 0,
		add  : [],
		addi : [],
		addc : 0
	}

	for(var a = diff.prev.length -1; a >= 0; a--) {
		var e = diff.prev[a]
		,   b = diff.next.indexOf(e)

		if(b === -1) {
			diff.rem.push(e)
			diff.remi.push(a)
			diff.remc++
		}
	}

	for(var b = 0; b < diff.next.length; b++) {
		var e = diff.next[b]
		,   a = diff.prev.indexOf(e)

		if(a === -1) {
			diff.add.push(e)
			diff.addi.push(b)
			diff.addc++
		}
	}

	return diff
}

f.amove = function(next, prev, deep) {
	var plen = prev && prev.length || 0
	,   nlen = next && next.length || 0

	var diff = {
		prev : plen ? prev : [],
		next : nlen ? next : [],
		plen : plen,
		nlen : nlen,
		rem  : [],
		remi : [],
		remc : 0,
		add  : [],
		addi : [],
		addc : 0,
		src  : [],
	}

	var change = false
	,   stack = diff.prev.slice()
	,   empty = {}

	loop_prev:
	for(var bi = 0; bi < diff.next.length; bi++) {
		var b = diff.next[bi]

		for(var ai = 0; ai < plen; ai++) {
			var a = stack[ai]
			if(a === empty) continue

			if(deep ? !f.jeq(a, b) : a !== b) continue

			if(ai !== bi) {
				change = true
			}

			stack[ai] = empty
			diff.src[bi] = ai
			continue loop_prev
		}

		change = true
		diff.src[bi] = -1
		diff.add.push(b)
		diff.addi.push(bi)
		diff.addc++
	}

	for(var ai = plen -1; ai >= 0; ai--) {
		var a = stack[ai]
		if(a === empty) continue

		change = true
		diff.rem.push(a)
		diff.remi.push(ai)
		diff.remc++
	}

	return change ? diff : null
}

f.adrop = function(array, item) {
	var index = array.indexOf(item)
	if(~index) array.splice(index, 1)
	return array
}

f.aflat = function(array) {
	return [].concat.apply([], array)
}


f.hinc = function(hash, key, inc) {
	if(!hash) return

	if(key in hash === false) {
		hash[key] = inc
	} else {
		hash[key]+= inc
	}
}

f.hush = function(hash, key, item) {
	if(!hash) return

	if(key in hash === false) {
		hash[key] = [item]
	} else {
		hash[key].push(item)
	}
}


f.jcp = function(json) {
	if(!json) return json

	try {
		return JSON.parse(JSON.stringify(json))
	} catch(e) {
		return null
	}
}

f.jeq = function(a, b) {
	if(a === b) return true

	var at = typeof a
	,   bt = typeof b
	if(at !== bt) return false

	switch(at) {
		case 'boolean':
		case 'number':
		case 'string': return false
	}

	if(!a || !b) return false
	if(a.length !== b.length) return false

	var k
	for(k in a) if(k in b === false) return false
	for(k in b) if(!f.jeq(a[k], b[k])) return false

	return true
}

f.jdepth = function(a) {
	switch(typeof a) {
		case 'boolean':
		case 'number':
		case 'string':
		case 'function':
			return 1
	}

	if(!a) return 0


	var d = 1
	for(var k in a) d += f.jdepth(a[k])
	return d
}

f.jdist = function(a, b) {
	if(a === b) return 0

	var at = typeof a
	,   bt = typeof b
	if(at !== bt) return f.jdepth(a) + f.jdepth(b)

	switch(at) {
		case 'boolean':
		case 'number':
		case 'string':
		case 'function':
			return 1
	}

	if(!a) return f.jdepth(b)
	if(!b) return f.jdepth(a)

	var k, d = 0
	for(k in a) if(k in b === false) d += f.jdepth(a[k])
	for(k in b) if(k in a === false) d += f.jdepth(b[k])
		else d += f.jdist(a[k], b[k])

	return d
}


f.seq = function(a, b) {
	return !a && !b ? true :
		!a === !b && a.length === b.length && f.snot(a, b).length === 0
}
f.sor = function() {
	var c = []
	for(var i = 0; i < arguments.length; i++) {
		var a = arguments[i]

		if(a) for(var j = 0; j < a.length; j++) {
			var e = a[j]
			if(c.indexOf(e) === -1) c.push(e)
		}
	}
	return c
}
f.sand = function(a, b) {
	if(!a || !b) return []

	var c = []
	for(var i = 0, l = a.length; i < l; i++) {
		var e = a[i]
		if(b.indexOf(e) !== -1 && c.indexOf(e) === -1) c.push(e)
	}
	return c
}
f.sxor = function(a, b) {
	if(!a || !b) return a ? a : b ? b : []

	var c = [].concat(a, b)
	for(var i = c.length -1; i >= 0; i--) {
		var j = c.indexOf(c[i])

		if(i !== j) {
			c.splice(i, 1)
			c.splice(j, 1)
			i--
		}
	}
	return c
}
f.snot = function(a, b) {
	a = a || []
	b = b || []

	var c = []
	for(var i = 0, l = a.length; i < l; i++) {
		var e = a[i]
		if(b.indexOf(e) === -1 && c.indexOf(e) === -1) c.push(e)
	}
	return c
}


f.uniqp = function(invert, dropMultiple) {
	return function(e, i, a) {
		return !invert ^ (a.indexOf(e) === (dropMultiple ? a.lastIndexOf(e) : i))
	}
}
f.uniq = function(e, i, a) {
	return a.indexOf(e) === i
}
f.uniqi = function(e, i, a) {
	return a.indexOf(e) !== i
}
f.uniqm = function(e, i, a) {
	return a.indexOf(e) === a.lastIndexOf(e)
}
f.uniqim = function(e, i, a) {
	return a.indexOf(e) !== a.lastIndexOf(e)
}


f.clamp = function(num, min, max) {
	return num < min ? min : num > max ? max : num
}

f.rand = function(num) {
	return Math.floor(Math.random() * (+num || 1))
}

f.any = function(array) {
	return array && array[f.rand(array.length)]
}

f.exp = function(val) {
	var exp  = 0
	,   absv = Math.abs(val)

	if(absv === 0 || !isFinite(absv)) return absv

	if(absv < 1) while(Math.pow(10, exp    ) >  absv) exp--
	else         while(Math.pow(10, exp + 1) <= absv) exp++
	return exp
}

f.hround = function(val) {
	return Math.round(val * 100) / 100
}

f.pround = function(val, exp) {
	var precision = +exp || 0

	if(precision < 0) {
		var add = Math.pow(10, -precision)
		return Math.round(val / add) * add
	} else {
		var add = Math.pow(10,  precision)
		return Math.round(val * add) / add
	}
}

f.mround = function(val, mant) {
	return f.pround(val, mant - f.exp(val))
}

f.eround = function(val, mant, eps) {
	return f.pround(val, Math.min(eps, mant - f.exp(val)))
}

f.cround = function(val) {
	return f.pround(val, Math.min(7, 2 - f.exp(val)))
}

f.xrad = Math.PI / 180
f.torad = function(val) {
	return val * f.xrad
}

f.xdeg = 180 / Math.PI
f.todeg = function(val) {
	return val * f.xdeg
}

f.radist = function(rad) {
	// return this.radistp(rad, 2 * Math.PI)
	return Math.abs(rad) > Math.PI
		? rad - 2 * Math.PI * Math.ceil(Math.floor(Math.abs(rad) / Math.PI) / 2) * (rad < 0 ? -1 : 1)
		: rad
}
f.radistp = function(rad, tau) {
	var pi = tau / 2
	return Math.abs(rad) > pi
		? rad - tau * Math.ceil(Math.floor(Math.abs(rad) / pi) / 2) * (rad < 0 ? -1 : 1)
		: rad
}

f.prop = function(name) {
	var args = arguments

	return function(item) {
		for(var i = 0; item && i < args.length; i++) item = item[args[i]]
		return item
	}
}

f.pset = function(name, value) {
	return function(item) {
		item[name] = value
	}
}

f.func = function(name) {
	for(var args = [], i = 1; i < arguments.length; i++) args.push(arguments[i])

	return function(item) {
		return item[name]
			&& typeof item[name].apply === 'function'
			&& item[name].apply(item, args)
	}
}

f.call = function(item) {
	return typeof item === 'function' && item.call(this)
}

f.range = function(length) {
	length = +length || 0
	for(var r = [], i = 0; i < length; i++) r.push(i)
	return r
}

f.rangep = function(length, start, step) {
	length = isNaN(length) ? 0 : +length
	start  = start == null ? 0 : start
	step   = step  == null ? typeof start === 'number' ? 1 : 0 : step
	for(var r = [], i = 0; i < length; i++) r.push(step ? i * step + start : start)
	return r
}

f.qsenc = function(object, scheme) {
	if(!scheme) scheme = '&='

	var pairs = []
	for(var key in object) {
		var ken = encodeURIComponent(key)
		,   val = object[key]
		if(val == null) continue

		if(val instanceof Array) {
			for(var i = 0; i < val.length; i++) {
				pairs.push(ken + scheme[1] + encodeURIComponent(val[i]))
			}
		} else {
			pairs.push(ken + scheme[1] + encodeURIComponent(val))
		}
	}
	return pairs.join(scheme[0])
}

f.qsdec = function(string, scheme) {
	if(!scheme) scheme = '&='

	var object = {}
	,   pairs  = string.split(scheme[0])

	for(var i = 0; i < pairs.length; i++) {
		var pair = pairs[i].split(scheme[1])
		,   key = decodeURIComponent(pair[0])
		,   val = decodeURIComponent(pair[1])

		if(key in object) {
			var old = object[key]
			if(old instanceof Array) old.push(val)
			else object[key] = [old, val]

		} else {
			object[key] = val
		}
	}
	return object
}

f.follow = function(item, name) {
	for(var stack = []; item; item = item[name]) {
		stack.push(item)
	}
	return stack
}

f.copy = function(destination, source) {
	if(destination) for(var name in source) {
		if(Object.prototype.hasOwnProperty.call(source, name)) {
			destination[name] = source[name]
		}
	}
	return destination
}

f.copylist = function(destination, source, list) {
	for(var name in source) if(list.indexOf(name) !== -1) {
		if(Object.prototype.hasOwnProperty.call(source, name)) {
			destination[name] = source[name]
		}
	}
	return destination
}

f.merge = function() {
	for(var r = {}, i = 0; i < arguments.length; i++) f.copy(r, arguments[i])
	return r
}

f.throttle = function(delay, fn) {
	var last = 0
	return function() {
		var now = new Date
		if(now - last > delay) {
			last = now
			return fn.apply(this, arguments)
		}
	}
}

f.postpone = function(delay, func, scope) {
	var timer = false
	,   poned = false
	return function() {
		if(timer) {
			poned = true
		} else {
			timer = true
			setTimeout(end, delay)
		}
	}
	function end() {
		if(poned) {
			poned = false
			setTimeout(end, delay)
		} else {
			timer = false
			func.call(scope)
		}
	}
}

f.after = function(delay, func, scope, data) {
	setTimeout(function() {
		func.call(scope, data)
	}, delay)
}

f.charmap = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
f.randchar = function() {
	return f.any(f.charmap)
}

f.implode = function(string, data, scheme, skip) {
	if(!scheme) scheme = /#\{(\w+)\}/g
	return string.replace(scheme, function(match, name) {
		return name in data ? data[name] : skip ? match : ''
	})
}

f.nzformat = function(num, size, zero) {
	if(isNaN(num)) return num +''

	var abs  = Math.abs(num)
	,   diff = size - Math.max(0, f.exp(abs))
	,   gap  = diff > 1 ? Array(diff).join(zero || '0') : ''
	return (num < abs ? '-' : '') + gap + abs
}

f.nformat = function(num, size, zero) {
	var abs  = Math.abs(num)
	,   neg  = num < abs
	,   exp  = isNaN(num) ? 2 : f.exp(abs)
	,   fill = zero ? '0' : ' '
	,   diff = size - Math.max(0, exp) - neg - 1
	,   gap  = diff > 1 ? Array(diff).join(fill) : ''
	,   sign =  zero && neg ? '-' : fill
	,   val  = !zero && neg ? num : abs
	return sign + gap + val
}

f.dformat = function(date, format) {
	var map = {
		'Y': 'getFullYear',
		'M': 'getMonth',
		'D': 'getDate',
		'h': 'getHours',
		'i': 'getMinutes',
		's': 'getSeconds'
	}
	var add = {
		'M': 1
	}
	return format.replace(/([YMDhis])(\1+)?/g, function(all, one) {
		return f.nzformat(date[map[one]]() + (add[one] || 0), all.length)
	})
}

f.tformat = function(table, options) {
	if(options       == null) options = {}
	if(options.join  == null) options.join = ' '

	var rowc = table.length
	,   colc = table[0].length

	var rows = []
	for(var i = 0; i < rowc; i++) {
		rows.push(f.rangep(colc, 0, null))
	}

	for(var j = 0; j < colc; j++) {
		var dl = []
		,   dr = []
		,   ds = []
		,   da = []

		var ml = 0
		,   mr = 0
		,   ma = 0

		for(var i = 0; i < rowc; i++) {
			var val = table[i][j]
			,   num = val === +val
			,   str = val == null ? '' : (num ? f.cround(val) : val) +''

			if(!j && options.indent && i < options.indent.length) {
				str = options.indent[i] + str
			}

			var len = str.length

			var cl = -1
			,   cr = 0

			if(num) {
				var pti = str.indexOf('.')
				cl = pti === -1 ? len : pti
				cr = pti === -1 ?   0 : len - pti
			}

			ml = Math.max(ml, cl)
			mr = Math.max(mr, cr)
			ma = Math.max(ma, len)

			dl.push(cl)
			dr.push(cr)
			ds.push(str)
			da.push(len)
		}

		if (ml + mr < ma) ml = ma - mr

		for(var i = 0; i < rowc; i++) {
			var cs = ds[i]
			,   cl = dl[i]
			,   cr = dr[i]
			,   ca = da[i]

			var ol = cl === -1 ? 0 : ml - cl
			,   or = cl === -1 ? ml + mr - ca : mr - cr

			var il = Array(1 + Math.max(0, ol)).join(' ')
			,   ir = Array(1 + Math.max(0, or)).join(' ')

			rows[i][j] = il + cs + ir
		}
	}


	var string = []
	for(var i = 0; i < rowc; i++) {
		string.push(rows[i].join(options.join))
	}

	return string.join('\n')
}

f.tindsym = ['\u2514', '\u251C', ' ', '\u2502']
// f.tindsym = ['└', '├ ' ', '│']
// f.tindsym = ['L_', '|-', '  ', '| ']
f.tind = function(order) {
	for(var indent = ''; order > 1; order >>= 1) {
		indent = f.tindsym[(order % 2) + (!!indent.length * 2)] + indent
	}
	return indent
}

f.tmap = function(node, func, scope, options, level, order, parent, index) {
	if(!options) {
		options = {}
	}
	if(!options.list) {
		options.list = []
	}

	if(typeof func !== 'function') {
		func = null
	}

	if(!node || options.stop) {
		return options
	}

	if(level == null) {
		level = 0
		order = 1

		if(options.print) {
			if(!options.indent) {
				options.indent = []
			}
		}
	}

	if(level == null) level = 0
	if(order == null) order = 1

	if(options.maxdepth != null && level > options.maxdepth) {
		return options
	}

	if(options.mindepth == null || level >= options.mindepth) {
		var result = func ? func.call(scope || node, node, options, level, parent, index) : node

		if(options.stop) return options
		if(result != null) options.list.push(result)
		if(options.print) options.indent.push(f.tind(order))
	}

	var children = options.property ? node[options.property] : node.children
	if(!children) return options

	var l = children.length
	,   r = options.reverse
	for(var i = r ? l -1 : 0; r ? i >= 0 : i < l; r ? i-- : i++) {
		f.tmap(children[i], func, scope, options, level +1, (order << 1)+ +(i < l -1), node, i)
	}

	if(options.print && level === 0) {
		console.log(f.tformat(options.list, {
			join: options.join,
			indent: options.indent

		}) +'\n')
	}

	return options
}

f.rgb = function(rgb) {
	return 'rgb('+ [
		rgb[0] * 255 |0,
		rgb[1] * 255 |0,
		rgb[2] * 255 |0 ] +')'
}

f.rgba = function(rgb, a) {
	return 'rgba('+ [
		rgb[0] * 255 |0,
		rgb[1] * 255 |0,
		rgb[2] * 255 |0
	].concat(isNaN(a) ? 1 : +a) +')'
}

f.rcolor = function(alpha) {
	return 'rgba('+ [255,255,255].map(f.rand).concat(+alpha || 1) +')'
}

f.softcolor = function(frac) {
	var t = 2 * Math.PI
	var r = t * frac

	return [
		Math.cos(r          ) / 2 + 0.5,
		Math.cos(r + 2/3 * t) / 2 + 0.5,
		Math.cos(r + 1/3 * t) / 2 + 0.5 ]
}

f.logcall = function(name, args, original) {
	console.log(name, args)
}

f.mitm = function(object, method, watcher, modify) {
	var original = object[method]

	if(typeof original !== 'function') return
	if(typeof watcher  !== 'function') {
		watcher = f.logcall
	}
	object[method] = function() {
		var result = watcher.call(this, method, arguments, original)
		return modify ? result : original.apply(this, arguments)
	}
}

f.inspect = function(object, func, modify) {
	for(var name in object) if(typeof object[name] === 'function') {
		f.mitm(object, name, func, modify)
	}
}

f.binds = function(func, scope) {
	if(typeof func !== 'function') {
		throw Error('object to bind is not a function')
	}

	return function() {
		return func.apply(scope, arguments)
	}
}
f.binda = function(func, scope, bound) {
	if(typeof func !== 'function') {
		throw Error('object to bind is not a function')
	}

	return function() {
		return func.apply(scope, bound)
	}
}
f.bindr = function(func, scope, bound, replace) {
	if(typeof func !== 'function') {
		throw Error('object to bind is not a function')
	}

	return function() {
		var args = []

		for(var a = 0, b = 0; b < bound.length; b++) {
			args.push(bound[b] === replace ? arguments[a++] : bound[b])
		}
		while(a < arguments.length) args.push(arguments[a++])
		return func.apply(scope, args)
	}
}

f.proto = function(parent, object) {
	if(arguments.length <2 && typeof parent !== 'function') {
		object = parent
		parent = null
	}
	var proto = parent ? f.copy(Object.create(parent.prototype), object) : object
	,   Proto = null

	if(0) {
		Proto = function() {
			if(typeof this.init === 'function') this.init.apply(this, arguments)
		}
	} else {
		Proto = eval('(function '+ (proto.unitName || proto.PROTO || 'Proto') +'() {'+
			'if(typeof this.init === "function") this.init.apply(this, arguments)'+
		'})')
	}

	Proto.New = function() {
		var unit = Object.create(Proto.prototype)
		Proto.apply(unit, arguments)
		return unit
	}

	Proto.prototype = proto
	proto.protochain = proto.protochain ? proto.protochain.concat(proto) : [proto]
	proto.constructor = Proto
	return Proto
}
f.unit = function() {
	console.warn('f.unit() is now [deprecated], please use f.proto() instead')
	return f.proto.apply(this, arguments)
}

// f.protomerge = function(unit, name) {
// 	var value = {}
// 	,   last = null
// 	for(var i = 0; i < unit.protochain.length; i++) {
// 		var proto = unit.protochain[i]
// 		if(proto !== last) {
// 			f.copy(value, proto[name])
// 			last = proto
// 		}
// 	}
// 	f.copy(value, unit[name])
// 	return value
// }
//
// f.protocat = function(unit, name) {
// 	var value = unit.protochain[0][name]
// 	,   last = null
// 	for(var i = 1; i < unit.protochain.length; i++) {
// 		var proto = unit.protochain[i]
// 		if(proto !== last) {
// 			value += proto[name]
// 			last = proto
// 		}
// 	}
// 	value += unit[name]
// 	return value
// }
//
// f.protocall = function(unit, name) {
// 	for(var i = 0; i < unit.protochain.length; i++) {
// 		var proto = unit.protochain[i]
// 		,   method = proto[name]
//
// 		if(Object.prototype.hasOwnProperty.call(proto, name)
// 		&& typeof method === 'function') method.call(unit)
// 	}
// }
//
// f.protodo = function(unit, name, init, func, scope) {
// 	var first = init == null
// 	,   chain = unit.protochain
// 	,   value = first ? chain[0] : init
// 	,   last = null
// 	for(var i = first ? 1 : 0; i < chain.length; i++) {
// 		var proto = chain[i]
// 		if(proto !== last) {
// 			value = func.call(scope, value, proto[name])
// 			last = proto
// 		}
// 	}
// 	return func.call(scope, value, unit[name])
// }
f.protoget = function(unit, name) {
	var list = []
	,   last = null
	,   value = null
	for(var i = 0; i < unit.protochain.length; i++) {
		var proto = unit.protochain[i]

		value = proto[name]
		if(value === last) continue

		list.push(value)
		last = value
	}

	value = unit[name]
	if(value !== last) list.push(value)
	return list
}

f.protomerge = function(unit, name) {
	// return f.protodo(unit, name, {}, f.copy)
	return f.protoget(unit, name).reduce(f.copy, {})
}

f.protocat = function(unit, name) {
	// return f.protodo(unit, name, '', f.sum)
	return f.protoget(unit, name).reduce(f.sum, '')
}

f.protocall = function(unit, name) {
	// return f.protodo(unit, name, unit, function(func) { func.call(this); return unit })
	return f.protoget(unit, name).forEach(f.call, unit)
}
