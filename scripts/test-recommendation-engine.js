const catalog = require('../data/catalog.json');
const { filterCandidates } = require('../lib/catalog-filter');

console.log('=== TEST 1: Persona Sam (Flow A: Investor Pitch in Gastown) ===');
const samProfile = {
  gender_expression: 'Male',
  budget: '$$',
  size: 'M',
  body_type: 'rectangle',
  seasonal_colour: 'autumn',
  style: 'classic',
  season_or_climate: 'Fall/Winter',
  lifestyle: ['office_professional'],
  flow: 'occasion',
  occasion: 'pitch',
  audience_text: 'Seed fund, partners are ex-engineers, meeting at their office in Gastown'
};

const samResult = filterCandidates(catalog, samProfile);
console.log('Sam candidates count by slot:', samResult.slot_counts);
console.log('Sam total candidates:', samResult.total_candidates);
console.log('Is valid pool:', samResult.is_valid_pool);
console.log('Relaxed field:', samResult.relaxed_field);

console.log('\n=== TEST 2: Occasion Override (Funeral + Trendy Style) ===');
const funeralProfile = {
  gender_expression: 'Male',
  budget: '$',
  style: 'trendy',
  flow: 'occasion',
  occasion: 'funeral',
  audience_text: 'Traditional family funeral service'
};
const funeralResult = filterCandidates(catalog, funeralProfile);
console.log('Funeral candidates count by slot:', funeralResult.slot_counts);
console.log('Is valid pool:', funeralResult.is_valid_pool);
console.log('Relaxed field:', funeralResult.relaxed_field);

console.log('\n=== TEST 3: Persona Maya (Flow B: Everyday Capsule) ===');
const mayaProfile = {
  gender_expression: 'Female',
  budget: '$$',
  size: 'S',
  body_type: 'bottom_triangle',
  seasonal_colour: 'autumn',
  style: 'casual',
  season_or_climate: 'Fall/Winter',
  lifestyle: ['family', 'office_professional'],
  flow: 'everyday'
};
const mayaResult = filterCandidates(catalog, mayaProfile);
console.log('Maya candidates count by slot:', mayaResult.slot_counts);
console.log('Maya total candidates:', mayaResult.total_candidates);
console.log('Is valid pool:', mayaResult.is_valid_pool);

console.log('\nAll core engine tests executed successfully!');
