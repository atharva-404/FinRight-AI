/**
 * WebSocket Chat Debugging Utilities
 * 
 * Usage in browser console:
 * - Copy and paste this entire file into browser console, or
 * - Save as debugUtils.js and import in your React app
 * 
 * Then use:
 * wsDebug.connect('ws://localhost:8000/ws/ai/chat/')
 * wsDebug.send('Hello')
 * wsDebug.logs()
 */

const wsDebug = (() => {
  let ws = null;
  let logs = [];
  let stats = {
    messagesSent: 0,
    messagesReceived: 0,
    tokensReceived: 0,
    errorsReceived: 0,
    bytesReceived: 0,
    bytesSent: 0,
    startTime: null,
    endTime: null
  };

  const log = (type, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = {
      timestamp,
      type,
      message,
      data,
      time: new Date()
    };
    logs.push(entry);

    const color = {
      'CONNECT': '#00aa00',
      'DISCONNECT': '#ff0000',
      'SEND': '#0000ff',
      'RECEIVE': '#00aa00',
      'TOKEN': '#00ff00',
      'ERROR': '#ff0000',
      'INFO': '#0080ff',
      'WARNING': '#ff8800'
    }[type] || '#000000';

    console.log(`%c[${timestamp}] [${type}]`, `color: ${color}; font-weight: bold;`, message, data || '');
  };

  const connect = (url, onMessage = null) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      log('WARNING', 'Already connected to WebSocket', ws.url);
      return;
    }

    log('INFO', 'Connecting to WebSocket...', url);
    stats.startTime = new Date();

    ws = new WebSocket(url);

    ws.onopen = () => {
      log('CONNECT', 'WebSocket connection established', { readyState: ws.readyState });
      console.log('%c✅ CONNECTED', 'color: #00aa00; font-weight: bold; font-size: 14px;');
    };

    ws.onmessage = (event) => {
      stats.messagesReceived++;
      stats.bytesReceived += event.data.length;

      try {
        const data = JSON.parse(event.data);
        log('RECEIVE', `Received ${data.type}`, data);

        if (data.type === 'token') {
          stats.tokensReceived++;
          console.log(`%c📝 Token: "${data.text}"`, 'color: #00ff00;');
        } else if (data.type === 'error') {
          stats.errorsReceived++;
          log('ERROR', `Backend error: ${data.error}`, data);
        }

        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        log('ERROR', `Failed to parse message: ${error.message}`, event.data);
      }
    };

    ws.onerror = (error) => {
      log('ERROR', 'WebSocket error', error);
      console.error('%c❌ WEBSOCKET ERROR', 'color: #ff0000; font-weight: bold; font-size: 14px;', error);
    };

    ws.onclose = (event) => {
      stats.endTime = new Date();
      log('DISCONNECT', 'WebSocket connection closed', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      console.log('%c❌ DISCONNECTED', 'color: #ff0000; font-weight: bold; font-size: 14px;');
    };
  };

  const send = (question, documentId = null) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      log('ERROR', 'Cannot send: WebSocket not connected', { readyState: ws?.readyState });
      console.error('❌ WebSocket not connected');
      return false;
    }

    const payload = JSON.stringify({
      question,
      document_id: documentId
    });

    stats.messagesSent++;
    stats.bytesSent += payload.length;

    log('SEND', `Sending message (${payload.length} bytes)`, { question, documentId });

    try {
      ws.send(payload);
      console.log(`%c📤 Sent: "${question}"`, 'color: #0000ff;');
      return true;
    } catch (error) {
      log('ERROR', `Failed to send: ${error.message}`);
      console.error('❌ Send failed:', error);
      return false;
    }
  };

  const disconnect = () => {
    if (ws) {
      log('INFO', 'Disconnecting WebSocket...');
      ws.close();
    } else {
      log('WARNING', 'No WebSocket connection to close');
    }
  };

  const getLogs = (filter = null) => {
    let result = logs;

    if (filter) {
      if (typeof filter === 'string') {
        result = logs.filter(l => l.type === filter);
      } else if (typeof filter === 'function') {
        result = logs.filter(filter);
      }
    }

    return result;
  };

  const printLogs = (filter = null) => {
    const filtered = getLogs(filter);
    console.table(filtered.map(l => ({
      Time: l.timestamp,
      Type: l.type,
      Message: l.message,
      Data: JSON.stringify(l.data)
    })));
  };

  const getStats = () => {
    let duration = 0;
    if (stats.startTime && stats.endTime) {
      duration = (stats.endTime - stats.startTime) / 1000;
    } else if (stats.startTime) {
      duration = (new Date() - stats.startTime) / 1000;
    }

    return {
      ...stats,
      duration: `${duration.toFixed(2)}s`,
      averageLatency: stats.messagesReceived > 0 ? `${(duration / stats.messagesReceived * 1000).toFixed(0)}ms` : 'N/A',
      connection: {
        url: ws?.url || 'Not connected',
        readyState: ws?.readyState === undefined ? 'N/A' : {
          0: 'CONNECTING',
          1: 'OPEN',
          2: 'CLOSING',
          3: 'CLOSED'
        }[ws.readyState]
      }
    };
  };

  const printStats = () => {
    console.log('%c📊 WebSocket Statistics', 'font-weight: bold; font-size: 14px;');
    console.table(getStats());
  };

  const clear = () => {
    logs = [];
    log('INFO', 'Logs cleared');
  };

  const export_ = () => {
    const data = {
      logs,
      stats: getStats(),
      timestamp: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `websocket-debug-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    log('INFO', 'Debug data exported');
  };

  // Quick commands for console
  const help = () => {
    console.log(`
%c🧪 WebSocket Debug Utilities

Usage:
  wsDebug.connect(url)           - Connect to WebSocket
  wsDebug.send(question)          - Send a message
  wsDebug.disconnect()            - Close connection
  wsDebug.logs(filter)            - Get logs (optional filter by type)
  wsDebug.printLogs(filter)       - Print logs in table format
  wsDebug.stats()                 - Get statistics object
  wsDebug.printStats()            - Print stats in table format
  wsDebug.clear()                 - Clear logs
  wsDebug.export()                - Export debug data to JSON file
  wsDebug.help()                  - Show this help

Quick Examples:
  wsDebug.connect('ws://localhost:8000/ws/ai/chat/')
  wsDebug.send('Hello, how are you?')
  wsDebug.printStats()
  wsDebug.printLogs('TOKEN')      // Show only token messages
  wsDebug.export()                // Download debug log

Filter Types:
  'CONNECT', 'DISCONNECT', 'SEND', 'RECEIVE', 'TOKEN', 'ERROR', 'INFO', 'WARNING'

    `, 'color: #0080ff; font-weight: bold;');
  };

  return {
    connect,
    send,
    disconnect,
    logs: getLogs,
    printLogs,
    stats: getStats,
    printStats,
    clear,
    export: export_,
    help,
    // For direct access if needed
    _ws: () => ws,
    _stats: () => stats,
    _logs: () => logs
  };
})();

// Auto-help on load
console.log('%c✨ WebSocket Debug Utils Loaded', 'color: #00aa00; font-weight: bold; font-size: 14px;');
console.log('Type wsDebug.help() for commands');
