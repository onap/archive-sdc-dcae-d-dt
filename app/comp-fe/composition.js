(function () {
    /**
     * workaround to register events only once
     * and get just the inner-event
     */
    var eventMap = {};
    window.addEventListener('message', function (event) {
        var innerEvent = event.data;
        var handler = eventMap[innerEvent.type];
        if (handler instanceof Function) {
            handler(innerEvent.data);
        }
    });

    /**
     * Use this function to register to post message events
     */
    window.registerPostMessageEvent = function (type, handler) {
        eventMap[type] = handler;
    };
})();

function alertNoFlowTypeSelected() {
    $('#selected-type-mt')
        .addClass('pulse-info')
        .on('change', function (event) {
            $(event.target).removeClass('pulse-info');
        })
    alertError('Please select the flow type to continue');
}

var CompositionEditor = function () {
    var componentId = document
        .getElementById('iframe')
        .getAttribute('componentid');
    var userId = document
        .getElementById('iframe')
        .getAttribute('user_id');
    var readOnlyComponent = document
        .getElementById('iframe')
        .getAttribute('readOnlyComponent');
    var curcomp = {
        cid: null,
        //1806 US374595 save flow type in cdump
        flowType: null,
        version: 0,
        nodes: [],
        relations: [],
        inputs: [],
        outputs: []
    };
    window.d3Data = curcomp;
    curcomp.cid = componentId;
    this.curcomp = curcomp;

    var flowTypes = window.flowTypes;
    var typeSelect = document.getElementById("selected-type-mt");
    var self = this;

    if (flowTypes.length > 0) {
        flowTypes
            .forEach(function (flowType) {
                var myOption = document.createElement("option");
                myOption.text = flowType;
                myOption.value = flowType;
                typeSelect.add(myOption);
            });
    }

    typeSelect
        .addEventListener("change", function () {
            curcomp.flowType = typeSelect.value;
        });

    document
        .getElementById("savebtn")
        .setAttribute("data-tests-id", "SaveButton");
    document
        .getElementById("savebtn")
        .setAttribute("disabled", "true");
    document
        .getElementById("savebtn")
        .setAttribute("style", "opacity:0.5");

    if (readOnlyComponent == 'true') {
        var componentUser = document
            .getElementById('iframe')
            .getAttribute('componentUser');
        alertError("The resource is already checked out by user: " + componentUser);
    } else {
        document
            .getElementById("savebtn")
            .removeAttribute("disabled");
        document
            .getElementById("savebtn")
            .setAttribute("style", "opacity:1");
    }

    document
        .getElementById("savebtn")
        .addEventListener("click", function () {
            var mt = $('#selected-type-mt').val();
            if (!mt) {
                alertNoFlowTypeSelected();
                return;
            }
            compController.saveComposition(curcomp);
        });

    var vfni = document
        .getElementById('iframe')
        .getAttribute('vnfiname');

    // document.getElementById("submitbtn").setAttribute("data-tests-id",
    // "SubmitButton"); if (!(vfni !== null && vfni !== "") || readOnlyComponent ==
    // 'true') {     //
    // document.getElementById("submitbtn").setAttribute("disabled", "true");     //
    // document.getElementById("submitbtn").setAttribute("style", "opacity:0.5"); }
    // else {     document.getElementById("submitbtn").addEventListener("click",
    // function () {         var mt = $('#selected-type-mt').val();         if (mt
    // == null) {             alertNoFlowTypeSelected();             return; }
    // console.log('entered submitbtn eventlistener');         var component_Id =
    // document.getElementById('iframe').getAttribute('componentid');         var
    // serviceuuid = document.getElementById('iframe').getAttribute('serviceuuid');
    //       var vnfiname =
    // document.getElementById('iframe').getAttribute('vnfiname');
    // compController.createBlueprint(component_Id, serviceuuid, vnfiname, mt); });
    //   //console.log(x); }

    function log(x, y) {
        var args = ["composition:"].concat(Array.prototype.slice.call(arguments, 0));
        console
            .log
            .apply(console, args);
    }

    function simulateclick(x, y, target) {
        target = target || document.body;
        var e = document.createEvent("MouseEvent");
        e.initMouseEvent("click", true, true, window, 1, 0, 0, x, y, false, false, false, false, 0, null);
        target.dispatchEvent(e);
    }

    function addcss(id, text) {
        var head = document.getElementsByTagName("head")[0];
        var style = document.createElement("style");
        style.id = id;
        style.type = "text/css";
        style.innerHTML = text;

        // if style with this id exists, remove it
        try {
            var styles = head.getElementsByTagName("style");
            if (styles)
                _.each(styles, function (x) {
                    if (x.id == id)
                        head.removeChild(x);
                    }
                );
            }
        catch (e) {
            log(e);
        }
        head.appendChild(style);
        return style;
    }

    function parentmsg(s) {
        return parent.postMessage(s, '*');
    }

    var msgid = 0;

    function basemsg(action) {
        return {
            "action": action,
            "channelID": "ice-to-cart",
            "id": msgid++,
            "timestamp": new Date()
        };
    }

    function uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function parsequery(s) {
        s = s.substring(s.indexOf('?') + 1).split('&');
        var params = {},
            pair;
        // march and parse
        for (var i = s.length - 1; i >= 0; i--) {
            pair = s[i].split('=');
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return params;
    }

    var cid = "<span style='color:red'>NULL</span>";

    function getCompositionError(error) {
        console.error("unable to get composition: %o", error);
    }

    function deletebutton() {
        d3.select("#compositiondiv")
            .append("div")
            .style("position", "absolute")
            .style("bottom", "30px")
            .style("right", "5px")
            .style("background", "rgba(255,0,0,0.3)")
            .html("toggle node deletion")
            .on("click", () => {
                d3.selectAll(".deletenode").style("visibility",  d3.selectAll(".deletenode")
                    .style("visibility") === "hidden" ? "visible" : "hidden");
            });
    }

    function init(cid) {
        log("init");
        cid = cid || uuid();
        log("cid", cid);
        curcomp.cid = cid;
        console.log("get composition is called ");
        $
            .get(window.configOptions.backend_url + "getComposition/" + cid)
            .then(function (resData) {
                if (resData && resData.successResponse) {
                    try {
                        var composition = JSON.parse(resData.successResponse);
                        composition.cid = cid;
                        onCompositionEvent("initend");
                        restoregraph(composition);
                    } catch (error) {
                        getCompositionError(error);
                    }
                } else {
                    document.dispatchEvent(new CustomEvent('noComposition'));
                }
            })
            .fail(getCompositionError);

        deletebutton();
        initDeleteEvent();
    }

    function getcdump(cid) {
        var pe = svg.style("pointer-events");

        log("suspend pointer-events");
        svg.style("pointer-events", "none");

        // fallback in case xhrget doesn't reset svg pointer events
        setTimeout(function () {
            if (svg.style("pointer-events") != pe) {
                log("restore pointer-events fallback");
                svg.style("pointer-events", pe);
            }
        }, 2000);

        return new Promise(function (resolve, reject) {
            xhrget("/cdump?cid=" + cid, function (resp) {
                log("restore pointer-events");
                if (svg.style("pointer-events") != "none") // assert?
                    log("wtf pointer-events");
                svg.style("pointer-events", pe);
                try {
                    resolve(JSON.parse(resp));
                } catch (e) {
                    reject({"exception": e, "response": resp});
                }
            });
        });
    }

    function compositionreadonly(val) {
        if (val == undefined)
            val = true;
        if (val)
            svg.style("pointer-events", "none");
        else
            svg.style("pointer-events", "all");
        return svg.style("pointer-events");
    }

    function restoregraph(c) {
        if (!c.nodes)
            return;

        curcomp.cid = c.cid;
        rc = c;

        c
            .nodes
            .forEach(function (n) {
                addnode(n, 0, 0, n.ndata);
            });
        c
            .relations
            .forEach(function (r) {
                var m = r.meta;
                addlink(m.n1, m.n2, m.p1, m.p2, true);
            });
        sortinterfaces(); // HACK
        //1806 US374595 flowType saved to cdump
        if (c.flowType && _.contains(flowTypes, c.flowType)) {
            typeSelect.value = c.flowType;
            curcomp.flowType = typeSelect.value;
        } else {
            console.log(c.flowType + " not in flowTypes DDL")
        }
    }

    function postcompimg() {
        log("postcompimg");
        /*xhrpostraw("/compimg?cid="+cid, serialsvg(),
         function(resp) { log("compimg", resp); },
         "image/svg");*/
    }

    function commitcomposition(callback) {
        console.log("commitcomposition");
        /*xhrpost("/composition.commit?cid="+cid, {},
         function(resp) {
         callback(resp);
         });*/
    }

    function jsonparse(x) {
        try {
            return JSON.parse(x);
        } catch (e) {
            log("jsonparse", x, e);
            throw e;
        }
    }

    function template(id, fn) {
        /*xhrget("/template?" + id, function(resp) {
         var tp = JSON.parse(resp);
         if (! tp.nodes) {
         log("template:oops", tp);
         fn(null);
         }
         var nn = tp.nodes.length;
         if (nn == 0)
         fn(tp);
         else {
         tp.nodes.map(function(n) {
         if (n.id == 0) {      //  dummy node special case
         if (--nn == 0)
         fn(tp);
         } else {
         xhrget("/type?" + n.type.name, function(resp) {
         var ti = JSON.parse(resp);
         n.typeinfo = ti;
         if (--nn == 0)
         fn(tp);
         });
         }
         });
         }
         });*/
    }

    function template0(id, fn) {
        /*xhrget("/template?" + id, function(resp) {
         var tp = JSON.parse(resp);
         fn(tp);
         });*/
    }

    function addtemplate(id) {
        template(id, addcomp);
    }

    function addproduct(prod, x, y) {
        log("addproduct", prod);
        if (prod.offer) {
            clearComposition();
        }
        catalogitem(prod.uuid, function (p) {
            log("addproduct p", p);

            // HACK -- this can't be right
            log("HACK node.id", prod.uuid);
            p
                .model
                .nodes
                .forEach(function (n) {
                    n.id = prod.uuid;
                });

            if (p.models && p.models.length > 0) {
                // addcomp
                p
                    .models
                    .map(function (w) {
                        dropdata(w, x || bw / 2, y || bh / 2);
                    });
            }
            onCompositionEvent("added.product.to.composition", prod);
        });
    }

    function setnodeproperties(nid, properties) {
        /*xhrpost("/composition.setnodeproperties?cid="+cid, {"nid":nid, "properties":_.clone(properties)},
         function(resp) {
         });*/
    }

    function setnodepolicies(nid, policies) {
        /*xhrpost("/composition.setnodepolicies?cid="+cid, {"nid":nid, "policies":_.clone(policies)},
         function(resp) {
         });*/
    }

    function deepclone(x) {
        return JSON.parse(JSON.stringify(x));
    }

    var gensym = (function () {
        var n = 0;
        return function (x) {
            var t = new Date().getTime();
            return (x || "g") + "." + t + "." + n++;
        };
    })();

    var xhrprefix = configOptions.backend_url;

    function xhrgetBE(url, callback) {
        var req = new XMLHttpRequest;
        if (!(url.startsWith("https://") || url.startsWith("http://")))
            url = xhrprefix + url;
        req.open("GET", url, true); // asynchronous request
        req.onreadystatechange = function (x) {
            if (req.readyState === 4)
                callback(req.responseText);
            };
        req.send(null);
    }

    function xhrget(url, callback) {
        var req = new XMLHttpRequest;
        if (!(url.startsWith("https://") || url.startsWith("http://")))
            url = xhrprefix + url;
        req.open("GET", url, true); // asynchronous request
        req.onreadystatechange = function (x) {
            if (req.readyState === 4)
                callback(req.responseText);
            };
        req.send(null);
    }

    function xhrgetsync(url, callback) {
        var req = new XMLHttpRequest;
        if (!(url.startsWith("https://") || url.startsWith("http://")))
            url = xhrprefix + url;
        req.open("GET", url, false);
        req.onreadystatechange = function (x) {
            if (req.readyState === 4)
                callback(req.responseText);
            };
        req.send(null);
    }

    callback = function (responseText) {
        // write your own handler here.
        console.log('result from http://localhost:8446/saveComposition/ac297d4d-0199-458f-99ff-2a6ff6' +
                'ed849a \n' + responseText);
    };

    /**
     * Callback function of AJAX request if the request fails.
     */
    failCallback = function () {
        // write your own failure handler here.
        console.log('AJAXRequest failure!');
    };

    var apiService = new ApiService(xhrprefix, userId);
    var compController = new CompController(apiService);

    function xhrpost(url, obj, callback, type, async) {
        var req = new XMLHttpRequest;
        if (!(url.startsWith("https://") || url.startsWith("http://")))
            url = xhrprefix + url;
        req.open("POST", url, true); // asynchronous request
        req.setRequestHeader("Content-Type", type || "application/json;charset=UTF-8");
        req.setRequestHeader('USER_ID', userId);

        req.onreadystatechange = function (x) {
            if (req.readyState === 4)
                callback(req.responseText);
            };
        try {
            req.send(JSON.stringify(obj));
        } catch (e) {
            if (e.name == "TypeError")
                req.send(JSON.stringify(obj));
            else
                throw(e);
            }
        }

    function xhrpostraw(url, obj, callback, type) {
        var req = new XMLHttpRequest;
        if (!(url.startsWith("https://") || url.startsWith("http://")))
            url = xhrprefix + url;
        req.open("POST", url, true);
        req.setRequestHeader("Content-Type", type || "text/plain");
        req.setRequestHeader('USER_ID', userId);

        req.onreadystatechange = function (x) {
            if (req.readyState === 4)
                callback(req.responseText);
            };
        req.send(obj);
    }

    var bw = document
        .getElementById("compositioncontainer")
        .clientWidth;
    var bh = document
        .getElementById("compositioncontainer")
        .clientHeight;

    // initially setting linkdistance to smaller value will help layout sort out
    // edge crossings
    var force = d3
        .layout
        .force()
        .gravity(.9)
        .charge(-3000)
        .linkDistance(500)
        .linkStrength(1)
        .size([bw, bh]);

    setTimeout(function () {
        init(componentId);
    });

    function unfix() {
        force
            .nodes()
            .forEach(function (n) {
                n.fixed = false;
            });
    }

    function fix() {
        force
            .nodes()
            .forEach(function (n) {
                n.fixed = true;
            });
    }

    function resize() {
        bw = document
            .getElementById("compositioncontainer")
            .clientWidth;
        bh = document
            .getElementById("compositioncontainer")
            .clientHeight;
        svg
            .attr("width", bw)
            .attr("height", bh);
        force.size([
            bw - 30,
            bh - 30
        ]);
        force.start();
    }

    var rev = 0;

    var svg = d3
        .select("#compositioncontainer")
        .append("svg:svg")
        .style("overflow", "visible")
        .attr("width", bw)
        .attr("height", bh);

    var undergraph = svg.append("svg:g");
    var graph = svg.append("svg:g");
    var edgegroup = graph.append("svg:g");

    function bbox(sel) { // arg is d3 svg selection
        return sel[0][0].getBBox();
    }

    function clamp(d) {
        var pad = 120; // HACK
        var x1 = pad,
            y1 = pad,
            x2 = bw - pad,
            y2 = bh - pad;
        if (d.x < x1)
            d.x = x1;
        if (d.y < y1)
            d.y = y1;
        if (d.x > x2)
            d.x = x2;
        if (d.y > y2)
            d.y = y2;
        return d;
    }

    function circleclamp(d) {
        var p2 = 2 * Math.PI;
        if (d.a < 0)
            d.a += p2;
        if (d.a > p2)
            d.a -= p2;
        return d;
    }

    function tick() {
        if (force.alpha() < .05) // chill
            force.alpha(0);
        graph
            .selectAll(".node")
            .attr("transform", function (d) {
                clamp(d);

                // (d.x > 350) {                 d.x = 350;             }             break;
                // case 2:             if (d.x < bw - 350) {                 d.x = bw - 350;
                //         }             break;     } } HACK for vLAN nodes in uCPE
                var modelName = d
                    .model
                    .name
                    .toUpperCase()
                    .replace(/-/g, " ");
                if (modelName.match(/\bVPN\sFACING\b/) || modelName.match(/\bINTERNET\sFACING\b/)) {
                    if (d.y > 130)
                        d.y = 130;
                    }
                else if (modelName.match(/\bLAN\sFACING\b/)) {
                    if (d.y < bh - 130)
                        d.y = bh - 130;
                    }
                else if (modelName.match(/\bNM\sVLAN\b/)) {
                    if (d.x < bw - 150)
                        d.x = bw - 150;
                    }
                else if (modelName.match(/\bOAM\sVLAN\b/)) {
                    if (d.x > 150)
                        d.x = 150;
                    }
                // END TODO

                return "translate(" + d.x + "," + d.y + ")";
            });
        d3
            .selectAll(".relation")
            .attr("d", epath);
        d3
            .selectAll(".nodeport")
            .attr("transform", function (d) {
                circleclamp(d);
                if (d.link) {
                    if (d.link.srcport == d)
                        n1 = d.link.source,
                        n2 = d.link.target;
                    else
                        n1 = d.link.target,
                        n2 = d.link.source;
                    var p1 = {
                            x: n1.x,
                            y: n1.y
                        },
                        p2 = {
                            x: n2.x,
                            y: n2.y
                        };
                    var dx = n2.x - n1.x,
                        dy = n2.y - n1.y;
                    d.a = Math.atan2(dx, dy);
                    circleclamp(d);
                    var p = nodeboundarypoint(p1, p2, d.parent.name);
                    d.x = p.x - d.parent.x;
                    d.y = p.y - d.parent.y;
                } else {
                    if (d.parent.ports.length > 1) {
                        d
                            .parent
                            .ports
                            .forEach(function (x) {
                                if (d != x && Math.abs(x.a - d.a) < 0.8) {
                                    d.a += x.a > d.a
                                        ? -.02
                                        : .02;
                                }
                            });
                    }
                    var p1 = {
                            x: d.parent.x,
                            y: d.parent.y
                        },
                        p2 = {
                            x: d.parent.x + 100 * Math.sin(d.a),
                            y: d.parent.y + 100 * Math.cos(d.a)
                        };
                    var p = nodeboundarypoint(p1, p2, d.parent.name);
                    d.x = p.x - d.parent.x;
                    d.y = p.y - d.parent.y;
                }
                return "translate(" + d.x + "," + d.y + ")";
            });
    }

    force.on("tick", tick);

    // p1 inside, p2 outside
    function nodeboundarypoint(p1, p2, nodename) {
        if ((Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y)) < 0.2) {
            return p1;
        }
        if (typeof document.elementsFromPoint === 'function') {
            var mp = {
                x: (p1.x + p2.x) / 2,
                y: (p1.y + p2.y) / 2
            };
            var r = svg
                .node()
                .getBoundingClientRect();
            var n = document
                .elementsFromPoint(mp.x + r.left, mp.y + r.top)
                .find(function (x) {
                    var d = d3
                        .select(x)
                        .datum();
                    return d3
                        .select(x)
                        .classed("nodebody") && d && d.name == nodename;
                });
            if (n)
                p1 = mp;
            else
                p2 = mp;
            return nodeboundarypoint(p1, p2, nodename);
        }
        // ... here when no function document.elementsFromPoint (FF <46) ... -- put on
        // circle
        var r = 30;
        var dx = p2.x - p1.x,
            dy = p2.y - p1.y;
        if (!dx) {
            if (r < Math.abs(dy)) {
                p1.y += r * Math.sign(dy);
            } else {
                p1.y += dy;
            }
            return p1;
        }

        alpha = Math.atan2(dx, dy);
        p1.x += r * Math.sin(alpha);
        p1.y += r * Math.cos(alpha);
        return p1;
    }

    var hitrect = svg
        .node()
        .createSVGRect();
    hitrect.height = 1;
    hitrect.width = 1;

    // ffs, chrome's svg.getIntersectionList uses bbox for intersection
    function nodeboundarypoint0(p1, p2, node) {
        if ((Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y)) < 0.5)
            return p1;
        else {
            var n,
                mp = {
                    x: (p1.x + p2.x) / 2,
                    y: (p1.y + p2.y) / 2
                };
            hitrect.x = mp.x;
            hitrect.y = mp.y;
            var hits = svg
                .node()
                .getIntersectionList(hitrect, null);
            if (hits) {
                function itol(x) {
                    var v,
                        r = [],
                        i = 0;
                    while (v = x.item(i++))
                        r.push(v);
                    return r;
                }

                hits = itol(hits);
                n = hits.find(function (x) {
                    var d = d3
                        .select(x)
                        .datum();
                    return d3
                        .select(x)
                        .classed("nodebody") && d && d.name == node;
                });
            }
            if (n)
                p1 = mp;
            else
                p2 = mp;
            return nodeboundarypoint0(p1, p2, node);
        }
    }

    function abs(n) {
        return n < 0
            ? -n
            : n;
    }

    function rand(n) {
        n = n || 1.0;
        return (Math.random() * n) - n / 2;
    }

    function elt(selection) {
        return selection[0][0];
    }

    function nameof(x) {
        return x
            ? x.name
            : "...";
    }

    function dnode(name) {
        return force
            .nodes()
            .find(function (n) {
                return n.model.name === name;
            });
    }

    function dlink(name) {
        return force
            .links()
            .filter(function (l) {
                return l.source.model.name === name || l.target.model.name === name;
            });
    }

    function matchnodetype(n, tname) {
        return ((n.type.name === tname) || (n.typeinfo && n.typeinfo.hierarchy && n.typeinfo.hierarchy.find(function (t) {
            return t.name === tname;
        })));
    }

    // "transactions" for composition operations
    var logtxn = false;
    var incompositiontxn = false;

    function txn(name, fn) {
        if (incompositiontxn) // already in transaction
            return fn();
        else {
            try {
                if (logtxn)
                    log("TXN.begin", name);
                incompositiontxn = true;
                return fn();
            } finally {
                incompositiontxn = false;
                if (logtxn)
                    log("TXN.end", name);
                onCompositionEvent("composition.done");
            }
        }
    }

    function addnode(model, x, y, ndata) {
        return txn("addnode", function () {
            return _addnode(model, x, y, ndata);
        });
    }

    function _addnode(model, x, y, ndata) {
        var hasdata = !!ndata;

        curmodel = model;

        if (!ndata) {
            ndata = {
                name: gensym("n"),
                label: model.name,
                x: x,
                y: y,
                px: x - 1,
                py: y - 1,
                ports: [],
                radius: 30
            };

            if (matchnodetype(model, "tosca.nodes.network.Port"))
                ndata.radius = 10;

            if (model.name === "CPE")
                ndata.radius = 80;
            }

        //log("node", model.name, ndata.x, ndata.y, ndata.fixed);

        ndata.x = ndata.x || bw / 2 + rand(100);
        ndata.y = ndata.y || bh / 2 + rand(100);
        ndata.px = ndata.x - 1;
        ndata.py = ndata.y - 1;

        ndata.ports = ndata.ports || [];
        ndata.label = model.name;

        model = _.clone(model);
        model.nid = ndata.name;

        var node = _.extend({}, model, {ndata: ndata});
        curcomp.nodes.push(deepclone(node));

        if (!hasdata) {
            /*xhrpost("/composition.addnode?cid="+cid, node,
             function(resp) {
             });

             xhrpost("/composition.savecomp?cid="+cid, curcomp,
             function(resp) {
             });*/

            onCompositionEvent("composition.add.node", model);
        }
        ndata.model = model;

        force.nodes().push(ndata);

        var nodes = force.nodes();

        var gnode = graph.selectAll(".node")
            .data(nodes, function (d) {
                return d.name;
            });

        var n = gnode.enter()
            .append("g")
            .attr("id", model.nid.replace(/\W/g, "_"))
            // this must come first, because ?? .attr("class", "node draggable")
            .classed("node", true)
            .classed("draggable", true)
            .attr("draggable", "true")
            .classed(model.type.name.replace(/\W/g, "_"), true)
            .attr("transform", function (d) {
                if (!d.x || isNaN(d.x))
                    d.x = bw / 2 + rand(100);
                if (!d.y || isNaN(d.y))
                    d.y = bh / 2 + rand(100);
                return "translate(" + d.x + "," + d.y + ")";
            });

        rendernode(n);

        n.on("mouseover", (d) => {
            self.selectedElement = d;
        });

        n.on("mouseout", () => {
            self.selectedElement = null;
        });

        n.call(force.drag().on("dragstart", function (d) {
            d3.select(this).classed("fixed", d.fixed = true);
        }));

        function rti(n, name) {
            return n.typeinfo.requirements.find(function (tr) {
                    return tr.name === r.name;
                })
        }

        if (!model.typeinfo)
            model.typeinfo = {}; // dummy node special case

        if (model.requirements) {
            model.requirements = dedup(model.requirements);
            model.requirements
                .forEach(function (x) {
                    if (x.name === "host") // CCD hack
                        return;
                    ndata.ports.push({
                            name: x.name,
                            parent: ndata,
                            ptype: "req",
                            id: uuid(),
                            portinfo: _.clone(x)
                        });
                });

            model.requirements.forEach(function (r) {
                    r.ti = model
                        .typeinfo
                        .requirements
                        .find(function (tr) {
                            return tr.name === r.name;
                        });
                });
        }
        // this may become uneccessary(?) (serban: type info now merged with
        // requirements/capabilities)
        if (model.typeinfo.requirements) {
            model.typeinfo.requirements = dedup(model.typeinfo.requirements);
            model.typeinfo.requirements.forEach(function (x) {
                    var port = ndata
                        .ports
                        .find(function (y) {
                            return y.name === x.name && y.ptype === "req";
                        });
                    if (port)
                        port.portinfo = _.extend(_.clone(x), port.portinfo); // this should never happen
                    else {
                        if (x.name === "host") // CCD hack
                            return;
                        log("UNEXPECTED TYPEINFO", x.name);
                    }
                });
        }

        if (model.capabilities) {
            model.capabilities = dedup(model.capabilities);
            model.capabilities.forEach(function (x) {
                    ndata
                        .ports
                        .push({
                            name: x.name,
                            parent: ndata,
                            ptype: "cap",
                            id: uuid(),
                            portinfo: _.clone(x)
                        });
                });

            model.capabilities.forEach(function (c) {
                    c.ti = model
                        .typeinfo
                        .capabilities
                        .find(function (tc) {
                            return tc.name == c.name;
                        });
                });
        }

        if (model.typeinfo.capabilities) {
            model.typeinfo.capabilities = dedup(model.typeinfo.capabilities);
            model
                .typeinfo
                .capabilities
                .forEach(function (x) {
                    var port = ndata
                        .ports
                        .find(function (y) {
                            return y.name === x.name && y.ptype === "cap";
                        });
                    if (port)
                        port.portinfo = _.extend(_.clone(x), port.portinfo); // this should never happen
                    else {
                        log("UNEXPECTED TYPEINFO", x.name);
                    }
                });
        }
        addports(n);

        force.start();

        return ndata;
    }

    // pin lans and wans in lexicographic order
    function sortinterfaces() {
        // var rx = [/^WAN/, /^LAN/]; for (var i in rx) {     var x = 200;
        // d3.selectAll(".node")         .filter(function (d) {             return
        // d.label.match(rx[i]);         })         .sort(function (a, b) { return
        // a.label > b.label;         })         .each(function (d) { d.x = d.px = x;
        //       x += 100;             d.fixed = true;         }); }
    }

    var _nd = [];

    function updatenodes() {
        var nd = force
            .nodes()
            .map(function (d) {
                var f = {
                    nid: d.name,
                    x: d.x,
                    y: d.y,
                    px: d.px,
                    py: d.py,
                    radius: d.radius,
                    fixed: true
                };
                f.ndata = _.clone(f);
                f.ndata.name = d.name;
                return f;
            });

        // only consider x,y values in computing sameness
        function same(a, b) {
            return a.every(function (c) {
                return b.some(function (d) {
                    return c.x == d.x && c.y == d.y;
                });
            });
        }

        if (!same(nd, _nd)) {
            log("updatenodes...changed");
            onCompositionEvent("after.loaded.composition");
        } else {
            log("updatenodes...stable");
        }
        _nd = nd;
    }

    force.on("end", updatenodes);

    function pp(x) {
        return JSON.stringify(x, null, 2);
    }

    function str(x) {
        return JSON.stringify(x);
    }

    function dedup(a) {
        var r = [];
        a.forEach(function (x) {
            if (!r.find(function (y) {
                return x.name == y.name;
            }))
                r.push(x)
        });
        return r;
    }

    function addport(n, name, ptype, portinfo) {
        n
            .each(function (d) {
                d
                    .ports
                    .push({
                        name: name || gensym(),
                        parent: d,
                        ptype: ptype,
                        portinfo: portinfo,
                        id: uuid()
                    });
            });
        addports(n);
    }

    var iconbase = "/images/ice/";
    iconbase = "/img/";

    var icons = {};

    function ngon(node, n, offset) {
        offset = offset || 0;
        //var offset = n == 4 ? Math.PI/4 : 0;
        var r = node
                .datum()
                .radius * (1 + 1 / n),
            p = [];
        for (var i = 0; i < n; i++) {
            // offset is so squares are squared :/
            var a = (i * Math.PI * 2) / n + offset;
            p.push(r * Math.sin(a));
            p.push(r * Math.cos(a));
        }
        return node
            .append("svg:polygon")
            .classed("nodebody", true)
            .attr("points", p.join(","));
    }

    var compositionDraggingType;

    function allowDropByType(event, type) {
        if (compositionDraggingType === type) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            return true;
        }
        return false;
    }

    /* DEAD CODE?
     // handle dropping location data on a node
     function dropLocation(event,that) {
     compositionDraggingType = null;
     var locText = event.dataTransfer.getData('location');
     if (locText === '') {return;}
     if (event.stopPropagation) {event.stopPropagation();}

     var nodeData = d3.select(that).datum();
     log("dropLocation",locText,nodeData);

     var loc = shoppingCart.locations.findByKey(Location.genKey(JSON.parse(locText)));
     log("dropLocation loc",loc);
     closeNodePropertiesEditor();
     setLocationOnSite(nodeData.model,loc);
     d3.select(that).select("#confignode").html(function(d) {return getShortPropertyValues(d.model);});
     }
     */

    // var getShortPropertyValues = getShortPropertyValues || function(x) { return
    // "{property values}" };
    var getShortPropertyValues = getShortPropertyValues || function (x) {
        return ""
    };

    var cpe;

    function renderucpe() {
        cpe = undergraph
            .append("svg:rect")
            .classed("ucpecontainer", true)
            .attr("width", bw - 200)
            .attr("height", bh - 100)
            .attr("x", 100)
            .attr("y", 50)
            .attr("rx", 20)
            .attr("ry", 20)
            .attr("stroke", "black")
            .attr("stroke-width", 5)
            .attr("fill", "rgba(0,0,0,0.1)")
            .style("opacity", 0.2);
    }

    function rendernode(n) {
        var type = n
            .datum()
            .model
            .type
            .name;
        var model = n
            .datum()
            .model;

        // HACK
        if (matchnodetype(n.datum().model, "tosca.nodes.network.Port")) {
            ngon(n, 4);
            return;
        }

        n
            .append("svg:rect")
            .classed("nodebody", true)
            /*
             .attr("width", 70)
             .attr("height", 44)
             .attr("x", -35)
             .attr("y", -22)
             */
            .attr("width", 90)
            .attr("height", 64)
            .attr("x", -45)
            .attr("y", -32)
            .attr("rx", 5)
            .attr("ry", 5);

        n.classed(type.replace(/\W/g, "_"), true);
        n.classed(n.datum().model.name.replace(/\W/g, "_"), true);

        var w = 150,
            h = 50; // node width, height

        // n.append("g")     .attr("transform", "translate(" + (-(w / 2 - 15)) + "," +
        // (-(h / 2 - 5)) + ")")     .append("foreignObject")     .attr({         width:
        // 100,         height: 50,         fill: '#7413E8',         'class':
        // 'svg-tooltip'     })     .append('xhtml:div')     .append('div')
        // .html(function (d) { return squishnodename(d.label) })     .append("div")
        // .attr({         width: 50,         height: 50,         fill: 'red', color:
        // 'green'     })     .style("pointer-events", "all") .style("cursor",
        // "pointer")     .html("config")     .on("click", function (d) {         if
        // (d3.event.metaKey || d3.event.ctrlKey) {             return;     }         if
        // (typeof editNodeProperties === 'function') { editNodeProperties(this);  }
        // else { configeditor(d3.select(this), d.model);         }     });

        n
            .append("g")
            .attr("transform", "translate(" + (-(w / 2 - 15)) + "," + (-(h / 2 - 5)) + ")")
            .append("foreignObject")
            .attr("width", (w - 10) + "px")
            .attr("height", (h + 60) + "px")
            .append("xhtml:div")
            .classed("compositionbody", true)
            //.classed(type.replace(/\./g,"_"), true)
            .classed("nodetext", true)
            .style("width", (w - 30) + "px")
            .style("height", (h - 20) + "px")
            .style("pointer-events", function () {
                return (type == "asc.nodes.Site"
                    ? null
                    : "none");
            })
            .attr("ondragover", function () {
                return (type == "asc.nodes.Site"
                    ? "allowDropByType(event,'location');"
                    : null);
            })
            .attr("ondrop", function () {
                return (type == "asc.nodes.Site"
                    ? "dropLocation(event,this);"
                    : null);
            })
            .html(function (d) {
                var icon = icons[d.model.type.name];
                if (!icon) {
                    if (d.model.typeinfo && d.model.typeinfo.hierarchy) {
                        var h = d.model.typeinfo.hierarchy;
                        for (i in h) {
                            var type = h[i].name;
                            if (icon = icons[type])
                                break;
                            }
                        }
                }
                if (icon)
                    icon = iconbase + icon;
                else
                    icon = window.location.origin + iconbase + "3net.png";
                icon = "dcae/comp-fe/img/death.png";
                if (propertynameval(d.model.properties, "designer_name")) {
                    // return "<img class=nodeicon width='40px' src=" + icon + "></img>" + "<br/>" +
                    //     "<center>" +     propertynameval(d.model.properties, "designer_name") +
                    // "</center>";
                } else {
                    //return "<img width='30px' src=" + icon + "></img>" + "<br/>" +
                    return "<center>" +
                    // "<img class=nodeicon width='20px' src=" + icon + "></img>" + "<br/>" +
                    "<span class=nodenametext>" + squishnodename(d.label) + "</span><br/></center>";
                }
            })
        // .append("span") .attr("id", "confignode") .attr("class", "confignode")
        // .style("pointer-events", "all") .style("cursor", "pointer") .html(function(d)
        // {return getShortPropertyValues(d.model);}) .html("config") .on("click",
        // function (d) {     if (d3.event.metaKey || d3.event.ctrlKey) { return;     }
        //   if (typeof editNodeProperties === 'function') { editNodeProperties(this);
        //  } else {         if ($('#selected-type-mt').val() == null) {
        // alertNoFlowTypeSelected();         } else {             var self = this;
        // compController.saveComposition(curcomp)                 .then(function () {
        //                   d.model.uniqeId = d.name; configeditor(d3.select(self),
        // d.model);                 });         }     } }); node delete button
        var del = n
            .append("g")
            .classed("deletenode", true)
            .attr("transform", "translate(0,-10)")
            .style("visibility", "hidden");

        del
            .append("svg:ellipse")
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", "red")
            .attr("opacity", 0.7)
            .on("click", function (d) {
                if (d3.select(this).style("visibility") != "hidden")
                    removenode(d);
                }
            );

        del
            .append("svg:text")
            .attr("dominant-baseline", "middle")
            .attr("text-anchor", "middle")
            .style("color", "black")
            .style("pointer-events", "none")
            .text(function (d) {
                return "X";
            })

    }

    var propertyeditor = propertyeditor || null;

    function propertynameval(props, name) {
        var p = props && props.find(function (x) {
            return x.name == name;
        });
        return p && p.assignment
            ? p.assignment.value
            : null;
    }

    function configeditor(selection, model) {
        var x = selection[0][0]
        var r = x.getBoundingClientRect();
        var e = document.getElementById("configeditor");
        var stuff = d3.select(e.children[0]);

        var cfg = d3
            .select("#configstuff")
            .html("properties for <b>" + model.name + ":</b>");
        var props = cfg
            .append("form")
            .attr("id", "cfgform")
            .style("display", "table")
            .style("overflow-y", "auto")
            .style("overflow-x", "hidden")
            .style("padding-left", "10px")
            .style("width", "100%");

        mm = model;
        model
            .properties
            .forEach(function (p) {
                var row = props
                    .append("div")
                    .style("line-height", "25px")
                    .style("height", "45px")
                    .style("display", "table-row");

                row
                    .append("label")
                    .style("display", "table-cell")
                    .html(p.name);
                row
                    .append("input")
                    .style("display", "table-cell")
                    .style("width", "90%")
                    .attr("type", "text")
                    .attr("name", p.name)
                    .attr("value", function () {
                        return p.value && !_.isObject(p.value)
                            ? p.value
                            : null;
                    });

                if (window.isRuleEditorActive) {
                    row
                        .append('span')
                        .attr({"class": "glyphicon glyphicon-cog rule-editor-btn"})
                        .on('click', function () {
                            var self = this;
                            var reModel = $('#rule-editor-modal');
                            openRuleEditor();

                            function openRuleEditor() {
                                var $propInput = $(self)
                                    .parent()
                                    .find('input');
                                var flowType = $('#selected-type-mt').val();
                                var data = {
                                    vfcmtUuid: curcomp.cid,
                                    nodeName: model.name,
                                    nodeId: model.uniqeId,
                                    fieldName: p.name,
                                    userId: userId,
                                    flowType: flowType
                                };
                                window.registerPostMessageEvent('disable-loader', function () {
                                    $('#modal-loader').hide();
                                });
                                window.registerPostMessageEvent('exit', function (jsonResult) {
                                    reModel.modal('hide');
                                    if (jsonResult !== null) {
                                        try {
                                            JSON.parse(jsonResult); // verifing that jsonResult is a valid json
                                            p.value = jsonResult; // updating model
                                            $propInput.val(p.value); // updating view
                                        } catch (err) {
                                            alert('Internal Error: unable to parse rule-editor value');
                                        }
                                    }
                                });
                                reModel
                                    .find('iframe')
                                    .attr({
                                        src: window.ruleEditorUrl + '?' + $.param(data),
                                        style: 'display: none'
                                    })
                                    .load(function (event) {
                                        $(event.target).attr({style: 'display: block'});
                                    });

                                reModel.modal({backdrop: 'static', keyboard: false});
                                $('#modal-loader').show();
                            }
                        });
                }

            });

        d3
            .select("#configset")
            .on("click", function () {
                eatform(model);
            });

        props
            .append("div")
            .style("display", "table-column");
        props
            .append("div")
            .style("display", "table-column")
            .style("width", "70%");

        e.style.left = r.left;
        e.style.top = r.top;
        e.style.visibility = "visible";
        e.style.transform = "scale(1)";
    }

    function eatform(model) {
        d3
            .select("#cfgform")
            .selectAll("input")
            .each(function () {
                var i = d3.select(this),
                    name = i.attr("name"),
                    val = i.property("value");
                if (val) {
                    // debugger;
                    var p = model
                        .properties
                        .find(function (x) {
                            return x.name == name;
                        });
                    p.value = val;
                    log("forminput", name, val);
                }
                curcomp
                    .nodes
                    .forEach(function (node) {
                        if (node.nid == model.uniqeId) {
                            var copy = model
                                .properties
                                .map(function (a) {
                                    return Object.assign({}, a);
                                });
                            node.properties = copy;
                        }
                    });
            });
        configclose();
    }

    function configclose(x) {
        var e = document.getElementById("configeditor");
        e.style.transform = "scale(.001)";
    }

    function selectucpe() {
        return graph
            .select(".node")
            .filter(function (d) {
                return d.label === "ucpe";
            });
    }

    function removeucpe() {
        selectucpe().each(removenode);
    }

    function removenode(d) {
        return txn("removenode", function () {
            return _removenode(d);
        });
    }

    function _removenode(d) {
        curcomp.nodes = curcomp
            .nodes
            .filter(function (n) {
                return n.nid !== d.name;
            });

        console.log("before: ", curcomp.nodes);

        onCompositionEvent("composition.remove.node", {nid: d.name});

        if (d.label === "ucpe") {
            // cpe implementation is such a hack
            cpe.remove();
            return;
        }

        _
            .values(d.ports)
            .map(function (x) {
                if (x.link)
                    removelink(x.link);
                }
            );
        nodes = _.without(force.nodes(), d);

        graph.selectAll(".node").data(nodes, function (d) {
                return d.name;
            })
            .exit()
            .remove();
        force
            .nodes(nodes)
            .start();

    }

    function addports(n) {
        var port = n
            .selectAll(".nodeport")
            .data(function (d) {
                return d.ports;
            }, function (p) {
                return p.id;
            })
            //.filter(function(d) { return d.name != "host"; })
            .enter();

        var pg = port
            .append("g")
            .attr("class", "nodeport")
            .attr("name", function (d) {
                return d.name;
            })
            .attr("transform", function (d) {
                var pp = d.parent.ports;
                d.a = rand() * Math.PI * 2;
                d.x = d.parent.radius * Math.sin(d.a);
                d.y = d.parent.radius * Math.cos(d.a);
                return "translate(" + d.x + "," + d.y + ")";
            });

        pg
            .append("svg:circle")
            .classed("targetcircle", true)
            .attr("r", 5);

        var pc = pg
            .append("svg:circle")
            .attr("class", function (d) {
                var rtype = "nuh";
                if (d.ptype === "cap") {
                    if (d.portinfo) {
                        if (d.portinfo.type)
                            rtype = d.portinfo.type.name;
                        if (d.portinfo.target)
                            rtype = d.portinfo.target.name;
                        }
                    else {
                        rtype = "null";
                    }
                } else {
                    try {
                        rtype = d.portinfo.capability.name;
                    } catch (e) {
                        log("oops", d, d.parent.model.name);
                    }
                }
                if (rtype.name) {
                    log("HACK rtype", rtype);
                    rtype = rtype.name;
                }
                if (rtype)
                    rtype = rtype.replace(/\W/g, "_");
                else
                    log("NULL RTYPE", d);
                return (d.ptype == "cap"
                    ? "capabilityport"
                    : "requirementport") + " " + rtype;
            })
            .classed("srcport", true)
            .attr("r", 5)
            .attr("port", function (d) {
                return d.name;
            });

        pg
            .append("svg:text")
            .attr("class", "nodeporttext")
            .attr("transform", "scale(.75)")
            .attr("dominant-baseline", "middle")
            .style("pointer-events", "none")
            .text(function (d) {
                return squishportname(d.name);
            });

        pc.on("click", function (d) {
            log("pc.onclick", d);
            var port = d3.select(this);
            if (d3.selectAll(".tmprelation").empty())
                startedge(port, d);
            else
                targetclick(port, d);
            }
        );

        pc.on("mouseenter", function (d) {
            var self = d3.select(this);
            var t = d3
                .select(self.node().parentNode)
                .select("text");
            t.style("font-size", "15px");
            //t.style("stroke", "black");
        });
        pc.on("mouseleave", function (d) {
            var self = d3.select(this);
            var t = d3
                .select(self.node().parentNode)
                .select("text");
            t.style("font-size", "12px");
            //t.style("font-size", "inherit"); t.style("stroke", "rgba(0,0,0,0.3)");
        });

        pc.on("touchstart", function (d) {
            d3
                .event
                .preventDefault();
            var t = d3.event.touches[0],
                x = t.clientX,
                y = t.clientY;
            var port = d3.select(this);
            if (d3.selectAll(".tmprelation").empty()) {
                force.stop();
                startedge(port, d);
            } else {
                force.resume();
                targetclick(port, d);
            }
        });

        pg.classed("targetport", true);

        return pg;
    }

    //hacks
    function squishportname(s) {
        return s
            .replace(/_connection$/, "")
            .replace(/_input$/, "")
            .replace(/_output$/, "")
            .replace(/network/, "net");
    }

    function squishnodename(s) {
        return s
            .replace(/network/, "net")
            .replace(/_analytics$/, "")
            .replace(/customer/, "cust");
    }

    function portclick(d) {
        var port = d3.select(this);
        if (d3.selectAll(".tmprelation").empty())
            startedge(port, d);
        else
            targetclick(port, d);
        }

    function addlink(n1, n2, p1, p2, restoring) {
        return txn("addlink", function () {
            return _addlink(n1, n2, p1, p2, restoring);
        });
    }

    function _addlink(n1, n2, p1, p2, restoring) {
        var nodes = force.nodes();
        var links = force.links();
        //p1 = p1 || gensym(); p2 = p2 || gensym();

        n1 = typeof n1 === "object"
            ? n1
            : _.findWhere(nodes, {name: n1});
        n2 = typeof n2 === "object"
            ? n2
            : _.findWhere(nodes, {name: n2});

        if (!n1 || !n2) {
            // hostedOn exceptional case log("addlink?", n1, n2, p1, p2);
            return [n1, n2];
        }

        var sp,
            tp;
        try {
            sp = n1
                .ports
                .find(function (p) {
                    return p.name == p1 && (!p.link || !p.link.name);
                });
            tp = n2
                .ports
                .find(function (p) {
                    return p.name == p2 && (!p.link || !p.link.name);
                });
        } catch (e) {
            log(e, n1, n2);
        }

        if (sp == null) {
            // port is already linked, so we'll duplicate it (unless occurrences exceeded)
            var xp = n1
                .ports
                .find(function (p) {
                    return p.name == p1
                });
            sp = _.clone(xp);
            sp.link = null;
            sp.id = uuid();
            n1
                .ports
                .push(sp);
            addports(d3.selectAll(".node").filter(function (n) {
                return n1.name == n.name;
            }));
        }

        if (tp == null) {
            // port is already linked, so we'll duplicate it (unless occurrences exceeded)
            var xp = n2
                .ports
                .find(function (p) {
                    return p.name == p2
                });
            tp = _.clone(xp);
            tp.link = null;
            tp.id = uuid();
            n2
                .ports
                .push(tp);
            addports(d3.selectAll(".node").filter(function (n) {
                return n2.name == n.name;
            }));
        }

        // if port allows multiple occurrences, duplicate it (weak test on occurrences
        // is a hack)

        if (sp.portinfo.occurrences == null || sp.portinfo.occurrences[1] > 1) {
            var nx = d3
                .selectAll(".node")
                .filter(function (n) {
                    return n1.name == n.name;
                });
            addport(nx, sp.name, sp.ptype, sp.portinfo);
        }

        if (tp.portinfo.occurrences == null || tp.portinfo.occurrences[1] > 1) {
            var nx = d3
                .selectAll(".node")
                .filter(function (n) {
                    return n2.name == n.name;
                });
            addport(nx, tp.name, tp.ptype, tp.portinfo);
        }

        /*
         // hack -- add port for relations with multiple occurrences
         //log("addlink", sp.type, sp.name, tp.type, tp.name);
         if (sp.ptype == "cap" && sp.name == "access_conn") {
         var nx = d3.selectAll(".node").filter(function(n) { return n1.name == n.name; });
         addport (nx, "access_conn", "cap", sp.portinfo);
         }
         if (tp.ptype == "cap" && tp.name == "access_conn") {
         var nx = d3.selectAll(".node").filter(function(n) { return n2.name == n.name; });
         addport (nx, "access_conn", "cap", tp.portinfo);
         }
         */

        let link = {
            name: gensym("lnk"),
            source: n1,
            target: n2,
            srcport: sp,
            targetport: tp,
            pending: true
        };

        sp.link = link;
        tp.link = link;

        links.push(link);

        let ln = edgegroup.selectAll(".relation")
            .data(links, function (d) {
                return d.name;
            });

        ln.enter()
            .insert("svg:path")
            .classed("relation", true)
            .classed("pending", true)
            .attr("d", epath)
            .on("mouseover", (d) => {
                self.selectedElement = d;
            })
            .on("mouseout", () => {
                self.selectedElement = null;
            });

        ln.exit().remove();

        setTimeout(function () {
            edgegroup.selectAll(".pending")
                .classed("pending", false)
                .each(function (d) {
                    d.pending = false;
                });
        }, 1000);

        let meta = {
            n1: n1.name,
            n2: n2.name,
            p1: p1,
            p2: p2
        };

        function findrelationship(n, p) {
            let r = n.typeinfo.requirements && n.typeinfo.requirements
                .find(function (x) {
                    return x.name === p;
                });
            return r && r.relationship && [n.name, r.relationship.name, r.name];
        }

        meta.relationship = findrelationship(n1.model, p1) || findrelationship(n2.model, p2);

        let relation = {
            rid: link.name,
            n1: n1.name,
            name1: n1.model.name,
            n2: n2.name,
            name2: n2.model.name,
            meta: meta
        };

        curcomp.relations.push(deepclone(relation));

        // if (!restoring) {
            /*xhrpost("/composition.addrelation?cid="+cid, relation,
             function(resp) {
             });

             xhrpost("/composition.savecomp?cid="+cid, curcomp,
             function(resp) {
             });*/

        // }

        force.start();

        return link;
    }

    function removelink(d) {
        return txn("removelink", function () {
            return _removelink(d);
        });
    }

    function removelink(d) {
        /*xhrpost("/composition.deleterelation?cid="+cid, {rid: d.name},
         function(resp) {
         });*/

        curcomp.relations = curcomp.relations.filter(r => r.rid !== d.name);

        /*xhrpost("/composition.savecomp?cid="+cid, curcomp,
         function(resp) {
         });*/

        var links = _.without(force.links(), d);
        edgegroup
            .selectAll(".relation")
            .data(links, function (d) {
                return d.name;
            })
            .exit()
            .remove();
        force
            .links(links)
            .start();
        d.srcport.link = null;
        d.targetport.link = null;
    }

    var srcport = false;

    function startedge(port, d) {
        log("startedge", d);
        d = port.datum(); // ??
        var type,
            rtype;
        try {
            if (d.ptype == "cap") {
                rtype = d.portinfo.type.name;
                type = "requirementport";
            } else {
                rtype = d.portinfo.capability.name;
                //rtype = d.portinfo.target.name; // MAYBE??
                type = "capabilityport";
            }
        } catch (e) {
            log("startedge-error", e, d);
        }
        if (rtype.name) {
            log("HACK rtype", rtype);
            rtype = rtype.name;
        }
        if (rtype)
            rtype = rtype.replace(/\./g, "_");
        else
            log("NULL RTYPE");
        d3
            .selectAll("." + rtype + "." + type)
            .filter(function (c) {
                return c.parent != d.parent;
            }) // same node
            .filter(function (c) {
                return !c.link;
            }) // already linked
            .classed("fabulous", true);

        var mx = port[0][0].getScreenCTM();
        x = mx.e;
        y = mx.f;

        srcport = port; // global

        d3
            .selectAll(".targetport")
            .classed("targeting", true);

        var link = {
            source: d.parent,
            target: {
                x: x,
                y: y
            },
            srcport: d,
            targetport: {
                x: 5,
                y: 5
            }
        };
        srcport.each(function (d) {
            d.link = link;
        });

        var tmp = graph
            .selectAll(".tmprelation")
            .data([link])
            .enter()
            .insert("svg:path")
            .attr("class", "tmprelation")
            .attr("d", tpath);

        d3
            .select("#compositioncontainer")
            .on("mousemove", function () {
                var m = d3.mouse(this);
                link.target.x = m[0];
                link.target.y = m[1];
                tick();
                tmp.attr("d", tpath);
            })
            .on("touchmove", function () {
                d3
                    .event
                    .preventDefault();
                var m = d3.mouse(this);
                link.target.x = m[0];
                link.target.y = m[1];
                tick();
                tmp.attr("d", tpath);
            })
            .on("mouseup", function () {
                // will miss target click event if this is immediate
                setTimeout(function () {
                    if (srcport)
                        srcport.each(function (d) {
                            d.link = null;
                        });
                    srcport = false; // HACK
                    d3
                        .selectAll(".targeting")
                        .classed("targeting", false);
                    d3
                        .select("#compositioncontainer")
                        .on("mousemove", null)
                        .on("mouseup", null);
                    tmp.remove();
                    d3
                        .selectAll(".fabulous")
                        .classed("fabulous", false);
                }, 1);
            });
    }

    function targetclick(tport, d) {
        d3
            .selectAll(".tmprelation")
            .remove();
        d3
            .selectAll(".fabulous")
            .classed("fabulous", false); // DRY

        if (srcport) {
            var tp = tport.attr("port");
            var sp = srcport.attr("port");
            var spd = srcport.datum(),
                tpd = tport.datum();

            //log("targetclick", spd, tpd);
            var stype = spd.ptype == "cap"
                ? spd.portinfo.type.name
                : spd.portinfo.capability.name;
            var ttype = tpd.ptype == "cap"
                ? tpd.portinfo.type.name
                : tpd.portinfo.capability.name;
            // var stype = spd.type == "cap" ? spd.portinfo.type.name :
            // spd.portinfo.target.name; var ttype = tpd.type == "cap" ?
            // tpd.portinfo.type.name : tpd.portinfo.target.name; log("target",
            // "stype="+stype, "ttype="+str(ttype));

            var name = d.label;

            if (spd.ptype != tpd.ptype && stype == ttype)
                log("MATCH ", d);
            else {
                log("NOMATCH", d);
                var mx = tport[0][0].getScreenCTM(); // fun!
                var x = mx.e,
                    y = mx.f;
                d3
                    .select("#problem")
                    .style("left", x)
                    .style("top", y)
                    .style("visibility", "visible")
                    .html("node/type mismatch");
                setTimeout(function () {
                    d3
                        .select("#problem")
                        .style("visibility", "hidden");
                }, 3000);
                return;
            }

            // match success...
            var port = d3.select(tport[0][0].parentNode);
            port.classed("boundport", true);
            port.classed("targetport", false);
            var sp = srcport.datum(),
                tp = tport.datum();
            addlink(sp.parent, tp.parent, sp.name, tp.name);
            srcport = false;
        }
    }

    var edgelink = function () {
        var curvature = .5;

        function link(d) {
            var spx = d.srcport.x,
                spy = d.srcport.y,
                tpx = d.targetport.x,
                tpy = d.targetport.y;

            var x0 = d.source.x + spx,
                x1 = d.target.x + tpx,
                y0 = d.source.y + spy,
                y1 = d.target.y + tpy,

                xi = d3.interpolateNumber(x0, x1),
                yi = d3.interpolateNumber(y0, y1),
                x2 = xi(curvature),
                y2 = yi(curvature),
                x3 = xi(1 - curvature),
                y3 = yi(1 - curvature);

            // if (isNaN(spx)) log("edgelink", d); fix curvature depending on whether port
            // is on side, top, or bottom log(":: " + tpy + ", " + spy);
            /*
             if (tpy == 0) y3 = y1;
             if (spy == 0) y2 = y0;
             if (tpy != 0) x3 = x1;
             if (spy != 0) x2 = x0;
             */
            y3 = y1;
            y2 = y0;

            return "M" + x0 + "," + y0 + "C" + x2 + "," + y2 + " " + x3 + "," + y3 + " " + x1 + "," + y1;
        }

        link.curvature = function (_) {
            if (!arguments.length)
                return curvature;
            curvature = +_;
            return link;
        };

        return link;
    };

    var epath = edgelink();
    var tpath = edgelink();

    epath.curvature(0.3);

    function node(name) {
        return cc
            .nodes
            .find(function (n) {
                return n.name == name;
            });
    }

    function hascapability(n, cap) {
        return n.capabilities && n
            .capabilities
            .find(function (c) {
                return c.name == cap;
            });
    }

    function addcomp(c, x, y) {
        return txn("addcomp", function () {
            return _addcomp(c, x, y);
        });
    }

    function _addcomp(c, x, y) {
        x = x || 0;
        y = y || 0;

        log("addcomp", c);
        cc = c;

        var nodes = {};
        var links = [];
        var newnodes = [];

        if (!c.outputs)
            c.outputs = []; // dummy node special case
        if (!c.inputs)
            c.inputs = [];

        var outputs = c.outputs;
        outputs.forEach(function (o) {
            o.value = jsonparse(o.value);
        });

        var inputs = c.inputs;

        c
            .nodes
            .forEach(function (n) {

                n = _.clone(n);

                outputs.forEach(function (o) {
                    _
                        .values(o)
                        .forEach(function (a) {
                            _
                                .values(a)
                                .forEach(function (m) {
                                    if (m.forEach) {
                                        m
                                            .forEach(function (y) {
                                                if (n.name == y) {
                                                    n.output = o;
                                                }
                                            });
                                    }
                                });
                        });
                });

                if (c.policies) {
                    c
                        .policies
                        .forEach(function (po) {
                            if (!po.targets) {
                                return;
                            }
                            po
                                .targets
                                .some(function (potarget) {
                                    if (n.name != potarget) {
                                        return false;
                                    }
                                    log("ASSIGN POLICY", potarget, po);
                                    if (!n.policies) {
                                        n.policies = [];
                                    }
                                    var policy = JSON.parse(JSON.stringify(po));
                                    n
                                        .policies
                                        .push(policy);
                                    return true;
                                });
                        });
                }

                onCompositionEvent("init.properties.on.node", n);
                // debugger;
                if (n.properties) {
                    n
                        .properties
                        .forEach(function (p) {
                            if (!p.value && p.assignment) {
                                p.value = p.assignment.value || p["default"];
                                if (!p.value && p.assignment.input) {
                                    p.value = p.assignment.input["default"];
                                }
                                //log("assignment value", p.name, p.value);
                            }
                        });
                }

                inputs
                    .forEach(function (i) {
                        // debugger;
                        if (n.properties)
                            n.properties.forEach(function (p) {
                                if (p.name == i.name && !p.value) {
                                    p.value = i['default'];
                                    log("INPUT", p.name, p.value);
                                }
                            });
                        }
                    );

                var d = addnode(n, x, y);
                newnodes.push(d);

                nodes[n.name] = d;
                d.model = n;
                x += 50;
                y += rand(50);
            });

        log(c.name);
        log("inputs", inputs);
        log("outputs", outputs);

        //if (inputs && inputs.length > 0)
        /*xhrpost("/composition.addinputs?cid="+cid, inputs);*/
        //if (outputs && outputs.length > 0)
        /*xhrpost("/composition.addoutputs?cid="+cid, outputs);*/

        c
            .nodes
            .forEach(function (n) {
                if (n.requirements) {
                    n
                        .requirements
                        .forEach(function (req) {
                            var tn = c
                                .nodes
                                .find(function (x) { // target node
                                    return req.node == x.name;
                                });
                            if (tn) {
                                // find target capability from requirement
                                var tc = tn
                                    .typeinfo
                                    .capabilities
                                    .find(function (cap) {
                                        return req.capability.name === cap.type.name;
                                    });
                                if (tc)
                                    links.push({
                                        n1: nodes[n.name],
                                        sp: req.name,
                                        n2: nodes[tn.name],
                                        tp: tc.name
                                    });
                                }
                            });
                }
            });

        links.forEach(function (x) {
            addlink(x.n1, x.n2, x.sp, x.tp);
        });
        sortinterfaces(); // HACK
        return newnodes;
    }

    function unfade() {
        d3
            .selectAll(".node")
            .classed("faded", false);
    }

    var dropzone1 = d3
        .select("#compositioncontainer")
        .node();

    dropzone1.addEventListener('dragover', function (e) {
        if (e.preventDefault)
            e.preventDefault();

        //e.dataTransfer.dropEffect = 'move'; return allowDropByType(e,'product');
        return true;
    });

    dropzone1.addEventListener('dragenter', function (e) {
        e.preventDefault();
        this.className = "over"; // assumes react
    });

    dropzone1.addEventListener('dragleave', function (e) {
        this.className = "";
    });

    function droplistener(e) {
        compositionDraggingType = null;

        e.preventDefault();
        e.stopPropagation();

        var data = JSON.parse(e.dataTransfer.getData('product'));

        dropdata(data, e.clientX, e.clientY);
    }

    dropzone1.addEventListener('drop', droplistener);

    var catalogprefix = catalogprefix || "";

    function dropdata(data, x, y) {
        //log("DROPDATA",data);
        if (data.nodes) {
            log("dropdata", 1);
            // assuming incoming data blob is a composition template
            fixcomp(data, function (c) {
                var nodes = addcomp(c, x, y);
            });
        } else if (data.product) { // DEAD?
            log("dropdata", 2);
            addproduct(data.product, x, y);
        } else if (data.uuid) { // self-contained catalog interface
            log("dropdata", 3);
            addproduct(data, x, y);
        } else {
            log("dropdata", 4);
            // it's a single node
            var n = data;
            if (n.id == 0) { // dummy node special case
                n.type = {
                    name: "NOTYPE"
                };
                addnode(n);
            } else {
                // replace with catalogtype TODO
                if (x.type && x.type.name) {
                    xhrget(catalogprefix + "/type?" + n.type.name, function (resp) {
                        var ti = JSON.parse(resp);
                        n.typeinfo = ti;
                        addnode(n);
                    });
                } else {
                    addnode(n);
                }
            }
        }
        return false;
    }

    // query type info for each node
    function fixcomp(c, fn) {
        var nn = c.nodes.length;
        c
            .nodes
            .map(function (n) {
                if (n.id === 0) { // dummy node special case
                    n.type = {
                        name: "NOTYPE"
                    };
                    if (--nn == 0)
                        fn(c);
                    }
                else {
                    // replace with catalogtype TODO HACK n.type into n.type.name
                    if (typeof n.type == "string")
                        n.type = {
                            name: n.type
                        };
                    if (!n.name)
                        n.name = "foo";
                    catalogtype(n.id, n.type.name, function (resp) {
                        var ti = JSON.parse(resp);
                        if (n.typeinfo)
                            log("fixcomp - already have typeinfo");
                        else
                            n.typeinfo = ti;
                        if (--nn == 0)
                            fn(c);
                        }
                    );
                }
            });
    }

    function fixcomp0(c, fn) {
        var nn = c.nodes.length;
        c
            .nodes
            .map(function (n) {
                if (n.id == 0) { // dummy node special case
                    n.type = {
                        name: "NOTYPE"
                    };
                    if (--nn == 0)
                        fn(c);
                    }
                else {
                    // replace with catalogtype TODO
                    xhrget(catalogprefix + "/type?" + n.type.name, function (resp) {
                        var ti = JSON.parse(resp);
                        n.typeinfo = ti;
                        if (--nn == 0)
                            fn(c);
                        }
                    );
                }
            });
    }

    function setcomposition(c) {
        c = JSON.parse(c);
        d3
            .select("#composition")
            .html("\"" + c.name + "\"<br><span style='font-size: 60%'>(" + c.description + ")<br>" + c.composition + "</span>");
    }

    // stolen from bostock
    function wrap(text, width) {
        text
            .each(function () {
                var text = d3.select(this),
                    words = text
                        .text()
                        .split(/\s+/)
                        .reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr("y"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text
                        .text(null)
                        .append("tspan")
                        .attr("x", 0)
                        .attr("y", y)
                        .attr("dy", dy + "em");
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text
                            .append("tspan")
                            .attr("x", 0)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
                    }
                }
            });
    }

    // filters go in defs element
    var defs = svg.append("defs");

    var filter = defs
        .append("filter")
        .attr("id", "drop-shadow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result in
    // blur
    filter
        .append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 7)
        .attr("result", "blur");

    // translate output of Gaussian blur to the right and downwards with 2px store
    // result in offsetBlur
    filter
        .append("feOffset")
        .attr("in", "blur")
        .attr("dx", 2)
        .attr("dy", 2)
        .attr("result", "offsetBlur");

    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    var feMerge = filter.append("feMerge");

    feMerge
        .append("feMergeNode")
        .attr("in", "offsetBlur")
    feMerge
        .append("feMergeNode")
        .attr("in", "SourceGraphic");

    function _serialsvg() {
        svg
            .append("style")
            .html(css); // stick the stylesheet in
        return new XMLSerializer().serializeToString(svg[0][0]);
        // <object type="image/svg+xml" data="foo4.svg"> </object>
    }

    function serialsvg() {
        // no, clone is poison var s = clone(svg);
        s = svg;
        //  s.append("style").html(css); // stick the stylesheet in
        return new XMLSerializer().serializeToString(s.node());
        // <object type="image/svg+xml" data="foo4.svg"> </object>
    }

    function clone(s) {
        var n = s.node();
        return d3.select(n.parentNode.insertBefore(n.cloneNode(true), n.nextSibling));
    }

    // EXTERNAL / OUTBOUND APIs window.addEventListener('load', function(){
    // },false);

    if (typeof ascIceServerGet == 'function') {
        xhrget = function (url, callback) {
            console.log("ascIceServerGet", url);
            ascIceServerGet(url, function (responseText) {
                if (callback)
                    callback(responseText);
                }
            );
        }
        xhrpost = function (url, obj, callback, type) {
            console.log("ascIceServerPost", url, obj, type);
            ascIceServerPost(url, JSON.stringify(obj), function (responseText) {
                if (callback)
                    callback(responseText);
                }
            , type);
        }

        xhrpostraw = function (url, obj, callback, type) {
            //	console.log("ascIceServerPost raw", url, obj, type);
            ascIceServerPost(url, obj, function (responseText) {
                if (callback)
                    callback(responseText);
                }
            , type || "text/plain");
        }
    }

    function onCompositionEvent(compositionEvent, compositionElement) {
        if (typeof onEventFromComposition === 'function') {
            onEventFromComposition(compositionEvent, compositionElement);
        }
    }

    function setCompositionDropZone(type, yesno) {
        compositionDraggingType = (yesno === true
            ? type
            : null);
        switch (type) {
            case 'product':
                d3
                    .select("#compositiondiv")
                    .selectAll(".compositioncontainer")
                    .classed("highlight", !!yesno);
                break;
            case 'location':
                d3
                    .select("#compositiondiv")
                    .selectAll(".asc_nodes_Site")
                    .classed("highlight", !!yesno);
                break;
        }
    }

    function clearComposition() {
        graph
            .selectAll(".node")
            .each(function (d) {
                removenode(d);
            });
    }

    function initDeleteEvent(){
        self.selectedElement = null;
        d3.select("body").on("keydown", function () {
            if (d3.event.code === "Delete") {
                if (self.selectedElement !== null) {
                    let name = self.selectedElement.name.split(".");
                    if (name.length > 0) {
                        if (name[0] === "n") {
                            removenode(self.selectedElement)
                        } else if (name[0] === "lnk") {
                            removelink(self.selectedElement)
                        }
                    }
                    self.selectedElement = null;
                } else {
                    notifyError('No item selected', 'errorMsg');
                }
            }
        });
    }

    var composition_version = {
        revision: "revision: 2568",
        lastmod: "last modified: Thu Sep 21 13:22:37 2017"
    };

    // log(composition_version); extern
    window.xhrget = xhrget;
    window.configclose = configclose;
    window.dropdata = dropdata;

    // log("starting composition inside " + window.location.host + " " +
    // JSON.stringify(composition_version));

};

