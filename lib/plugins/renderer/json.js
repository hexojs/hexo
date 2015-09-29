'use strict';

function jsonRenderer(data) {
  return JSON.parse(data.text);
}

module.exports = jsonRenderer;
