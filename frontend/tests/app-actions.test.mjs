import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getBooksMeta } from './helpers/doctypes.mjs';
import { loadSaved, stubFrappe } from './helpers/frappe.mjs';
import {
  dialog,
  frappeModels,
  getActionsForDoc,
  loadFrappeDocTypes,
  newFrappeDoc,
  registerFrappeModels,
} from './helpers/ui.mjs';

stubFrappe(({ body }) => ({ message: getBooksMeta(body.doctypes) }));
registerFrappeModels(frappeModels);
await loadFrappeDocTypes();

test('app action uses a saved document and displays its server result', async () => {
  window.frappe.boot.books = {
    document_actions: {
      'Books Customer': [{ label: 'Fiscal review', method: 'example.review' }],
    },
  };
  const customer = newFrappeDoc('Customer', { name: 'Test customer' });
  assert.ok(
    !getActionsForDoc(customer).some(
      (action) => action.label === 'Fiscal review'
    )
  );
  await loadSaved(customer, { docstatus: 0 });
  let request;
  stubFrappe(({ path, body }) => {
    request = { path, body };
    return { message: { title: 'Review result', detail: ['CUIT checked'] } };
  });
  let title;
  dialog.confirm = (options) => {
    title = options.title;
    void options.actions[0].onClick();
  };
  const action = getActionsForDoc(customer).find(
    (action) => action.label === 'Fiscal review'
  );
  assert.ok(action);
  await action.action(customer);
  assert.ok(request.path.endsWith('example.review'));
  assert.deepEqual(request.body, {
    doctype: 'Books Customer',
    name: 'Test customer',
  });
  assert.equal(title, 'Review result');
  customer._dirty = true;
  assert.ok(
    !getActionsForDoc(customer).some(
      (action) => action.label === 'Fiscal review'
    )
  );
});
