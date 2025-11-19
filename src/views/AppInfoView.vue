<template>
  <div class="min-h-screen" style="background-color: var(--bg-page); color: var(--text-main);">
    <section class="hero px-6 pt-20 pb-16 text-center relative overflow-hidden">
      <div class="accent-bg"></div>
      <h1 class="hero-title animate-in">Manage subscriptions. Save money.</h1>
      <p class="mt-4 text-lg animate-in" style="color: var(--muted);">Beautiful insights. Clear totals. Mobile-first experience.</p>
      <div class="mt-8 flex justify-center gap-3 animate-in">
        <router-link to="/" class="btn-primary">Open App</router-link>
        <a href="#install" class="btn-secondary">Install on Home Screen</a>
      </div>
    </section>

    <main class="space-y-12 px-6 pb-20">
      <section class="grid md:grid-cols-3 gap-6">
        <div class="card feature animate-delay-1">
          <div class="icon-pill" style="background-color: var(--olive);"></div>
          <h3 class="text-lg font-semibold mb-1">Category chart</h3>
          <p style="color: var(--muted);">Radial view that visualizes where your monthly budget goes.</p>
        </div>
        <div class="card feature animate-delay-2">
          <div class="icon-pill" style="background-color: var(--olive);"></div>
          <h3 class="text-lg font-semibold mb-1">Smart list</h3>
          <p style="color: var(--muted);">Subscriptions with price, cycle, next bill date — easy to scan.</p>
        </div>
        <div class="card feature animate-delay-3">
          <div class="icon-pill" style="background-color: var(--olive);"></div>
          <h3 class="text-lg font-semibold mb-1">Monthly total</h3>
          <p style="color: var(--muted);">Normalized totals across monthly and yearly plans.</p>
        </div>
      </section>

      <section id="install" class="card install">
        <h2 class="text-xl font-semibold mb-3">Install on your phone</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="animate-in">
            <h3 class="font-medium mb-2">iPhone (Safari)</h3>
            <ol class="list-decimal pl-5 space-y-1">
              <li>Open SubScribe in Safari.</li>
              <li>Tap Share.</li>
              <li>Select Add to Home Screen.</li>
              <li>Confirm.</li>
            </ol>
          </div>
          <div class="animate-in">
            <h3 class="font-medium mb-2">Android (Chrome)</h3>
            <ol class="list-decimal pl-5 space-y-1">
              <li>Open SubScribe in Chrome.</li>
              <li>Open the menu (⋮).</li>
              <li>Select Add to Home screen.</li>
              <li>Confirm.</li>
            </ol>
          </div>
        </div>
        <div class="mt-6">
          <router-link to="/" class="btn-primary">Open App</router-link>
        </div>
      </section>

      <section class="cta">
        <div class="cta-inner">
          <h3 class="text-2xl font-semibold">Start tracking smarter</h3>
          <p class="mt-1" style="opacity: 0.9;">Set your budget rhythm and stay on top of every payment.</p>
          <div class="mt-6 flex gap-3">
            <router-link to="/" class="btn-primary">Open App</router-link>
            <a href="#install" class="btn-secondary" style="border-color: #ffffff55; color: #fff;">Install guide</a>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.hero { background-image: radial-gradient(1200px 500px at 30% -10%, var(--olive) 0%, transparent 40%), radial-gradient(800px 400px at 85% -20%, var(--olive-dark) 0%, transparent 35%); }
.hero-title { font-size: clamp(2.25rem, 4.5vw, 3.25rem); font-weight: 800; letter-spacing: -0.02em; position: relative; }
.hero-title::after { content: ''; position: absolute; left: 50%; transform: translateX(-50%); bottom: -10px; width: 140px; height: 6px; border-radius: 9999px; background: linear-gradient(90deg, var(--olive), var(--accent)); filter: saturate(120%); }
.accent-bg { position: absolute; inset: -2px; pointer-events: none; opacity: 0.08; background: radial-gradient(1000px 1000px at 50% -30%, var(--olive) 0%, transparent 60%); }
.animate-in { animation: fadeUp 700ms ease both; }
.animate-delay-1 { animation: fadeUp 700ms ease both; animation-delay: 120ms; }
.animate-delay-2 { animation: fadeUp 700ms ease both; animation-delay: 240ms; }
.animate-delay-3 { animation: fadeUp 700ms ease both; animation-delay: 360ms; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.card { border-color: var(--border); transition: transform 250ms ease, box-shadow 250ms ease; box-shadow: 0 8px 28px rgba(46, 58, 44, 0.12); }
.card.feature { position: relative; overflow: hidden; }
.card.feature:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(46, 58, 44, 0.18); }
.icon-pill { width: 36px; height: 36px; border-radius: 9999px; margin-bottom: 10px; box-shadow: 0 8px 20px rgba(46, 58, 44, 0.2); }
.install { border: 1px solid var(--border); background-image: linear-gradient(180deg, rgba(111, 124, 99, 0.08), transparent); }
.cta { margin-top: 8px; }
.cta-inner { background-color: var(--olive-dark); color: white; border-radius: 16px; padding: 24px; display: grid; place-items: center; text-align: center; }
</style>