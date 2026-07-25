export class ReportSection {
  constructor({
    id = '',
    title = '',
    order = 0,
    content = null
  } = {}) {
    this.id = id;
    this.title = title;
    this.order = order;
    this.content = content;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      order: this.order,
      content: this.content
    };
  }
}
