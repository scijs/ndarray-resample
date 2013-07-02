"use strict"

var fft = require("ndarray-fft")
var pool = require("ndarray-scratch")
var ops = require("ndarray-ops")
var cwise = require("cwise")

var clampScale = cwise({
  args:["array", "array", "scalar", "scalar", "scalar"],
  body: function clampScale(out, inp, s, l, h) {
    var x = inp * s
    if(x < l) { x = l }
    if(x > h) { x = h }
    out = x
  }
})


function downsample2x(out, inp, clamp_lo, clamp_hi) {
  if(typeof clamp_lo === "undefined") {
    clamp_lo = -Infinity
  }
  if(typeof clamp_hi === "undefined") {
    clamp_hi = Infinity
  }
  
  var ishp = inp.shape
  var oshp = out.shape
  
  if(out.size === 1) {
    var v = ops.sum(inp)/inp.size
    if(v < clamp_lo) { v = clamp_lo }
    if(v > clamp_hi) { v = clamp_hi }
    out.set(0,0,v)
    return
  }
  
  var d = ishp.length
  var x = pool.malloc(ishp)
    , y = pool.malloc(ishp)
  
  ops.assign(x, inp)
  ops.assigns(y, 0.0)

  fft(1, x, y)
  
  var lo = x.lo
    , hi = x.hi
  
  var s = pool.malloc(oshp)
    , t = pool.malloc(oshp)
  
  var nr = new Array(d)
    , a = new Array(d)
    , b = new Array(d)
  for(var i=0; i<1<<d; ++i) {
    for(var j=0; j<d; ++j) {
      if(i&(1<<j)) {
        nr[j] = oshp[j] - (oshp[j]>>1)
        if(nr[j] === 0) {
          continue
        }
        a[j] = oshp[j] - nr[j]
        b[j] = ishp[j] - nr[j]
      } else {
        nr[j] = oshp[j]>>>1
        a[j] = 0
        b[j] = 0
      }
    }
    ops.assign(hi.apply(lo.apply(s, a), nr), hi.apply(lo.apply(x, b), nr))
    ops.assign(hi.apply(lo.apply(t, a), nr), hi.apply(lo.apply(y, b), nr))
  }
  
  fft(-1, s, t)
  clampScale(out, s, 1.0/(1<<d), clamp_lo, clamp_hi)
  
  pool.free(x)
  pool.free(y)
  pool.free(s)
  pool.free(t)
}

module.exports = downsample2x