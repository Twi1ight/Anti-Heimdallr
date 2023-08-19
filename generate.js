var RandExp = require('randexp');
var UglifyJS = require('uglify-js');
var fs = require('fs');
var lodash = require('lodash');

// let's say the reg pattern is: /hello+ (world|to you)/
// var randExp = new RandExp(/\<i\>Hypertext Transfer Protocol \-\- HTTP\/1\.1\<\/i\>/im);
// var generatedString = randExp.gen();
// console.log(generatedString);

function minify() {
    ast = UglifyJS.parse(ast.print_to_string());
    ast = UglifyJS.parse(UglifyJS.minify(ast, {
        mangle: {
            eval: true
        },
        compress: {
            sequences: true
        }
    }).code);
    return ast;
}
var config = JSON.parse(fs.readFileSync('config.json'))
const url_base = config.url_base.endsWith('/') ? config.url_base : config.url_base + '/'

var printerData = require('./data.js')
var scripts = []
printerData.forEach(item => {
    if(item?.type >= 3){
        let randexp = new RandExp(item.rulecontent)
        randexp.defaultRange.subtract(32, 47);
        randexp.defaultRange.subtract(58, 62);
        randexp.defaultRange.subtract(91, 96);
        let src = url_base + randexp.gen()
        // console.log(item.commandments)
        // console.log(src)
        scripts.push(src)
    }
})
var size = ~~(Math.random() * scripts.length) % (config.max_count - config.min_count) + config.min_count
console.log("生成诱饵链接数量:", size)
var code = `
var scripts = ${JSON.stringify(lodash.sampleSize(scripts, size))};

function loadScriptAsync(src) {
    var tag = document.createElement('script');
    tag.src = src;
    tag.async = true;
    document.body.appendChild(tag);
}

scripts.forEach(function(src) {
    loadScriptAsync(src);
});
`

let ast = UglifyJS.parse(code)
let result = UglifyJS.minify(ast, {
    mangle: {
        eval: true
    },
    compress: {
        sequences: true
    }
}).code

console.log(result)

fs.writeFileSync('output.js', result)