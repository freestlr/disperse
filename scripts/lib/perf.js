var perf = {
	precision: 4,
	values: {},

	time: function() {
		return window.performance && window.performance.now ? window.performance.now()
			:  Date.now ? Date.now()
			:  new Date().getTime()
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

		console.log('perf', name +':',
			f.mround(v.localTime / v.localCycles, perf.precision), 'avg,',
			f.mround(v.localBest, perf.precision), 'best,',
			f.mround(v.localWorst, perf.precision), 'worst,',
			f.mround(v.localTime, perf.precision), 'ms,',
			v.localCycles, 'cycles,',
			v.totalCycles, 'total cycles,',
			f.mround(v.totalTime / v.totalCycles, perf.precision), 'total avg')

		if(!noFlush) perf.flushLocal(name)
	},

	monitor: function(name, interval) {
		setInterval(perf.show, interval || 1000, name)
	}
}
