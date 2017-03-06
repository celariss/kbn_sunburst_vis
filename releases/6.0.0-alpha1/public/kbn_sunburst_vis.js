
  import 'ui/agg_table';
  import 'ui/agg_table/agg_table_group';

  import 'plugins/kbn_sunburst_vis/kbn_sunburst_vis.less';
  import 'plugins/kbn_sunburst_vis/kbn_sunburst_vis_controller';
  import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
  import VisSchemasProvider from 'ui/vis/schemas';
  import kbnCirclesVisTemplate from 'plugins/kbn_sunburst_vis/kbn_sunburst_vis.html';

  require('ui/registry/vis_types').register(KbnSunburstVisProvider);

  function KbnSunburstVisProvider(Private) {
    var TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
    var Schemas = Private(VisSchemasProvider);

    return new TemplateVisType({
      name: 'kbn_sunburst',
      title: 'Sunburst Diagram',
      icon: 'fa-life-ring',
      description: 'Cool D3 Sunburst',
      template: require('plugins/kbn_sunburst_vis/kbn_sunburst_vis.html'),
      params: {
        defaults: {
          showText: true,
          showValues: true,
          showMetricsAtAllLevels: false
        },
        editor: require('plugins/kbn_sunburst_vis/kbn_sunburst_vis_params.html') /*'<vislib-basic-options></vislib-basic-options>'*/
      },
      hierarchicalData: function (vis) {
        return Boolean(vis.params.showPartialRows || vis.params.showMetricsAtAllLevels);
      },
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Split Size',
          min: 1,
          max: 1,
          defaults: [
            {type: 'count', schema: 'metric'}
          ]
        },
        {
          group: 'buckets',
          name: 'segment',
          title: 'Ring',
          aggFilter: '!geohash_grid',
          min: 0,
          max: 5
        }
      ]),
      requiresSearch: true
    });
  }
