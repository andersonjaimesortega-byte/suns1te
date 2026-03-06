export class WorkLog {
  constructor({ id, title, category, description, sections = null, photos = [], timestamp, signature = null }) {
    this.id = id || Date.now().toString();
    this.title = title;
    this.category = category;
    this.description = description;
    this.sections = sections; // { avances: [], actividades: [], retos: [], pendientes: [] }
    this.photos = photos;
    this.timestamp = timestamp || new Date().toISOString();
    this.signature = signature;
  }

  static fromJSON(json) {
    return new WorkLog(json);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      category: this.category,
      description: this.description,
      sections: this.sections,
      photos: this.photos,
      timestamp: this.timestamp,
      signature: this.signature,
    };
  }
}
