  import { uiModules } from 'ui/modules';
  const module = uiModules.get('kibana/kbn_sunburst_vis', ['kibana']);
  import d3 from 'd3';
  import _ from 'lodash';
  //import $ from 'jquery';

  import AggResponseProvider from './lib/agg_response';

  //const formatNumber = d3.format(',.0f');

  module.controller('KbnSunburstVisController', function ($scope, $element, $rootScope, Private) {
    const sunburstAggResponse = Private(AggResponseProvider);

    const svgRoot = $element[0];
    //const margin = 20;
    const width = 700;
    const height = 500;

    const radius = Math.min(width, height) / 2;

    const x = d3.scale.linear().range([0, 2 * Math.PI]);
    const y = d3.scale.linear().range([0, radius]);
    const color = d3.scale.category20c();

    //let node, root;

    const div = d3.select(svgRoot);

    const partition = d3.layout.partition()
      .value(function (d) { return d.size; });

    const arc = d3.svg.arc()
      .startAngle( function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
      .endAngle(   function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
      .innerRadius(function (d) { return Math.max(0, y(d.y)); })
      .outerRadius(function (d) { return Math.max(0, y(d.y + d.dy)); });

    const _buildVis = function (root) {

      let text;
      let textValue;

      const svg = div.append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + (height / 2 + 10) + ')');

      const g = svg.selectAll('g')
        .data(partition.nodes(root))
        .enter().append('g');

      const path = g.append('path')
        .attr('d', arc)
        //.style('fill', function (d) { return color((d.children ? d : d.parent).name); })
        .on('click', click);

      if ($scope.vis.params.showText) {
        text = g.append('text')
          .attr('transform', function (d) { return 'rotate(' + computeTextRotation(d) + ')'; })
          .attr('x', function (d) { return y(d.y); })
          .attr('dx', '6') // margin
          .attr('dy', '.35em') // vertical-align
          .text(function (d) { return(d.name === 'flare' ? '' : d.name); });
      }

      if ($scope.vis.params.showValues) {
        textValue = g.append('text')
            .attr('transform', function (d) { return 'rotate(' + computeTextRotation(d) + ')'; })
            .attr('x', function (d) { return y(d.y); })
            .attr('dx', '6') // margin
            .attr('dy', '1.35em') // vertical-align
            .attr('fill', 'darkblue')
            .text(function (d) { return(d.name === 'flare' ? '' : '(' + d.size + ')'); });
      }

      function click(d) {

        if (text) text.transition().attr('opacity', 0);
        if (textValue) textValue.transition().attr('opacity', 0);

        path.transition()
          .duration(250)
          .attrTween('d', arcTween(d))
          .each('end', function (e, i) {
            // check if the animated element's data e lies within the visible angle span given in d
            if (e.x >= d.x && e.x < (d.x + d.dx)) {
              // get a selection of the associated text element(s)
              const arcText = d3.select(this.parentNode).selectAll('text');
              // fade in the text element and recalculate positions
              if (arcText) {
                arcText.transition().duration(250)
                  .attr('opacity', 1)
                  .attr('transform', function () { return 'rotate(' + computeTextRotation(e) + ')'; })
                  .attr('x', function (d) { return y(d.y); });
              }
            }
          });
        }
      };


    const _render = function (data) {
    	d3.select(svgRoot).selectAll('svg').remove();
      	_buildVis(data.children);
    };

    $scope.$watch('esResponse', function (resp) {
      	if (resp) {
        	const chartData = sunburstAggResponse($scope.vis, resp);
        	_render(chartData);
      	}
    });

    d3.select(self.frameElement).style('height', height + 'px');

    function arcTween(d) {
      const xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]);
      const yd = d3.interpolate(y.domain(), [d.y, 1]);
      const yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
      return function (d, i) {
        return i
            ? function (t) { return arc(d); }
            : function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
      };
    }

    function computeTextRotation(d) {
      return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
    }

  });
