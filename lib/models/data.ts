import warehouse from 'warehouse';

export default ctx => {
  const Data = new warehouse.Schema({
    _id: {type: String, required: true},
    data: Object
  });

  return Data;
};
