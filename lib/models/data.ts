import warehouse from 'warehouse';

export = ctx => {
  const Data = new warehouse.Schema({
    _id: {type: String, required: true},
    data: Object
  });

  return Data;
};
