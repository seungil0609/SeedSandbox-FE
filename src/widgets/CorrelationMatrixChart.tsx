import { ResponsiveHeatMap } from "@nivo/heatmap";
import { PortfolioRiskAtom } from "../store/dashboard/atoms";
import { useAtom } from "jotai";

function CorrelationMatrixChart() {
  const [riskData] = useAtom(PortfolioRiskAtom);

  const correlationMatrix = riskData?.metrics.correlationMatrix || {};
  const keys = Object.keys(correlationMatrix);

  // 데이터 변환
  const data = keys.map((rowKey) => ({
    id: rowKey,
    data: keys.map((colKey) => ({
      x: colKey,
      y: correlationMatrix[rowKey][colKey] ?? null,
    })),
  }));

  if (!keys.length) return null;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveHeatMap
        data={data}
        margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
        valueFormat=">-.2f"
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: "",
          legendOffset: 36,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "",
          legendPosition: "middle",
          legendOffset: -72,
        }}
        colors={{
          type: "diverging",
          scheme: "red_blue",
          minValue: -1,
          maxValue: 1,
          divergeAt: 0.5,
        }}
        emptyColor="#333333"
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
        enableLabels={true}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 3]],
        }}
        theme={{
          text: { fill: "#e0e0e0", fontSize: 11, fontWeight: 600 },
          tooltip: {
            container: {
              background: "rgba(20, 20, 20, 0.95)",
              color: "#fff",
              fontSize: "12px",
              borderRadius: "8px",
              border: "1px solid #444",
            },
          },
        }}
        // 🟢 [수정] 범례 (타이틀 제거)
        legends={[
          {
            anchor: "right",
            translateX: 50,
            translateY: 0,
            length: 200,
            thickness: 10,
            direction: "column",
            tickPosition: "after",
            tickSize: 3,
            tickSpacing: 4,
            tickOverlap: false,
            titleAlign: "start",
            titleOffset: 4,
          },
        ]}
        // 🔴 [삭제] 에러를 유발하던 cellOpacity 관련 속성 4줄을 완전히 삭제했습니다.
        hoverTarget="cell"
      />
    </div>
  );
}

export default CorrelationMatrixChart;
