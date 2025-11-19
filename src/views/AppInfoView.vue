<template>
  <div class="min-h-screen p-6" style="background-color: var(--bg-page); color: var(--text-main);">
    <header class="mb-8">
      <h1 class="text-3xl font-bold">SubScribe — ваше управление подписками</h1>
      <p class="mt-2" style="color: var(--muted);">Отслеживайте расходы, планируйте бюджет, не пропускайте платежи.</p>
    </header>

    <main class="space-y-6">
      <section class="card">
        <h2 class="text-xl font-semibold mb-2">Что умеет приложение</h2>
        <ul class="list-disc pl-5 space-y-1">
          <li>Красивая диаграмма расходов по категориям</li>
          <li>Список подписок с датами и суммами</li>
          <li>Поддержка месячных и годовых платежей</li>
          <li>Работает как веб‑приложение на телефоне</li>
        </ul>
        <div class="mt-4">
          <router-link to="/" class="btn-primary">Открыть приложение</router-link>
        </div>
      </section>

      <section class="card">
        <h2 class="text-xl font-semibold mb-2">Как добавить на главный экран</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-medium mb-2">iPhone (Safari)</h3>
            <ol class="list-decimal pl-5 space-y-1">
              <li>Откройте SubScribe в Safari.</li>
              <li>Нажмите кнопку «Поделиться» (иконка со стрелкой).</li>
              <li>Выберите «На экран Домой».</li>
              <li>Подтвердите добавление.</li>
            </ol>
          </div>
          <div>
            <h3 class="font-medium mb-2">Android (Chrome)</h3>
            <ol class="list-decimal pl-5 space-y-1">
              <li>Откройте SubScribe в Chrome.</li>
              <li>Откройте меню (⋮) справа.</li>
              <li>Выберите «Добавить на главный экран».</li>
              <li>Подтвердите добавление.</li>
            </ol>
          </div>
        </div>
      </section>

      <section class="card">
        <h2 class="text-xl font-semibold mb-2">Цвета и стиль</h2>
        <p>Страница оформлена в цветах приложения: фон, карточки и акценты используют переменные темы.</p>
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