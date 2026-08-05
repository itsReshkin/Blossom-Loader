/**
 * Aikar's flags — the community-standard G1GC tuning for Minecraft servers.
 * Documented at https://docs.papermc.io/paper/aikars-flags
 *
 * The region sizing differs above 12 GB, where a larger young generation and bigger heap
 * regions pay off; below that the smaller values keep GC pauses shorter.
 */
const LARGE_HEAP_THRESHOLD_GB = 12

const SHARED_FLAGS = [
  '-XX:+UseG1GC',
  '-XX:+ParallelRefProcEnabled',
  '-XX:MaxGCPauseMillis=200',
  '-XX:+UnlockExperimentalVMOptions',
  '-XX:+DisableExplicitGC',
  '-XX:+AlwaysPreTouch',
  '-XX:G1HeapWastePercent=5',
  '-XX:G1MixedGCCountTarget=4',
  '-XX:G1MixedGCLiveThresholdPercent=90',
  '-XX:G1RSetUpdatingPauseTimePercent=5',
  '-XX:SurvivorRatio=32',
  '-XX:+PerfDisableSharedMem',
  '-XX:MaxTenuringThreshold=1',
  '-Dusing.aikars.flags=https://mcflags.emc.gs',
  '-Daikars.new.flags=true'
]

const SMALL_HEAP_FLAGS = [
  '-XX:G1NewSizePercent=30',
  '-XX:G1MaxNewSizePercent=40',
  '-XX:G1HeapRegionSize=8M',
  '-XX:G1ReservePercent=20',
  '-XX:InitiatingHeapOccupancyPercent=15'
]

const LARGE_HEAP_FLAGS = [
  '-XX:G1NewSizePercent=40',
  '-XX:G1MaxNewSizePercent=50',
  '-XX:G1HeapRegionSize=16M',
  '-XX:G1ReservePercent=15',
  '-XX:InitiatingHeapOccupancyPercent=20'
]

export function buildJvmFlags(memoryGB: number): string[] {
  const heapFlags = memoryGB >= LARGE_HEAP_THRESHOLD_GB ? LARGE_HEAP_FLAGS : SMALL_HEAP_FLAGS
  return [`-Xms${memoryGB}G`, `-Xmx${memoryGB}G`, ...SHARED_FLAGS, ...heapFlags]
}
