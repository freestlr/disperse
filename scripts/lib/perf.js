var perf = {
	precision: Infinity,
	values: {},

	round: function(v) {
		return perf.precision === -Infinity ? f.cround(v)
			: perf.precision === Infinity ? v
			: f.mround(v, perf.precision)
	},

	start: function(name) {
		var v = perf.values[name]
		if(!v) {
			v = perf.values[name] = {
				totalSpent  :  0,
				totalCycles :  0,
				totalBest   :  Infinity,
				totalWorst  : -Infinity,
				localSpent  :  0,
				localCycles :  0,
				localBest   :  Infinity,
				localWorst  : -Infinity,
				lastSpent   :  0,
				startTime   :  0
			}
		}

		v.startTime = performance.now()
	},

	end: function(name, flushCycles) {
		var v = perf.values[name]
		if(!v) return

		v.lastSpent = performance.now() - v.startTime
		v.startTime = 0

		v.totalCycles++
		v.localCycles++

		v.totalBest  = Math.min(v.totalBest, v.lastSpent)
		v.totalWorst = Math.max(v.totalWorst, v.lastSpent)

		v.localBest  = Math.min(v.localBest, v.lastSpent)
		v.localWorst = Math.max(v.localWorst, v.lastSpent)

		v.totalSpent += v.lastSpent
		v.localSpent += v.lastSpent

		if(v.localCycles >= flushCycles) perf.show(name)
	},

	flushLocal: function(name) {
		var v = perf.values[name]
		if(!v) return

		v.localSpent  =  0
		v.localCycles =  0
		v.localBest   =  Infinity
		v.localWorst  = -Infinity
	},

	show: function(name, noFlush) {
		var v = perf.values[name]
		if(!v) return console.log('perf: no', name)

		console.log(perf.format('perf %n: %a avg, %b best, %w worst, %s ms, %c cycles, %C total cycles, %A total avg', name))

		if(!noFlush) perf.flushLocal(name)
	},

	getlist: function(list, fmt, head) {
		return f.tformat(
			(head ? [perf.format(fmt, '', true)] : []).concat(
			list.map(name => perf.format(fmt, name))))
	},

	getall: function(fmt, head) {
		return perf.getlist(Object.keys(perf.values), fmt, head)
	},

	format: function(fmt, name, head) {
		var v = perf.values[name]
		if(!v && !head) return console.log('perf: no', name)

		var map = head ? {
			'%n': 'name',

			'%S': 'TIME',
			'%C': 'CYCLES',
			'%B': 'BEST',
			'%W': 'WORST',
			'%A': 'AVG',

			'%s': 'time',
			'%c': 'cycles',
			'%b': 'best',
			'%w': 'worst',
			'%a': 'avg',

			'%l': 'last'

		} : {
			'%n': name,

			'%S': v.totalSpent,
			'%C': v.totalCycles,
			'%B': perf.round(v.totalBest),
			'%W': perf.round(v.totalWorst),
			'%A': perf.round(v.totalSpent / v.totalCycles),

			'%s': v.localSpent,
			'%c': v.localCycles,
			'%b': perf.round(v.localBest),
			'%w': perf.round(v.localWorst),
			'%a': perf.round(v.localSpent / v.localCycles),

			'%l': perf.round(v.lastSpent)
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
