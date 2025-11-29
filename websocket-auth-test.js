/**
 * WebSocket Authentication Test
 * Run this in browser console after logging in
 */

console.log('🔐 WebSocket Authentication Test\n');

// 1. Check if token exists
console.log('Step 1: Checking token...');
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (token) {
  console.log('✅ Token found:', token.substring(0, 20) + '...');
} else {
  console.error('❌ No token found in localStorage or sessionStorage');
  console.error('   Make sure you are logged in first');
}

// 2. Check WebSocket URL
console.log('\nStep 2: Building WebSocket URL...');
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const urlParams = token ? `?token=${token}` : '';
const wsUrl = `${protocol}//localhost:8000/ws/ai/chat/${urlParams}`;
console.log('WebSocket URL:', wsUrl);

// 3. Test connection
console.log('\nStep 3: Testing WebSocket connection...');
const ws = new WebSocket(wsUrl);

ws.addEventListener('open', () => {
  console.log('✅ WebSocket connected successfully');
  console.log('   Code 1000: Normal connection accepted');
  
  // 4. Send test message
  console.log('\nStep 4: Sending test message...');
  const testPayload = {
    question: 'Hello, can you help me?',
    document_id: null
  };
  console.log('Payload:', testPayload);
  ws.send(JSON.stringify(testPayload));
});

ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('\n✅ Message received:', data);
  
  if (data.type === 'token') {
    console.log('   Token: "' + data.text + '"');
  } else if (data.type === 'done') {
    console.log('   ✅ Response complete');
    ws.close();
  } else if (data.type === 'error') {
    console.error('   ❌ Error:', data.error);
    ws.close();
  }
});

ws.addEventListener('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

ws.addEventListener('close', (event) => {
  if (event.code === 1000) {
    console.log('✅ Connection closed normally (code 1000)');
  } else if (event.code === 4001) {
    console.error('❌ Connection rejected - Authentication failed (code 4001)');
    console.error('   Possible causes:');
    console.error('   1. Token is invalid or expired');
    console.error('   2. User not found in database');
    console.error('   3. Token not passed in query string');
  } else {
    console.error('❌ Connection closed with code:', event.code, event.reason);
  }
});

console.log('\n📊 Waiting for response... (watch console for updates)');
