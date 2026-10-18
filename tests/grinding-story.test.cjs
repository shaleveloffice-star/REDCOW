const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createLoader}=require('./helpers.cjs');
test('grinding story defaults resolve for existing CMS and admin edits survive storage',()=>{
 const load=createLoader();
 const {resolveSeoPageContent}=load('@/lib/seo-content/resolve-seo-content');
 const {mergeSeoPageFields,sanitizeSeoPageFields}=load('@/lib/seo-content/sanitize-seo-storage');
 for(const locale of ['he','en','fr']){
  const result=resolveSeoPageContent(locale,'home',{smashStory:{title:'Existing smash'}});
  assert.ok(result.grindingStory.title);
  assert.equal(result.grindingStory.bottomParagraphs.length,3);
  assert.equal(result.smashStory.title,'Existing smash');
 }
 const saved=mergeSeoPageFields({smashStory:{title:'keep'}},sanitizeSeoPageFields({grindingStory:{title:'עריכה',introduction:'פתיח',bottomContent:'סיום'}}));
 const result=resolveSeoPageContent('he','home',saved);
 assert.equal(result.grindingStory.title,'עריכה');
 assert.deepEqual(result.grindingStory.introductionParagraphs,['פתיח']);
 assert.equal(result.smashStory.title,'keep');
});
