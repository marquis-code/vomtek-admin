<template>
  <div>
    <NuxtLoadingIndicator color="#007d48" :height="2" :duration="1800" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastHost />
  </div>
</template>