setTimeout(function () {
    window.comp = new CompositionEditor();
    $('#composition-loader').hide();
}, 2000);

//
// ─── CONTROLLERS
// ────────────────────────────────────────────────────────────────
//

/**
 * Represents a controller that connects DOM operations with services. Comp(ostion)Controller
 * @param {ApiService} apiService - service that handles api calls
 * @requires jquery
 * @requires bootstrap-modal
 */
function CompController(apiService) {

    /* Private members */

    var self = this,
        loaderElement = $('#composition-loader');

    /* Public members */

    /**
     * Saves a given composition, up to 3 attempts are made in case of failure
     * UI interactions:
     *      - loader showing until request returns
     *      - notification on success
     *      - modal on failure
     * @param {Object} composition
     */
    self.saveComposition = function (composition) {
        loaderElement.show();
        return attempt(3, function () {
            return apiService.saveComposition(composition.cid, composition);
        })
            .then(function (response) {
                console.log(response);
                composition.cid = response.uuid;
                notifySuccess('Composition saved', 'saveMsg');
            })
            .fail(function (jqXHR) {
                console.error('SaveComposition failed %o', jqXHR.responseJSON.notes);
                var tempError = Object
                    .keys(jqXHR.responseJSON.requestError)
                    .map(function (key) {
                        return jqXHR.responseJSON.requestError[key];
                    });
                var message = (jqXHR.responseJSON !== undefined)
                    ? tempError[0].formattedErrorMessage // use response when it's not in JSON format
                    : 'Internal server error - unable to save composition.';
                alertError(message);
            })
            .always(function () {
                loaderElement.hide();
                window
                    .sdc
                    .notify('ACTION_COMPLETED');
            });
    };

    /**
     * Creates a blueprint
     * UI interactions:
     *      - loader showing until request returns
     *      - notification on success
     *      - modal on failure
     * @param {String} component_Id
     * @param {String} serviceuuid
     * @param {String} vnfiname
     * @param {String} mt - flow-type
     */
    self.createBlueprint = function (component_Id, serviceuuid, vnfiname, mt) {
        loaderElement.show();
        apiService
            .createBlueprint(component_Id, serviceuuid, vnfiname, mt)
            .then(function (response) {
                console.log('create blueprint response body: %o', response);
                notifySuccess('Blueprint Created', 'submitMsg');
            })
            .fail(function (jqXHR) {
                console.error('Create blueprint failed %o', jqXHR.responseJSON.notes);
                var tempError = Object
                    .keys(jqXHR.responseJSON.requestError)
                    .map(function (key) {
                        return jqXHR.responseJSON.requestError[key];
                    });
                var message = (jqXHR.responseJSON !== undefined)
                    ? tempError[0].formattedErrorMessage
                    // use response when it's not in JSON format
                    : 'Internal server error: unable to create blueprint';
                alertError(message);
            })
            .always(function () {
                loaderElement.hide();
            });
    };

}

