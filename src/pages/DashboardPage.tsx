import { useAtom, useSetAtom } from "jotai";
import style from "./styles/DashboardPage.module.scss";
import CorrelationMatrixChart from "../widgets/CorrelationMatrixChart";
import {
  getPortfolioAIReviewAtom,
  getPortfolioChartDataAtom,
  getPortfolioChartIndexDataAtom,
  getPortfolioDashboardDataAtom,
  getPortfolioRiskDataAtom,
} from "../store/dashboard/action";
import { useEffect } from "react";
import {
  PortfolioAIReviewAnswerAtom,
  PortfolioRiskAtom,
  PortfolioTotalsAtom,
  dashboardMarketIndexAtom,
  dashboardRangeAtom,
} from "../store/dashboard/atoms";
import HistoricalLineChart from "../widgets/HistoricalLineChart";
import { selectedPortfolioIdAtom } from "../store/portfolios/atoms";
import { Link } from "react-router-dom";
import RiskComparisonBar from "../widgets/RiskComparisonBar";
import { Bot } from "lucide-react";

const ButtonGroup = ({ options, value, onChange }: any) => (
  <div className={style.buttonRail}>
    {options.map((opt: any) => (
      <button
        key={opt.value}
        className={`${style.button} ${value === opt.value ? style.active : ""}`}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const toHtmlWithEmphasis = (raw: string) => {
  if (!raw) return "";
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return raw
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return `<strong>${escape(part.slice(2, -2))}</strong>`;
      }
      return escape(part);
    })
    .join("");
};

function DashboardPage() {
  const getPortfolioRiskData = useSetAtom(getPortfolioRiskDataAtom);
  const getPortfolioDashboardData = useSetAtom(getPortfolioDashboardDataAtom);
  const getPortfolioChartData = useSetAtom(getPortfolioChartDataAtom);
  const getMarketIndexChartData = useSetAtom(getPortfolioChartIndexDataAtom);
  const getPortfolioAIReview = useSetAtom(getPortfolioAIReviewAtom);

  const [totals] = useAtom(PortfolioTotalsAtom);
  const [aiReviewText] = useAtom(PortfolioAIReviewAnswerAtom);
  const [riskData] = useAtom(PortfolioRiskAtom);
  const [selectedPortfolioId] = useAtom(selectedPortfolioIdAtom);

  const [marketIndex, setMarketIndex] = useAtom(dashboardMarketIndexAtom);
  const [range, setRange] = useAtom(dashboardRangeAtom);

  const rangeOptions = [
    { label: "1주", value: "7d" },
    { label: "1개월", value: "1mo" },
    { label: "3개월", value: "3mo" },
    { label: "6개월", value: "6mo" },
    { label: "1년", value: "1y" },
    { label: "3년", value: "3y" },
    { label: "전체", value: "max" },
  ];

  const indexOptions = [
    { label: "S&P500", value: "sp500" },
    { label: "Dow", value: "dowjones" },
    { label: "Nasdaq", value: "nasdaq" },
    { label: "KOSPI", value: "kospi" },
    { label: "KOSDAQ", value: "kosdaq" },
  ];

  const getBenchmarkName = () =>
    indexOptions.find((opt) => opt.value === marketIndex)?.label || "Market";

  const excludedAssets = riskData?.excluded || [];

  useEffect(() => {
    if (!selectedPortfolioId) return;
    getPortfolioChartData(range, "1d");
    getMarketIndexChartData(range, "1d", marketIndex);
  }, [range, marketIndex, selectedPortfolioId]);

  useEffect(() => {
    if (!selectedPortfolioId) return;
    getPortfolioRiskData(marketIndex);
    getPortfolioDashboardData();
    getPortfolioChartData(range, "1d");
    getMarketIndexChartData(range, "1d", marketIndex);
    getPortfolioAIReview();
  }, [selectedPortfolioId, marketIndex]);

  // 🟢 [수정] 빈 화면 렌더링 부분
  if (!selectedPortfolioId) {
    return (
      <div className={style.pageWrapper}>
        <div className={style.header}>
          <div className={style.title}>대시보드</div>
        </div>

        <div className={style.emptyState}>
          {/* 4번째 사진 스타일 적용 */}
          <h2 style={{ color: "rgba(255, 255, 255, 0.2)" }}>
            포트폴리오를 생성해주세요.
          </h2>
        </div>
      </div>
    );
  }

  const kpiItems = totals
    ? [
        {
          label: "자산가치",
          value: `${
            totals.baseCurrency
          } ${totals.totalPortfolioValue.toLocaleString()}`,
          status: "neutral",
        },
        {
          label: "수익률",
          value: `${totals.totalPortfolioReturnPercentage.toFixed(2)}%`,
          status:
            totals.totalPortfolioReturnPercentage > 0
              ? "positive"
              : totals.totalPortfolioReturnPercentage < 0
              ? "negative"
              : "neutral",
        },
        {
          label: "수익",
          value: `${
            totals.baseCurrency
          } ${totals.totalPortfolioProfitLoss.toLocaleString()}`,
          status:
            totals.totalPortfolioProfitLoss > 0
              ? "positive"
              : totals.totalPortfolioProfitLoss < 0
              ? "negative"
              : "neutral",
        },
        {
          label: "원금",
          value: `${
            totals.baseCurrency
          } ${totals.totalPortfolioCostBasis.toLocaleString()}`,
          status: "neutral",
        },
      ]
    : [
        { label: "자산가치", value: "-", status: "neutral" },
        { label: "수익률", value: "-", status: "neutral" },
        { label: "수익", value: "-", status: "neutral" },
        { label: "원금", value: "-", status: "neutral" },
      ];

  const hasRiskData = riskData && riskData.metrics && riskData.benchmark;

  const riskComparisonItems = [
    {
      key: "volatility",
      label: "변동성",
      desc: "낮을수록 안정적",
      portfolioValue: hasRiskData ? riskData.metrics.volatility : 0,
      benchmarkValue: hasRiskData ? riskData.benchmark.volatility : 0,
    },
    {
      key: "beta",
      label: "베타",
      desc: "시장 민감도 (기준 1.0)",
      portfolioValue: hasRiskData ? riskData.metrics.beta : 0,
      benchmarkValue: 1.0,
    },
    {
      key: "maxDrawdown",
      label: "최대 낙폭",
      desc: "0에 가까울수록 좋음",
      portfolioValue: hasRiskData ? riskData.metrics.maxDrawdown : 0,
      benchmarkValue: hasRiskData ? riskData.benchmark.maxDrawdown : 0,
      isNegative: true,
    },
    {
      key: "sharpeRatio",
      label: "샤프 지수",
      desc: "높을수록 좋음",
      portfolioValue: hasRiskData ? riskData.metrics.sharpeRatio : 0,
      benchmarkValue: hasRiskData ? riskData.benchmark.sharpeRatio : 0,
    },
  ];

  const hasTransactions = totals && totals.totalPortfolioCostBasis > 0;

  return (
    <div className={style.pageWrapper}>
      <div className={style.header}>
        <div className={style.title}>대시보드</div>
      </div>

      <div className={style.filterBar}>
        <div className={style.filterBar__group}>
          <span className={style.filterBar__label}>비교 지수</span>
          <ButtonGroup
            options={indexOptions}
            value={marketIndex}
            onChange={setMarketIndex}
          />
        </div>
        <div className={style.filterBar__group}>
          <span className={style.filterBar__label}>기간 설정</span>
          <ButtonGroup
            options={rangeOptions}
            value={range}
            onChange={setRange}
          />
        </div>
      </div>

      <div className={style.kpiRow}>
        {kpiItems.map((kpi, idx) => (
          <div key={idx} className={style.kpiCard}>
            <span className={style.kpiCard__label}>{kpi.label}</span>
            <span
              className={`${style.kpiCard__value} ${
                kpi.status === "positive"
                  ? style.profit
                  : kpi.status === "negative"
                  ? style.loss
                  : ""
              }`}
            >
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      <div className={style.aiBanner}>
        <div className={style.aiBanner__icon}>
          <Bot size={24} color="#00bfff" />
        </div>
        <div className={style.aiBanner__text}>
          <span className={style.aiBanner__title}>AI 포트폴리오 진단</span>
          <span className={style.aiBanner__desc}>
            {aiReviewText ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: toHtmlWithEmphasis(aiReviewText),
                }}
              />
            ) : hasTransactions ? (
              "분석 중입니다..."
            ) : (
              "거래내역이 부족하여 분석할 수 없습니다."
            )}
          </span>
        </div>
      </div>

      <div className={style.mainChartSection}>
        <h3>포트폴리오 가치 추이 (vs {getBenchmarkName()})</h3>
        <HistoricalLineChart range={range} />
      </div>

      <div className={style.analysisGrid}>
        <div className={style.riskContainer}>
          <h3 className={style.sectionTitle}>리스크 상세 분석</h3>
          <div className={style.riskGrid}>
            {riskComparisonItems.map((item) => (
              <div key={item.key} className={style.riskCard}>
                <div className={style.riskCard__header}>
                  <h4>{item.label}</h4>
                  <span>{item.desc}</span>
                </div>
                <div className={style.chartContainer}>
                  <RiskComparisonBar
                    portfolioValue={item.portfolioValue}
                    benchmarkValue={item.benchmarkValue}
                    benchmarkName={getBenchmarkName()}
                    isNegative={item.isNegative}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 상관관계 매트릭스 */}
        <div className={style.matrixContainer}>
          <div className={style.sectionHeader}>
            <h3 className={style.sectionTitle}>상관관계 분석</h3>
          </div>

          <div className={style.matrixCard}>
            {hasTransactions ? (
              <>
                <div
                  style={{
                    padding: "0 0 10px 0",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "10px",
                  }}
                >
                  1.0에 가까울수록 함께 움직이고, -1.0에 가까울수록 반대로
                  움직임
                </div>

                {/* 🟢 [수정] 차트 컨테이너에 명시적인 높이 부여 (중요!) */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    flex: 1,
                    minHeight: 0,
                  }}
                >
                  <CorrelationMatrixChart />
                </div>

                {excludedAssets.length > 0 && (
                  <div className={style.excludedList}>
                    <span className={style.excludedLabel}>
                      ⚠️ 분석 제외 (섹터 미정 또는 데이터 부족):
                    </span>
                    {excludedAssets.map((ticker) => (
                      <span key={ticker} className={style.excludedBadge}>
                        {ticker}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={style.matrixCard__empty}>
                <p>보유 중인 자산이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
