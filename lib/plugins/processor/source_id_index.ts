import type Document from 'warehouse/dist/document';
import type Model from 'warehouse/dist/model';

interface SourceSchema {
  _id?: string;
  source: string;
}

class SourceIdIndex<T extends SourceSchema> {
  private readonly model: Model<T>;
  private sourceIds?: Map<string, string>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  find(source: string): Document<T> | undefined {
    const sourceIds = this.load();
    const id = sourceIds.get(source);

    if (id) {
      const doc = this.model.findById(id);
      if (doc?.source === source) return doc;
      sourceIds.delete(source);
    }

    const doc = this.model.findOne({source});
    if (doc) this.set(doc);
    return doc;
  }

  set(doc: T | Document<T>): void {
    if (doc._id) this.load().set(doc.source, doc._id);
  }

  delete(source: string): void {
    this.load().delete(source);
  }

  private load(): Map<string, string> {
    if (!this.sourceIds) {
      this.sourceIds = new Map();
      this.model.forEach(doc => {
        if (doc._id) this.sourceIds.set(doc.source, doc._id);
      });
    }

    return this.sourceIds;
  }
}

export default SourceIdIndex;
