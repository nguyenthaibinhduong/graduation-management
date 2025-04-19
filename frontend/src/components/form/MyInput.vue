<template>
  <div class="flex items-center gap-4">
    <label :for="id" class="w-1/5">{{ title ?? 'Form Input' }}</label>

    <!-- Render theo type -->
    <DatePicker v-if="type === 'date'" :id="id" v-bind="$attrs" class="w-4/5" />
    <InputText v-else-if="type === 'text'" :id="id" v-bind="$attrs" class="w-4/5" />
    <Select v-else-if="type === 'select'" :id="id" v-bind="$attrs" class="w-4/5" />
    <InputNumber v-else-if="type === 'number'" :id="id" v-bind="$attrs" class="w-4/5" />
    <MultiSelect v-else-if="type === 'multiselect'" :id="id" v-bind="$attrs" class="w-4/5" />
    <Password v-else-if="type === 'password'" :id="id" v-bind="$attrs" class="w-4/5" />

  </div>
  <Editor v-if="type === 'editor'" :id="id" v-bind="$attrs" class="w-full" />
</template>

<script setup>
import { DatePicker, InputNumber, InputText, Select, MultiSelect, Password } from 'primevue'
import Editor from 'primevue/editor';
import { defineProps } from 'vue'

const props = defineProps({
  title: String,
  id: { type: String, default: 'input-field' },
  type: { type: String, default: 'text' },
})
</script>
