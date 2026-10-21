import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractLogins, isBackup, parseIdeas, parseLogins, safeUrl, sanitizeBoard } from '../lib/sanitize.ts';
import { findProjectForRepo, mergeRepo, projectFromRepo, summarizeRepo } from '../lib/github.ts';
import { addTechValue, techSuggestions } from '../lib/tech.ts';

test('safeUrl only lets http(s) links through', () => {
  assert.equal(safeUrl('https://myapp.com'), 'https://myapp.com/');
  assert.equal(safeUrl('myapp.com/path'), 'https://myapp.com/path');
  assert.equal(safeUrl('http://localhost:3000'), 'http://localhost:3000/');
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('JaVaScRiPt:alert(1)'), '');
  assert.equal(safeUrl(' javascript:alert(1)'), '');
  assert.equal(safeUrl('data:text/html,<script>alert(1)</script>'), '');
  assert.equal(safeUrl('vbscript:x'), '');
  assert.equal(safeUrl('notaurl'), '');
  assert.equal(safeUrl(42), '');
});

test('sanitizeBoard cleans a hostile backup', () => {
  const board = sanitizeBoard({
    projects: [
      {
        id: "x'); alert(1); ('",
        name: '<img src=x onerror=alert(1)>',
        stage: 'Hacked',
        liveUrl: 'javascript:alert(document.cookie)',
        repoUrl: 'https://github.com/a/b',
        manualProgress: 500,
        milestones: [{ id: 'ok', text: 'Ship it', completed: 'yes' }, { text: '' }],
        tech: { framework: ['Next.js', 'next.js', 7] },
        stack: 'not an array'
      },
      { id: 'dup', name: 'A' },
      { id: 'dup', name: 'B' }
    ],
    notes: [{ id: 'n1', text: 'Idea', color: 99 }, 'junk']
  });
  const [p, a, b] = board.projects;
  assert.match(p.id, /^proj_[a-f0-9]{16}$/);
  assert.equal(p.name, '<img src=x onerror=alert(1)>'); // kept as text; React escapes it
  assert.equal(p.stage, 'Idea');
  assert.equal(p.liveUrl, '');
  assert.equal(p.repoUrl, 'https://github.com/a/b');
  assert.equal(p.manualProgress, 100);
  assert.deepEqual(p.milestones.map(m => [m.text, m.completed]), [['Ship it', false]]);
  assert.deepEqual(p.tech.framework, ['Next.js']);
  assert.deepEqual(p.stack, []);
  assert.equal(a.id, 'dup');
  assert.notEqual(b.id, 'dup');
  assert.equal(board.notes.length, 2);
  assert.equal(board.notes[0].color, 4);
});

test('old array backups still import, and logins come out separately', () => {
  const raw = [{ id: 'proj_001', name: 'My App', stage: 'MVP', logins: [{ id: 'l1', username: 'admin@x.local', role: 'Admin', password: 'pw' }] }];
  assert.ok(isBackup(raw));
  assert.ok(!isBackup({ hello: 1 }));
  const board = sanitizeBoard(raw);
  assert.equal(board.projects[0].stage, 'MVP');
  assert.ok(!('logins' in board.projects[0]));
  const logins = extractLogins(raw, board);
  assert.deepEqual(Object.keys(logins), ['proj_001']);
  assert.equal(logins.proj_001[0].username, 'admin@x.local');
});

test('parseIdeas and parseLogins handle pasted lists', () => {
  assert.deepEqual(parseIdeas('IPON CHECKLIST\n\nEVENT TRACKER|\n  DORM APP '), ['IPON CHECKLIST', 'EVENT TRACKER', 'DORM APP']);
  const { logins, password } = parseLogins('admin@a.local    Admin\nuser@a.local\tStudent\nsecret123', '');
  assert.equal(password, 'secret123');
  assert.deepEqual(logins.map(l => [l.username, l.role, l.password]), [
    ['admin@a.local', 'Admin', 'secret123'],
    ['user@a.local', 'Student', 'secret123']
  ]);
});

test('GitHub repos become cards and sync without overwriting your edits', () => {
  const repo = summarizeRepo({ full_name: 'alpize/pest-patrol', name: 'pest-patrol', description: 'Pest app', homepage: 'javascript:alert(1)', html_url: 'https://github.com/alpize/pest-patrol', language: 'TypeScript', private: true, pushed_at: '2026-10-20T00:00:00Z' })!;
  assert.equal(repo.homepage, '');
  const card = projectFromRepo(repo);
  assert.equal(card.name, 'Pest Patrol');
  assert.deepEqual(card.tech.frontend, ['TypeScript']);
  assert.equal(card.github?.private, true);
  assert.equal(summarizeRepo({ full_name: '../evil' }), null);

  const edited = { ...card, desc: 'My own tagline', github: null };
  assert.equal(findProjectForRepo([edited], repo)?.id, card.id);
  const merged = mergeRepo(edited, { ...repo, homepage: 'https://pest.app/' });
  assert.equal(merged.desc, 'My own tagline');
  assert.equal(merged.liveUrl, 'https://pest.app/');
});

test('tech suggestions rank prefix matches first and skip ones already added', () => {
  assert.deepEqual(addTechValue(['React'], 'react'), ['React']);
  assert.deepEqual(addTechValue([], 'Vue,'), ['Vue']);
  const s = techSuggestions('framework', 'ne', ['Next.js'], []);
  assert.ok(!s.includes('Next.js'));
  assert.equal(s[0], 'NestJS');
});
