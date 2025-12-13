import { useAtom } from "jotai";
import { ResponsiveLine } from "@nivo/line";
import {
  portfolioChartData,
  portfolioChartIndexData,
} from "../store/dashboard/atoms";

interface Props {
  range: string; // 부모로부터 현재 선택된 기간을 받음 (예: "3mo", "max")
}

function HistoricalLineChart({ range }: Props) {
  const [chartData] = useAtom(portfolioChartData);
  const [indexData] = useAtom(portfolioChartIndexData);

  if (!chartData) return null;

  // 데이터 전처리 (Nivo Time Scale은 Date 객체를 선호함)
  const cleaned = chartData.historicalChartData
    .filter((p) => p && p.date && p.value !== null)
    .map((p) => ({ x: new Date(p.date), y: Number(p.value) }))
    .sort((a, b) => a.x.getTime() - b.x.getTime());

  const cleanedIndex = indexData?.data
    ? indexData.data
        .filter((p) => p && p.date && p.value !== null)
        .map((p) => ({ x: new Date(p.date), y: Number(p.value) }))
        .sort((a, b) => a.x.getTime() - b.x.getTime())
    : [];

  const series = [
    {
      id: "내 포트폴리오",
      data: cleaned,
    },
    ...(cleanedIndex.length
      ? [
          {
            id: indexData?.index || "시장 지수",
            data: cleanedIndex,
          },
        ]
      : []),
  ];

  // 🟢 기간(Range)에 따른 X축 라벨 포맷 및 간격 설정
  const getAxisBottomSettings = () => {
    switch (range) {
      case "7d":
      case "1mo":
        return { format: "%m/%d", tickValues: "every 2 days" }; // 12/12
      case "3mo":
      case "6mo":
        return { format: "%m월", tickValues: "every 1 month" }; // 12월
      case "1y":
        return { format: "%Y.%m", tickValues: "every 2 months" }; // 24.12
      case "3y":
      case "max":
        return { format: "%Y년", tickValues: "every 1 year" }; // 2024년
      default:
        return { format: "%Y-%m-%d", tickValues: 5 };
    }
  };

  const axisSettings = getAxisBottomSettings();

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveLine
        data={series}
        margin={{ top: 20, right: 30, bottom: 50, left: 50 }}
        // 🟢 중요: 포인트 방식이 아니라 시간(Time) 방식으로 변경
        xScale={{
          type: "time",
          format: "native", // 입력 데이터가 Date 객체임
          precision: "day",
        }}
        yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          format: axisSettings.format, // 동적 포맷 (%Y년 등)
          tickValues: axisSettings.tickValues, // 동적 간격 (every 1 month 등)
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        colors={["#00bfff", "#ff7f50"]}
        lineWidth={2}
        pointSize={0} // 포인트 제거하여 선을 매끄럽게
        useMesh={true}
        enableGridX={false}
        enableGridY={true}
        theme={{
          text: { fill: "#aaa", fontSize: 11 },
          axis: { ticks: { text: { fill: "#888" } } },
          grid: { line: { stroke: "#333", strokeDasharray: "4 4" } },
          crosshair: { line: { stroke: "#fff", strokeWidth: 1 } },
          tooltip: {
            container: {
              background: "#222",
              color: "#fff",
              fontSize: "12px",
              border: "1px solid #444",
            },
          },
        }}
        // 툴팁 날짜 포맷도 보기 좋게
        xFormat="time:%Y-%m-%d"
      />
    </div>
  );
}

export default HistoricalLineChart;
