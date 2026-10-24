#!/usr/bin/env node
/**
 * Run all migrations in order.
 * Usage: node scripts/run-migrations.js
 */
var pg = require('/app/node_modules/pg');
var fs = require('fs');
var path = require('path');

var pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

var migrations = [
  '/app/migrations/001_jobs.sql',
  '/app/migrations/002_users.sql',
  '/app/migrations/002b_subscription_payments.sql',
  '/app/migrations/003_security_hardening.sql',
];

async function run() {
  for (var i = 0; i < migrations.length; i++) {
    var file = migrations[i];
    var name = path.basename(file);
    try {
      var sql = fs.readFileSync(file, 'utf8');
      await pool.query(sql);
      console.log('OK: ' + name);
    } catch (e) {
      console.log('ERR ' + name + ': ' + e.message);
    }
  }
  process.exit(0);
}

run();
