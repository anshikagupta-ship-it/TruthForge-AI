import { stringifyDeterministic } from '../utils/deterministicHasher.js';

export class JSONRenderer {
  static render(formattedData) {
    return JSON.stringify(formattedData, null, 2);
  }
}
