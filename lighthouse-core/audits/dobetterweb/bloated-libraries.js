/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview This audit checks a page for any unnecessarily large npm dependencies.
 * These "bloated" libraries can be replaced with functionally equivalent, smaller ones.
 */

'use strict';

const Audit = require('../audit.js');
const i18n = require('../../lib/i18n/i18n.js');

const UIStrings = {
  /** Title of a Lighthouse audit that provides detail on large Javascript libraries that are used on the page that have better alternatives. This descriptive title is shown when to users when no known "bloated" libraries are detected on the page.*/
  title: 'Avoids unnecessarily large JavaScript dependencies',
  /** Title of a Lighthouse audit that provides detail on large Javascript libraries that are used on the page that have better alternatives. This descriptive title is shown when to users when some known "bloated" libraries are detected on the page.*/
  failureTitle: 'Includes unnecessarily large JavaScript dependencies',
  /** Description of a Lighthouse audit that tells the user why they should care about the large Javascript libraries that have better alternatives.. This is displayed after a user expands the section to see more. No character length limits. */
  description: 'Large JavaScript libraries can lead to poor performance. ' +
    'Prefer smaller, functionally equivalent libraries to reduce your bundle size.' +
    '[Learn more](https://developers.google.com/web/fundamentals/performance/webpack/decrease-frontend-size#optimize_dependencies',
  /** Label for a column in a data table. Entries will be names of suggested libraries that are an alternative to what's currently being used. */
  suggestion: 'Suggestion',
};

const str_ = i18n.createMessageInstanceIdFn(__filename, UIStrings);
const database = {'moment': 'dayjs'};

class BloatedLibrariesAudit extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'bloated-libraries',
      title: str_(UIStrings.title),
      description: str_(UIStrings.description),
      requiredArtifacts: ['Stacks'],
    };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @return {LH.Audit.Product}
   */
  static audit(artifacts) {
    /** @type {Array<{original: {name: string}, suggestion: {name: string}}>} */
    const libraryPairings = [];
    const foundLibraries = artifacts.Stacks.filter(stack => stack.detector === 'js');

    for (const library of foundLibraries) {
      if (!library.npm || !database[library.npm]) continue;
      libraryPairings.push({original: library, suggestion: {name: database[library.npm]}});
    }

    const tableDetails = [];
    libraryPairings.forEach(libraryPairing => {
      tableDetails.push({
        name: libraryPairing.original.name,
        suggestion: libraryPairing.suggestion.name,
      });
    });

    /** @type {LH.Audit.Details.Table['headings']} */
    const headings = [
      {key: 'name', itemType: 'text', text: str_(i18n.UIStrings.columnName)},
      {key: 'suggestion', itemType: 'text', text: str_(UIStrings.suggestion)},
    ];

    const details = Audit.makeTableDetails(headings, tableDetails, {});

    return {
      score: libraryPairings.length > 0 ? 0 : 1,
      details: {
        ...details,
      },
    };
  }
}

module.exports = BloatedLibrariesAudit;
module.exports.UIStrings = UIStrings;
