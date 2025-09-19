// lib/middleware/memoryMonitor.ts
// Memory monitor và auto cleanup cho upload files lớn

export interface MemoryStats {
  rss: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
}

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private warningThreshold = 400; // 400MB warning
  private criticalThreshold = 450; // 450MB critical
  private lastCleanup = 0;
  private cleanupInterval = 5000; // 5 giây

  private constructor() {}

  public static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  public getMemoryStats(): MemoryStats {
    const usage = process.memoryUsage();
    return {
      rss: usage.rss,
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
      rssMB: Math.round(usage.rss / 1024 / 1024 * 100) / 100,
    };
  }

  public checkMemoryAndCleanup(): { shouldCleanup: boolean; stats: MemoryStats; level: 'normal' | 'warning' | 'critical' } {
    const stats = this.getMemoryStats();
    const now = Date.now();

    let level: 'normal' | 'warning' | 'critical' = 'normal';
    let shouldCleanup = false;

    if (stats.heapUsedMB >= this.criticalThreshold) {
      level = 'critical';
      shouldCleanup = true;
    } else if (stats.heapUsedMB >= this.warningThreshold) {
      level = 'warning';
      // Cleanup only if enough time has passed
      shouldCleanup = now - this.lastCleanup > this.cleanupInterval;
    }

    if (shouldCleanup) {
      this.forceGarbageCollection();
      this.lastCleanup = now;
    }

    return { shouldCleanup, stats, level };
  }

  public forceGarbageCollection(): boolean {
    try {
      if (global.gc) {
        console.log('[Memory] Forcing garbage collection...');
        global.gc();
        
        // Thêm delay để system có thời gian cleanup
        setImmediate(() => {
          if (global.gc) {
            global.gc();
          }
        });
        
        return true;
      } else {
        console.warn('[Memory] Garbage collection not exposed. Run with --expose-gc flag.');
        return false;
      }
    } catch (error) {
      console.error('[Memory] Error during garbage collection:', error);
      return false;
    }
  }

  public logMemoryStatus(context = ''): void {
    const { stats, level } = this.checkMemoryAndCleanup();
    
    const prefix = context ? `[${context}]` : '[Memory]';
    const emoji = level === 'critical' ? '🔴' : level === 'warning' ? '🟡' : '🟢';
    
    console.log(`${prefix} ${emoji} Heap: ${stats.heapUsedMB}MB/${stats.heapTotalMB}MB | RSS: ${stats.rssMB}MB | Level: ${level.toUpperCase()}`);
    
    if (level === 'critical') {
      console.warn(`${prefix} ⚠️  CRITICAL: Memory usage is very high! Consider reducing chunk size or restarting.`);
    }
  }

  public async safeMemoryOperation<T>(
    operation: () => Promise<T>,
    operationName = 'Unknown'
  ): Promise<T> {
    const startStats = this.getMemoryStats();
    this.logMemoryStatus(`${operationName} Start`);
    
    try {
      const result = await operation();
      
      const endStats = this.getMemoryStats();
      const memoryDiff = endStats.heapUsedMB - startStats.heapUsedMB;
      
      console.log(`[${operationName}] Memory diff: ${memoryDiff > 0 ? '+' : ''}${memoryDiff}MB`);
      this.logMemoryStatus(`${operationName} End`);
      
      // Auto cleanup if memory increased significantly
      if (memoryDiff > 10) {
        this.checkMemoryAndCleanup();
      }
      
      return result;
    } catch (error) {
      this.logMemoryStatus(`${operationName} Error`);
      this.forceGarbageCollection();
      throw error;
    }
  }
}

// Singleton instance
export const memoryMonitor = MemoryMonitor.getInstance();

// Helper function để sử dụng trong API routes
export const withMemoryMonitoring = <T>(
  operation: () => Promise<T>,
  operationName = 'API Operation'
): Promise<T> => {
  return memoryMonitor.safeMemoryOperation(operation, operationName);
};

// Memory-safe sleep function
export const memorySafeSleep = (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setImmediate(() => {
      setTimeout(() => {
        // Force một lần GC trước khi tiếp tục
        if (global.gc && Math.random() < 0.1) { // 10% chance để avoid spam
          global.gc();
        }
        resolve();
      }, ms);
    });
  });
};
