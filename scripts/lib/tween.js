/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

var TWEEN = {
	time: 0,
	tweens: [],

	getAll: function() {
		return TWEEN.tweens
	},

	removeAll: function() {
		for(var i = TWEEN.tweens.length -1; i >= 0; i--) {
			TWEEN.tweens[i].updating = false
		}
	},

	add: function(tween) {
		tween.updating = true
		if(TWEEN.tweens.indexOf(tween) === -1) {
			TWEEN.tweens.push(tween)
		}
	},

	remove: function(tween) {
		tween.updating = false
	},

	loop: function() {
		TWEEN.update()
		TWEEN.timer = requestAnimationFrame(TWEEN.loop)
	},

	loopEnd: function() {
		cancelAnimationFrame(TWEEN.timer)
	},

	update: function(time) {
		var t = +time
		TWEEN.time = t === t ? t : window.performance.now()

		var length = TWEEN.tweens.length
		if(!length) return false

		for(var i = length -1; i >= 0; i--) {
			var tween = TWEEN.tweens[i]

			if(tween.updating || tween.ended) {
				tween.update(TWEEN.time)
			} else {
				TWEEN.tweens.splice(i, 1)
			}
		}

		return true
	}
}

TWEEN.Tween = function(object) {
	this.source = {}
	this.target = {}
	this.delta  = {}

	this.durationTime = 1000
	this.delayTime = 0
	this.startTime = null
	this.repeatTimes = 0
	this.enableYoyo = false
	this.reversed = false
	this.waitForStart = true
	this.easingFunction = TWEEN.Easing.Linear.None
	this.interpolationFunction = TWEEN.Interpolation.Linear

	this.chainedTweens = []
	this.synchedTweens = []

	this.onBeforeStartCallback = null
	this.onBeforeStartScope = null
	this.onBeforeStartData = null

	this.onStartCallbackFired = false
	this.onStartCallback = null
	this.onStartScope = null
	this.onStartData = null

	this.onUpdateCallback = null
	this.onUpdateScope = null
	this.onUpdateData = null

	this.onCompleteCallback = null
	this.onCompleteScope = null
	this.onCompleteData = null

	this.onStopCallback = null
	this.onStopScope = null
	this.onStopData = null

	this.playing = false
	this.ended = false
	this.elapsed = 0
	this.progress = 0
	this.prodelta = 0

	if(object) this.setSource(object)
}

