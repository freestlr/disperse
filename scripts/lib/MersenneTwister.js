/*
  I've wrapped Makoto Matsumoto and Takuji Nishimura's code in a namespace
  so it's better encapsulated. Now you can have multiple random number generators
  and they won't stomp all over eachother's state.

  If you want to use this as a substitute for Math.random(), use the random()
  method like so:

  var m = new MersenneTwister();
  var randomNumber = m.random();

  You can also call the other genrand_{foo}() methods on the instance.

  If you want to use a specific seed in order to get a repeatable random
  sequence, pass an integer into the constructor:

  var m = new MersenneTwister(123);

  and that will always produce the same random sequence.

  Sean McCullough (banksean@gmail.com)
*/

/*
   A C-program for MT19937, with initialization improved 2002/1/26.
   Coded by Takuji Nishimura and Makoto Matsumoto.

   Before using, initialize the state by using init_genrand(seed)
   or init_by_array(init_key, key_length).

   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:

     1. Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.

     2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.

     3. The names of its contributors may not be used to endorse or promote
        products derived from this software without specific prior written
        permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


   Any feedback is very welcome.
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
   email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/

function MersenneTwister(seed) {
	seed = isNaN(seed) ? new Date().getTime() : +seed

	var N = 624
	,   M = 397

	var state = new Array(N)
	,   index = -1

	this.init = function(s) {
		state[0] = s |0

		for(var i = 1; i < N; i++) {
			var a = state[i - 1]
			,   x = a ^ (a >>> 30)

			state[i] = (
				((((x & 0xffff0000) >>> 16) * 1812433253) << 16)
				+  (x & 0x0000ffff)         * 1812433253
				+   i
			) >>> 0
		}

		index = N
	}

	/* int [0,0xffffffff] */
	this.genrand32 = function() {
		var i = index++
		,   j = index

		if(j >= N) j = index = 0

		var a = (state[i] & 0x80000000) | (state[j] & 0x7fffffff)
		,   y = state[i] = state[(i + M) % N] ^ (a >>> 1) ^ (a & 1 && 0x9908b0df)

		/* Tempering */
		y ^= (y >>> 11)
		y ^= (y <<   7) & 0x9d2c5680
		y ^= (y <<  15) & 0xefc60000
		y ^= (y >>> 18)

		return y >>> 0
	}

	this.init(seed)
}

MersenneTwister.prototype = {
	/* int [0,0x7fffffff] */
	intPositive: function() {
		return this.genrand32() >>> 1
	},

	/* float [0,1] */
	realInclusive: function() {
		return this.genrand32() * (1 / 4294967295)
	},

	/* float [0,1) */
	random: function() {
		return this.genrand32() * (1 / 4294967296)
	},

	/* float (0,1) */
	realExclusive: function() {
		return (this.genrand32() + 0.5) * (1 / 4294967296)
	},

	/* double [0,1) */
	randomDouble: function() {
		var a = this.genrand32() >>> 5
		,   b = this.genrand32() >>> 6

		return (a * 67108864 + b) * (1 / 9007199254740992)
	}
}
