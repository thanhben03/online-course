#!/usr/bin/env node

// Script kiểm tra tình trạng server trong quá trình upload file lớn
// Sử dụng: node scripts/monitor-upload-health.js

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Upload Health Monitor Starting...\n');

// Kiểm tra memory usage của Node.js process
function checkNodeMemory() {
  const used = process.memoryUsage();
  const stats = {};
  
  for (let key in used) {
    stats[key] = `${Math.round(used[key] / 1024 / 1024 * 100) / 100}MB`;
  }
  
  return stats;
}

// Kiểm tra system memory
function checkSystemMemory() {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      // Windows
      exec('wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value', (error, stdout) => {
        if (error) {
          resolve({ error: 'Cannot get system memory info' });
          return;
        }
        
        const lines = stdout.split('\n');
        let total = 0, free = 0;
        
        lines.forEach(line => {
          if (line.includes('TotalVisibleMemorySize=')) {
            total = parseInt(line.split('=')[1]) * 1024; // Convert KB to bytes
          }
          if (line.includes('FreePhysicalMemory=')) {
            free = parseInt(line.split('=')[1]) * 1024; // Convert KB to bytes
          }
        });
        
        resolve({
          total: `${Math.round(total / 1024 / 1024 / 1024 * 100) / 100}GB`,
          free: `${Math.round(free / 1024 / 1024 / 1024 * 100) / 100}GB`,
          used: `${Math.round((total - free) / 1024 / 1024 / 1024 * 100) / 100}GB`,
          usage: `${Math.round((total - free) / total * 100)}%`
        });
      });
    } else {
      // Linux/macOS
      exec('free -b', (error, stdout) => {
        if (error) {
          resolve({ error: 'Cannot get system memory info' });
          return;
        }
        
        const lines = stdout.split('\n');
        const memLine = lines[1].split(/\s+/);
        const total = parseInt(memLine[1]);
        const used = parseInt(memLine[2]);
        const free = parseInt(memLine[3]);
        
        resolve({
          total: `${Math.round(total / 1024 / 1024 / 1024 * 100) / 100}GB`,
          free: `${Math.round(free / 1024 / 1024 / 1024 * 100) / 100}GB`,
          used: `${Math.round(used / 1024 / 1024 / 1024 * 100) / 100}GB`,
          usage: `${Math.round(used / total * 100)}%`
        });
      });
    }
  });
}

// Kiểm tra Node.js processes
function checkNodeProcesses() {
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32' 
      ? 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV'
      : 'ps aux | grep node';
      
    exec(cmd, (error, stdout) => {
      if (error) {
        resolve({ error: 'Cannot get process info' });
        return;
      }
      
      if (process.platform === 'win32') {
        const lines = stdout.split('\n').filter(line => line.includes('node.exe'));
        resolve({ count: lines.length - 1, processes: lines.slice(1) });
      } else {
        const lines = stdout.split('\n').filter(line => line.includes('node') && !line.includes('grep'));
        resolve({ count: lines.length, processes: lines });
      }
    });
  });
}

// Kiểm tra disk space
function checkDiskSpace() {
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32'
      ? 'dir /-c'
      : 'df -h .';
      
    exec(cmd, (error, stdout) => {
      if (error) {
        resolve({ error: 'Cannot get disk info' });
        return;
      }
      
      resolve({ output: stdout.split('\n').slice(-5) });
    });
  });
}

// Kiểm tra Next.js server status
function checkNextJSServer() {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      timeout: 5000
    }, (res) => {
      resolve({ 
        status: 'running', 
        statusCode: res.statusCode,
        headers: res.headers 
      });
    });
    
    req.on('error', () => {
      resolve({ status: 'not running' });
    });
    
    req.on('timeout', () => {
      resolve({ status: 'timeout' });
    });
    
    req.end();
  });
}

