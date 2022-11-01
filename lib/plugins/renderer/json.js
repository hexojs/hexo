'use strict';

function jsonRenderer(data) {
  return JSON.parse(data.text);
}

export default jsonRenderer;
