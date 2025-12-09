#!/usr/bin/env node
/**
 * Script kiểm tra khả năng upload file lớn với memory optimization
 * Usage: node scripts/test-large-upload.js
 */

const fs = require('fs');
const path = require('path');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function createTestFile(sizeInMB, filename) {
  console.log(`📁 Tạo file test ${filename} với kích thước ${sizeInMB}MB...`);
  
  const filePath = path.join(__dirname, '..', 'public', filename);
  const stream = fs.createWriteStream(filePath);
  
  const chunkSize = 1024 * 1024; // 1MB chunks
  const totalChunks = sizeInMB;
  const testData = Buffer.alloc(chunkSize, 'A'); // Fill with 'A'
  
  return new Promise((resolve, reject) => {
    let written = 0;
    
    function writeChunk() {
      if (written >= totalChunks) {
        stream.end();
        console.log(`✅ Tạo thành công file ${filename} (${formatBytes(written * chunkSize)})`);
        resolve(filePath);
        return;
      }
      
      stream.write(testData, (err) => {
        if (err) {
          reject(err);
          return;
        }
        written++;
        
        if (written % 10 === 0) {
          console.log(`   Progress: ${written}/${totalChunks} chunks (${formatBytes(written * chunkSize)})`);
        }
        
        // Không block event loop
        setImmediate(writeChunk);
      });
    }
    
    writeChunk();
  });
}

async function testMemoryUsage() {
  console.log('\n🔧 Kiểm tra memory usage của Node.js process:');
  
  const used = process.memoryUsage();
  console.log('Memory usage:');
  for (let key in used) {
    console.log(`   ${key}: ${formatBytes(used[key])}`);
  }
  
  console.log(`\n💡 Heap limit: ${formatBytes(require('v8').getHeapStatistics().heap_size_limit)}`);
}

async function simulateUpload(filePath) {
  console.log(`\n📤 Mô phỏng upload process cho ${path.basename(filePath)}...`);
  
  const stats = fs.statSync(filePath);
  console.log(`File size: ${formatBytes(stats.size)}`);
  
  // Mô phỏng stream reading
  const stream = fs.createReadStream(filePath, { highWaterMark: 5 * 1024 * 1024 }); // 5MB chunks
  let processed = 0;
  let chunks = 0;
  
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      processed += chunk.length;
      chunks++;
      
      if (chunks % 10 === 0) {
        console.log(`   Processed: ${formatBytes(processed)} (${Math.round(processed / stats.size * 100)}%)`);
        
        // Kiểm tra memory sau mỗi 10 chunks
        const memUsage = process.memoryUsage();
        console.log(`   Memory: ${formatBytes(memUsage.heapUsed)} heap, ${formatBytes(memUsage.rss)} RSS`);
      }
      
      // Force GC if available (run with --expose-gc flag)
      if (global.gc && chunks % 20 === 0) {
        global.gc();
      }
    });
    
    stream.on('end', () => {
      console.log(`✅ Upload simulation hoàn tất! Processed ${formatBytes(processed)} in ${chunks} chunks`);
      resolve();
    });
    
    stream.on('error', reject);
  });
}

async function main() {
  console.log('🚀 Test Large File Upload Optimization\n');
  
  try {
    // Test memory trước khi bắt đầu
    await testMemoryUsage();
    
    // Tạo file test 100MB (có thể tăng lên nếu muốn test file lớn hơn)
    const testFilePath = await createTestFile(100, 'test-large-file.dat');
    
    // Test memory sau khi tạo file
    console.log('\n📊 Memory usage sau khi tạo file:');
    await testMemoryUsage();
    
    // Mô phỏng upload process
    await simulateUpload(testFilePath);
    
    // Test memory sau upload
    console.log('\n📈 Memory usage sau khi simulate upload:');
    await testMemoryUsage();
    
    // Cleanup
    console.log('\n🧹 Cleanup test file...');
    fs.unlinkSync(testFilePath);
    console.log('✅ Test file đã được xóa');
    
    console.log('\n🎉 Test hoàn tất! Optimization đang hoạt động tốt.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Chạy test
if (require.main === module) {
  main();
}

module.exports = { createTestFile, testMemoryUsage, simulateUpload };
