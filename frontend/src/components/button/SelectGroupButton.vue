<template>
    <div class="w-full p-4 rounded-lg">
        <SelectButton :options="internalOptions" :option-label="optionLabel" :option-value="optionValue"
            :model-value="modelValue || 0" @update:modelValue="onSelect" :allow-empty="true" class="w-full " />
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { SelectButton } from 'primevue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    options: {
        type: Array,
        required: true
    },
    modelValue: {
        type: [String, Number, null],
        default: null
    },
    optionLabel: {
        type: String,
        default: 'label'
    },
    optionValue: {
        type: String,
        default: 'value'
    }
});

const emit = defineEmits(['update:modelValue']);

// Gán value tự động nếu thiếu
const internalOptions = computed(() => {
    return props.options.map((opt, index) => {
        return {
            ...opt,
            [props.optionValue]:
                opt[props.optionValue] !== undefined
                    ? opt[props.optionValue]
                    : index
        };
    });
});

const onSelect = (value) => {
    emit('update:modelValue', value);

    const selected = internalOptions.value.find(
        opt => opt[props.optionValue] === value
    );

    if (selected?.action && typeof selected.action === 'function') {
        selected.action();
    }
}
</script>
