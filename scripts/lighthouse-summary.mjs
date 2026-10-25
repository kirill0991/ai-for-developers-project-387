// Turns a Lighthouse JSON report into a short Markdown summary for the scheduled agent:
// the full report is several hundred KB, far too much for a free model's context.
import { readFileSync } from 'node:fs'

const report = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const metrics = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
]
const scored = ['binary', 'numeric', 'metricSavings']

const lines = [
  `**URL:** ${report.finalDisplayedUrl}, Lighthouse ${report.lighthouseVersion}, ${report.configSettings.formFactor}`,
  '',
  '| Категория | Оценка |',
  '|---|---|',
  ...Object.values(report.categories).map(
    (category) => `| ${category.title} | ${Math.round(category.score * 100)} |`,
  ),
  '',
  '**Метрики**',
  '',
  ...metrics.map((id) => `- ${report.audits[id].title}: ${report.audits[id].displayValue}`),
  '',
  '**Проваленные аудиты (оценка ниже 0.9)**',
  '',
]

const failed = Object.values(report.audits)
  .filter((audit) => scored.includes(audit.scoreDisplayMode) && audit.score !== null)
  .filter((audit) => audit.score < 0.9 && !metrics.includes(audit.id))
  .sort((a, b) => a.score - b.score)
  .slice(0, 15)

lines.push(
  ...(failed.length > 0
    ? failed.map((audit) => {
        const value = audit.displayValue ? ` — ${audit.displayValue}` : ''
        return `- \`${audit.id}\` (${audit.score}): ${audit.title}${value}`
      })
    : ['Нет.']),
)

console.log(lines.join('\n'))
