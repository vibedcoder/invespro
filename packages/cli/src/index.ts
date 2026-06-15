#!/usr/bin/env node

import { defineCommand, runMain } from 'citty';
import evaluateCommand from './commands/evaluate.js';
import profileCommand from './commands/profile.js';
import validateCommand from './commands/validate.js';

const main = defineCommand({
  meta: {
    name: 'invespro',
    version: '0.1.0',
    description: 'Investment risk profiling engine',
  },
  subCommands: {
    profile: profileCommand,
    evaluate: evaluateCommand,
    validate: validateCommand,
  },
});

runMain(main);