# 🐛 Productivity Dashboard - Bug Hunt Challenge

Web application ini sengaja dibuat dengan **14 bug teknis** yang harus kamu temukan dan perbaiki.
Bug-bug ini bukan bug visual/logika biasa, melainkan bug yang berkaitan dengan:
- Performance & Speed
- State Management
- Memory Leaks
- Cache Management
- Race Conditions
- Event Handling

---

## 📋 Daftar Bug yang Tersembunyi

### 🔴 Critical Bugs (Memory & Performance)

| # | Lokasi | Kategori | Deskripsi Singkat |
|---|--------|----------|-------------------|
| 1 | `src/utils/helpers.ts` | Performance | Expensive O(n²) computation tanpa memoization |
| 2 | `src/utils/helpers.ts` | Cache | localStorage dibaca berulang tanpa caching |
| 3 | `src/utils/helpers.ts` | Race Condition | API call tanpa cancellation/abort support |
| 5 | `src/components/PomodoroTimer.tsx` | Memory Leak | setInterval tidak pernah di-clear |
| 8 | `src/components/ActivityLog.tsx` | Event Leak | Event listener ditambahkan tanpa di-remove |
| 13 | `src/App.tsx` | Memory Leak | setInterval tanpa cleanup |
| 14 | `src/App.tsx` | Event Leak | Scroll listener di-add ulang setiap tasks berubah |

### 🟡 Medium Bugs (State & Rendering)

| # | Lokasi | Kategori | Deskripsi Singkat |
|---|--------|----------|-------------------|
| 6 | `src/components/TaskList.tsx` | Stale Closure | useEffect dependency array tidak lengkap |
| 7 | `src/components/Statistics.tsx` | Performance | Expensive function dipanggil tanpa useMemo |
| 9 | `src/App.tsx` | Cache | localStorage dibaca setiap render |
| 10 | `src/App.tsx` | Performance | localStorage ditulis setiap render |
| 11 | `src/App.tsx` | Re-render | Object reference baru setiap render |
| 12 | `src/App.tsx` | Re-render | Handler tanpa useCallback |

---

## 🎯 Cara Mendeteksi Bug

### Tools yang bisa digunakan:
1. **React DevTools Profiler** - Lihat komponen mana yang re-render berlebihan
2. **Chrome DevTools Performance** - Lihat main thread blocking
3. **Chrome DevTools Memory** - Deteksi memory leak (heap snapshot)
4. **Console** - Lihat log `[PERF]` dan `[DEBUG]` yang menunjukkan masalah
5. **React DevTools "Highlight updates"** - Lihat komponen yang re-render

### Indikator Bug:
- **Render counter** di header akan naik sangat cepat
- **Console** akan penuh dengan log `[DEBUG] Checking for updates...`
- **Memory usage** akan terus naik seiring waktu
- **Scroll position** di title bar akan flicker
- **Search suggestions** tidak akan muncul saat mengetik

---

## 💡 Tips untuk Memperbaiki

### Memory Leak (Bug #5, #13)
```tsx
// ❌ Salah
useEffect(() => {
  const id = setInterval(() => { ... }, 1000);
}, [deps]);

// ✅ Benar
useEffect(() => {
  const id = setInterval(() => { ... }, 1000);
  return () => clearInterval(id); // Cleanup!
}, [deps]);
```

### Stale Closure (Bug #6)
```tsx
// ❌ Salah - dependency tidak lengkap
useEffect(() => {
  fetchData(searchQuery);
}, []); // Missing searchQuery!

// ✅ Benar
useEffect(() => {
  fetchData(searchQuery);
}, [searchQuery]);
```

### Memoization (Bug #7)
```tsx
// ❌ Salah - dipanggil setiap render
const result = expensiveComputation(data);

// ✅ Benar
const result = useMemo(() => expensiveComputation(data), [data]);
```

### Event Listener Leak (Bug #8, #14)
```tsx
// ❌ Salah
useEffect(() => {
  window.addEventListener('resize', handler);
  // No cleanup!
}, [someDep]);

// ✅ Benar
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []); // Stable dependency
```

### Race Condition (Bug #3)
```tsx
// ❌ Salah - request lama bisa menimpa yang baru
const fetchResults = async (query) => {
  const results = await api.search(query);
  setResults(results); // Bisa stale!
};

// ✅ Benar - gunakan AbortController atau flag
const fetchResults = async (query) => {
  const controller = new AbortController();
  const results = await api.search(query, { signal: controller.signal });
  if (!controller.signal.aborted) {
    setResults(results);
  }
  return () => controller.abort();
};
```

### localStorage Optimization (Bug #9, #10)
```tsx
// ❌ Salah - dibaca setiap render
const [data, setData] = useState(loadFromStorage('key'));
saveToStorage('key', data); // Di luar useEffect!

// ✅ Benar - lazy init + useEffect
const [data, setData] = useState(() => loadFromStorage('key'));
useEffect(() => {
  saveToStorage('key', data);
}, [data]); // Hanya saat data berubah
```

---

## 🏆 Challenge Level

- **Easy**: Bug #9, #10, #11 (localStorage & reference issues)
- **Medium**: Bug #5, #6, #7, #12 (cleanup & memoization)
- **Hard**: Bug #3, #8, #13, #14 (race conditions & complex leaks)
- **Expert**: Bug #1, #2 (optimization & caching strategy)

---

Selamat berburu bug! 🐛🔍
