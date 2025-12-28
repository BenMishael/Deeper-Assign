/**
 * Performance benchmarks for equality utilities
 * Measures actual performance vs JSON.stringify and structuredClone
 */

import { deepEqual, deepClone } from '../../public/ts/utils/equality.js';

// Sample publisher config (typical use case)
const sampleConfig = {
  publisherId: 'pub-test',
  aliasName: 'Test Publisher',
  isActive: true,
  pages: [
    { pageType: 'homepage', selector: '#main-content', position: 'top' },
    { pageType: 'article', selector: '.article-content', position: 'bottom' },
    { pageType: 'category', selector: '#category-list', position: 'middle' },
  ],
  tags: ['tech', 'news', 'sports'],
  publisherDashboard: 'https://example.com/dashboard',
  monitorDashboard: 'https://example.com/monitor',
  qaStatusDashboard: 'https://example.com/qa',
  metadata: {
    created: new Date('2024-01-01'),
    updated: new Date('2024-01-15'),
    version: '1.0.0',
  },
};

// Create a copy for comparison
const sampleConfigCopy = JSON.parse(JSON.stringify(sampleConfig));

// Create a different config for inequality test
const differentConfig = {
  ...sampleConfig,
  aliasName: 'Different Publisher',
  pages: [
    { pageType: 'homepage', selector: '#main-content', position: 'top' },
    { pageType: 'article', selector: '.different-content', position: 'bottom' },
  ],
};

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  opsPerSecond: number;
}

function benchmark(name: string, fn: () => void, iterations: number = 10000, runs: number = 5): BenchmarkResult {
  const results: number[] = [];
  
  for (let run = 0; run < runs; run++) {
    // Warmup
    for (let i = 0; i < 100; i++) {
      fn();
    }

    // Actual benchmark
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const end = performance.now();
    results.push(end - start);
  }

  // Use median to avoid outliers
  results.sort((a, b) => a - b);
  const medianTime = results[Math.floor(results.length / 2)];
  const avgTime = medianTime / iterations;
  const opsPerSecond = 1000 / avgTime;

  return {
    name,
    iterations,
    totalTime: medianTime,
    avgTime,
    opsPerSecond,
  };
}

function formatResult(result: BenchmarkResult): string {
  return `${result.name}:
  Iterations: ${result.iterations.toLocaleString()}
  Total Time: ${result.totalTime.toFixed(2)}ms
  Avg Time: ${result.avgTime.toFixed(4)}ms
  Ops/Second: ${Math.round(result.opsPerSecond).toLocaleString()}`;
}

console.log('🚀 Performance Benchmarks\n');
console.log('='.repeat(60));
console.log('Test Object:', JSON.stringify(sampleConfig, null, 2).substring(0, 200) + '...\n');

// Benchmark 1: Deep Equality Comparison
console.log('\n📊 Deep Equality Comparison\n');

const deepEqualResult = benchmark(
  'deepEqual (equal)',
  () => deepEqual(sampleConfig, sampleConfigCopy),
  10000
);

const jsonStringifyResult = benchmark(
  'JSON.stringify comparison (equal)',
  () => JSON.stringify(sampleConfig) === JSON.stringify(sampleConfigCopy),
  10000
);

const deepEqualInequalResult = benchmark(
  'deepEqual (not equal)',
  () => deepEqual(sampleConfig, differentConfig),
  10000
);

const jsonStringifyInequalResult = benchmark(
  'JSON.stringify comparison (not equal)',
  () => JSON.stringify(sampleConfig) === JSON.stringify(differentConfig),
  10000
);

console.log(formatResult(deepEqualResult));
console.log('\n' + formatResult(jsonStringifyResult));

const equalitySpeedup = jsonStringifyResult.avgTime / deepEqualResult.avgTime;
console.log(`\n✅ deepEqual is ${equalitySpeedup.toFixed(2)}x faster than JSON.stringify (equal case)`);

const equalitySpeedupInequal = jsonStringifyInequalResult.avgTime / deepEqualInequalResult.avgTime;
console.log(`✅ deepEqual is ${equalitySpeedupInequal.toFixed(2)}x faster than JSON.stringify (not equal case)`);