TWEEN.Tween.prototype = {

	clock: TWEEN,
	realtime: false,

	copy: function(tween) {
		this.durationTime          = tween.durationTime
		this.delayTime             = tween.delayTime
		this.startTime             = tween.startTime
		this.repeatTimes           = tween.repeatTimes
		this.enableYoyo            = tween.enableYoyo
		this.reversed              = tween.reversed
		this.easingFunction        = tween.easingFunction
		this.interpolationFunction = tween.interpolationFunction

		return this
	},

	setSource: function(object) {
		if(object != null) {
			this.source = object
		}
		return this
	},

	setTarget: function(object) {
		if(object != null) {
			this.target = object
		}
		return this
	},

	setClock: function(object) {
		if(object != null) {
			this.clock = object
		}
		return this
	},

	duration: function(duration) {
		this.durationTime = duration
		return this
	},

	from: function(object) {
		for(var name in this.source) {
			if(name in object) this.source[name] = object[name]
		}
		return this
	},

	to: function(object, duration) {
		if(object != null) {
			this.setTarget(object)
		}

		if(duration != null) {
			this.durationTime = duration
		}

		return this
	},

	delay: function(amount) {
		this.delayTime = amount
		return this
	},

	repeat: function(times) {
		this.repeatTimes = times
		return this
	},

	yoyo: function(enableYoyo) {
		this.enableYoyo = enableYoyo
		return this
	},

	easing: function(easingFunction) {
		this.easingFunction = easingFunction
		return this
	},

	interpolation: function(interpolation) {
		this.interpolationFunction = interpolation
		return this
	},

	chain: function() {
		this.chainedTweens = arguments
		return this
	},

	synch: function() {

	},

	onBeforeStart: function(callback, scope, data) {
		this.onBeforeStartCallback = callback
		this.onBeforeStartScope = scope
		this.onBeforeStartData = data
		return this
	},

	onStart: function(callback, scope, data) {
		this.onStartCallback = callback
		this.onStartScope = scope
		this.onStartData = data
		return this
	},

	onUpdate: function(callback, scope, data) {
		this.onUpdateCallback = callback
		this.onUpdateScope = scope
		this.onUpdateData = data
		return this
	},

	onComplete: function(callback, scope, data) {
		this.onCompleteCallback = callback
		this.onCompleteScope = scope
		this.onCompleteData = data
		return this
	},

	onStop: function(callback, scope, data) {
		this.onStopCallback = callback
		this.onStopScope = scope
		this.onStopData = data
		return this
	},


	stop: function() {
		this.playing = false

		this.clock.remove(this)

		if(this.debug) console.trace(this.debug, 'stop')

		if(this.onStopCallback !== null) {
			this.onStopCallback.call(this.onStopScope, this.onStopData)
		}

		for(var name in this.valuesTarget) {
			var valueTarget = this.valuesTarget[name]
			if(valueTarget instanceof TWEEN.Tween) {
				valueTarget.stop()
			}
		}

		this.stopChainedTweens()
		return this
	},

	stopChainedTweens: function() {
		for(var i = this.chainedTweens.length -1; i >= 0; i--) {
			this.chainedTweens[i].stop()
		}
	},

	updateSource: function() {
		this.valuesSource = {}

		for(var property in this.source) {
			var valueSource = this.source[property]
			,   valueSourceNumber = parseFloat(valueSource, 10)

			if(!isFinite(valueSourceNumber)) continue

			this.valuesSource[property] = valueSourceNumber
		}

		return this
	},

	updateTarget: function() {
		this.valuesRelative = {}
		this.valuesTarget = {}

		for(var property in this.target) {
			var valueTarget = this.target[property]
			,   valueSource = this.valuesSource[property]

			if(valueTarget instanceof TWEEN.Tween) {
				this.valuesTarget[property] = valueTarget
				continue
			}

			if(property in this.valuesSource === false) continue


			if(valueTarget instanceof Array) {
				if(valueTarget.length) {
					this.valuesTarget[property] = [valueSource].concat(valueTarget)
				}

			} else if(typeof valueTarget === 'string') {
				// Parses relative end values with start as base (e.g.: +10, -3)
				var valueTargetNumber = parseFloat(valueTarget, 10)

				if(isFinite(valueTargetNumber)) {
					this.valuesRelative[property] = valueTargetNumber
					this.valuesTarget[property] = valueSource + valueTargetNumber
				}

			} else if(typeof valueTarget === 'number') {
				if(isFinite(valueTarget)) {
					this.valuesTarget[property] = valueTarget
				}
			}
		}

		return this
	},

	start: function(time) {
		var t = +time
		if(t !== t) t = this.realtime && this.clock.realtime || this.clock.time

		this.startTime = t + this.delayTime
		this.onStartCallbackFired = false
		this.ended = false
		this.elapsed = 0
		this.progress = 0
		this.prodelta = 0

		this.updateSource()
		this.updateTarget()

		this.delta = {}

		var changes = false
		for(var property in this.valuesTarget) {
			var valueSource = this.valuesSource[property]
			,   valueTarget = this.valuesTarget[property]

			if(valueSource !== valueTarget) {
				changes = true
			}

			if(valueTarget instanceof TWEEN.Tween) {
				valueTarget.setClock(this.clock).start(t)
				this.clock.remove(valueTarget)
				this.delta[property] = valueTarget.delta

			} else {
				this.delta[property] = 0
			}
		}

		if(!changes) return this

		this.clock.add(this)

		if(this.onBeforeStartCallback !== null) {
			this.onBeforeStartCallback.call(this.onBeforeStartScope, this.source, this.target, this.onBeforeStartData)
		}

		if(this.debug) console.trace(this.debug, 'start',
			'\n\tsource:', this.valuesSource,
			'\n\ttarget:', this.valuesTarget)

		return this
	},

	update: function(time) {
		if(this.ended) {
			this.ended = false
			this.playing = false

			if(this.debug) console.log(this.debug, 'ended')
			return
		}

		if(time < this.startTime && this.waitForStart) {
			this.updating = true
			return
		}

		if(time - this.startTime > this.durationTime && this.elapsed === 1) {
			this.updating = false
			return
		}

		if(this.onStartCallbackFired === false) {
			this.onStartCallbackFired = true
			this.playing = true

			if(this.onStartCallback !== null) {
				this.onStartCallback.call(this.onStartScope, this.source, this.onStartData)
			}

			if(this.debug) console.log(this.debug, 'playing')
		}

		this.passedTime = time - this.startTime
		this.remainTime = this.durationTime - this.passedTime
		this.setProgress(this.passedTime / this.durationTime)

		this.updating = this.elapsed < 1 || this.repeatTimes > 0

		if(this.elapsed === 0 && !this.waitForStart) {
			this.updating = false
		}

		if(this.elapsed === 1) {

			if(this.repeatTimes > 0) {
				this.repeatTimes--

				// Reassign starting values, restart by making startTime = now
				for(var property in this.valuesSource) {
					var valueSource = this.valuesSource[property]
					,   valueTarget = this.valuesTarget[property]

					if(property in this.valuesRelative) {
						valueSource += this.valuesRelative[property]
					}

					if(this.enableYoyo) {
						this.valuesTarget[property] = valueSource
						valueSource = valueTarget
					}

					this.valuesSource[property] = valueSource
				}

				if(this.enableYoyo) {
					this.reversed = !this.reversed
				}

				this.startTime = time + this.delayTime


			} else {
				this.ended = true

				if(this.onCompleteCallback !== null) {
					this.onCompleteCallback.call(this.onCompleteScope, this.onCompleteData)
				}

				for(var i = this.chainedTweens.length -1; i >= 0; i--) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					this.chainedTweens[i].start(this.startTime + this.durationTime)
				}
			}
		}

		return
	},

	setProgress: function(elapsed) {
		var last = this.progress
		this.elapsed = elapsed > 1 ? 1 : elapsed < 0 ? 0 : elapsed
		this.progress = this.easingFunction(this.elapsed)
		this.prodelta = this.progress - last

		for(var property in this.valuesTarget) {
			var valueTarget = this.valuesTarget[property]
			,   valueSource = this.valuesSource[property]
			,   valueCurrent

			if(valueTarget instanceof TWEEN.Tween) {
				valueTarget.setProgress(this.elapsed)
				continue

			} else if(valueTarget instanceof Array) {
				valueCurrent = this.interpolationFunction(valueTarget, this.progress)
			} else {
				valueCurrent = valueSource + (valueTarget - valueSource) * this.progress
			}

			this.delta[property] = valueCurrent - this.source[property]
			this.source[property] = valueCurrent
		}

		if(this.debug) console.log(this.debug, 'update',
			'\n\tvalues:', this.source,
			'\n\tdetta:', this.delta)

		if(this.onUpdateCallback !== null) {
			this.onUpdateCallback.call(this.onUpdateScope, this.progress, this.source, this.delta)
		}
	}
}


