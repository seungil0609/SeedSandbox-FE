import { ResponsiveBar } from "@nivo/bar";
import { useAtom } from "jotai";
import { PortfolioDashboardAtom } from "../store/dashboard/atoms";

interface Props {
  portfolioValue: number;
  benchmarkValue: number;
  benchmarkName: string;
  isNegative?: boolean; // MDD처럼 음수가 좋은 지표인지 여부
}

function RiskComparisonBar({
  portfolioValue,
  benchmarkValue,
  benchmarkName,
  isNegative,
}: Props) {
  // 1. 차트 표현용 양수 변환 (절댓값)
  const pValue = isNegative ? Math.abs(portfolioValue) : portfolioValue;
  const bValue = isNegative ? Math.abs(benchmarkValue) : benchmarkValue;
  // 🟢 [1] 포트폴리오 이름 가져오기
  const [dashboardData] = useAtom(PortfolioDashboardAtom);
  const portfolioName = dashboardData?.name || "내 포트폴리오";

  // 2. 데이터 구성 (originalValue에 원래 음수 값 저장)
  // 2. 데이터 구성
  const data = [
    {
      category: portfolioName, // 🟢 [수정] "내 포트폴리오" -> 실제 이름(test 등)
      value: pValue,
      color: "#00bfff", // 파랑
      originalValue: portfolioValue,
    },
    {
      category: benchmarkName, // S&P500 등
      value: bValue,
      color: "#ff7f50", // 주황
      originalValue: benchmarkValue,
    },
  ];
  return (
    // 🟢 [중요] Nivo 차트는 높이가 지정된 부모 div가 필수입니다.
    <div style={{ height: "100px", width: "100%" }}>
      <ResponsiveBar
        data={data}
        keys={["value"]}
        indexBy="category"
        layout="horizontal"
        margin={{ top: 0, right: 30, bottom: 10, left: 100 }}
        padding={0.4}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        // 색상 적용
        colors={({ data }: any) => data.color}
        enableGridX={true}
        enableGridY={false}
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={{
          tickSize: 0,
          tickPadding: 10,
          tickRotation: 0,
        }}
        enableLabel={true}
        // 라벨: 음수 지표면 마이너스(-) 붙여서 표시
        label={(d: any) =>
          isNegative ? `-${d.value?.toFixed(2)}` : d.value?.toFixed(2)
        }
        labelSkipWidth={20}
        labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        theme={{
          text: { fill: "#aaa", fontSize: 11, fontWeight: 600 },
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
        // 툴팁: 마우스 올렸을 때 원본 값(음수 포함) 표시
        tooltip={({ color, indexValue, data }: any) => (
          <div
            style={{
              padding: "6px 10px",
              color: "#fff",
              background: "rgba(30, 30, 30, 0.95)",
              fontSize: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
              whiteSpace: "nowrap",
            }}
          >
            <strong style={{ color }}>{indexValue}</strong>:{" "}
            {Number(data.originalValue).toFixed(2)}
          </div>
        )}
      />
    </div>
  );
}

export default RiskComparisonBar;
