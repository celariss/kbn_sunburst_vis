import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisSchemasProvider } from 'ui/vis/editors/default/schemas';
import kbnSunburstVisTemplate from './kbn_sunburst_vis.html';

import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
VisTypesRegistryProvider.register(KbnSunburstVisProvider);

import 'ui/agg_table';
import 'ui/agg_table/agg_table_group';

import './kbn_sunburst_vis.less';
import './kbn_sunburst_vis_controller';

function KbnSunburstVisProvider(Private) {
  const VisFactory = Private(VisFactoryProvider);
  const Schemas = Private(VisSchemasProvider);

  return VisFactory.createAngularVisualization({
    name: 'kbn_sunburst',
    title: 'Sunburst Diagram',
    icon: 'fa-life-ring',
    description: 'Cool D3 Sunburst',
    visConfig: {
      defaults: {
        showText: true,
        showValues: true,
        showMetricsAtAllLevels: false
      },
      template: kbnSunburstVisTemplate
    },
    hierarchicalData: function (vis) {
      return Boolean(vis.params.showPartialRows || vis.params.showMetricsAtAllLevels);
    },
    editorConfig: {
      optionsTemplate: require('./kbn_sunburst_vis_params.html') /*'<vislib-basic-options></vislib-basic-options>'*/,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Split Size',
          min: 1,
          max: 1,
          defaults: [{
            type: 'count',
            schema: 'metric'
          }]
        },
        {
          group: 'buckets',
          name: 'segment',
          title: 'Ring',
          aggFilter: '!geohash_grid',
          min: 0,
          max: 5
        }
      ])
    },
    requiresSearch: true
  });
}

// export the provider so that the visType can be required with Private()
export default KbnSunburstVisProvider;

