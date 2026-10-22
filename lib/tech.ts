import type { Project, TechKey } from './types.ts';

export type TechFieldKey = TechKey | 'other';

export interface TechField {
  key: TechFieldKey;
  label: string;
  short: string;
  placeholder: string;
  suggest: string[];
}

export const TECH_FIELDS: TechField[] = [
  { key: 'framework', label: 'Framework', short: 'FW', placeholder: 'e.g. Next.js, Laravel, Flutter',
    suggest: ['Next.js', 'Nuxt', 'SvelteKit', 'Remix', 'Astro', 'Vite', 'React', 'Vue', 'Angular', 'Svelte', 'Laravel', 'CodeIgniter', 'Symfony', 'Django', 'Flask', 'FastAPI', 'Ruby on Rails', 'Express', 'NestJS', 'Spring Boot', 'ASP.NET Core', 'Flutter', 'React Native', 'Expo', 'Ionic', 'Capacitor', 'Electron', 'Tauri', 'Gatsby', 'WordPress'] },
  { key: 'frontend', label: 'Frontend', short: 'FE', placeholder: 'e.g. React, Tailwind CSS',
    suggest: ['HTML/CSS', 'JavaScript', 'TypeScript', 'Vanilla JS', 'React', 'Vue', 'Angular', 'Svelte', 'SolidJS', 'Alpine.js', 'jQuery', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Chakra UI', 'shadcn/ui', 'DaisyUI', 'Sass', 'Blade', 'Livewire', 'Inertia.js', 'Flutter', 'React Native', 'Kotlin', 'Swift'] },
  { key: 'backend', label: 'Backend', short: 'BE', placeholder: 'e.g. Node.js, Firebase',
    suggest: ['Node.js', 'Express', 'NestJS', 'PHP', 'Laravel', 'Python', 'Django', 'Flask', 'FastAPI', 'Go', 'Java', 'Spring Boot', 'C# / .NET', 'Ruby on Rails', 'Firebase', 'Supabase', 'Appwrite', 'PocketBase', 'Convex', 'Cloudflare Workers', 'AWS Lambda', 'Serverless', 'GraphQL', 'REST API', 'None (static)'] },
  { key: 'database', label: 'Database', short: 'DB', placeholder: 'e.g. MySQL, Firestore',
    suggest: ['MySQL', 'PostgreSQL', 'SQLite', 'MariaDB', 'MongoDB', 'Firestore', 'Firebase Realtime DB', 'Supabase', 'Redis', 'SQL Server', 'DynamoDB', 'PlanetScale', 'Neon', 'Turso', 'localStorage', 'IndexedDB', 'Google Sheets'] },
  { key: 'hosting', label: 'Hosting', short: 'HOST', placeholder: 'e.g. Vercel, GitHub Pages',
    suggest: ['GitHub Pages', 'Vercel', 'Netlify', 'Firebase Hosting', 'Cloudflare Pages', 'Render', 'Railway', 'Fly.io', 'Heroku', 'AWS', 'Google Cloud', 'Azure', 'DigitalOcean', 'Hostinger', 'cPanel', 'Play Store', 'App Store'] },
  { key: 'other', label: 'Other tools', short: '+', placeholder: 'e.g. Stripe, OpenAI',
    suggest: ['PWA', 'Stripe', 'PayMongo', 'GCash', 'PayPal', 'Xendit', 'OpenAI', 'Claude API', 'Gemini API', 'Google Maps', 'Twilio', 'Semaphore SMS', 'Resend', 'SendGrid', 'Cloudinary', 'Firebase Auth', 'Clerk', 'Auth0', 'Docker', 'GitHub Actions', 'Figma', 'Chart.js'] }
];

export type FormTech = Record<TechFieldKey, string[]>;

export function projectTech(project: Project): FormTech {
  return {
    framework: [...project.tech.framework],
    frontend: [...project.tech.frontend],
    backend: [...project.tech.backend],
    database: [...project.tech.database],
    hosting: [...project.tech.hosting],
    other: [...project.stack]
  };
}

export function emptyTech(): FormTech {
  return { framework: [], frontend: [], backend: [], database: [], hosting: [], other: [] };
}

export function allTech(project: Project) {
  const tech = projectTech(project);
  return TECH_FIELDS.flatMap(f => tech[f.key].map(value => ({ key: f.key, label: f.label, short: f.short, value })));
}

// Suggestions: the built-in list plus anything already used in your other apps.
export function techSuggestions(key: TechFieldKey, query: string, taken: string[], projects: Project[]): string[] {
  const field = TECH_FIELDS.find(f => f.key === key)!;
  const used = projects.flatMap(p => projectTech(p)[key]);
  const pool = [...new Set([...field.suggest, ...used])];
  const takenLower = taken.map(v => v.toLowerCase());
  const q = query.trim().toLowerCase();
  return pool
    .filter(v => !takenLower.includes(v.toLowerCase()))
    .filter(v => !q || v.toLowerCase().includes(q))
    .sort((a, b) => {
      if (!q) return 0;
      const as = a.toLowerCase().startsWith(q), bs = b.toLowerCase().startsWith(q);
      return as === bs ? 0 : as ? -1 : 1;
    })
    .slice(0, 8);
}

export function addTechValue(list: string[], raw: string): string[] {
  const value = raw.replace(/,+$/, '').trim().slice(0, 60);
  if (!value || list.some(v => v.toLowerCase() === value.toLowerCase())) return list;
  return [...list, value];
}
