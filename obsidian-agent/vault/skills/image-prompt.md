---
name: image-prompt
description: Generuje profesjonalne prompty do AI image generation na podstawie zdjęcia
trigger: prompt do zdjęcia, image prompt, midjourney, dall-e, stable diffusion, comfyui, prompt generatywny
---

## Image Prompt Generator

Gdy użytkownik wgra zdjęcie i poprosi o prompt:

1. Przeanalizuj obraz szczegółowo:
   - Główny motyw i kompozycja
   - Styl, oświetlenie, kolory
   - Nastrój i atmosfera
   - Tło i detale

2. Wygeneruj 3 warianty promptu:

### 🎨 Midjourney / DALL-E 3
```
[opis główny], [styl artystyczny], [oświetlenie], [kolory], [nastrój], 
[kamera/obiektyw], high quality, detailed, 8k
```

### 🖼️ Stable Diffusion / ComfyUI
```
(masterpiece:1.2), (best quality:1.2), [opis], [styl], [oświetlenie],
[kolory], [nastrój], highly detailed, sharp focus
Negative: blurry, low quality, deformed, ugly
```

### 📝 Prosty (uniwersalny)
```
[opis w 1-2 zdaniach]
```

Wszystkie prompty po polsku i angielsku.
