import { ResponsiveBar } from "@nivo/bar";

interface Props {
  portfolioValue: number;
  benchmarkValue: number;
  benchmarkName: string;
  isNegative?: boolean;
}

function RiskComparisonBar({
  portfolioValue,
  benchmarkValue,
  benchmarkName,
  isNegative,
}: Props) {
  const pValue = isNegative ? Math.abs(portfolioValue) : portfolioValue;
  const bValue = isNegative ? Math.abs(benchmarkValue) : benchmarkValue;

  const data = [
    {
      category: "내 포트폴리오",
      value: pValue,
      color: "#00bfff",
      originalValue: portfolioValue,
    },
    {
      category: benchmarkName,
      value: bValue,
      color: "#555555",
      originalValue: benchmarkValue,
    },
  ];

  return (
    <ResponsiveBar
      data={data}
      keys={["value"]}
      indexBy="category"
      layout="horizontal"
      // margin에서 bottom을 줄여서 공간을 아낍니다 (20 -> 10)
      margin={{ top: 0, right: 30, bottom: 10, left: 100 }}
      padding={0.4}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={({ data }: { data: any }) => data.color}
      enableGridX={true}
      enableGridY={false}
      axisTop={null}
      axisRight={null}
      // 🟢 [수정됨] 아래 X축 눈금(숫자들)을 아예 없앱니다.
      axisBottom={null}
      axisLeft={{
        tickSize: 0,
        tickPadding: 10, // 글자와 막대 사이 간격 살짝 조정
        tickRotation: 0,
      }}
      enableLabel={true}
      label={(d: any) =>
        isNegative ? `-${d.value?.toFixed(2)}` : d.value?.toFixed(2)
      }
      labelSkipWidth={20}
      labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
      theme={{
        text: { fill: "#aaa", fontSize: 11, fontWeight: 600 },
        // axis 설정은 axisLeft에만 적용됨
        axis: { ticks: { text: { fill: "#aaa" } } },
        grid: { line: { stroke: "#333", strokeDasharray: "2 2" } },
        tooltip: {
          container: {
            background: "#222",
            color: "#fff",
            fontSize: "12px",
          },
        },
      }}
      tooltip={({ color, indexValue, data }: any) => (
        <div
          style={{
            padding: 6,
            color: "#fff",
            background: "#222",
            fontSize: "12px",
            border: "1px solid #444",
          }}
        >
          <strong style={{ color }}>{indexValue}</strong>:{" "}
          {Number(data.originalValue).toFixed(2)}
        </div>
      )}
    />
  );
}

export default RiskComparisonBar;
