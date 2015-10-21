'use strict';

const _ = require('lodash');
const shell = require('shelljs');
const spawn = require('child_process').spawn;
const Bluebird = require('bluebird');

function execAsync (cmd) {
   return new Bluebird(function exec (resolve, reject) {
      shell.exec(cmd, { silent: true }, (code, output) => {
         if (code > 0) reject(output);
         else resolve(output);
      });
   });
}

function dockerCreate (cfg) {
   const cmd = [
      `docker create`,
      `-p`, `${cfg.port}:9200`,
      `-p`, `${cfg.clusterPort}:9300`,
      `-v`, `${cfg.configDir}:/usr/share/elasticsearch/config`,
      `-v`, `${cfg.dataDir}:/usr/share/elasticsearch/data`,
      `--name`, `${cfg.containerName}`,
      `${cfg.containerImage}`
   ].join(' ');

   return execAsync(cmd).catch(err => console.error(err));
}

function dockerStart (cfg) {
   const container = spawn('docker', [
      'start',
      `-a`,                      // Attach to STDIN / STDERR
      `${cfg.containerName}`
   ], {
      stdio: 'inherit'
   });

   container.on('close', () => {
      console.error('elasticsearch container exited');
   });

   return container;
}

module.exports = function setup (config, inputs, output) {
   // Merge runtime config with default package config
   const cfg = _.defaults({}, config, require('./config'));

   dockerCreate(cfg)
      .then(() => dockerStart(cfg))
      .then(() => {
         output({
            COUCH_SERVICE_HOST: 'localhost',
            COUCH_SERVICE_PORT: cfg.port
         });

         require('exit-hook')(function stopContainer () {
            console.log('couchdb container stopping');
            shell.exec(`docker stop ${cfg.containerName}`);
         });
      });
};
