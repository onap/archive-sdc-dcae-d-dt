var log = log || function (x, y) {
    var args = ["asdc-catalog:"].concat(Array.prototype.slice.call(arguments, 0));
    console.log.apply(console, args);
}

setTimeout(function () {
    sbox = document.getElementById('searchbox');
    if (sbox) {
        sbox.onkeypress = function (e) {
            if (!e) e = window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == '13') {
                dosearch(sbox.value);
                return false;
            }
        };
    }
}, 1000);

function dosearch() {
    input = document.getElementById("searchbox");
    catalogbyname(".*(" + input.value + ").*");
}

var catalogprefix = window.catalogPrefix;

function elements() {
    // log("elements");
    var url = "/catalog";
    xhrget(url,
        function (req) {
            d3.select("#elementquery").remove();
            var res = JSON.parse(req);
            var list = d3.select("#catalogitemlist");
            res.elements.map(function (item) {
                (function () {
                    var div = list.append("div");
                    var name = item.name;
                    div.classed("folder", true)
                        .html("<b data-tests-id=" + name + ">" + name + "</b>")
                        .append("br");
                    div.on("click", function () {
                        div.on("click", null); // once only
                        items(item, div);
                    });
                })();
            });
        });
}

function items(item, parent) {

    var items = item.items;
    items.map(function (item) {
        var _item = item;
        (function () {
            var div = parent.append("div");
            var name = _item.name;
            log("ITEM", name, _item);

            div.classed("item", true)
                .attr('data-tests-id', name)
                .html(name);

            parent.append("div").style("clear", "both").style("height", 0);
            div.on("click", function () {
                dropdata(_item);
            });

            div.attr("draggable", true)
                .classed("draggable", true);
            div.node().addEventListener('dragstart', function (e) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('product', JSON.stringify(_item));
            });
        })();
    });

}

function catalogitem(id, fn) {
    var nn = 0;
    var url = "/" + id + "/model";
    log("catalogitem:", url);
    xhrget(url, function (resp) {
        var x = JSON.parse(resp);
        if (!_.isEmpty(x.error)) {
            log("catalogitem error", x.error);
            return;
        }
        if (_.isEmpty(x.data)) {
            log("catalogitem NO DATA");
            return;
        }

        x = x.data; // HACK

        var model = x.model;
        log("catalogitem", model.nodes);

        if (!x.models) {
            log("HACK models");
            x.models = [x.model];
        }

        nn += model.nodes.length;
        model.nodes.map(function (n) {
            catalogtype(id, n.type, function (resp) {
                var ti = JSON.parse(resp);
                n.typeinfo = ti;

                // patch things up (HACK)
                log("HACK typeinfo");
                n.typeinfo = n.typeinfo.data.type;
                if (!n.typeinfo.requirements)
                    n.typeinfo.requirements = [];
                if (!n.typeinfo.capabilities)
                    n.typeinfo.capabilities = [];

                if (--nn == 0)
                    fn(x);
            });
        });
    });
}

function catalogitem00(id, fn) {
    var nn = 0;
    var url = "/" + id + "/model";
    log("catalogitem:", url);
    xhrget(url, function (resp) {
        var x = JSON.parse(resp);
        var model = x.data.model;
        //model.id = id;
        model.name = "foo"; // HACK
        log("catalogitem", id, x, model);
        fn(model);
    });
}

function xhrget(url, callback) {
    var req = new XMLHttpRequest;
    console.log(url);
    // debugger;
    url = catalogprefix + url;
    // if (!(url.startsWith("https://") || url.startsWith("http://")))
    //     url = catalogprefix + url;
    // console.log(url);
    req.open("GET", url, true); // asynchronous request
    req.onreadystatechange = function (x) {
        if (req.readyState === 4)
            callback(req.responseText);
    };
    req.send(null);
}

function catalogtype(id, type, fn) {
    var url = "/" + id + "/type/" + type + "/";
    xhrget(url, function (resp) {
        //log("catalogtype", id, type, resp);
        fn(resp);
    });
}

setTimeout(elements, 500);
