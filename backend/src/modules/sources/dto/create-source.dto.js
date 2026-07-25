export class CreateSourceDto {
  constructor({ source_name, source_url, publisher, source_type, trust_score, publication_date, doi }) {
    this.source_name = source_name;
    this.source_url = source_url;
    if (publisher !== undefined) this.publisher = publisher;
    this.source_type = source_type;
    if (trust_score !== undefined) this.trust_score = trust_score;
    if (publication_date !== undefined) this.publication_date = publication_date;
    if (doi !== undefined) this.doi = doi;
  }
}
