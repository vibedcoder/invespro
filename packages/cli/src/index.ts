#!/usr/bin/env node

import { defineCommand, runMain } from 'citty';
import compileCommand from './commands/compile.js';
import evaluateBatchCommand from './commands/evaluate-batch.js';
import evaluateCommand from './commands/evaluate.js';
import profileCommand from './commands/profile.js';
import validateCommand from './commands/validate.js';

const main = defineCommand({
  meta: {
    name: 'zagvar-helm',
    version: '0.1.0',
    description: 'Investment risk profiling engine',
  },
  subCommands: {
    compile: compileCommand,
    profile: profileCommand,
    evaluate: evaluateCommand,
    'evaluate-batch': evaluateBatchCommand,
    validate: validateCommand,
  },
});

runMain(main);
