import { ResponsiveLine } from "@nivo/line";
import { useAtom } from "jotai";
import {
  portfolioChartData,
  portfolioChartIndexData,
  PortfolioDashboardAtom, // 🟢 [추가] 포트폴리오 이름 가져오기 위함
} from "../store/dashboard/atoms";

interface Props {
  range: string;
}

const HistoricalLineChart = ({ range }: Props) => {
  const [chartData] = useAtom(portfolioChartData);
  const [indexData] = useAtom(portfolioChartIndexData);
  const [dashboardData] = useAtom(PortfolioDashboardAtom); // 🟢 [추가]

  // 🟢 [설정] 포트폴리오 이름 가져오기 (없으면 기본값)
  const portfolioName = dashboardData?.name || "내 포트폴리오";

  // 데이터가 없을 때 처리
  if (
    !chartData?.historicalChartData ||
    chartData.historicalChartData.length === 0
  ) {
    return (
      <div
        style={{
          height: "300px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#666",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
        }}
      >
        데이터가 없습니다.
      </div>
    );
  }

  // Nivo Line 차트용 데이터 포맷팅
  const data = [
    {
      id: portfolioName, // 🟢 [수정] 동적 이름 적용 (예: 'test')
      data: chartData.historicalChartData.map((d) => ({
        x: d.date,
        y: d.value,
      })),
    },
  ];

  // 벤치마크 데이터가 있으면 추가
  if (indexData && indexData.data && indexData.data.length > 0) {
    data.push({
      id: indexData.symbol || "Market",
      data: indexData.data.map((d) => ({
        x: d.date,
        y: d.value,
      })),
    });
  }

  // 기간별 X축 눈금(Tick) 설정 함수
  const getAxisSettings = (currentRange: string) => {
    const format = "%Y.%m.%d";
    let tickValues = "every 1 month";

    switch (currentRange) {
      case "7d":
        tickValues = "every 1 day";
        break;
      case "1mo":
        tickValues = "every 1 week";
        break;
      case "3mo":
        tickValues = "every 1 month";
        break;
      case "6mo":
        tickValues = "every 1 month";
        break;
      case "1y":
        tickValues = "every 3 months";
        break;
      case "3y":
        tickValues = "every 1 year";
        break;
      case "max":
        tickValues = "every 1 year";
        break;
      default:
        tickValues = "every 1 month";
    }
    return { format, tickValues };
  };

  const axisSettings = getAxisSettings(range);

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
        xScale={{
          type: "time",
          format: "%Y-%m-%d",
          precision: "day",
        }}
        xFormat="time:%Y.%m.%d"
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          format: axisSettings.format,
          tickValues: axisSettings.tickValues,
          tickSize: 0,
          tickPadding: 12,
          tickRotation: 0,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 12,
          tickRotation: 0,
        }}
        colors={["#00bfff", "#ff7f50"]}
        lineWidth={3}
        pointSize={0}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        enableGridX={false}
        enableGridY={true}
        gridYValues={5}
        useMesh={true}
        // 🟢 [수정] 툴팁 커스터마이징 (가로 정렬 & 동적 이름)
        tooltip={({ point }) => (
          <div
            style={{
              background: "rgba(30, 30, 30, 0.95)",
              padding: "8px 12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
              whiteSpace: "nowrap", // ⭐️ 핵심: 줄바꿈 방지
            }}
          >
            <div
              style={{ color: "#aaa", marginBottom: "4px", fontSize: "11px" }}
            >
              {point.data.xFormatted}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: point.seriesColor,
                }}
              />
              {/* 동적 이름 표시 */}
              <span style={{ fontWeight: 600 }}>{point.seriesId}:</span>
              <span>{point.data.yFormatted}%</span>
            </div>
          </div>
        )}
        theme={{
          text: {
            fill: "#888",
            fontSize: 11,
          },
          grid: {
            line: {
              stroke: "#333",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            },
          },
          crosshair: {
            line: {
              stroke: "#fff",
              strokeWidth: 1,
              strokeOpacity: 0.5,
            },
          },
          tooltip: {
            container: {
              background: "#222",
              color: "#fff",
              fontSize: "12px",
            },
          },
        }}
      />
    </div>
  );
};

export default HistoricalLineChart;
