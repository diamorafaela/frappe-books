<template>
  <p v-if="error" role="alert" class="text-ink-red-3">{{ error }}</p>
  <div ref="container" />
</template>

<script setup lang="ts">
import {
  onMounted,
  onBeforeUnmount,
  onActivated,
  onDeactivated,
  ref,
} from 'vue';
import { t } from 'fyo';
import { translateValue } from 'fyo/utils/translation';
import type { FrappeDoc } from 'src/frappe/document';
import { call } from 'src/web/api';
import type { SettingsPanelExtension } from './settingsPanelExtension';

const props = defineProps<{ panel: SettingsPanelExtension; doc: FrappeDoc }>();
const container = ref<HTMLElement>();
const error = ref('');
let dispose: (() => void) | undefined;
let active = false;
let generation = 0;

async function activate() {
  if (active) return;
  active = true;
  const current = ++generation;
  error.value = '';
  try {
    const url = new URL(props.panel.module, window.location.origin);
    if (
      url.origin !== window.location.origin ||
      !url.pathname.startsWith('/assets/')
    ) {
      throw new Error(t`Invalid settings extension URL`);
    }
    const extension = await import(/* @vite-ignore */ url.href);
    if (!active || current !== generation || !container.value) return;
    dispose = extension.mount(container.value, {
      doctype: props.doc.doctype,
      name: props.doc.frappeName,
      call,
      translate: translateValue,
      isDirty: () => props.doc.dirty,
      refresh: () => props.doc.refresh(),
    });
  } catch (cause) {
    if (!active || current !== generation) return;
    error.value =
      cause instanceof Error
        ? cause.message
        : t`Could not load settings extension`;
  }
}

function deactivate() {
  active = false;
  generation++;
  dispose?.();
  dispose = undefined;
}

onMounted(activate);
onActivated(activate);
onDeactivated(deactivate);
onBeforeUnmount(deactivate);
</script>
