import http from 'http';
import { parse } from 'url';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Import Netlify Functions
import { handler as authLoginHandler } from './netlify/functions/auth-login';
import { handler as scanHandler } from './netlify/functions/scan';
import { handler as dashboardHandler } from './netlify/functions/dashboard';
import { handler as studentsHandler } from './netlify/functions/students';
import { handler as studentDetailHandler } from './netlify/functions/student-detail';
import { handler as studentsImportHandler } from './netlify/functions/students-import';
import { handler as mealsHandler } from './netlify/functions/meals';
import { handler as reportsHandler } from './netlify/functions/reports';
import { handler as reportsExportHandler } from './netlify/functions/reports-export';
import { handler as settingsHandler } from './netlify/functions/settings';
import { handler as reseedHandler } from './netlify/functions/reseed';
import { handler as healthHandler } from './netlify/functions/health';

const PORT = Number(process.env.PORT) || 8888;

const server = http.createServer(async (req, res) => {
  const parsedUrl = parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  // Read request body
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    // Determine which function handles this route
    let handlerToCall: any = null;
    const queryParams: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsedUrl.query)) {
      if (typeof v === 'string') queryParams[k] = v;
      else if (Array.isArray(v)) queryParams[k] = v[0];
    }

    if (pathname === '/api/auth/login') {
      handlerToCall = authLoginHandler;
    } else if (pathname === '/api/scan') {
      handlerToCall = scanHandler;
    } else if (pathname === '/api/dashboard') {
      handlerToCall = dashboardHandler;
    } else if (pathname === '/api/students/import') {
      handlerToCall = studentsImportHandler;
    } else if (pathname.match(/^\/api\/students\/(\d+)\/history$/)) {
      const match = pathname.match(/^\/api\/students\/(\d+)\/history$/);
      queryParams.id = match![1];
      queryParams.action = 'history';
      handlerToCall = studentDetailHandler;
    } else if (pathname.match(/^\/api\/students\/(\d+)$/)) {
      const match = pathname.match(/^\/api\/students\/(\d+)$/);
      queryParams.id = match![1];
      handlerToCall = studentDetailHandler;
    } else if (pathname === '/api/students') {
      handlerToCall = studentsHandler;
    } else if (pathname === '/api/meals') {
      handlerToCall = mealsHandler;
    } else if (pathname === '/api/reports/export') {
      handlerToCall = reportsExportHandler;
    } else if (pathname === '/api/reports') {
      handlerToCall = reportsHandler;
    } else if (pathname === '/api/settings/reseed') {
      handlerToCall = reseedHandler;
    } else if (pathname === '/api/settings') {
      handlerToCall = settingsHandler;
    } else if (pathname === '/api/health') {
      handlerToCall = healthHandler;
    }

    if (!handlerToCall) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Not Found: ${pathname}` }));
      return;
    }

    // Build Netlify Event
    const netlifyEvent: any = {
      path: pathname,
      httpMethod: req.method || 'GET',
      headers: req.headers as Record<string, string>,
      queryStringParameters: queryParams,
      body: body || null,
      isBase64Encoded: false
    };

    try {
      const result = await handlerToCall(netlifyEvent, {} as any);
      const headers = {
        'Access-Control-Allow-Origin': '*',
        ...(result.headers || {})
      };
      res.writeHead(result.statusCode || 200, headers);
      res.end(result.body || '');
    } catch (err: any) {
      console.error('[Dev Server Handler Error]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error in Netlify Function handler' }));
    }
  });
});

server.listen(PORT, () => {
  console.log('===============================================================');
  console.log(`⚡ Netlify Functions Local Dev Server running on http://localhost:${PORT}`);
  console.log(`📡 Supabase Endpoint: ${process.env.SUPABASE_URL || '(Not set - provide in .env)'}`);
  console.log('===============================================================');

  // Spawn Vite frontend
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  const clientProcess = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true
  });

  clientProcess.on('error', (err) => {
    console.error('Failed to start client process:', err);
  });

  const cleanup = () => {
    clientProcess.kill();
    server.close();
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
});
