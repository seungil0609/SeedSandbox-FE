import { useAtom } from 'jotai';
import { ResponsiveLine } from '@nivo/line';
import { portfolioChartData, portfolioChartIndexData } from '../store/dashboard/atoms';

function HistoricalLineChart() {
    const [chartData] = useAtom(portfolioChartData);
    const [indexData] = useAtom(portfolioChartIndexData);
    if (!chartData) return null;

    const parseDate = (d: string) => new Date(d).getTime();

    const cleaned = chartData.historicalChartData
        .filter((p) => p && p.date && p.value !== null && p.value !== undefined)
        .map((p) => ({ date: p.date, value: Number(p.value) }))
        .filter((p) => Number.isFinite(p.value))
        .sort((a, b) => parseDate(a.date) - parseDate(b.date));

    const cleanedIndex =
        indexData && indexData.data
            ? indexData.data
                  .filter((p) => p && p.date && p.value !== null && p.value !== undefined)
                  .map((p) => ({ date: p.date, value: Number(p.value) }))
                  .filter((p) => Number.isFinite(p.value))
                  .sort((a, b) => parseDate(a.date) - parseDate(b.date))
            : [];

    const allDates = Array.from(
        new Set([...cleaned.map((p) => p.date), ...cleanedIndex.map((p) => p.date)])
    ).sort((a, b) => parseDate(a) - parseDate(b));

    const portfolioMap = new Map(cleaned.map((p) => [p.date, p.value]));
    const indexMap = new Map(cleanedIndex.map((p) => [p.date, p.value]));

    const series = [
        {
            id: '포트폴리오',
            data: allDates.map((d) => ({
                x: d,
                y: portfolioMap.has(d) ? portfolioMap.get(d)! : null,
            })),
        },
        ...(cleanedIndex.length
            ? [
                  {
                      id: '시장 지수',
                      data: allDates.map((d) => ({
                          x: d,
                          y: indexMap.has(d) ? indexMap.get(d)! : null,
                      })),
                  },
              ]
            : []),
    ];

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveLine
                data={series}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
                curve="monotoneX"
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                }}
                enableGridX={false}
                enableGridY={false}
                colors={['#00bfff', '#ff7f50']}
                lineWidth={3}
                pointSize={6}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                useMesh
                margin={{ top: 32, right: 24, bottom: 64, left: 48 }}
                theme={{
                    text: { fill: '#222', fontWeight: '700', fontSize: '0.7rem' },
                    tooltip: {
                        container: {
                            background: '#222',
                            color: '#fff',
                            fontSize: 12,
                            borderRadius: '6px',
                        },
                    },
                    axis: {
                        ticks: { text: { fill: '#fff' } },
                        legend: { text: { fill: '#fff' } },
                    },
                }}
                tooltip={({ point }) => (
                    <div style={{ padding: '6px 8px', fontSize: 12 }}>
                        <div>{String(point.data.x)}</div>
                        <div style={{ fontWeight: 700 }}>
                            {point.data.y != null ? String(point.data.y) : '데이터 없음'}
                        </div>
                    </div>
                )}
            />
        </div>
    );
}

export default HistoricalLineChart;
