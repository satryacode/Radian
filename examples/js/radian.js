var radian = angular.module("radian", []);

radian.directive("plotData", [ "$rootScope", "splitAttrs", function(e, t) {
    "use strict";
    function r(e, r, i) {
        function b(e, t, n) {
            function r(e, i) {
                e instanceof Array && e.length > 0 ? typeof e[0] == "string" && i ? e.forEach(function(t, r) {
                    e[r] = n(t);
                }) : e.forEach(function(e) {
                    r(e, !1);
                }) : typeof e == "object" && Object.keys(e).forEach(function(n) {
                    r(e[n], n == t);
                });
            }
            r(e, !1);
        }
        r.hide(), t(e, i, n, !1, "plot-data");
        var s = e.plotOptions;
        if (!s.name) throw Error("<plot-data> must had NAME attribute");
        var o = s.name, u = s.format || "json", a = s.separator === "" ? " " : s.separator || ",", f = s.cols;
        f && (f = f.split(",").map(function(e) {
            return e.trim();
        }));
        var l = [ "json", "csv" ];
        if (l.indexOf(u) == -1) throw Error('invalid FORMAT "' + u + '" in <plot-data>');
        if (u == "csv" && !f) throw Error("CSV <plot-data> must have COLS");
        var c = "";
        r.contents().each(function(e, t) {
            t instanceof Text && (c += t.textContent);
        });
        var h, p = /^\s*[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\s*$/;
        switch (u) {
          case "json":
            try {
                h = JSON.parse(c);
            } catch (d) {
                throw Error("invalid JSON data in <plot-data>");
            }
            break;
          case "csv":
            try {
                h = $.csv.toArrays(c.replace(/^\s*\n/g, "").split("\n").map(function(e) {
                    return e.replace(/^\s+/, "");
                }).join("\n"), {
                    separator: a
                });
                if (h.length > 0) {
                    if (h[0].length != f.length) throw Error("mismatch between COLS and CSV data in <plot-data>");
                    var v = {}, m = [];
                    for (var g = 0; g < f.length; ++g) v[f[g]] = [], m.push(h[0][g].match(p));
                    for (var y = 0; y < h.length; ++y) for (var g = 0; g < f.length; ++g) m[g] ? v[f[g]].push(parseFloat(h[y][g])) : v[f[g]].push(h[y][g]);
                    h = v;
                }
            } catch (d) {
                throw Error("invalid CSV data in <plot-data>");
            }
        }
        if (e.$parent[o] && e.$parent[o].metadata) for (var w in e.$parent[o].metadata) {
            var E = e.$parent[o].metadata[w];
            if (E.format == "date") if (!E.dateParseFormat) b(h, w, function(e) {
                return new Date(e);
            }); else {
                var S;
                E.dateParseFormat == "isodate" ? S = d3.time.format.iso.parse : S = d3.time.format(E.dateParseFormat).parse, b(h, w, function(e) {
                    return S(e);
                });
            }
        }
        var E = e.$parent[o] ? e.$parent[o].metadata : null;
        e.$parent[o] = h, E && (e.$parent[o].metadata = E);
    }
    var n = {};
    return [ "cols", "format", "name", "separator", "src" ].forEach(function(e) {
        n[e] = 1;
    }), {
        restrict: "E",
        scope: !1,
        compile: function(e, t, n) {
            return {
                post: r
            };
        }
    };
} ]), radian.directive("metadata", [ "$rootScope", "splitAttrs", function(e, t) {
    "use strict";
    var n = {};
    return [ "dateFormat", "dateParseFormat", "errorFor", "format", "label", "name", "units" ].forEach(function(e) {
        n[e] = 1;
    }), {
        restrict: "E",
        scope: !1,
        link: function(e, r, i) {
            if (!r[0].parentNode || r[0].parentNode.tagName != "PLOT-DATA" || !$(r[0].parentNode).attr("name")) throw Error("<metadata> not properly nested inside <plot-data>");
            var s = $(r[0].parentNode).attr("name");
            t(e, i, n, !1, "metadata");
            var o = e.plotOptions;
            delete e.plotOptions;
            if (!o.hasOwnProperty("name")) throw Error("<metadata> without NAME attribute");
            var u = o.name;
            delete o.name, e.$parent[s] || (e.$parent[s] = {
                metadata: {}
            }), e.$parent[s].metadata || (e.$parent[s].metadata = {}), e.$parent[s].metadata[u] = o;
        }
    };
} ]), radian.directive("radianUi", [ function() {
    "use strict";
    function e(e) {
        var t = e.plotOptions;
        if (t.strokeSwitch !== undefined) {
            var n = t.strokeSwitchLabel, r = t.strokeSwitch.split(";");
            r.length == 1 ? (e.stroke = 0, e.swbut = r[0], e.swbutlab = n, e.switchfn = function() {
                e.stroke = 1 - e.stroke, e.$emit("strokeSelChange", e.stroke);
            }) : (e.stroke = r[0], e.swsel = r, e.swsellab = n, e.$watch("stroke", function(t, n) {
                e.$emit("strokeSelChange", t);
            }));
        }
        if (t.selectX !== undefined) {
            var i = t.selectX.split(",");
            i.length > 1 && (e.xv = i[0], e.xvs = i, e.xlab = t.selectXLabel, e.$watch("xv", function(t, n) {
                t == e.yv && (e.yv = n), e.yvs = e.xvs.filter(function(t) {
                    return t != e.xv;
                }), e.$emit("xDataSelChange", e.xvs.indexOf(t));
            }));
        }
        if (t.selectY !== undefined) {
            var s = t.selectY.split(",");
            s.length > 1 && (e.yv = s[0], e.yvs = s, e.ylab = t.selectYLabel, e.allyvs = t.selectY.split(","), e.selectX == e.selectY && (e.yvs = s.splice(1), e.yv = e.allyvs[1]), e.$watch("yv", function(t, n) {
                e.$emit("yDataSelChange", e.allyvs.indexOf(t));
            }));
        }
        var o = 0, u = 0;
        e.xv && (o = e.xvs.indexOf(e.xv)), e.yv && (u = e.allyvs.indexOf(e.yv)), e.$emit("xDataSelChange", o), e.$emit("yDataSelChange", u);
    }
    return {
        restrict: "E",
        scope: !1,
        template: [ '<div class="radian-ui">', '<span class="form-inline">', '<span ng-show="xvs">', "<span>{{xlab}}</span>", '<select ng-model="xv" class="span1" ng-options="v for v in xvs">', "</select>", "</span>", '<span ng-show="xvs && yvs">', "&nbsp;&nbsp;vs&nbsp;&nbsp;", "</span>", '<span ng-show="yvs">', "<span>{{ylab}}</span>", '<select ng-model="yv" class="span1" ng-options="v for v in yvs">', "</select>", "</span>", '<span ng-show="yvs && (swbut || swsel)">', "&nbsp;&nbsp;", "</span>", '<span ng-show="swbut">', "<span>{{swbutlab}}</span>", '<button class="btn" data-toggle="button" ng-click="switchfn()">', "{{swbut}}", "</button>", "</span>", '<span ng-show="swsel">', "<label>{{swsellab}}&nbsp;</label>", '<select ng-model="stroke" .span1 ng-options="o for o in swsel">', "</select>", "</span>", "</span>", "</div>" ].join(""),
        replace: !0,
        link: function(t, n, r) {
            t.$on("uiSetup", function() {
                e(t);
            });
        }
    };
} ]), radian.directive("plot", [ "evalPlotExpr", "plotOption", "splitAttrs", "$timeout", "$rootScope", "dumpScope", function(e, t, n, r, i, s) {
    "use strict";
    function u(e, t, r, i) {
        n(e, r, o, !0, "plot"), e.strokesel = 0;
        var s = 300, u = 1.618, a = u * s, f = r.width, l = r.height, c = r.aspect;
        f && l && c && (c = null);
        if (l && f) s = l, a = f, u = a / s; else if (l && c) s = l, u = c, a = s * u; else if (f && c) a = f, u = c, s = a / u; else if (l) s = l, a = s * u; else if (f) a = f, s = a / u; else if (c) u = c, s = a / u; else {
            var h = t.width(), p = t.height(), d = t.css("aspect") ? parseFloat(t.css("aspect")) : null;
            h && p && d && (d = null), p && h ? (s = p, a = h, u = a / s) : p && d ? (s = p, u = d, a = s * u) : h && d ? (a = h, u = d, s = a / u) : p ? (s = p, a = s * u) : h ? (a = h, s = a / u) : d && (u = d, s = a / u);
        }
        e.width = a, e.height = s;
        var v = $(t.children()[0]).children()[1];
        d3.select(v).style("width", a).style("height", s), e.plots = [], e.views = [], e.switchable = [], e.addPlot = function(t, n) {
            (n.plotOptions && n.plotOptions.hasOwnProperty("legendSwitches") || e.plotOptions && e.plotOptions.hasOwnProperty("legendSwitches")) && e.switchable.push(e.plots.length), e.plots.push({
                xidx: 0,
                yidx: 0,
                draw: t,
                scope: n,
                enabled: !0
            });
        }, i(e.$new(), function(e) {
            t.children().append(e);
        });
    }
    function a(e, n) {
        function i() {
            e.views.forEach(function(t) {
                c(t, e.plots);
            });
        }
        function s() {
            e.views = h.map(function(t) {
                return l(e, t);
            });
        }
        var o = e.plotOptions, u = d3.select($(n.children()[0]).children()[1]), a = u.append("g").attr("width", e.width).attr("height", e.height), h = [ a ], p = null;
        if (o.hasOwnProperty("zoomX")) {
            var d = t(e, "zoom-fraction", .2);
            d = Math.min(.95, Math.max(.05, d));
            var v = e.height * d, m = e.height * (1 - d), g = u.append("g").attr("transform", "translate(0," + m + ")").attr("width", e.width).attr("height", e.height * d);
            h.push(g), h[0].attr("height", e.height * (1 - d)), p = function() {
                u.append("defs").append("clipPath").attr("id", "xzoomclip").append("rect").attr("width", e.views[0].realwidth).attr("height", e.views[0].realheight), e.views[0].clip = "xzoomclip";
                var t = d3.svg.brush().x(e.views[1].x);
                t.on("brush", function() {
                    e.views[0].x.domain(t.empty() ? e.views[1].x.domain() : t.extent()), c(e.views[0], e.plots, e.ui);
                }), e.views[1].post = function(n) {
                    n.append("g").attr("class", "x brush").call(t).selectAll("rect").attr("y", -6).attr("height", e.views[1].realheight + 7);
                };
            };
        }
        r(function() {
            s(), p && p(), i(), f(u, e), e.$on("paintChange", function(e) {
                i();
            }), e.$on("dataChange", function(e, t) {
                s(), p && p(), i();
            }), e.$on("strokeSelChange", function(t, n) {
                e.strokesel = n, i();
            }), e.$on("xDataSelChange", function(t, n) {
                e.plots.forEach(function(e) {
                    e.scope.x && e.scope.x[0] instanceof Array && (e.xidx = n % e.scope.x.length);
                }), s(), p && p(), i();
            }), e.$on("yDataSelChange", function(t, n) {
                e.plots.forEach(function(e) {
                    e.scope.y && e.scope.y[0] instanceof Array && (e.yidx = n % e.scope.y.length);
                }), s(), p && p(), i();
            }), e.$broadcast("uiSetup");
        }, 0);
    }
    function f(e, t) {
        var n = t.switchable.length;
        if (n > 0) {
            var r = t.plots.filter(function(e, n) {
                return t.switchable.indexOf(n) != -1;
            }), i = e.append("g").selectAll("g").data(r).enter().append("g"), s = i.append("circle").style("stroke-width", 1).attr("r", 5).attr("fill", function(e, t) {
                return e.scope.plotOptions.stroke.split(";")[0] || "#000";
            }).attr("stroke", function(e, t) {
                return e.scope.plotOptions.stroke.split(";")[0] || "#000";
            }), o = function(e, n) {
                e.enabled = !e.enabled, d3.select(this).select("circle").attr("fill", e.enabled ? e.scope.plotOptions.stroke.split(";")[0] || "#000" : "#fff"), t.views.forEach(function(e) {
                    c(e, t.plots, t.ui);
                });
            };
            i.on("click", o);
            var u = i.append("text").attr("text-anchor", "start").attr("dy", ".32em").attr("dx", "8").text(function(e, t) {
                return e.scope.plotOptions.label || "data" + t;
            }), a = [];
            u.each(function(e, t) {
                a.push(d3.select(this).node().getComputedTextLength() + 10);
            });
            var f = d3.max(a), l = 15, h = f + l, p = n * f + (n - 1) * l;
            i.attr("transform", function(e, n) {
                return "translate(" + (t.width - p + h * n) + ",10)";
            });
        }
    }
    function l(e, t) {
        function f(e) {
            return e[0] instanceof Array ? d3.merge(e.map(function(e) {
                return d3.extent(e);
            })) : d3.extent(e);
        }
        var n = {
            svg: t
        }, r = e.plotOptions;
        n.xaxis = !r.axisX || r.axisX != "off", n.yaxis = !r.axisY || r.axisX != "off";
        var i = !r.axisXLabel || r.axisXLabel != "off", s = !r.axisYLabel || r.axisYLabel != "off", o = r.axisXLabel, u = r.axisYLabel;
        n.margin = {
            top: r.topMargin || 2,
            right: r.rightMargin || 10,
            bottom: r.bottomMargin || 2,
            left: r.leftMargin || 2
        }, n.xaxis && (n.margin.bottom += 20 + (i ? 15 : 0)), n.yaxis && (n.margin.left += 30 + (s ? 22 : 0)), n.realwidth = n.svg.attr("width") - n.margin.left - n.margin.right, n.realheight = n.svg.attr("height") - n.margin.top - n.margin.bottom, n.outw = n.realwidth + n.margin.left + n.margin.right, n.outh = n.realheight + n.margin.top + n.margin.bottom;
        var a = e.plots, l = d3.extent(d3.merge(a.filter(function(e) {
            return e.enabled;
        }).map(function(e) {
            return f(e.scope.x);
        }))), c = d3.extent(d3.merge(a.filter(function(e) {
            return e.enabled;
        }).map(function(e) {
            return f(e.scope.y);
        }))), h = a.some(function(e) {
            return e.scope.x.metadata && e.scope.x.metadata.format == "date";
        });
        h ? n.x = d3.time.scale().range([ 0, n.realwidth ]).domain(l) : n.x = d3.scale.linear().range([ 0, n.realwidth ]).domain(l), n.y = d3.scale.linear().range([ n.realheight, 0 ]).domain(c);
        if (i) {
            if (!o) {
                for (var p = 0; p < a.length; ++p) {
                    var d = a[p].scope.x;
                    if (d.metadata && d.metadata.label) {
                        o = d.metadata.label, d.metadata.units && (o += " (" + d.metadata.units + ")");
                        break;
                    }
                }
                if (!o && r.selectX) {
                    var v = r.selectX.split(",");
                    o = v[a[0].xidx];
                }
                o || (o = "X Axis");
            }
            n.xlabel = o;
        }
        if (s) {
            if (!u) {
                for (var p = 0; p < a.length; ++p) {
                    var m = a[p].scope.y;
                    if (m.metadata && m.metadata.label) {
                        u = m.metadata.label, m.metadata.units && (u += " (" + m.metadata.units + ")");
                        break;
                    }
                }
                if (!u && r.selectY) {
                    var v = r.selectY.split(",");
                    u = v[a[0].yidx];
                }
                u || (u = "Y Axis");
            }
            n.ylabel = u;
        }
        return n;
    }
    function c(e, t, n) {
        e.svg.selectAll("g").remove();
        var r = e.svg.append("g").attr("width", e.outw).attr("height", e.outh), i = r.append("g").attr("transform", "translate(" + e.margin.left + "," + e.margin.top + ")");
        e.clip && i.attr("clip-path", "url(#" + e.clip + ")");
        if (e.xaxis) {
            var s = d3.svg.axis().scale(e.x).orient("bottom").ticks(r.attr("width") / 100);
            t[0].scope.x.metadata && t[0].scope.x.metadata.format == "date" && s.tickFormat(d3.time.format(t[0].scope.x.metadata.dateFormat || "%Y-%m-%d")), r.append("g").attr("class", "axis").attr("transform", "translate(" + e.margin.left + "," + (+e.realheight + 4) + ")").call(s), e.xlabel && r.append("g").attr("class", "axis-label").attr("transform", "translate(" + (+e.margin.left + e.realwidth / 2) + "," + e.realheight + ")").append("text").attr("x", 0).attr("y", 35).attr("text-anchor", "middle").text(e.xlabel);
        }
        if (e.yaxis) {
            var s = d3.svg.axis().scale(e.y).orient("left").ticks(r.attr("height") / 36), o = r.append("g").attr("class", "axis");
            o = o.attr("transform", "translate(" + (+e.margin.left - 4) + ",0)"), o.call(s);
            if (e.ylabel) {
                var u = 12, a = e.realheight / 2;
                r.append("g").attr("class", "axis-label").append("text").attr("x", u).attr("y", a).attr("transform", "rotate(-90," + u + "," + a + ")").attr("text-anchor", "middle").text(e.ylabel);
            }
        }
        t.forEach(function(t) {
            if (t.enabled) {
                var n = i.append("g"), r = t.scope.x[0] instanceof Array ? t.scope.x[t.xidx] : t.scope.x, s = t.scope.y[0] instanceof Array ? t.scope.y[t.yidx] : t.scope.y;
                t.draw(n, r, e.x, s, e.y, t.scope);
            }
        }), e.post && e.post(i);
    }
    var o = {};
    return [ "aspect", "axisX", "axisXLabel", "axisX2", "axisY", "axisYLabel", "axisY2", "fill", "fillOpacity", "height", "id", "label", "legendSwitches", "marker", "markerSize", "range", "rangeX", "rangeY", "selectX", "selectY", "stroke", "strokeOpacity", "strokeSwitch", "strokeWidth", "title", "width", "zoom2d", "zoomX", "zoomY" ].forEach(function(e) {
        o[e] = 1;
    }), {
        restrict: "E",
        template: [ '<div class="radian">', "<radian-ui></radian-ui>", "<svg></svg>", "</div>" ].join(""),
        transclude: !0,
        scope: !0,
        compile: function(e, t, n) {
            return {
                pre: function(e, t, r) {
                    u(e, t, r, n);
                },
                post: a
            };
        }
    };
} ]), radian.directive("lines", [ "getStyle", "splitAttrs", "evalPlotExpr", "$rootScope", "dumpScope", function(e, t, n, r, i) {
    "use strict";
    function u(t, n, r, i, s, o) {
        var u = e("strokeWidth", o, 1), a = e("strokeOpacity", o, 1), f = e("stroke", o, "#000").split(";"), l;
        f.length == 1 || !o.strokesel ? l = f[0] : isNaN(parseInt(o.strokesel)) ? l = f[Math.max(0, o.swsel.indexOf(o.strokesel)) % f.length] : l = f[o.strokesel % f.length];
        if (l.indexOf(":") == -1) {
            var c = d3.svg.line().x(function(e) {
                return r(e[0]);
            }).y(function(e) {
                return s(e[1]);
            });
            t.append("path").datum(d3.zip(n, i)).attr("class", "line").attr("d", c).style("fill", "none").style("stroke-width", u).style("stroke-opacity", a).style("stroke", l);
        } else {
            var h = l.split(":"), o = function(e) {
                return 1 - Math.exp(-20 * e / (3 * n.length));
            }, p = d3.interpolateHsl(h[0], h[1]), d = d3.zip(n, i), v = d3.zip(d, d.slice(1));
            t.selectAll("path").data(v).enter().append("path").attr("class", "line").style("stroke-width", u).style("stroke-opacity", a).style("stroke", function(e, t) {
                return p(o(t));
            }).attr("d", d3.svg.line().x(function(e) {
                return r(e[0]);
            }).y(function(e) {
                return s(e[1]);
            }));
        }
    }
    var s = [ "fill", "fillOpacity", "label", "legendSwitches", "marker", "markerSize", "selectX", "selectY", "stroke", "strokeOpacity", "strokeWidth" ], o = {};
    return s.forEach(function(e) {
        o[e] = 1;
    }), {
        restrict: "E",
        scope: !0,
        link: function(e, r, i) {
            t(e, i, o, !0, "lines"), r.hide(), e.$parent.addPlot(u, e), i.$observe("x", function(t) {
                e.x = n(e, t), e.$emit("dataChange");
            }), i.$observe("y", function(t) {
                e.y = n(e, t), e.$emit("dataChange");
            }), i.$observe("stroke", function() {
                e.$emit("paintChange");
            });
        }
    };
} ]), radian.factory("dumpScope", function() {
    "use strict";
    var e = function(t, n) {
        var r = "";
        for (var i = 0; i < n; ++i) r = r.concat(" ");
        console.log(r + t.$id + ": " + Object.keys(t).filter(function(e) {
            return e.charAt(0) != "$" && e != "this";
        }));
        for (var s = t.$$childHead; s; s = s.$$nextSibling) e(s, n + 2);
    };
    return function(t) {
        e(t, 0);
    };
}), radian.factory("evalPlotExpr", [ "$rootScope", "plotLib", "parseExpr", function($rootScope, plotLib, parseExpr) {
    return function(scope, expr) {
        console.log("eval: " + expr);
        var ast;
        try {
            ast = parseExpr(expr);
        } catch (e) {
            return expr;
        }
        var metadatakey = null, dataset = null;
        estraverse.traverse(ast, {
            enter: function(e) {
                if (e.type != "PluckExpression" && e.type != "MemberExpression") return estraverse.VisitorOption.Skip;
                if (e.property.type == "Identifier") {
                    metadatakey = e.property.name;
                    var t = e.object;
                    while (t.type != "Identifier") t = t.object;
                    return dataset = t.name, estraverse.VisitorOption.Break;
                }
            }
        }), estraverse.traverse(ast, {
            leave: function(e) {
                delete e.start, delete e.end;
            }
        }), console.log("      ast = " + JSON.stringify(ast));
        var astrepl = estraverse.replace(ast, {
            leave: function(e) {
                if (e.type == "BinaryExpression") {
                    var t = "";
                    switch (e.operator) {
                      case "+":
                        t = "rad$$add";
                        break;
                      case "-":
                        t = "rad$$sub";
                        break;
                      case "*":
                        t = "rad$$mul";
                        break;
                      case "/":
                        t = "rad$$div";
                        break;
                      case "**":
                        t = "rad$$pow";
                    }
                    return t ? {
                        type: "CallExpression",
                        callee: {
                            type: "Identifier",
                            name: t
                        },
                        arguments: [ e.left, e.right ]
                    } : e;
                }
                return e.type == "UnaryExpression" && e.operator == "-" ? {
                    type: "CallExpression",
                    callee: {
                        type: "Identifier",
                        name: "rad$$neg"
                    },
                    arguments: [ e.argument ]
                } : e;
            }
        });
        astrepl = estraverse.replace(astrepl, {
            enter: function(e) {
                return e.type == "CallExpression" && e.callee.type == "PluckExpression" ? {
                    type: "CallExpression",
                    callee: {
                        type: "MemberExpression",
                        object: e.callee.object,
                        property: {
                            type: "Identifier",
                            name: "map"
                        },
                        computed: !1
                    },
                    arguments: [ {
                        type: "FunctionExpression",
                        id: null,
                        params: [ {
                            type: "Identifier",
                            name: "$$x"
                        } ],
                        body: {
                            type: "BlockStatement",
                            body: [ {
                                type: "ReturnStatement",
                                argument: {
                                    type: "CallExpression",
                                    callee: {
                                        type: "MemberExpression",
                                        object: {
                                            type: "Identifier",
                                            name: "$$x"
                                        },
                                        property: e.callee.property,
                                        computed: !1
                                    },
                                    arguments: e.arguments
                                }
                            } ]
                        }
                    } ]
                } : e;
            },
            leave: function(e) {
                if (e.type == "PluckExpression") return {
                    type: "CallExpression",
                    callee: {
                        type: "MemberExpression",
                        object: e.object,
                        property: {
                            type: "Identifier",
                            name: "map"
                        },
                        computed: !1
                    },
                    arguments: [ {
                        type: "FunctionExpression",
                        id: null,
                        params: [ {
                            type: "Identifier",
                            name: "$$x"
                        } ],
                        body: {
                            type: "BlockStatement",
                            body: [ {
                                type: "ReturnStatement",
                                argument: {
                                    type: "MemberExpression",
                                    object: {
                                        type: "Identifier",
                                        name: "$$x"
                                    },
                                    property: e.property,
                                    computed: !1
                                }
                            } ]
                        }
                    } ]
                };
            }
        }), console.log("  astrepl = " + JSON.stringify(astrepl));
        var exc = {
            Math: 1,
            Date: 1,
            Object: 1
        }, excstack = [];
        Object.keys(plotLib).forEach(function(e) {
            exc[e] = 1;
        }), astrepl = estraverse.replace(astrepl, {
            enter: function(e, t) {
                switch (e.type) {
                  case "FunctionExpression":
                    excstack.push(e.params.map(function(e) {
                        return e.name;
                    })), e.params.forEach(function(e) {
                        exc[e.name] ? ++exc[e.name] : exc[e.name] = 1;
                    });
                    break;
                  case "Identifier":
                    if (!exc[e.name]) if (!t || (t.type != "MemberExpression" && t.type != "PluckExpression" || e != t.property) && (t.type != "CallExpression" || e != t.callee)) return parseExpr("scope.$eval('" + e.name + "')");
                }
                return e;
            },
            leave: function(e) {
                return e.type == "FunctionExpression" && excstack.pop().forEach(function(e) {
                    --exc[e] == 0 && delete exc[e];
                }), e;
            }
        });
        var access = escodegen.generate(astrepl);
        console.log("  access = " + access), console.log("");
        var ret = [];
        try {
            with (plotLib) eval("ret = " + access);
        } catch (e) {
            console.log("evalPlotExpr failed on '" + expr + "' -- " + e.message);
        }
        return dataset && metadatakey && $rootScope[dataset] && $rootScope[dataset].metadata && $rootScope[dataset].metadata[metadatakey] && (ret.metadata = $rootScope[dataset].metadata[metadatakey]), ret;
    };
} ]), radian.factory("getStyle", function() {
    "use strict";
    return function(e, t, n) {
        var r = t;
        if (r.plotOptions && r.plotOptions[e]) return r.plotOptions[e];
        while (r.$parent) {
            r = r.$parent;
            if (r.plotOptions && r.plotOptions[e]) return r.plotOptions[e];
        }
        return n;
    };
}), radian.factory("splitAttrs", [ "evalPlotExpr", "$timeout", function(e, t) {
    "use strict";
    var n = [ "aspect", "axisX", "axisXLabel", "axisX2", "axisY", "axisYLabel", "axisY2", "banded", "clipX", "clipY", "cols", "dateFormat", "dateParseFormat", "errorFor", "fill", "fillOpacity", "format", "height", "id", "interp", "label", "legendSwitches", "marker", "markerSize", "name", "range", "rangeX", "rangeY", "rows", "selectX", "selectY", "separator", "src", "stroke", "strokeOpacity", "strokeSwitch", "strokeWidth", "tabs", "title", "type", "units", "width", "zoom2d", "zoomX", "zoomY" ], r = {};
    return n.forEach(function(e) {
        r[e] = 1;
    }), function(n, i, s, o, u) {
        n.plotOptions = {}, Object.keys(i).forEach(function(a) {
            if (s.hasOwnProperty(a)) n.plotOptions[a] = i[a]; else {
                if (r.hasOwnProperty(a)) throw Error("invalid attribute in <" + u + "> directive: " + a);
                if (a.charAt(0) != "$") {
                    if (!o) throw Error("extra variable attributes not allowed in <" + u + ">");
                    t(function() {
                        n[a] = e(n, i[a]);
                    }, 0);
                }
            }
        });
    };
} ]), radian.factory("plotOption", function() {
    "use strict";
    return function(e, t, n) {
        while (e) {
            if (e.plotOptions && e.plotOptions[t]) return e.plotOptions[t];
            e = e.$parent;
        }
        return n;
    };
}), radian.factory("plotLib", function() {
    "use strict";
    function e(e) {
        return function(t) {
            return t instanceof Array ? t.map(e) : e(t);
        };
    }
    function t(e) {
        return function(t, n) {
            var r = t instanceof Array, i = n instanceof Array;
            if (!r && !i) return e(t, n);
            var s = r ? t.length : 0, o = i ? n.length : 0, u = r && i ? Math.min(s, o) : Math.max(s, o), a = new Array(u), f;
            r && i ? f = function(r) {
                return e(t[r], n[r]);
            } : r ? f = function(r) {
                return e(t[r], n);
            } : f = function(r) {
                return e(t, n[r]);
            };
            for (var l = 0; l < u; ++l) a[l] = f(l);
            return a;
        };
    }
    function n(e) {
        return function(t, n) {
            var r = {}, i = [];
            t.forEach(function(e, t) {
                r[n[t]] ? r[n[t]].push(e) : (i.push(n[t]), r[n[t]] = [ e ]);
            });
            var s = [];
            return i.forEach(function(t) {
                s.push(e(r[t]));
            }), s;
        };
    }
    function r(e, t, n) {
        return d3.range(e, t, (t - e) / (n - 1));
    }
    function i(e, t, n) {
        return d3.range(e, t, n);
    }
    function s(e) {
        var t = d3.mean(e), n = d3.mean(e, function(e) {
            return e * e;
        });
        return Math.sqrt(n - t * t);
    }
    function o(e) {
        var t = [], n = {};
        return e.forEach(function(e) {
            n[e] || (t.push(e), n[e] = 1);
        }), t;
    }
    function u(e) {
        var t = [ 76.18009172947146, -86.50532032941678, 24.01409824083091, -1.231739572450155, .001208650973866179, -0.000005395239384953 ], n = 1.000000000190015, r = e + 5.5 - (e + .5) * Math.log(e + 5.5), i = n + sumArr(t.map(function(t, n) {
            return t / (e + n + 1);
        }));
        return -r + Math.log(2.5066282746310007 * i / e);
    }
    function a(t, n, r) {
        var i = 1 / (r * Math.sqrt(2 * Math.PI)), s = 2 * r * r;
        return e(function(e) {
            return i * Math.exp(-(e - n) * (e - n) / s);
        })(t);
    }
    function f(t, n, r) {
        var i = 1 / (r * Math.sqrt(2 * Math.PI)), s = 2 * r * r;
        return e(function(e) {
            return e <= 0 ? 0 : i / e * Math.exp(-(Math.log(e) - n) * (Math.log(e) - n) / s);
        })(t);
    }
    function l(t, n, r) {
        var i = n * Math.log(r) + u(n);
        return e(function(e) {
            return e <= 0 ? 0 : Math.exp((n - 1) * Math.log(e) - e / r - i);
        })(t);
    }
    function c(t, n, r) {
        var i = n * Math.log(r) - u(n);
        return e(function(e) {
            return e <= 0 ? 0 : Math.exp(cval - r / e - (n + 1) * Math.log(e));
        })(t);
    }
    return {
        E: Math.E,
        LN10: Math.LN10,
        LN2: Math.LN2,
        LOG10E: Math.LOG10E,
        LOG2E: Math.LOG2E,
        PI: Math.PI,
        SQRT1_2: Math.SQRT1_2,
        SQRT2: Math.SQRT2,
        abs: e(Math.abs),
        acos: e(Math.acos),
        asin: e(Math.asin),
        atan: e(Math.atan),
        ceil: e(Math.ceil),
        cos: e(Math.cos),
        exp: e(Math.exp),
        floor: e(Math.floor),
        log: e(Math.log),
        round: e(Math.round),
        sin: e(Math.sin),
        sqrt: e(Math.sqrt),
        tan: e(Math.tan),
        atan2: Math.atan2,
        pow: Math.pow,
        min: d3.min,
        max: d3.max,
        extent: d3.extent,
        sum: d3.sum,
        mean: d3.mean,
        median: d3.median,
        quantile: d3.quantile,
        zip: d3.zip,
        seq: r,
        seqStep: i,
        sdev: s,
        unique: o,
        minBy: n(d3.min),
        maxBy: n(d3.max),
        sumBy: n(d3.sum),
        meanBy: n(d3.mean),
        sdevBy: n(s),
        normal: a,
        lognormal: f,
        gamma: l,
        invgamma: c,
        rad$$neg: e(function(e) {
            return -e;
        }),
        rad$$add: t(function(e, t) {
            return e + t;
        }),
        rad$$sub: t(function(e, t) {
            return e - t;
        }),
        rad$$mul: t(function(e, t) {
            return e * t;
        }),
        rad$$div: t(function(e, t) {
            return e / t;
        }),
        rad$$pow: t(function(e, t) {
            return Math.pow(e, t);
        })
    };
}), radian.factory("parseExpr", function() {
    "use strict";
    function i(n, r) {
        function c(e) {
            return Zt(e), i.start = o, i.end = u, i.type = a, i.value = f, i;
        }
        e = String(n), t = e.length, It();
        var i = {};
        return c.jumpTo = function(t, n) {
            s = t;
            var r = e.charAt(t - 1);
            l = n, zt();
        }, c;
    }
    function g(t, n) {
        var i = r(e, t);
        n += " (" + i.line + ":" + i.column + ")";
        var o = new SyntaxError(n);
        throw o.pos = t, o.loc = i, o.raisedAt = s, o;
    }
    function Nt(e) {
        function s(e) {
            if (e.length == 1) return t += "return str === " + JSON.stringify(e[0]) + ";";
            t += "switch(str){";
            for (var n = 0; n < e.length; ++n) t += "case " + JSON.stringify(e[n]) + ":";
            t += "return true}return false;";
        }
        e = e.split(" ");
        var t = "", n = [];
        e : for (var r = 0; r < e.length; ++r) {
            for (var i = 0; i < n.length; ++i) if (n[i][0].length == e[r].length) {
                n[i].push(e[r]);
                continue e;
            }
            n.push([ e[r] ]);
        }
        if (n.length > 3) {
            n.sort(function(e, t) {
                return t.length - e.length;
            }), t += "switch(str.length){";
            for (var r = 0; r < n.length; ++r) {
                var o = n[r];
                t += "case " + o[0].length + ":", s(o);
            }
            t += "}";
        } else s(e);
        return new Function("str", t);
    }
    function jt(e) {
        return e < 65 ? e === 36 : e < 91 ? !0 : e < 97 ? e === 95 : e < 123 ? !0 : e >= 170 && Dt.test(String.fromCharCode(e));
    }
    function Ft(e) {
        return e < 48 ? e === 36 : e < 58 ? !0 : e < 65 ? !1 : e < 91 ? !0 : e < 97 ? e === 95 : e < 123 ? !0 : e >= 170 && Pt.test(String.fromCharCode(e));
    }
    function It() {
        s = 0, l = !0, zt();
    }
    function qt(e, t) {
        u = s, a = e, zt(), f = t, l = e.beforeExpr;
    }
    function Rt() {
        var t = e.indexOf("*/", s += 2);
        t === -1 && g(s - 2, "Unterminated comment"), s = t + 2;
    }
    function Ut() {
        var n = e.charCodeAt(s += 2);
        while (s < t && n !== 10 && n !== 13 && n !== 8232 && n !== 8329) ++s, n = e.charCodeAt(s);
    }
    function zt() {
        while (s < t) {
            var n = e.charCodeAt(s);
            if (n === 32) ++s; else if (n === 13) {
                ++s;
                var r = e.charCodeAt(s);
                r === 10 && ++s;
            } else if (n === 10) ++s; else if (n < 14 && n > 8) ++s; else if (n === 47) {
                var r = e.charCodeAt(s + 1);
                if (r === 42) Rt(); else {
                    if (r !== 47) break;
                    Ut();
                }
            } else if (n < 14 && n > 8 || n === 32 || n === 160) ++s; else {
                if (!(n >= 5760 && Ot.test(String.fromCharCode(n)))) break;
                ++s;
            }
        }
    }
    function Wt() {
        var t = e.charCodeAt(s + 1);
        return t >= 48 && t <= 57 ? sn(!0) : (++s, qt(it));
    }
    function Xt() {
        var t = e.charCodeAt(s + 1);
        return l ? (++s, tn()) : t === 61 ? en(ft, 2) : en(ut, 1);
    }
    function Vt() {
        var t = e.charCodeAt(s + 1);
        if (t === 61) return en(ft, 2);
        if (t === 42) {
            var n = e.charCodeAt(s + 2);
            return t === 61 ? en(ft, 3) : en(St, 2);
        }
        return en(Et, 1);
    }
    function $t(t) {
        var n = e.charCodeAt(s + 1);
        return n === t ? en(t === 124 ? pt : dt, 2) : n === 61 ? en(ft, 2) : en(t === 124 ? vt : gt, 1);
    }
    function Jt() {
        var t = e.charCodeAt(s + 1);
        return t === 61 ? en(ft, 2) : en(mt, 1);
    }
    function Kt(t) {
        var n = e.charCodeAt(s + 1);
        return n === t ? en(ct, 2) : n === 61 ? en(ft, 2) : en(lt, 1);
    }
    function Qt(t) {
        var n = e.charCodeAt(s + 1), r = 1;
        return n === t ? (r = t === 62 && e.charCodeAt(s + 2) === 62 ? 3 : 2, e.charCodeAt(s + r) === 61 ? en(ft, r + 1) : en(wt, r)) : (n === 61 && (r = e.charCodeAt(s + 2) === 61 ? 3 : 2), en(bt, r));
    }
    function Gt(t) {
        var n = e.charCodeAt(s + 1);
        return n === 61 ? en(yt, e.charCodeAt(s + 2) === 61 ? 3 : 2) : en(t === 61 ? at : ht, 1);
    }
    function Yt(t) {
        switch (t) {
          case 46:
            return Wt();
          case 35:
            return ++s, qt(ot);
          case 40:
            return ++s, qt(Z);
          case 41:
            return ++s, qt(et);
          case 59:
            return ++s, qt(nt);
          case 44:
            return ++s, qt(tt);
          case 91:
            return ++s, qt(K);
          case 93:
            return ++s, qt(Q);
          case 123:
            return ++s, qt(G);
          case 125:
            return ++s, qt(Y);
          case 58:
            return ++s, qt(rt);
          case 63:
            return ++s, qt(st);
          case 48:
            var n = e.charCodeAt(s + 1);
            if (n === 120 || n === 88) return rn();
          case 49:
          case 50:
          case 51:
          case 52:
          case 53:
          case 54:
          case 55:
          case 56:
          case 57:
            return sn(!1);
          case 34:
          case 39:
            return un(t);
          case 47:
            return Xt(t);
          case 37:
          case 42:
            return Vt();
          case 124:
          case 38:
            return $t(t);
          case 94:
            return Jt();
          case 43:
          case 45:
            return Kt(t);
          case 60:
          case 62:
            return Qt(t);
          case 61:
          case 33:
            return Gt(t);
          case 126:
            return en(ht, 1);
        }
        return !1;
    }
    function Zt(n) {
        o = s;
        if (n) return tn();
        if (s >= t) return qt(S);
        var r = e.charCodeAt(s);
        if (jt(r) || r === 92) return cn();
        var i = Yt(r);
        if (i === !1) {
            var u = String.fromCharCode(r);
            if (u === "\\" || Dt.test(u)) return cn();
            g(s, "Unexpected character '" + u + "'");
        }
        return i;
    }
    function en(t, n) {
        var r = e.slice(s, s + n);
        s += n, qt(t, r);
    }
    function tn() {
        var n = "", r, i, o = s;
        for (;;) {
            s >= t && g(o, "Unterminated regular expression");
            var u = e.charAt(s);
            Ht.test(u) && g(o, "Unterminated regular expression");
            if (!r) {
                if (u === "[") i = !0; else if (u === "]" && i) i = !1; else if (u === "/" && !i) break;
                r = u === "\\";
            } else r = !1;
            ++s;
        }
        var n = e.slice(o, s);
        ++s;
        var a = ln();
        return a && !/^[gmsiy]*$/.test(a) && g(o, "Invalid regexp flag"), qt(b, new RegExp(n, a));
    }
    function nn(t, n) {
        var r = s, i = 0;
        for (var o = 0, u = n == null ? Infinity : n; o < u; ++o) {
            var a = e.charCodeAt(s), f;
            a >= 97 ? f = a - 97 + 10 : a >= 65 ? f = a - 65 + 10 : a >= 48 && a <= 57 ? f = a - 48 : f = Infinity;
            if (f >= t) break;
            ++s, i = i * t + f;
        }
        return s === r || n != null && s - r !== n ? null : i;
    }
    function rn() {
        s += 2;
        var t = nn(16);
        return t == null && g(o + 2, "Expected hexadecimal number"), jt(e.charCodeAt(s)) && g(s, "Identifier directly after number"), qt(y, t);
    }
    function sn(t) {
        var n = s, r = !1, i = e.charCodeAt(s) === 48;
        !t && nn(10) === null && g(n, "Invalid number"), e.charCodeAt(s) === 46 && (++s, nn(10), r = !0);
        var o = e.charCodeAt(s);
        if (o === 69 || o === 101) o = e.charCodeAt(++s), (o === 43 || o === 45) && ++s, nn(10) === null && g(n, "Invalid number"), r = !0;
        jt(e.charCodeAt(s)) && g(s, "Identifier directly after number");
        var u = e.slice(n, s), a;
        return r ? a = parseFloat(u) : !i || u.length === 1 ? a = parseInt(u, 10) : /[89]/.test(u) || m ? g(n, "Invalid number") : a = parseInt(u, 8), qt(y, a);
    }
    function un(n) {
        s++, on.length = 0;
        for (;;) {
            s >= t && g(o, "Unterminated string constant");
            var r = e.charCodeAt(s);
            if (r === n) return ++s, qt(w, String.fromCharCode.apply(null, on));
            if (r === 92) {
                r = e.charCodeAt(++s);
                var i = /^[0-7]+/.exec(e.slice(s, s + 3));
                i && (i = i[0]);
                while (i && parseInt(i, 8) > 255) i = i.slice(0, i.length - 1);
                i === "0" && (i = null), ++s;
                if (i) m && g(s - 2, "Octal literal in strict mode"), on.push(parseInt(i, 8)), s += i.length - 1; else switch (r) {
                  case 110:
                    on.push(10);
                    break;
                  case 114:
                    on.push(13);
                    break;
                  case 120:
                    on.push(an(2));
                    break;
                  case 117:
                    on.push(an(4));
                    break;
                  case 85:
                    on.push(an(8));
                    break;
                  case 116:
                    on.push(9);
                    break;
                  case 98:
                    on.push(8);
                    break;
                  case 118:
                    on.push(11);
                    break;
                  case 102:
                    on.push(12);
                    break;
                  case 48:
                    on.push(0);
                    break;
                  case 13:
                    e.charCodeAt(s) === 10 && ++s;
                  case 10:
                    break;
                  default:
                    on.push(r);
                }
            } else (r === 13 || r === 10 || r === 8232 || r === 8329) && g(o, "Unterminated string constant"), on.push(r), ++s;
        }
    }
    function an(e) {
        var t = nn(16, e);
        return t === null && g(o, "Bad character escape sequence"), t;
    }
    function ln() {
        fn = !1;
        var t, n = !0, r = s;
        for (;;) {
            var i = e.charCodeAt(s);
            if (Ft(i)) fn && (t += e.charAt(s)), ++s; else {
                if (i !== 92) break;
                fn || (t = e.slice(r, s)), fn = !0, e.charCodeAt(++s) != 117 && g(s, "Expecting Unicode escape sequence \\uXXXX"), ++s;
                var o = an(4), u = String.fromCharCode(o);
                u || g(s - 1, "Invalid Unicode escape"), (n ? !jt(o) : !Ft(o)) && g(s - 4, "Invalid Unicode escape"), t += u;
            }
            n = !1;
        }
        return fn ? t : e.slice(r, s);
    }
    function cn() {
        var e = ln(), t = E;
        return fn || (At(e) ? t = J[e] : m && kt(e) && g(o, "The keyword '" + e + "' is reserved")), qt(t, e);
    }
    function hn() {
        c = o, h = u, Zt();
    }
    function pn(e) {
        m = e, s = h, zt(), Zt();
    }
    function dn() {
        this.type = null, this.start = o, this.end = null;
    }
    function vn() {
        this.start = tokStartLoc, this.end = null;
    }
    function mn() {
        return new dn;
    }
    function gn(e) {
        var t = new dn;
        return t.start = e.start, t;
    }
    function yn(e, t) {
        return e.type = t, e.end = h, e;
    }
    function bn(e) {
        return e.type === "ExpressionStatement" && e.expression.type === "Literal" && e.expression.value === "use strict";
    }
    function wn(e) {
        if (a === e) return hn(), !0;
    }
    function En() {
        return a === S || a === Y || Ht.test(e.slice(h, o));
    }
    function Sn() {
        !wn(nt) && !En() && Tn();
    }
    function xn(e) {
        a === e ? hn() : Tn();
    }
    function Tn() {
        g(o, "Unexpected token");
    }
    function Nn(e) {
        e.type !== "Identifier" && e.type !== "MemberExpression" && g(e.start, "Assigning to rvalue"), m && e.type === "Identifier" && Lt(e.name) && g(e.start, "Assigning to " + e.name + " in strict mode");
    }
    function Cn() {
        return c = h = s, d = m = null, v = [], Zt(), Hn();
    }
    function An() {
        a === ut && Zt(!0);
        var t = a, n = mn();
        switch (t) {
          case x:
          case C:
            hn();
            var r = t === x;
            wn(nt) || En() ? n.label = null : a !== E ? Tn() : (n.label = Kn(), Sn());
            for (var i = 0; i < v.length; ++i) {
                var s = v[i];
                if (n.label == null || s.name === n.label.name) {
                    if (!(s.kind == null || !r && s.kind !== "loop")) break;
                    if (n.label && r) break;
                }
            }
            return i === v.length && g(n.start, "Unsyntactic " + t.keyword), yn(n, r ? "BreakStatement" : "ContinueStatement");
          case k:
            return hn(), Sn(), yn(n, "DebuggerStatement");
          case A:
            return hn(), v.push(kn), n.body = An(), v.pop(), xn(q), n.test = On(), Sn(), yn(n, "DoWhileStatement");
          case _:
            hn(), v.push(kn), xn(Z);
            if (a === nt) return _n(n, null);
            if (a === I) {
                var u = mn();
                return hn(), Pn(u, !0), u.declarations.length === 1 && wn($) ? Dn(n, u) : _n(n, u);
            }
            var u = Hn(!1, !0);
            if (wn($)) return Nn(u), Dn(n, u);
            return _n(n, u);
          case D:
            return hn(), $n(n, !0);
          case P:
            return hn(), n.test = On(), n.consequent = An(), n.alternate = wn(O) ? An() : null, yn(n, "IfStatement");
          case H:
            return d || g(o, "'return' outside of function"), hn(), wn(nt) || En() ? n.argument = null : (n.argument = Hn(), Sn()), yn(n, "ReturnStatement");
          case B:
            hn(), n.discriminant = On(), n.cases = [], xn(G), v.push(Ln);
            for (var l, p; a != Y; ) if (a === T || a === L) {
                var y = a === T;
                l && yn(l, "SwitchCase"), n.cases.push(l = mn()), l.consequent = [], hn(), y ? l.test = Hn() : (p && g(c, "Multiple default clauses"), p = !0, l.test = null), xn(rt);
            } else l || Tn(), l.consequent.push(An());
            return l && yn(l, "SwitchCase"), hn(), v.pop(), yn(n, "SwitchStatement");
          case j:
            return hn(), Ht.test(e.slice(h, o)) && g(h, "Illegal newline after throw"), n.argument = Hn(), Sn(), yn(n, "ThrowStatement");
          case F:
            hn(), n.block = Mn(), n.handlers = [];
            while (a === N) {
                var b = mn();
                hn(), xn(Z), b.param = Kn(), m && Lt(b.param.name) && g(b.param.start, "Binding " + b.param.name + " in strict mode"), xn(et), b.guard = null, b.body = Mn(), n.handlers.push(yn(b, "CatchClause"));
            }
            return n.finalizer = wn(M) ? Mn() : null, !n.handlers.length && !n.finalizer && g(n.start, "Missing catch or finally clause"), yn(n, "TryStatement");
          case I:
            return hn(), n = Pn(n), Sn(), n;
          case q:
            return hn(), n.test = On(), v.push(kn), n.body = An(), v.pop(), yn(n, "WhileStatement");
          case R:
            return m && g(o, "'with' in strict mode"), hn(), n.object = On(), n.body = An(), yn(n, "WithStatement");
          case G:
            return Mn();
          case nt:
            return hn(), yn(n, "EmptyStatement");
          default:
            var w = f, S = Hn();
            if (t === E && S.type === "Identifier" && wn(rt)) {
                for (var i = 0; i < v.length; ++i) v[i].name === w && g(S.start, "Label '" + w + "' is already declared");
                var U = a.isLoop ? "loop" : a === B ? "switch" : null;
                return v.push({
                    name: w,
                    kind: U
                }), n.body = An(), v.pop(), n.label = S, yn(n, "LabeledStatement");
            }
            return n.expression = S, Sn(), yn(n, "ExpressionStatement");
        }
    }
    function On() {
        xn(Z);
        var e = Hn();
        return xn(et), e;
    }
    function Mn(e) {
        var t = mn(), n = !0, r = !1, i;
        t.body = [], xn(G);
        while (!wn(Y)) {
            var s = An();
            t.body.push(s), n && bn(s) && (i = r, pn(r = !0)), n = !1;
        }
        return r && !i && pn(!1), yn(t, "BlockStatement");
    }
    function _n(e, t) {
        return e.init = t, xn(nt), e.test = a === nt ? null : Hn(), xn(nt), e.update = a === et ? null : Hn(), xn(et), e.body = An(), v.pop(), yn(e, "ForStatement");
    }
    function Dn(e, t) {
        return e.left = t, e.right = Hn(), xn(et), e.body = An(), v.pop(), yn(e, "ForInStatement");
    }
    function Pn(e, t) {
        e.declarations = [], e.kind = "var";
        for (;;) {
            var n = mn();
            n.id = Kn(), m && Lt(n.id.name) && g(n.id.start, "Binding " + n.id.name + " in strict mode"), n.init = wn(at) ? Hn(!0, t) : null, e.declarations.push(yn(n, "VariableDeclarator"));
            if (!wn(tt)) break;
        }
        return yn(e, "VariableDeclaration");
    }
    function Hn(e, t) {
        var n = Bn(t);
        if (!e && a === tt) {
            var r = gn(n);
            r.expressions = [ n ];
            while (wn(tt)) r.expressions.push(Bn(t));
            return yn(r, "SequenceExpression");
        }
        return n;
    }
    function Bn(e) {
        var t = jn(e);
        if (a.isAssign) {
            var n = gn(t);
            return n.operator = f, n.left = t, hn(), n.right = Bn(e), Nn(t), yn(n, "AssignmentExpression");
        }
        return t;
    }
    function jn(e) {
        var t = Fn(e);
        if (wn(st)) {
            var n = gn(t);
            return n.test = t, n.consequent = Hn(!0), xn(rt), n.alternate = Hn(!0, e), yn(n, "ConditionalExpression");
        }
        return t;
    }
    function Fn(e) {
        return In(qn(e), -1, e);
    }
    function In(e, t, n) {
        var r = a.binop;
        if (r != null && (!n || a !== $) && r > t) {
            var i = gn(e);
            i.left = e, i.operator = f, hn(), i.right = In(qn(n), r, n);
            var i = yn(i, /&&|\|\|/.test(i.operator) ? "LogicalExpression" : "BinaryExpression");
            return In(i, t, n);
        }
        return e;
    }
    function qn(e) {
        if (a.prefix) {
            var t = mn(), n = a.isUpdate;
            return t.operator = f, t.prefix = !0, hn(), t.argument = qn(e), n ? Nn(t.argument) : m && t.operator === "delete" && t.argument.type === "Identifier" && g(t.start, "Deleting local variable in strict mode"), yn(t, n ? "UpdateExpression" : "UnaryExpression");
        }
        var r = Rn();
        while (a.postfix && !En()) {
            var t = gn(r);
            t.operator = f, t.prefix = !1, t.argument = r, Nn(r), hn(), r = yn(t, "UpdateExpression");
        }
        return r;
    }
    function Rn() {
        return Un(zn());
    }
    function Un(e, t) {
        if (wn(it)) {
            var n = gn(e);
            return n.object = e, n.property = Kn(!0), n.computed = !1, Un(yn(n, "MemberExpression"), t);
        }
        if (wn(ot)) {
            var n = gn(e);
            return n.object = e, n.property = Kn(!0), n.computed = !1, Un(yn(n, "PluckExpression"), t);
        }
        if (wn(K)) {
            var n = gn(e);
            return n.object = e, n.property = Hn(), n.computed = !0, xn(Q), Un(yn(n, "MemberExpression"), t);
        }
        if (!t && wn(Z)) {
            var n = gn(e);
            return n.callee = e, n.arguments = Jn(et), Un(yn(n, "CallExpression"), t);
        }
        return e;
    }
    function zn() {
        switch (a) {
          case z:
            var t = mn();
            return hn(), yn(t, "ThisExpression");
          case E:
            return Kn();
          case y:
          case w:
          case b:
            var t = mn();
            return t.value = f, t.raw = e.slice(o, u), hn(), yn(t, "Literal");
          case W:
          case X:
          case V:
            var t = mn();
            return t.value = a.atomValue, t.raw = a.keyword, hn(), yn(t, "Literal");
          case Z:
            var n = tokStartLoc, r = o;
            hn();
            var i = Hn();
            return i.start = r, i.end = u, xn(et), i;
          case K:
            var t = mn();
            return hn(), t.elements = Jn(Q, !0), yn(t, "ArrayExpression");
          case G:
            return Xn();
          case D:
            var t = mn();
            return hn(), $n(t, !1);
          case U:
            return Wn();
          default:
            Tn();
        }
    }
    function Wn() {
        var e = mn();
        return hn(), e.callee = Un(zn(), !0), wn(Z) ? e.arguments = Jn(et) : e.arguments = [], yn(e, "NewExpression");
    }
    function Xn() {
        var e = mn(), t = !0, n = !1;
        e.properties = [], hn();
        while (!wn(Y)) {
            t ? t = !1 : xn(tt);
            var r = {
                key: Vn()
            }, i = !1, s;
            wn(rt) ? (r.value = Hn(!0), s = r.kind = "init") : r.key.type !== "Identifier" || r.key.name !== "get" && r.key.name !== "set" ? Tn() : (i = n = !0, s = r.kind = r.key.name, r.key = Vn(), a !== Z && Tn(), r.value = $n(mn(), !1));
            if (r.key.type === "Identifier" && (m || n)) for (var o = 0; o < e.properties.length; ++o) {
                var u = e.properties[o];
                if (u.key.name === r.key.name) {
                    var f = s == u.kind || i && u.kind === "init" || s === "init" && (u.kind === "get" || u.kind === "set");
                    f && !m && s === "init" && u.kind === "init" && (f = !1), f && g(r.key.start, "Redefinition of property");
                }
            }
            e.properties.push(r);
        }
        return yn(e, "ObjectExpression");
    }
    function Vn() {
        return a === y || a === w ? zn() : Kn(!0);
    }
    function $n(e, t) {
        a === E ? e.id = Kn() : t ? Tn() : e.id = null, e.params = [];
        var n = !0;
        xn(Z);
        while (!wn(et)) n ? n = !1 : xn(tt), e.params.push(Kn());
        var r = d, i = v;
        d = !0, v = [], e.body = Mn(!0), d = r, v = i;
        if (m || e.body.body.length && bn(e.body.body[0])) for (var s = e.id ? -1 : 0; s < e.params.length; ++s) {
            var o = s < 0 ? e.id : e.params[s];
            (kt(o.name) || Lt(o.name)) && g(o.start, "Defining '" + o.name + "' in strict mode");
            if (s >= 0) for (var u = 0; u < s; ++u) o.name === e.params[u].name && g(o.start, "Argument name clash in strict mode");
        }
        return yn(e, t ? "FunctionDeclaration" : "FunctionExpression");
    }
    function Jn(e, t) {
        var n = [], r = !0;
        while (!wn(e)) r ? r = !1 : xn(tt), t && a === tt ? n.push(null) : n.push(Hn(!0));
        return n;
    }
    function Kn(e) {
        var t = mn();
        return t.name = a === E ? f : e && a.keyword || Tn(), hn(), yn(t, "Identifier");
    }
    var e, t, n = function(n) {
        return e = String(n), t = e.length, It(), Cn();
    }, r = function(e, t) {
        for (var n = 1, r = 0; ; ) {
            Bt.lastIndex = r;
            var i = Bt.exec(e);
            if (!(i && i.index < t)) break;
            ++n, r = i.index + i[0].length;
        }
        return {
            line: n,
            column: t - r
        };
    }, s, o, u, a, f, l, c, h, p, d, v, m, y = {
        type: "num"
    }, b = {
        type: "regexp"
    }, w = {
        type: "string"
    }, E = {
        type: "name"
    }, S = {
        type: "eof"
    }, x = {
        keyword: "break"
    }, T = {
        keyword: "case",
        beforeExpr: !0
    }, N = {
        keyword: "catch"
    }, C = {
        keyword: "continue"
    }, k = {
        keyword: "debugger"
    }, L = {
        keyword: "default"
    }, A = {
        keyword: "do",
        isLoop: !0
    }, O = {
        keyword: "else",
        beforeExpr: !0
    }, M = {
        keyword: "finally"
    }, _ = {
        keyword: "for",
        isLoop: !0
    }, D = {
        keyword: "function"
    }, P = {
        keyword: "if"
    }, H = {
        keyword: "return",
        beforeExpr: !0
    }, B = {
        keyword: "switch"
    }, j = {
        keyword: "throw",
        beforeExpr: !0
    }, F = {
        keyword: "try"
    }, I = {
        keyword: "var"
    }, q = {
        keyword: "while",
        isLoop: !0
    }, R = {
        keyword: "with"
    }, U = {
        keyword: "new",
        beforeExpr: !0
    }, z = {
        keyword: "this"
    }, W = {
        keyword: "null",
        atomValue: null
    }, X = {
        keyword: "true",
        atomValue: !0
    }, V = {
        keyword: "false",
        atomValue: !1
    }, $ = {
        keyword: "in",
        binop: 7,
        beforeExpr: !0
    }, J = {
        "break": x,
        "case": T,
        "catch": N,
        "continue": C,
        "debugger": k,
        "default": L,
        "do": A,
        "else": O,
        "finally": M,
        "for": _,
        "function": D,
        "if": P,
        "return": H,
        "switch": B,
        "throw": j,
        "try": F,
        "var": I,
        "while": q,
        "with": R,
        "null": W,
        "true": X,
        "false": V,
        "new": U,
        "in": $,
        "instanceof": {
            keyword: "instanceof",
            binop: 7,
            beforeExpr: !0
        },
        "this": z,
        "typeof": {
            keyword: "typeof",
            prefix: !0,
            beforeExpr: !0
        },
        "void": {
            keyword: "void",
            prefix: !0,
            beforeExpr: !0
        },
        "delete": {
            keyword: "delete",
            prefix: !0,
            beforeExpr: !0
        }
    }, K = {
        type: "[",
        beforeExpr: !0
    }, Q = {
        type: "]"
    }, G = {
        type: "{",
        beforeExpr: !0
    }, Y = {
        type: "}"
    }, Z = {
        type: "(",
        beforeExpr: !0
    }, et = {
        type: ")"
    }, tt = {
        type: ",",
        beforeExpr: !0
    }, nt = {
        type: ";",
        beforeExpr: !0
    }, rt = {
        type: ":",
        beforeExpr: !0
    }, it = {
        type: "."
    }, st = {
        type: "?",
        beforeExpr: !0
    }, ot = {
        type: "#"
    }, ut = {
        binop: 10,
        beforeExpr: !0
    }, at = {
        isAssign: !0,
        beforeExpr: !0
    }, ft = {
        isAssign: !0,
        beforeExpr: !0
    }, lt = {
        binop: 9,
        prefix: !0,
        beforeExpr: !0
    }, ct = {
        postfix: !0,
        prefix: !0,
        isUpdate: !0
    }, ht = {
        prefix: !0,
        beforeExpr: !0
    }, pt = {
        binop: 1,
        beforeExpr: !0
    }, dt = {
        binop: 2,
        beforeExpr: !0
    }, vt = {
        binop: 3,
        beforeExpr: !0
    }, mt = {
        binop: 4,
        beforeExpr: !0
    }, gt = {
        binop: 5,
        beforeExpr: !0
    }, yt = {
        binop: 6,
        beforeExpr: !0
    }, bt = {
        binop: 7,
        beforeExpr: !0
    }, wt = {
        binop: 8,
        beforeExpr: !0
    }, Et = {
        binop: 10,
        beforeExpr: !0
    }, St = {
        binop: 11,
        beforeExpr: !0
    }, xt = {
        bracketL: K,
        bracketR: Q,
        braceL: G,
        braceR: Y,
        parenL: Z,
        parenR: et,
        comma: tt,
        semi: nt,
        colon: rt,
        dot: it,
        question: st,
        slash: ut,
        eq: at,
        name: E,
        eof: S,
        num: y,
        regexp: b,
        string: w,
        hash: ot
    };
    for (var Tt in J) xt[Tt] = J[Tt];
    var Ct = Nt("class enum extends super const export import"), kt = Nt("implements interface let package private protected public static yield"), Lt = Nt("eval arguments"), At = Nt("break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this"), Ot = /[\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/, Mt = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ", _t = "ͱ-ʹ҃-֑҇-ׇֽֿׁׂׅׄؐ-ؚؠ-ىٲ-ۓۧ-ۨۻ-ۼܰ-݊ࠀ-ࠔࠛ-ࠣࠥ-ࠧࠩ-࠭ࡀ-ࡗࣤ-ࣾऀ-ःऺ-़ा-ॏ॑-ॗॢ-ॣ०-९ঁ-ঃ়া-ৄেৈৗয়-ৠਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢ-ૣ૦-૯ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୟ-ୠ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఁ-ఃె-ైొ-్ౕౖౢ-ౣ౦-౯ಂಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢ-ೣ೦-೯ംഃെ-ൈൗൢ-ൣ൦-൯ංඃ්ා-ුූෘ-ෟෲෳิ-ฺเ-ๅ๐-๙ິ-ູ່-ໍ໐-໙༘༙༠-༩༹༵༷ཁ-ཇཱ-྄྆-྇ྍ-ྗྙ-ྼ࿆က-ဩ၀-၉ၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟ᜎ-ᜐᜠ-ᜰᝀ-ᝐᝲᝳក-ឲ៝០-៩᠋-᠍᠐-᠙ᤠ-ᤫᤰ-᤻ᥑ-ᥭᦰ-ᧀᧈ-ᧉ᧐-᧙ᨀ-ᨕᨠ-ᩓ᩠-᩿᩼-᪉᪐-᪙ᭆ-ᭋ᭐-᭙᭫-᭳᮰-᮹᯦-᯳ᰀ-ᰢ᱀-᱉ᱛ-ᱽ᳐-᳒ᴀ-ᶾḁ-ἕ‌‍‿⁀⁔⃐-⃥⃜⃡-⃰ⶁ-ⶖⷠ-ⷿ〡-〨゙゚Ꙁ-ꙭꙴ-꙽ꚟ꛰-꛱ꟸ-ꠀ꠆ꠋꠣ-ꠧꢀ-ꢁꢴ-꣄꣐-꣙ꣳ-ꣷ꤀-꤉ꤦ-꤭ꤰ-ꥅꦀ-ꦃ꦳-꧀ꨀ-ꨧꩀ-ꩁꩌ-ꩍ꩐-꩙ꩻꫠ-ꫩꫲ-ꫳꯀ-ꯡ꯬꯭꯰-꯹ﬠ-ﬨ︀-️︠-︦︳︴﹍-﹏０-９＿", Dt = new RegExp("[" + Mt + "]"), Pt = new RegExp("[" + Mt + _t + "]"), Ht = /[\n\r\u2028\u2029]/, Bt = /\r\n|[\n\r\u2028\u2029]/g, on = [], fn, kn = {
        kind: "loop"
    }, Ln = {
        kind: "switch"
    };
    return n;
});