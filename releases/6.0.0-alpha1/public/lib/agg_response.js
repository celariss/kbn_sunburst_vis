import _ from 'lodash';
import arrayToLinkedList from 'ui/agg_response/hierarchical/_array_to_linked_list';

module.exports = function sunburstProvider(Private, Notifier) {
    let notify = new Notifier({
      location: 'Sunburst chart response converter'
    });

    let nodes = [];

    let bucket_temp = null;
    let bucket_position = 0;

  	function processEntryRecursive(data, parent) {

  		bucket_position = 0;

  		for (let t=0; t < _.size(data.buckets); t++) {
  			let bucket = data.buckets[t];

  			bucket_temp = null;

  			if (!bucket) {

  				let pos = 0;
  				let found = false;
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

  			let temp_node = { 'children' : null, 'name' : bucket.key, 'size' : bucket.doc_count };

  			// warning ...

  			if (_.size(bucket) > 2) {
  				let i = 0;

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

    return function (vis, resp) {

      let metric = vis.aggs.bySchemaGroup.metrics[0];
      let children = vis.aggs.bySchemaGroup.buckets;
      children = arrayToLinkedList(children);

      if (!children)  {
        return { 'children' : { 'children' : null }};
      }

      let firstAgg = children[0];
      let aggData = resp.aggregations[firstAgg.id];

      nodes = [];

      processEntryRecursive(aggData, nodes);

      let chart = {
        'name' :'flare',
        'children' : nodes,
        'size' : 0
      };

      return chart;
    };
  };
