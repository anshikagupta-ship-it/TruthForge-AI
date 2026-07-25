export class SectionIntegrityValidator {
  static validate(report) {
    const errors = [];
    const sections = report.sections || [];

    if (sections.length !== 10) {
      errors.push(`ERR_MISSING_SECTION: Expected 10 sections, found ${sections.length}`);
    }

    const seenOrders = new Set();
    sections.forEach((sec, idx) => {
      if (!sec.id || !sec.title) {
        errors.push(`ERR_INVALID_SECTION: Section at index ${idx} missing id or title`);
      }
      if (seenOrders.has(sec.order)) {
        errors.push(`ERR_DUPLICATE_SECTION_ORDER: Duplicate section order ${sec.order}`);
      }
      seenOrders.add(sec.order);
    });

    return errors;
  }
}
