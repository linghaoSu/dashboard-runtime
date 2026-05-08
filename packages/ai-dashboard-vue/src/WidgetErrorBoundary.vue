<script setup lang="ts">
import { onErrorCaptured, ref } from "vue";

const error = ref<Error | null>(null);

onErrorCaptured((captured) => {
  error.value =
    captured instanceof Error ? captured : new Error(String(captured));
  return false;
});
</script>

<template>
  <slot v-if="!error" />
  <div v-else class="dao-widget-error-boundary">
    {{ error.message }}
  </div>
</template>

<style scoped>
.dao-widget-error-boundary {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #fca5a5;
  font-size: 14px;
}
</style>
