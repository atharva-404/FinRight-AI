#!/usr/bin/env node

/**
 * WebSocket Chat Test Suite
 * Run from: node test-websocket.js
 * 
 * Tests WebSocket connectivity and messaging
 */

const WebSocket = require('ws');

const BACKEND_URL = process.env.BACKEND_URL || 'ws://localhost:8000/ws/ai/chat/';
const TEST_TIMEOUT = 10000; // 10 seconds

console.log('🧪 WebSocket Chat Test Suite');
console.log('=============================\n');

// Test 1: Connection
async function testConnection() {
  return new Promise((resolve, reject) => {
    console.log('Test 1: WebSocket Connection');
    console.log('Connecting to:', BACKEND_URL);

    const ws = new WebSocket(BACKEND_URL);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Connection timeout'));
    }, TEST_TIMEOUT);

    ws.onopen = () => {
      clearTimeout(timeout);
      console.log('✅ Connection successful');
      ws.close();
      resolve();
    };

    ws.onerror = (error) => {
      clearTimeout(timeout);
      reject(error);
    };
  });
}

// Test 2: Message Sending and Receiving
async function testMessaging() {
  return new Promise((resolve, reject) => {
    console.log('\nTest 2: Send Message & Receive Response');

    const ws = new WebSocket(BACKEND_URL);
    let receivedTokens = [];
    let isComplete = false;

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Message timeout - no response received'));
    }, TEST_TIMEOUT);

    ws.onopen = () => {
      console.log('✅ Connected');
      console.log('📤 Sending test question...');

      const testMessage = {
        question: 'What is your purpose?',
        document_id: null
      };

      ws.send(JSON.stringify(testMessage));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received:', data.type);

        switch (data.type) {
          case 'typing':
            if (data.status === 'start') {
              console.log('  ⌨️ AI typing started');
            } else if (data.status === 'stop') {
              console.log('  ⏹️ AI typing stopped');
            }
            break;

          case 'token':
            receivedTokens.push(data.text);
            console.log(`  📝 Token: "${data.text}"`);
            break;

          case 'done':
            isComplete = true;
            console.log('✅ Response complete');
            console.log(`  📊 Total tokens: ${receivedTokens.length}`);
            console.log(`  ✍️ Full response: ${data.complete}`);
            clearTimeout(timeout);
            ws.close();
            resolve();
            break;

          case 'error':
            throw new Error(data.error);
        }
      } catch (error) {
        clearTimeout(timeout);
        ws.close();
        reject(error);
      }
    };

    ws.onerror = (error) => {
      clearTimeout(timeout);
      reject(error);
    };
  });
}

// Test 3: Connection Status
async function testConnectionStatus() {
  return new Promise((resolve, reject) => {
    console.log('\nTest 3: Connection State Management');

    const ws = new WebSocket(BACKEND_URL);
    const states = [];

    ws.onopen = () => {
      states.push('OPEN');
      console.log('✅ State: OPEN');

      // Simulate sending before closing
      setTimeout(() => {
        console.log('📤 Sending final message...');
        ws.send(JSON.stringify({
          question: 'Goodbye',
          document_id: null
        }));
      }, 500);
    };

    ws.onclose = () => {
      states.push('CLOSED');
      console.log('✅ State: CLOSED');
      console.log(`  State sequence: ${states.join(' → ')}`);
      resolve();
    };

    ws.onerror = (error) => {
      reject(error);
    };

    // Close after 2 seconds
    setTimeout(() => {
      ws.close();
    }, 2000);
  });
}

// Test 4: Error Handling
async function testErrorHandling() {
  return new Promise((resolve, reject) => {
    console.log('\nTest 4: Error Handling');

    const ws = new WebSocket(BACKEND_URL);
    let errorReceived = false;

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Error test timeout'));
    }, TEST_TIMEOUT);

    ws.onopen = () => {
      console.log('✅ Connected');
      console.log('📤 Sending invalid message (empty question)...');

      // Send invalid message
      ws.send(JSON.stringify({
        question: '',  // Invalid - empty question
        document_id: null
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'error') {
          errorReceived = true;
          console.log('✅ Error received as expected:', data.error);
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      } catch (error) {
        clearTimeout(timeout);
        ws.close();
        reject(error);
      }
    };

    ws.onerror = (error) => {
      clearTimeout(timeout);
      reject(error);
    };
  });
}

// Run all tests
async function runAllTests() {
  const tests = [
    { name: 'Connection', fn: testConnection },
    { name: 'Messaging', fn: testMessaging },
    { name: 'Connection Status', fn: testConnectionStatus },
    { name: 'Error Handling', fn: testErrorHandling }
  ];

  const results = [];

  for (const test of tests) {
    try {
      await test.fn();
      results.push({ name: test.name, status: 'PASS' });
    } catch (error) {
      results.push({ name: test.name, status: 'FAIL', error: error.message });
    }
  }

  // Print summary
  console.log('\n=============================');
  console.log('📊 Test Summary');
  console.log('=============================\n');

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    if (result.status === 'PASS') {
      console.log(`✅ ${result.name}: PASS`);
      passed++;
    } else {
      console.log(`❌ ${result.name}: FAIL`);
      console.log(`   Error: ${result.error}`);
      failed++;
    }
  }

  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${Math.round((passed / results.length) * 100)}%`);

  process.exit(failed > 0 ? 1 : 0);
}

// Main execution
console.log(`Testing WebSocket at: ${BACKEND_URL}\n`);

runAllTests().catch((error) => {
  console.error('❌ Test suite error:', error.message);
  process.exit(1);
});
