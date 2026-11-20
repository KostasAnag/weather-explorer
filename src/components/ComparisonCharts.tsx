import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  buildDailyChartData, buildHourlyChartData, buildSeries, formatHoursAhead,
  type ChartSeries,
} from '../lib/compareData'
import type { ComparisonEntry } from '../types/weather'

// Recessive hairline grid and secondary-ink axis text (text never wears the series color).
const GRID = '#e7e6e2'
const AXIS_TEXT = { fill: '#52514e', fontSize: 12 }
const CHART_HEIGHT = 280

type ChartRow = Record<string, number | string>

/** The same numbers as a table: the color-independent view of a chart. */
function ChartDataTable({
  firstColumn, rowLabel, series, data,
}: {
  firstColumn: string
  rowLabel: (row: ChartRow) => string
  series: ChartSeries[]
  data: ChartRow[]
}) {
  return (
    <details className="chart-data">
      <summary>View data as table</summary>
      <table>
        <thead>
          <tr>
            <th scope="col">{firstColumn}</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <th scope="row">{rowLabel(row)}</th>
              {series.map((s) => (
                <td key={s.key}>{row[s.key] === undefined ? '–' : `${row[s.key]} °C`}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}

function ChartCard({
  title, description, series, empty, children,
}: {
  title: string
  description: string
  series: ChartSeries[]
  empty: boolean
  children: React.ReactNode
}) {
  return (
    <section className="chart-card">
      <h3>{title}</h3>
      {empty ? (
        <p role="status">Loading chart…</p>
      ) : (
        <figure role="img" aria-label={`${description}: ${series.map((s) => s.label).join(', ')}`}>
          {children}
        </figure>
      )}
    </section>
  )
}

export function HourlyTemperatureChart({ entries }: { entries: ComparisonEntry[] }) {
  const series = buildSeries(entries)
  const data = buildHourlyChartData(entries)
  return (
    <ChartCard
      title="Next 24 hours: temperature (°C)"
      description="Line chart of temperature over the next 24 hours for"
      series={series}
      empty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT} initialDimension={{ width: 640, height: CHART_HEIGHT }}>
        <LineChart data={data}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="hour" tickFormatter={formatHoursAhead} tick={AXIS_TEXT} stroke={GRID} interval={3} />
          <YAxis tick={AXIS_TEXT} stroke={GRID} unit="°" width={44} />
          <Tooltip itemSorter="dataKey" labelFormatter={(h) => formatHoursAhead(Number(h))} formatter={(v) => `${v} °C`} />
          {/* dataKey is loc0, loc1, ...: selection order (the default sorts alphabetically). */}
          <Legend itemSorter="dataKey" />
          {series.map((s) => (
            <Line
              key={s.key} dataKey={s.key} name={s.label} stroke={s.color}
              strokeWidth={2} dot={false} activeDot={{ r: 4 }} type="monotone" isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <ChartDataTable
        firstColumn="Hours from now"
        rowLabel={(row) => formatHoursAhead(Number(row.hour))}
        series={series}
        data={data}
      />
    </ChartCard>
  )
}

export function DailyHighsChart({ entries }: { entries: ComparisonEntry[] }) {
  const series = buildSeries(entries)
  const data = buildDailyChartData(entries)
  return (
    <ChartCard
      title="7-day highs (°C)"
      description="Bar chart of daily highest temperature for"
      series={series}
      empty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT} initialDimension={{ width: 640, height: CHART_HEIGHT }}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="day" tick={AXIS_TEXT} stroke={GRID} />
          <YAxis tick={AXIS_TEXT} stroke={GRID} unit="°" width={44} />
          <Tooltip itemSorter="dataKey" formatter={(v) => `${v} °C`} cursor={{ fill: 'rgb(0 0 0 / .05)' }} />
          {/* dataKey is loc0, loc1, ...: selection order (the default sorts alphabetically). */}
          <Legend itemSorter="dataKey" />
          {series.map((s) => (
            <Bar
              key={s.key} dataKey={s.key} name={s.label} fill={s.color}
              maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <ChartDataTable firstColumn="Day" rowLabel={(row) => String(row.day)} series={series} data={data} />
    </ChartCard>
  )
}