TWEEN.Easing = {

	Linear: {

		None: function (k) {

			return k;

		}

	},

	Quadratic: {

		In: function (k) {

			return k * k;

		},

		Out: function (k) {

			return k * (2 - k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k;
			}

			return - 0.5 * (--k * (k - 2) - 1);

		}

	},

	Cubic: {

		In: function (k) {

			return k * k * k;

		},

		Out: function (k) {

			return --k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k + 2);

		}

	},

	Quartic: {

		In: function (k) {

			return k * k * k * k;

		},

		Out: function (k) {

			return 1 - (--k * k * k * k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k;
			}

			return - 0.5 * ((k -= 2) * k * k * k - 2);

		}

	},

	Quintic: {

		In: function (k) {

			return k * k * k * k * k;

		},

		Out: function (k) {

			return --k * k * k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k * k * k + 2);

		}

	},

	Sinusoidal: {

		In: function (k) {

			return 1 - Math.cos(k * Math.PI / 2);

		},

		Out: function (k) {

			return Math.sin(k * Math.PI / 2);

		},

		InOut: function (k) {

			return 0.5 * (1 - Math.cos(Math.PI * k));

		}

	},

	Exponential: {

		In: function (k) {

			return k === 0 ? 0 : Math.pow(1024, k - 1);

		},

		Out: function (k) {

			return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if ((k *= 2) < 1) {
				return 0.5 * Math.pow(1024, k - 1);
			}

			return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

		}

	},

	Circular: {

		In: function (k) {

			return 1 - Math.sqrt(1 - k * k);

		},

		Out: function (k) {

			return Math.sqrt(1 - (--k * k));

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return - 0.5 * (Math.sqrt(1 - k * k) - 1);
			}

			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			return - (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));

		},

		Out: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			return (a * Math.pow(2, - 10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1);

		},

		InOut: function (k) {

			var s;
			var a = 0.1;
			var p = 0.4;

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if (!a || a < 1) {
				a = 1;
				s = p / 4;
			} else {
				s = p * Math.asin(1 / a) / (2 * Math.PI);
			}

			if ((k *= 2) < 1) {
				return - 0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
			}

			return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;

		}

	},

	Back: {

		In: function (k) {

			var s = 1.70158;

			return k * k * ((s + 1) * k - s);

		},

		Out: function (k) {

			var s = 1.70158;

			return --k * k * ((s + 1) * k + s) + 1;

		},

		InOut: function (k) {

			var s = 1.70158 * 1.525;

			if ((k *= 2) < 1) {
				return 0.5 * (k * k * ((s + 1) * k - s));
			}

			return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

		}

	},

	Bounce: {

		In: function (k) {

			return 1 - TWEEN.Easing.Bounce.Out(1 - k);

		},

		Out: function (k) {

			if (k < (1 / 2.75)) {
				return 7.5625 * k * k;
			} else if (k < (2 / 2.75)) {
				return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
			} else if (k < (2.5 / 2.75)) {
				return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
			} else {
				return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
			}

		},

		InOut: function (k) {

			if (k < 0.5) {
				return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
			}

			return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

		}

	}

};