// Benchmark 2: Deep Cloning
console.log('\n\n📊 Deep Cloning Comparison\n');

const deepCloneResult = benchmark(
  'deepClone',
  () => deepClone(sampleConfig),
  10000
);

const structuredCloneResult = benchmark(
  'structuredClone',
  () => structuredClone(sampleConfig),
  10000
);

console.log(formatResult(deepCloneResult));
console.log('\n' + formatResult(structuredCloneResult));

const cloneSpeedup = structuredCloneResult.avgTime / deepCloneResult.avgTime;
console.log(`\n✅ deepClone is ${cloneSpeedup.toFixed(2)}x faster than structuredClone`);

// Benchmark 3: Larger objects (more realistic for complex configs)
console.log('\n\n📊 Large Object Comparison\n');

const largeConfig = {
  ...sampleConfig,
  pages: Array.from({ length: 50 }, (_, i) => ({
    pageType: `page-${i}`,
    selector: `#selector-${i}`,
    position: i % 2 === 0 ? 'top' : 'bottom',
    metadata: {
      id: i,
      created: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
      tags: Array.from({ length: 10 }, (_, j) => `tag-${i}-${j}`),
    },
  })),
  metadata: {
    ...sampleConfig.metadata,
    history: Array.from({ length: 100 }, (_, i) => ({
      action: `action-${i}`,
      timestamp: new Date(`2024-01-${String((i % 30) + 1).padStart(2, '0')}`),
      user: `user-${i % 10}`,
    })),
  },
};

const largeConfigCopy = JSON.parse(JSON.stringify(largeConfig));

const largeDeepEqualResult = benchmark(
  'deepEqual (large, equal)',
  () => deepEqual(largeConfig, largeConfigCopy),
  5000
);

const largeJsonStringifyResult = benchmark(
  'JSON.stringify (large, equal)',
  () => JSON.stringify(largeConfig) === JSON.stringify(largeConfigCopy),
  5000
);

const largeDeepCloneResult = benchmark(
  'deepClone (large)',
  () => deepClone(largeConfig),
  5000
);

const largeStructuredCloneResult = benchmark(
  'structuredClone (large)',
  () => structuredClone(largeConfig),
  5000
);

console.log(formatResult(largeDeepEqualResult));
console.log('\n' + formatResult(largeJsonStringifyResult));
const largeEqualitySpeedup = largeJsonStringifyResult.avgTime / largeDeepEqualResult.avgTime;
console.log(`\n✅ deepEqual is ${largeEqualitySpeedup.toFixed(2)}x faster (large objects)`);

console.log('\n' + formatResult(largeDeepCloneResult));
console.log('\n' + formatResult(largeStructuredCloneResult));
const largeCloneSpeedup = largeStructuredCloneResult.avgTime / largeDeepCloneResult.avgTime;
console.log(`\n✅ deepClone is ${largeCloneSpeedup.toFixed(2)}x faster (large objects)`);

// Summary
console.log('\n\n' + '='.repeat(60));
console.log('📈 Summary');
console.log('='.repeat(60));
console.log(`Deep Equality (small): ${equalitySpeedup.toFixed(2)}x faster`);
console.log(`Deep Equality (large): ${largeEqualitySpeedup.toFixed(2)}x faster`);
console.log(`Deep Cloning (small): ${cloneSpeedup.toFixed(2)}x faster`);
console.log(`Deep Cloning (large): ${largeCloneSpeedup.toFixed(2)}x faster`);
console.log('\n📊 Recommended Values (conservative estimates):');
console.log(`Deep Equality: ${Math.min(equalitySpeedup, largeEqualitySpeedup).toFixed(1)}x - ${Math.max(equalitySpeedup, largeEqualitySpeedup).toFixed(1)}x faster`);
console.log(`Deep Cloning: ${Math.min(cloneSpeedup, largeCloneSpeedup).toFixed(1)}x - ${Math.max(cloneSpeedup, largeCloneSpeedup).toFixed(1)}x faster`);
console.log('='.repeat(60));

