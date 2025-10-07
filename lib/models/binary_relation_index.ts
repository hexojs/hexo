import type Hexo from '../hexo';

type BinaryRelationType<K extends PropertyKey, V extends PropertyKey> = {
  [key in K]: PropertyKey;
} & {
  [key in V]: PropertyKey;
};

class BinaryRelationIndex<K extends PropertyKey, V extends PropertyKey> {
  keyIndex: Map<PropertyKey, Set<PropertyKey>> = new Map();
  valueIndex: Map<PropertyKey, Set<PropertyKey>> = new Map();
  key: K;
  value: V;
  ctx: Hexo;
  schemaName: string;

  constructor(key: K, value: V, schemaName: string, ctx: Hexo) {
    this.key = key;
    this.value = value;
    this.schemaName = schemaName;
    this.ctx = ctx;
  }

  load() {
    this.keyIndex.clear();
    this.valueIndex.clear();
    const raw = this.ctx.model(this.schemaName).data;
    for (const _id in raw) {
      this.saveHook(raw[_id]);
    }
  }

  saveHook(data: BinaryRelationType<K, V> & { _id: PropertyKey }) {
    if (!data) return;
    const _id = data._id;
    const key = data[this.key];
    const value = data[this.value];
    if (!this.keyIndex.has(key)) {
      this.keyIndex.set(key, new Set());
    }
    this.keyIndex.get(key).add(_id);

    if (!this.valueIndex.has(value)) {
      this.valueIndex.set(value, new Set());
    }
    this.valueIndex.get(value).add(_id);
  }

  removeHook(data: BinaryRelationType<K, V> & { _id: PropertyKey }) {
    const _id = data._id;
    const key = data[this.key];
    const value = data[this.value];
    this.keyIndex.get(key)?.delete(_id);
    if (this.keyIndex.get(key)?.size === 0) {
      this.keyIndex.delete(key);
    }
    this.valueIndex.get(value)?.delete(_id);
    if (this.valueIndex.get(value)?.size === 0) {
      this.valueIndex.delete(value);
    }
  }

  findById(_id: PropertyKey) {
    const raw = this.ctx.model(this.schemaName).findById(_id, { lean: true });
    if (!raw) return;
    return { ...raw };
  }

  find(query: Partial<BinaryRelationType<K, V>>) {
    const key = query[this.key];
    const value = query[this.value];

    if (key && value) {
      const ids = this.keyIndex.get(key);
      if (!ids) return [];
      return Array.from(ids)
        .map(_id => this.findById(_id))
        .filter(record => record?.[this.value] === value);
    }

    if (key) {
      const ids = this.keyIndex.get(key);
      if (!ids) return [];
      return Array.from(ids).map(_id => this.findById(_id));
    }

    if (value) {
      const ids = this.valueIndex.get(value);
      if (!ids) return [];
      return Array.from(ids).map(_id => this.findById(_id));
    }

    return [];
  }

  findOne(query: Partial<BinaryRelationType<K, V>>) {
    return this.find(query)[0];
  }
}

export default BinaryRelationIndex;