//
// ─── SERVICES
// ───────────────────────────────────────────────────────────────────
//

/**
 * Represents a service that handles api calls
 * (!) Do not make any UI interactions or DOM changes in this context - use the controller for that
 * @constructor
 * @param {String} baseUrl
 * @param {String} userId
 */
function ApiService(baseUrl, userId) {

    /* Private members */

    var self = this,
        headers = {
            'Content-Type': 'text/plain;charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'USER_ID': userId
        };

    function post(path, data) {
        var deferred = $.Deferred();
        $.ajax({
            type: 'POST',
            url: baseUrl + path,
            data: JSON.stringify(data),
                headers: headers
            })
            .then(function () {
                // connect deferred with ajax on success
                return deferred
                    .resolve
                    .apply(null, arguments);
            })
            .fail(function (jqXHR) {
                // when no response show server-unavilable
                jqXHR.responseText = jqXHR.responseText || 'Server Unavailable';
                // connect deferred with ajax on failure
                return deferred.reject(jqXHR);
            });
        return deferred;
    }

    /* Public members */

    self.saveComposition = function (cid, data) {
        return post('/saveComposition/' + cid, data);
    };

    self.createBlueprint = function (componentId, serviceUuid, vfniName, mt) {
        var path = ['/createBluePrint', componentId, serviceUuid, vfniName, mt].join('/');
        return post(path, null);
    };
}

