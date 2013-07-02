var lena = require("luminance")(require("lena"))
var x = require("zeros")([256,256])
require("../downsample.js")(x, lena)
require("save-pixels")(x, "png").pipe(process.stdout)