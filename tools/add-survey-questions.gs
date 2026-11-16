/**
 * Adds the new survey questions to your EXISTING "Xpressions | Register my interest" form
 * and prints the full `fields` line to paste into site.js.
 *
 * How to use:
 * 1. Open the form in edit mode (forms.google.com > your form).
 * 2. Click the three-dot menu (top right) > Apps Script.
 * 3. Delete the sample code, paste this whole file, and click Save.
 * 4. Choose addSurveyQuestions in the function menu and click Run. Allow the permissions.
 * 5. Open the Execution log and copy the printed `fields:` line into site.js (replace the old one).
 *
 * Safe to run twice: questions that already exist are not added again.
 * The choice wording must stay exactly as below, because the website sends these exact values.
 */
function addSurveyQuestions() {
  var form = FormApp.getActiveForm();

  var AGE = ['18 to 21', '22 to 25', '26 to 30', 'Above 30'];
  var ROLE = ['Student at XIMB', 'Student at another college', 'Working professional', 'Other'];
  var HEARD = ['Instagram', 'WhatsApp', 'Poster on campus', 'LinkedIn', 'Friend or classmate', 'Other'];
  var CONSENT = 'I am 18 or older and agree to receive updates about Xpressions by email';

  function find(title) {
    var items = form.getItems();
    for (var i = 0; i < items.length; i++) if (items[i].getTitle() === title) return items[i];
    return null;
  }
  function moveAfter(item, afterTitle) {
    var after = find(afterTitle);
    if (after) form.moveItem(item.getIndex(), after.getIndex() + 1);
  }

  if (!find('Age group')) {
    var a = form.addListItem().setTitle('Age group').setChoiceValues(AGE).setRequired(true);
    moveAfter(a, 'College or organisation');
  }
  if (!find('I am a')) {
    var r = form.addListItem().setTitle('I am a').setChoiceValues(ROLE).setRequired(true);
    moveAfter(r, 'Age group');
  }
  if (!find('How did you hear about Xpressions?')) {
    form.addListItem().setTitle('How did you hear about Xpressions?').setChoiceValues(HEARD).setRequired(true);
  }
  if (!find('Consent')) {
    form.addCheckboxItem().setTitle('Consent').setChoiceValues([CONSENT]).setRequired(true)
      .setHelpText('Your details are used only for this course project.');
  }
  if (!find('Traffic source (filled automatically by the website)')) {
    form.addTextItem().setTitle('Traffic source (filled automatically by the website)');
  }

  // Read each question's entry ID from a prefilled link
  function entryId(item, value) {
    var resp;
    switch (item.getType()) {
      case FormApp.ItemType.TEXT: resp = item.asTextItem().createResponse(value); break;
      case FormApp.ItemType.LIST: resp = item.asListItem().createResponse(value); break;
      case FormApp.ItemType.CHECKBOX: resp = item.asCheckboxItem().createResponse([value]); break;
      case FormApp.ItemType.MULTIPLE_CHOICE: resp = item.asMultipleChoiceItem().createResponse(value); break;
    }
    var url = form.createResponse().withItemResponse(resp).toPrefilledUrl();
    return url.match(/entry\.\d+/)[0];
  }
  function firstChoice(item) {
    var t = item.getType();
    if (t === FormApp.ItemType.LIST) return item.asListItem().getChoices()[0].getValue();
    if (t === FormApp.ItemType.CHECKBOX) return item.asCheckboxItem().getChoices()[0].getValue();
    if (t === FormApp.ItemType.MULTIPLE_CHOICE) return item.asMultipleChoiceItem().getChoices()[0].getValue();
    return 'x';
  }
  var map = [
    ['name', 'Name'], ['email', 'Email'], ['college', 'College or organisation'],
    ['interests', 'Events I am interested in'], ['sides', 'Sides (filled automatically by the website)'],
    ['age', 'Age group'], ['role', 'I am a'], ['heard', 'How did you hear about Xpressions?'],
    ['consent', 'Consent'], ['source', 'Traffic source (filled automatically by the website)']
  ];
  var parts = map.map(function (m) {
    var it = find(m[1]);
    return it ? m[0] + ": '" + entryId(it, firstChoice(it)) + "'" : m[0] + ": ''";
  });
  Logger.log('Paste this into site.js, replacing the old fields line:\n\n    fields: { ' + parts.join(', ') + ' },');
}
