---
name: system-monitor
description: Monitoruje zasoby systemowe — CPU, RAM, GPU, dysk, procesy
trigger: cpu, ram, dysk, gpu, procesy, zasoby, zużycie, monitor, temperatura, vram, pamięć
---

## System Monitor

Użyj narzędzia `shell` aby pobrać dane systemowe.

### Windows (PowerShell)

```powershell
# CPU
Get-WmiObject Win32_Processor | Select Name, LoadPercentage

# RAM
$ram = Get-WmiObject Win32_OperatingSystem
"RAM: $([math]::Round($ram.FreePhysicalMemory/1MB,1)) GB free / $([math]::Round($ram.TotalVisibleMemorySize/1MB,1)) GB total"

# Dysk
Get-PSDrive -PSProvider FileSystem | Select Name, @{N='Used(GB)';E={[math]::Round($_.Used/1GB,1)}}, @{N='Free(GB)';E={[math]::Round($_.Free/1GB,1)}}

# Top procesy RAM
Get-Process | Sort WS -Descending | Select -First 10 Name, @{N='RAM(MB)';E={[math]::Round($_.WS/1MB,1)}}

# GPU (NVIDIA)
nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader
```

Przedstaw wyniki w czytelnej tabeli. Zwróć uwagę na niepokojące wartości (>90% CPU/RAM, wysoka temperatura).
