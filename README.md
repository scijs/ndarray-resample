ndarray-downsample2x
====================
Downsamples an ndarray by a factor of 2 using sinc interpolation.

## Example
Here is a simple example showing how to downsample an image:

```javascript
var lena = require("luminance")(require("lena"))
var x = require("zeros")([256,256])
require("ndarray-downsample2x")(x, lena)
require("save-pixels")(x, "png").pipe(process.stdout)
```

And here is the result:

<img src=example/lena2.png>

##Install

    npm install ndarray-downsample2x
    
### `require("ndarray-downsample2x")(output, input)`
Downsamples input by a factor of two storing the result in output.

* `output` gets the result of downsampling
* `input` is the array that gets downsampled

**Note** `input`'s shape must be divisible by 4 and `output`'s shape must be one half of `input`'s along each dimension.

## Credits
(c) 2013 Mikola Lysenko. MIT License