//
// ─── UTILS
// ──────────────────────────────────────────────────────────────────────
//

/**
 * Attempt to perform an given action (deferredFunc)
 * @param {Integer} maxAttempts - maximum number of retries
 * @param {Function} deferredFunc - function that returns deferred object (jquery promise object)
 * @returns {jquery Deferred object} - see api at https://api.jquery.com/category/deferred-object/
 * @requires jquery
 * @example
 * // prints 'error' if GET request to 'http://some-url' failed 3 times
 * // prints 'success' if one of the attempts was successful
 * attempt(3, () => $.get('http://some-url'))
 *      .then(() => console.log('success'))
 *      .fail(() => console.log('error'))
 */
function attempt(maxAttempts, deferredFunc) {
    var promise = $.Deferred(),
        errorArgs = null;

    function recurse(attemptsLeft) {
        if (attemptsLeft < 1) {
            // fail when no more attempts left
            promise
                .reject
                .apply(null, errorArgs);
        } else {
            deferredFunc()
                .then(function () {
                    return promise
                        .resolve
                        .apply(null, arguments);
                })
                .fail(function () {
                    errorArgs = arguments;
                    recurse(attemptsLeft - 1); // retry on fail
                });
        }
    }

    recurse(maxAttempts);
    return promise;
}

/**
 * Displays success notification on the bottom of the screen
 * Will auto-close after 5 secs
 * @param {String} message
 * @param {String} testId - id for selenium tests
 * @requires jquery
 * @requires remarkable-bootstrap-notify
 */
function notifySuccess(message, testId) {
    notify(message, testId, 'success', 'glyphicon glyphicon-ok');
}

function notifyError(message, testId) {
    notify(message, testId, 'danger', 'glyphicon glyphicon-remove');
}

function notify(message, testId, type, icon) {
    let template = $('<span>')
        .attr('data-tests-id', testId)
        .text(message)
        .prop('outerHTML'); // stringify the element

    $.notify({
        // options
        message: template,
        icon: icon
    }, {
        // settings
        type: type,
        delay: 5000, // auto-close after 5sec
        placement: {
            from: 'bottom'
        }
    });
}

/**
 * Displays alert modal
 * @param {String} message
 * @requires bootstrap
 */
function alertError(message) {
    $('#alert-modal')
        .modal('show')
        .find('.modal-body')
        .text(message);
}
