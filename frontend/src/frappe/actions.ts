import type { Action } from 'fyo/model/types';
import type { FrappeDoc } from './document';
import { call } from 'src/web/api';
import { showDialog } from 'src/utils/interactive';

export interface DocumentAction {
  label: string;
  method: string;
}

interface ActionResult {
  title: string;
  detail: string[];
}

/** App actions inspect saved documents; their endpoints enforce document permissions. */
export function getAppActions(doc: FrappeDoc): Action[] {
  const actions =
    globalThis.window?.frappe?.boot?.books?.document_actions?.[doc.doctype] ??
    [];
  return actions.map(({ label, method }) => ({
    label,
    condition: (document) => document.inserted && !document.dirty,
    async action() {
      const result = await call<ActionResult>(method, {
        doctype: doc.doctype,
        name: doc.frappeName,
      });
      await showDialog(result);
    },
  }));
}
