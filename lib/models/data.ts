'use strict';

import {Schema} from 'warehouse';

export default ctx => {
  const Data = new Schema({
    _id: {type: String, required: true},
    data: Object
  });

  return Data;
};
