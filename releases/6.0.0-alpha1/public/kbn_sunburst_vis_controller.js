import uiModules from 'ui/modules';

const module = uiModules.get('kibana/kbn_sunburst_vis', ['kibana']);
import d3 from 'd3';
import _ from 'lodash';
import $ from 'jquery';

let formatNumber = d3.format(',.0f');
import AggResponseProvider from './lib/agg_response';

module.controller('KbnSunburstVisController', function ($scope, $element, $rootScope, Private) {
    const sunburstAggResponse = Private(AggResponseProvider);

    let svgRoot = $element[0];
    let margin = 20;
    let width = 700;
    let height = 500;

    let radius = Math.min(width, height) / 2;

    let x = d3.scale.linear().range([0, 2 * Math.PI]);
    let y = d3.scale.linear().range([0, radius]);
    let color = d3.scale.category20c();
    let div;

    let node;
    let root;

    div = d3.select(svgRoot);

    let partition = d3.layout.partition()
        .value(function (d) {
            return d.size;
        });

    let arc = d3.svg.arc()
        .startAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
        })
        .endAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
        })
        .innerRadius(function (d) {
            return Math.max(0, y(d.y));
        })
        .outerRadius(function (d) {
            return Math.max(0, y(d.y + d.dy));
        });

    let _buildVis = function (root) {

        let svg = div.append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

        let g = svg.selectAll("g")
            .data(partition.nodes(root))
            .enter().append("g");

        let path = g.append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                return color((d.children ? d : d.parent).name);
            })
            .on("click", click);

        if ($scope.vis.params.showText) {
            let text = g.append("text")
                .attr("transform", function (d) {
                    return "rotate(" + computeTextRotation(d) + ")";
                })
                .attr("x", function (d) {
                    return y(d.y);
                })
                .attr("dx", "6") // margin
                .attr("dy", ".35em") // vertical-align
                .text(function (d) {
                    return (d.name == "flare" ? "" : d.name);
                });
        }

        if ($scope.vis.params.showValues) {
            let textValue = g.append("text")
                .attr("transform", function (d) {
                    return "rotate(" + computeTextRotation(d) + ")";
                })
                .attr("x", function (d) {
                    return y(d.y);
                })
                .attr("dx", "6") // margin
                .attr("dy", "1.35em") // vertical-align
                .attr("fill", "darkblue")
                .text(function (d) {
                    return (d.name == "flare" ? "" : "(" + d.size + ")");
                });
        }

        function click(d) {

            if (text) text.transition().attr("opacity", 0);
            if (textValue) textValue.transition().attr("opacity", 0);

            path.transition()
                .duration(250)
                .attrTween("d", arcTween(d))
                .each("end", function (e, i) {
                    // check if the animated element's data e lies within the visible angle span given in d
                    if (e.x >= d.x && e.x < (d.x + d.dx)) {
                        // get a selection of the associated text element(s)
                        let arcText = d3.select(this.parentNode).selectAll("text");
                        // fade in the text element and recalculate positions
                        if (arcText) {
                            arcText.transition().duration(250)
                                .attr("opacity", 1)
                                .attr("transform", function () {
                                    return "rotate(" + computeTextRotation(e) + ")";
                                })
                                .attr("x", function (d) {
                                    return y(d.y);
                                });
                        }
                    }
                });
        }
    };


    let _render = function (data) {
        d3.select(svgRoot).selectAll('svg').remove();
        _buildVis(data.children);
    };

    $scope.$watch('esResponse', function (resp) {
        if (resp) {
            let chartData = sunburstAggResponse($scope.vis, resp);
            _render(chartData);
        }
    });

    d3.select(self.frameElement).style("height", height + "px");

    function arcTween(d) {
        let xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function (d, i) {
            return i ?
                function (t) {
                    return arc(d);
                } :
                function (t) {
                    x.domain(xd(t));
                    y.domain(yd(t)).range(yr(t));
                    return arc(d);
                };
        };
    }

    function computeTextRotation(d) {
        return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
    }

});