TWEEN.EasingEnum = {
	'LinearNone'       : TWEEN.Easing.Linear.None,
	'QuadraticIn'      : TWEEN.Easing.Quadratic.In,
	'QuadraticOut'     : TWEEN.Easing.Quadratic.Out,
	'QuadraticInOut'   : TWEEN.Easing.Quadratic.InOut,
	'CubicIn'          : TWEEN.Easing.Cubic.In,
	'CubicOut'         : TWEEN.Easing.Cubic.Out,
	'CubicInOut'       : TWEEN.Easing.Cubic.InOut,
	'QuarticIn'        : TWEEN.Easing.Quartic.In,
	'QuarticOut'       : TWEEN.Easing.Quartic.Out,
	'QuarticInOut'     : TWEEN.Easing.Quartic.InOut,
	'QuinticIn'        : TWEEN.Easing.Quintic.In,
	'QuinticOut'       : TWEEN.Easing.Quintic.Out,
	'QuinticInOut'     : TWEEN.Easing.Quintic.InOut,
	'SinusoidalIn'     : TWEEN.Easing.Sinusoidal.In,
	'SinusoidalOut'    : TWEEN.Easing.Sinusoidal.Out,
	'SinusoidalInOut'  : TWEEN.Easing.Sinusoidal.InOut,
	'ExponentialIn'    : TWEEN.Easing.Exponential.In,
	'ExponentialOut'   : TWEEN.Easing.Exponential.Out,
	'ExponentialInOut' : TWEEN.Easing.Exponential.InOut,
	'CircularIn'       : TWEEN.Easing.Circular.In,
	'CircularOut'      : TWEEN.Easing.Circular.Out,
	'CircularInOut'    : TWEEN.Easing.Circular.InOut,
	'ElasticIn'        : TWEEN.Easing.Elastic.In,
	'ElasticOut'       : TWEEN.Easing.Elastic.Out,
	'ElasticInOut'     : TWEEN.Easing.Elastic.InOut,
	'BackIn'           : TWEEN.Easing.Back.In,
	'BackOut'          : TWEEN.Easing.Back.Out,
	'BackInOut'        : TWEEN.Easing.Back.InOut,
	'BounceIn'         : TWEEN.Easing.Bounce.In,
	'BounceOut'        : TWEEN.Easing.Bounce.Out,
	'BounceInOut'      : TWEEN.Easing.Bounce.InOut,
}

TWEEN.Interpolation = {

	Linear: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.Linear;

		if (k < 0) {
			return fn(v[0], v[1], f);
		}

		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}

		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

	},

	Bezier: function (v, k) {

		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = TWEEN.Interpolation.Utils.Bernstein;

		for (var i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}

		return b;

	},

	CatmullRom: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.CatmullRom;

		if (v[0] === v[m]) {

			if (k < 0) {
				i = Math.floor(f = m * (1 + k));
			}

			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

		} else {

			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}

			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}

			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

		}

	},

	Utils: {

		Linear: function (p0, p1, t) {

			return (p1 - p0) * t + p0;

		},

		Bernstein: function (n, i) {

			var fc = TWEEN.Interpolation.Utils.Factorial;

			return fc(n) / fc(i) / fc(n - i);

		},

		Factorial: (function () {

			var a = [1];

			return function (n) {

				var s = 1;

				if (a[n]) {
					return a[n];
				}

				for (var i = n; i > 1; i--) {
					s *= i;
				}

				a[n] = s;
				return s;

			};

		})(),

		CatmullRom: function (p0, p1, p2, p3, t) {

			var v0 = (p2 - p0) * 0.5;
			var v1 = (p3 - p1) * 0.5;
			var t2 = t * t;
			var t3 = t * t2;

			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

		}

	}

};
