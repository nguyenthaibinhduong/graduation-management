<template>
    <div class="w-full flex gap-x-4 p-2 rounded-lg">

        <Button size="small" class="btn-submit" icon="pi pi-list" label="Nhóm khóa luận" />

    </div>
    <CreateGroup />
    <InvitationList />

</template>
<script setup>
import CreateGroup from './CreateGroup.vue';
import { Button } from 'primevue';
import InvitationList from './InvitationList.vue';



</script>