var perf = {
	precision: Infinity,
	values: {},

	time: function() {
		return window.performance && window.performance.now ? window.performance.now()
			:  Date.now ? Date.now()
			:  new Date().getTime()
	},

	round: function(v) {
		return perf.precision === -Infinity ? f.cround(v)
			: perf.precision === Infinity ? v
			: f.mround(v, perf.precision)
	},

	start: function(name) {
		var v = perf.values[name]
		if(!v) {
			v = perf.values[name] = {
				totalTime   :  0,
				totalCycles :  0,
				totalBest   :  Infinity,
				totalWorst  : -Infinity,
				localTime   :  0,
				localCycles :  0,
				localBest   :  Infinity,
				localWorst  : -Infinity,
				lastTime    :  0,
				startTime   :  0
			}
		}

		v.startTime = perf.time()
	},

	end: function(name, flushCycles) {
		var v = perf.values[name]
		if(!v) return

		v.lastTime = perf.time() - v.startTime
		v.startTime = 0

		v.totalCycles++
		v.localCycles++

		v.totalBest  = Math.min(v.totalBest, v.lastTime)
		v.totalWorst = Math.max(v.totalWorst, v.lastTime)

		v.localBest  = Math.min(v.localBest, v.lastTime)
		v.localWorst = Math.max(v.localWorst, v.lastTime)

		v.totalTime += v.lastTime
		v.localTime += v.lastTime

		if(v.localCycles >= flushCycles) perf.show(name)
	},

	flushLocal: function(name) {
		var v = perf.values[name]
		if(!v) return

		v.localTime   =  0
		v.localCycles =  0
		v.localBest   =  Infinity
		v.localWorst  = -Infinity
	},

	show: function(name, noFlush) {
		var v = perf.values[name]
		if(!v) return console.log('perf: no', name)

		console.log(perf.format('perf %n: %a avg, %b best, %w worst, %t ms, %c cycles, %C total cycles, %A total avg', name))

		if(!noFlush) perf.flushLocal(name)
	},

	getlist: function(list, format) {
		// return f.tformat(list).map(function(name) { return perf.format(format , name) })
		return f.tformat(list.map(name => perf.format(format, name)))
	},

	getall: function(format) {
		return perf.getlist(Object.keys(perf.values), format)
	},

	format: function(fmt, name) {
		var v = perf.values[name]
		if(!v) return console.log('perf: no', name)

		var map = {
			'%n': name,

			'%T': v.totalTime,
			'%C': v.totalCycles,
			'%B': perf.round(v.totalBest),
			'%W': perf.round(v.totalWorst),
			'%A': perf.round(v.totalTime / v.totalCycles),

			'%t': v.localTime,
			'%c': v.localCycles,
			'%b': perf.round(v.localBest),
			'%w': perf.round(v.localWorst),
			'%a': perf.round(v.localTime / v.localCycles),

			'%l': perf.round(v.lastTime)
		}
		function extract(m) { return m in map ? map[m] : m }
		function replace(m) { return m in map ? map[m] : m.replace(/%./g, extract) }

		if(typeof fmt === 'string') return replace(fmt)
		if(fmt instanceof Array) return fmt.map(replace)
	},

	monitor: function(name, interval) {
		setInterval(perf.show, interval || 1000, name)
	},

	call: function(func) {
		var name = func.name
		var args = []

		for(var i = 1; i < arguments.length; i++) args.push(arguments[i])

		perf.start(name)
		var ret = func.apply(null, args)
		perf.end(name)
		return ret
	},

	wrap: function(func, name) {
		if(name == null) {
			name = func.name
		}
		return function() {
			perf.start(name)
			var ret = func.apply(this, arguments)
			perf.end(name)
			return ret
		}
	}
}
