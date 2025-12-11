import { ResponsiveHeatMap } from '@nivo/heatmap';
import { PortfolioRiskAtom } from '../store/dashboard/atoms';
import { useAtom } from 'jotai';

function CorrelationMatrixChart() {
    const [riskData] = useAtom(PortfolioRiskAtom);

    const correlationMatrix = riskData?.metrics.correlationMatrix || {};
    const keys = Object.keys(correlationMatrix);
    const data = keys.map((rowKey) => ({
        id: rowKey,
        data: keys.map((colKey) => ({
            x: colKey,
            y: correlationMatrix[rowKey][colKey] ?? null,
        })),
    }));

    if (!keys.length) return null;

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveHeatMap
                data={data}
                valueFormat=">-.2s"
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
                        ticks: {
                            text: {
                                fill: '#fff',
                            },
                        },
                        legend: {
                            text: {
                                fill: '#fff',
                            },
                        },
                    },
                }}
                axisTop={{
                    legendPosition: 'middle',
                    legendOffset: 36,
                    tickRotation: -45,
                    tickSize: 5,
                    tickPadding: 5,
                }}
                axisLeft={{
                    legendPosition: 'middle',
                    legendOffset: -60,
                    tickSize: 5,
                    tickPadding: 5,
                }}
                margin={{ top: 80, right: 60, bottom: 60, left: 100 }}
                colors={{
                    type: 'diverging',
                    scheme: 'red_blue',
                    divergeAt: 0.5,
                    minValue: -1,
                    maxValue: 1,
                }}
                emptyColor="#555555"
            />
        </div>
    );
}

export default CorrelationMatrixChart;
