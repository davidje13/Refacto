#!/bin/node

const fs = require('fs');

function mutate(input = {}, path, value) {
  if (!path.length) {
    return value;
  }
  const result = Object.assign({}, input);
  if (value === undefined && path.length === 1) {
    delete result[path[0]];
  } else {
    result[path[0]] = mutate(result[path[0]], path.slice(1), value);
  }
  return result;
}

const COMMAND_PATTERN = /^([^=]*)=(.*)$/;

function mutateAll(input, commands) {
  let current = input;

  commands.forEach((command) => {
    const parts = COMMAND_PATTERN.exec(command);
    if (!parts) {
      throw new Error('Unrecognised command: ' + command);
    }

    const path = (parts[1] === '') ? [] : parts[1].split('.');
    const value = (parts[2].length === 0) ? undefined : JSON.parse(parts[2]);

    current = mutate(current, path, value);
  });

  return current;
}

const sourceJson = JSON.parse(fs.readFileSync(0, 'utf-8'));

const resultJson = mutateAll(sourceJson, process.argv.slice(2));

process.stdout.write(JSON.stringify(resultJson));
