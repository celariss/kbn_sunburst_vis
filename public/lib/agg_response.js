import _ from 'lodash';
import { arrayToLinkedList } from 'ui/agg_response/hierarchical/_array_to_linked_list';

module.exports = function sunburstProvider(Private, Notifier) {
  let notify = new Notifier({
    location: 'Sunburst chart response converter'
  });

  let nodes = [];

  let buckettemp = null;
  let bucketposition = 0;

  // TODO : change for kibana 6.2.2 compatibility
  function processEntryRecursive(data, parent) {
    

    bucket_position = 0;

    for (var t=0; t < _.size(data.buckets); t++) {
      var bucket = data.buckets[t];

      bucket_temp = null;

      if (!bucket) {

        var pos = 0;
        var found = false;
        _.each(data.buckets, function(a,b) {

          if (!found) {
            if (bucket_position == pos) {
            bucket_temp = a;
            bucket_temp.key = b;
            bucket_position++;
            found = true;
            }
          }

          pos++;
        });

        if (bucket_temp) {
          bucket = bucket_temp;
        }
      }
      
      var temp_node = { 'children' : null, 'name' : bucket.key, 'size' : bucket.doc_count };

      // warning ...

      if (_.size(bucket) > 2) {
        var i = 0;

        while(!bucket[i] && i <= _.size(bucket)) { i++; }

        if (bucket[i] && bucket[i].buckets) {
          // there are more
             processEntryRecursive(bucket[i], temp_node);
        }
      }

      if (!parent.children) parent.children = [];

      parent.children.push(temp_node);
    }
  }

  // TODO : change for kibana 6.2.2 compatibility
  return function (vis, resp) {

    //console.log("vis :", vis);
    //console.log("resp :", resp);

    //let metric = vis.aggs.bySchemaGroup.metrics[0];
    let buckets = vis.aggs.bySchemaGroup.buckets;
    // each item in bucket contains :
    //   enabled
    //   id
    //   params {}
    //   __schema
    //   __type
    buckets = arrayToLinkedList(buckets);
    //console.log("buckets :", buckets);

    if (!buckets) {
      return { 'children': { 'children': null } };
    }

    //const firstAgg = children[0];
    const aggData = resp.tables[0];

    nodes = [];

    processEntryRecursive(aggData, nodes);

    let chart = {
      'name': 'flare',
      'children': nodes,
      'size': 0
    };

    //console.log("chart :", chart);

    return chart;
  };
};

