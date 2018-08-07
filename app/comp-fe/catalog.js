setTimeout(function () {
    sbox = document.getElementById('searchbox');
    sbox.onkeypress = function (e) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13') {
            dosearch(sbox.value);
            return false;
        }
    };

}, 1000);

function dosearch() {
    input = document.getElementById("searchbox");
    catalogbyname(".*(" + input.value + ").*");
}

var catalogprefix = "";

function catalogbyname(pattern) {
    xhrget(catalogprefix + "/byname?" + pattern,
        function (req) {
            var res = JSON.parse(req);
            var list = d3.select("#catalogitemlist");
            res.result.map(function (item) {
                var div = list.append("div");

                (function () {
                    div.classed("catalogitem", true)
                        .attr("draggable", true)
                        .html(item.name)
                        .append("br");
                    div.node().addEventListener('dragstart', function (e) {
                        var _item = item;
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('product', JSON.stringify(_item));
                    });

                })();

            });
        });
}

function catalogitem(id, fn) {
    var nn = 0;
    xhrget(catalogprefix + "/itembyid?" + id, function (resp) {
        var x = JSON.parse(resp);
        if (x.models && x.models.length > 0) {
            x.models.map(function (w) {
                nn += w.nodes.length;
                w.nodes.map(function (n) {
                    if (n.id == 0) { //  dummy node special case
                        if (--nn == 0)
                            fn(x);
                    } else {
                        xhrget(catalogprefix + "/type?" + n.type.name, function (resp) {
                            var ti = JSON.parse(resp);
                            n.typeinfo = ti;
                            if (--nn == 0)
                                fn(x);
                        });
                    }
                });
            });
        } else {
            fn(x);
        }
    });
}

function catalogtype(typename, fn) {
    xhrget(catalogprefix + "/type?" + typename, fn);
}

/* e.g.
 catalogtype(n.type.name, function(resp) {
 var ti = JSON.parse(resp);
 n.typeinfo = ti;
 addnode(n);
 });
 */


function log(x, y) {
    var args = ["catalog:"].concat(Array.prototype.slice.call(arguments, 0));
    console.log.apply(console, args);
}
