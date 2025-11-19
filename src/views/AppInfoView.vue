<template>
  <div class="min-h-screen" style="background-color: var(--bg-page); color: var(--text-main);">
    <section class="px-6 pt-14 pb-10 text-center">
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight">Manage subscriptions. Save money.</h1>
      <p class="mt-3 text-lg" style="color: var(--muted);">Beautiful insights. Clear totals. Works great on mobile.</p>
      <div class="mt-6 flex justify-center gap-3">
        <router-link to="/" class="btn-primary">Open App</router-link>
        <a href="#install" class="btn-secondary">Install on Home Screen</a>
      </div>
    </section>

    <main class="space-y-8 px-6 pb-16">
      <section class="grid md:grid-cols-3 gap-6">
        <div class="card">
          <h3 class="text-lg font-semibold mb-2">Category chart</h3>
          <p style="color: var(--muted);">Radial view that visualizes where your monthly budget goes.</p>
        </div>
        <div class="card">
          <h3 class="text-lg font-semibold mb-2">Smart list</h3>
          <p style="color: var(--muted);">Subscriptions with price, cycle, next bill date — easy to scan.</p>
        </div>
        <div class="card">
          <h3 class="text-lg font-semibold mb-2">Monthly total</h3>
          <p style="color: var(--muted);">Normalized totals across monthly and yearly plans.</p>
        </div>
      </section>

      <section id="install" class="card">
        <h2 class="text-xl font-semibold mb-2">Install on your phone</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-medium mb-2">iPhone (Safari)</h3>
            <ol class="list-decimal pl-5 space-y-1">
              <li>Open SubScribe in Safari.</li>
              <li>Tap Share.</li>
              <li>Select Add to Home Screen.</li>
              <li>Confirm.</li>
            </ol>
          </div>
          <div>
            <h3 class="font-medium mb-2">Android (Chrome)</h3>
            <ol class="list-decimal pl-5 space-y-1">
              <li>Open SubScribe in Chrome.</li>
              <li>Open the menu (⋮).</li>
              <li>Select Add to Home screen.</li>
              <li>Confirm.</li>
            </ol>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/" class="btn-primary">Open App</router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.card {
  border-color: var(--border);
}
</style>