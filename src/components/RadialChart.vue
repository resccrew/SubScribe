<template>
  <div class="relative w-full h-full">
    <svg :viewBox="`0 0 ${size} ${size}`" class="w-full h-full">
      <g :transform="`translate(${size / 2}, ${size / 2})`">
        <circle :r="innerRadius" :fill="`var(--olive-dark)`" />
        <g v-for="(bar, index) in bars" :key="index">
          <line
            :x1="bar.x1"
            :y1="bar.y1"
            :x2="bar.x2"
            :y2="bar.y2"
            :stroke="bar.color"
            stroke-width="2"
            stroke-linecap="round"
            class="bar-line"
            :style="{ strokeDasharray: bar.length, strokeDashoffset: bar.length, animationDelay: `${index * 12}ms` }"
          />
        </g>
      </g>
    </svg>
    
  </div>
  
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Subscription } from '@/types/subscription';

const props = defineProps<{
  subscriptions: Subscription[];
}>();

const NUM_BARS = 120;
const size = 280;
const innerRadius = 40;
const maxBarLength = (size / 2) - innerRadius - 10;
import { CATEGORY_COLOR_MAP } from '@/types/subscription'
const colorMap: Record<string, string> = CATEGORY_COLOR_MAP

const bars = computed(() => {
  const subs = props.subscriptions;
  const barValues = new Array(NUM_BARS).fill(0);

  if (subs && subs.length > 0) {
    const controlPoints: { index: number; value: number }[] = [];
    const sortedSubs = [...subs].sort((a, b) => a.price - b.price);
    sortedSubs.forEach((sub, i) => {
      controlPoints.push({
        index: Math.floor((i / sortedSubs.length) * NUM_BARS),
        value: sub.price,
      });
    });

    if (controlPoints.length > 0) {
      controlPoints.push({ index: NUM_BARS, value: controlPoints[0]!.value });
    }

    for (let i = 0; i < controlPoints.length - 1; i++) {
      const start = controlPoints[i];
      const end = controlPoints[i + 1];

      if (start && end) {
        const indexDiff = end.index - start.index;
        const valueDiff = end.value - start.value;

        for (let j = start.index; j < end.index; j++) {
          const progress = indexDiff === 0 ? 1 : (j - start.index) / indexDiff;
          barValues[j] = start.value + valueDiff * progress;
        }
      }
    }
  }

  const maxPrice = Math.max(...subs.map(s => s.price), 1);
  const noisyValues = barValues.map(v => {
    const noise = (Math.random() * 0.5 + 0.75) * v;
    return Math.max(noise, maxPrice * 0.02);
  });
  
  const maxBarValue = Math.max(...noisyValues, 1);

  return noisyValues.map((value, index) => {
    const angle = ((2 * Math.PI) / NUM_BARS) * index - (Math.PI / 2);
    const barLength = (value / maxBarValue) * maxBarLength;
    const outerRadius = innerRadius + barLength;

    const x1 = innerRadius * Math.cos(angle);
    const y1 = innerRadius * Math.sin(angle);
    const x2 = outerRadius * Math.cos(angle);
    const y2 = outerRadius * Math.sin(angle);

    const length = Math.hypot(x2 - x1, y2 - y1);
    const cat = barCategorySequence.value[index] ?? 'other'
    const color = colorMap[cat] || 'var(--olive)';
    return { x1, y1, x2, y2, length, color };
  });
});

const normalizedMonthly = (sub: Subscription) => sub.cycle === 'monthly' ? sub.price : sub.price / 12
const totalsByCategory = computed(() => {
  const totals: Record<string, number> = {}
  for (const s of props.subscriptions || []) {
    const key = s.category || 'other'
    totals[key] = (totals[key] || 0) + normalizedMonthly(s)
  }
  return totals
})
 

const barCategorySequence = computed(() => {
  const entries = Object.entries(totalsByCategory.value).filter(([, v]) => v > 0)
  const sum = entries.reduce((a, [, v]) => a + v, 0) || 1
  const result: string[] = []
  for (const [k, v] of entries) {
    const count = Math.max(1, Math.round((v / sum) * NUM_BARS))
    for (let i = 0; i < count; i++) result.push(k)
  }
  return result.slice(0, NUM_BARS).concat(Array(Math.max(0, NUM_BARS - result.length)).fill('other'))
})
</script>

<style scoped>
.bar-line {
  opacity: 0;
  animation: draw 600ms ease forwards, fadeIn 600ms ease forwards;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}

@keyframes fadeIn {
  to { opacity: 1; }
}
</style>