// Main monitoring function
async function runHealthCheck() {
  console.log('📊 Health Check Results:');
  console.log('========================\n');
  
  // Node.js Memory
  console.log('🔧 Node.js Process Memory:');
  const nodeMemory = checkNodeMemory();
  Object.keys(nodeMemory).forEach(key => {
    console.log(`   ${key}: ${nodeMemory[key]}`);
  });
  console.log();
  
  // System Memory
  console.log('💾 System Memory:');
  const systemMemory = await checkSystemMemory();
  if (systemMemory.error) {
    console.log(`   Error: ${systemMemory.error}`);
  } else {
    console.log(`   Total: ${systemMemory.total}`);
    console.log(`   Used: ${systemMemory.used} (${systemMemory.usage})`);
    console.log(`   Free: ${systemMemory.free}`);
  }
  console.log();
  
  // Node Processes
  console.log('⚡ Node.js Processes:');
  const nodeProcesses = await checkNodeProcesses();
  if (nodeProcesses.error) {
    console.log(`   Error: ${nodeProcesses.error}`);
  } else {
    console.log(`   Count: ${nodeProcesses.count}`);
    if (nodeProcesses.count > 0) {
      console.log('   Processes:');
      nodeProcesses.processes.slice(0, 3).forEach(proc => {
        console.log(`     ${proc.trim()}`);
      });
    }
  }
  console.log();
  
  // Next.js Server
  console.log('🚀 Next.js Server:');
  const serverStatus = await checkNextJSServer();
  console.log(`   Status: ${serverStatus.status}`);
  if (serverStatus.statusCode) {
    console.log(`   HTTP Status: ${serverStatus.statusCode}`);
  }
  console.log();
  
  // Disk Space
  console.log('💿 Disk Space:');
  const diskSpace = await checkDiskSpace();
  if (diskSpace.error) {
    console.log(`   Error: ${diskSpace.error}`);
  } else {
    diskSpace.output.forEach(line => {
      if (line.trim()) {
        console.log(`   ${line.trim()}`);
      }
    });
  }
  console.log();
  
  // Recommendations
  console.log('💡 Recommendations:');
  console.log('==================');
  
  const heapUsedMB = parseFloat(nodeMemory.heapUsed);
  if (heapUsedMB > 400) {
    console.log('🔴 CRITICAL: Node.js heap usage > 400MB - consider restart');
  } else if (heapUsedMB > 300) {
    console.log('🟡 WARNING: Node.js heap usage > 300MB - monitor closely');
  } else {
    console.log('🟢 OK: Node.js memory usage is healthy');
  }
  
  if (systemMemory.usage && parseInt(systemMemory.usage) > 85) {
    console.log('🔴 CRITICAL: System memory usage > 85% - free up memory');
  } else if (systemMemory.usage && parseInt(systemMemory.usage) > 75) {
    console.log('🟡 WARNING: System memory usage > 75% - monitor closely');
  } else {
    console.log('🟢 OK: System memory usage is healthy');
  }
  
  if (serverStatus.status !== 'running') {
    console.log('🔴 CRITICAL: Next.js server is not responding');
  } else {
    console.log('🟢 OK: Next.js server is running');
  }
  
  console.log('\n💻 To fix memory issues:');
  console.log('   1. Restart server: npm run dev:ultra-safe');
  console.log('   2. Use smaller files: < 500MB');
  console.log('   3. Upload one file at a time');
  console.log('   4. Clear browser cache');
  console.log('\n📈 Monitor during upload:');
  console.log('   watch -n 1 "node scripts/monitor-upload-health.js"');
}

// Auto-refresh mode
if (process.argv.includes('--watch')) {
  console.log('👀 Auto-refresh mode enabled (every 5 seconds)');
  console.log('Press Ctrl+C to stop\n');
  
  setInterval(async () => {
    console.clear();
    console.log(`🕐 ${new Date().toLocaleTimeString()} - Upload Health Monitor\n`);
    await runHealthCheck();
  }, 5000);
} else {
  runHealthCheck();
}
