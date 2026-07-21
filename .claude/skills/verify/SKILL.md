---
name: verify
description: TimeUmre (Ionic/Angular) değişikliklerini çalışan uygulamada doğrulama reçetesi — dev server + Playwright ile sürme.
---

# TimeUmre doğrulama

## Build / çalıştırma

- Prod derleme kontrolü: `npx ng build --configuration production` (~10 sn).
  Önceden var olan uyarılar: stencil `empty-glob` ve landing.page.html'de NG8107 — bunlar FAIL değildir.
- Dev server: `npx ng serve --port 4299` (arka planda, ~30-60 sn'de hazır; çıktıda `Local: http://localhost:4299/` bekle).

## Sürme (Playwright)

- Playwright projede kurulu (`node_modules/playwright`, chromium indirilmiş). Scratchpad'den script çalıştırırken
  `require('c:/Users/Administrator/Desktop/TimeUmre/node_modules/playwright')` ile mutlak yoldan yükle.
- **Gotcha:** `page.mouse.wheel` öncesi `page.mouse.move(640, 500)` şart — fare (0,0)'da kalırsa wheel,
  üstteki fixed premium header'a gider ve `ion-content` hiç kaymaz.
- `ion-content` shadow DOM'da kayar: scrollTop'u `content.shadowRoot.querySelector('.inner-scroll').scrollTop`
  ile oku; programatik kaydırma için `content.scrollToPoint(0, y, ms)`.
- Global header scroll'u `document` üzerindeki `ionScroll` custom event'i ile dinler (sayfalarda `[scrollEvents]="true"` gerekir).
- **Gotcha:** Playwright'ta bir konumdaki ilk sentetik `mouse.wheel` gesture kurulumu yüzünden hep düşer
  (scrollTop ilerlemez) — bu uygulama hatası değildir; ölçümde ilk örneği yok say.
- Landing kartlarında hover `scale(1.08)` var; scroll sırasında `app-landing` host'una `nf-scrolling`
  class'ı eklenip bu efekt kapatılır (landing.page.ts) — bu class scroll bitiminden ~140ms sonra kalkar.

## Sürülmeye değer akışlar

- `/` (landing, fullscreen hero), `/lokasyonlar` (fullscreen olmayan liste), `/umrah-routes` (kısa sayfa — header gizlenmemeli).
- Header yalnızca sayfa en tepedeyken (scrollTop ≤ 60) görünür; aşağıda `.ph-header--hidden` alır ve
  ortada yukarı kaydırmak onu geri getirmez — sadece en tepeye dönünce görünür.
  Yerleşim değişmezleri: `ion-router-outlet` computed `top` her zaman `0px`; `.inner-scroll` padding-top
  `var(--app-header-height)` (desktop 80px / ≤640px 64px) sabit kalmalı — bunlar oynarsa scroll titremesi geri gelmiş demektir.
