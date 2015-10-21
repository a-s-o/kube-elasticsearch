'use strict';

const cfg = require('../config');
const shell = require('shelljs');

shell.exec(`docker pull ${cfg.containerImage}`);
shell.exit(0);
