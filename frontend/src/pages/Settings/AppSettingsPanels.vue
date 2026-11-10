<template>
  <section v-for="panel in panels" :key="panel.module" class="mt-8">
    <AppSettingsPanel :panel="panel" :doc="doc" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FrappeDoc } from 'src/frappe/document';
import AppSettingsPanel from './AppSettingsPanel.vue';

const props = defineProps<{ doc: FrappeDoc }>();
const panels = computed(() =>
  (window.frappe.boot?.books?.settings_panels ?? []).filter(
    (panel) => panel.doctype === props.doc.doctype
  )
);
</script>
