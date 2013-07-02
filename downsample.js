"use strict"

var fft = require("ndarray-fft")
var pool = require("ndarray-scratch")
var ops = require("ndarray-ops")

var unpack = require("ndarray-unpack")
var savePixels = require("save-pixels")
var fs = require("fs")

function downsample2x(out, inp) {
  var ishp = inp.shape
  var oshp = out.shape
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
  
  ops.assigns(s, 0.0)
  ops.assigns(t, 0.0)
  
  var nr = new Array(d)
    , a = new Array(d)
    , b = new Array(d)
  for(var i=0; i<1<<d; ++i) {
    for(var j=0; j<d; ++j) {
      if(i&(1<<j)) {
        nr[j] = oshp[j] - (oshp[j]>>1)
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
  ops.muls(out, s, 1.0/(1<<d))
  
  pool.free(x)
  pool.free(y)
  pool.free(s)
  pool.free(t)
}

module.exports = downsample2x