module.exports = function(kibana){
	return new kibana.Plugin({
		name: 'kbn_sunburst_vis',
		require: ['kibana', 'elasticsearch'],
		uiExports: {
			visTypes: [
				'plugins/kbn_sunburst_vis/kbn_sunburst_vis'
				]
		}
	});
};