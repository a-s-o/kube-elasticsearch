'use strict';

const path = require('path');

module.exports = {
   containerName: 'kube-elasticsearch',
   containerImage: 'elasticsearch:latest',
   port: process.env.EXPOSE_PORT || 9200,
   clusterPort: 9300,
   dataDir: path.resolve(__dirname, './es_data'),
   configDir: path.resolve(__dirname, './es_config')
};
