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
import { useEffect, useState } from "react";
import {
  PortfolioAIReviewAnswerAtom,
  PortfolioRiskAtom,
  PortfolioTotalsAtom,
  dashboardMarketIndexAtom, // 🟢 저장된 시장 지수 Atom
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

  // 🟢 [수정] 로컬 state 대신 저장된 atom 사용
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

  // 🟢 [수정] interval은 range에 따라 자동 설정되므로 고정값('1d') 전달
  // (백엔드에서 1y 이상일 때 자동 최적화하도록 수정했으므로 1d로 보내도 됨)
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

  if (!selectedPortfolioId) {
    return (
      <div
        className={style.pageWrapper}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <h2>포트폴리오를 선택해주세요.</h2>
        <Link to="/portfolio" style={{ color: "#00bfff" }}>
          포트폴리오 관리로 이동
        </Link>
      </div>
    );
  }

  // 1. KPI 데이터 (영어 서브 텍스트 제거, 숫자에 색상 적용)
  const kpiItems = totals
    ? [
        {
          label: "총 자산 가치",
          value: `${
            totals.baseCurrency
          } ${totals.totalPortfolioValue.toLocaleString()}`,
          status: "neutral", // 자산 가치는 색상 X
        },
        {
          label: "총 수익",
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
      ]
    : [
        { label: "총 자산 가치", value: "-", status: "neutral" },
        { label: "총 수익", value: "-", status: "neutral" },
        { label: "원금", value: "-", status: "neutral" },
        { label: "수익률", value: "-", status: "neutral" },
      ];

  // 2. 리스크 데이터 (데이터가 없어도 0으로 채워서 표시)
  // 현재 API 구조상 transactions가 없으면 riskData가 null일 수 있음.
  // 이 경우 0으로 채운 더미 데이터를 보여줌.
  const hasRiskData = riskData && riskData.metrics && riskData.benchmark;

  const riskComparisonItems = [
    {
      key: "volatility",
      label: "변동성 (Volatility)",
      desc: "낮을수록 안정적",
      portfolioValue: hasRiskData ? riskData.metrics.volatility : 0,
      benchmarkValue: hasRiskData ? riskData.benchmark.volatility : 0,
    },
    {
      key: "beta",
      label: "베타 (Beta)",
      desc: "시장 민감도 (기준 1.0)",
      portfolioValue: hasRiskData ? riskData.metrics.beta : 0,
      benchmarkValue: 1.0, // 베타 기준값은 항상 1
    },
    {
      key: "maxDrawdown",
      label: "최대 낙폭 (MDD)",
      desc: "0에 가까울수록 좋음",
      portfolioValue: hasRiskData ? riskData.metrics.maxDrawdown : 0,
      benchmarkValue: hasRiskData ? riskData.benchmark.maxDrawdown : 0,
      isNegative: true,
    },
    {
      key: "sharpeRatio",
      label: "샤프 지수 (Sharpe)",
      desc: "클수록 좋음",
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

      {/* 필터 바 (간격 버튼 제거됨) */}
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

      {/* KPI Strip */}
      <div className={style.kpiRow}>
        {kpiItems.map((kpi, idx) => (
          <div key={idx} className={style.kpiCard}>
            <span className={style.kpiCard__label}>{kpi.label}</span>
            {/* 🟢 수정: 숫자에 직접 색상 클래스 적용 */}
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

      {/* AI Insight */}
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
              "데이터를 분석 중입니다..."
            ) : (
              "거래 내역이 부족하여 분석할 수 없습니다."
            )}
          </span>
        </div>
      </div>

      {/* Main Chart */}
      <div className={style.mainChartSection}>
        <h3>포트폴리오 가치 추이 (vs {getBenchmarkName()})</h3>
        <HistoricalLineChart range={range} />
      </div>

      {/* Bottom Analysis */}
      <div className={style.analysisGrid}>
        {/* 리스크 그리드 (데이터 없어도 항상 표시, 값은 0) */}
        <div className={style.riskContainer}>
          <h3 className={style.sectionTitle}>리스크 상세 분석</h3>
          <div className={style.riskGrid}>
            {riskComparisonItems.map((item) => (
              <div key={item.key} className={style.riskCard}>
                <div className={style.riskCard__header}>
                  <h4>{item.label}</h4>
                  <span>{item.desc}</span>
                </div>
                {/* 차트 항상 렌더링 (0값 처리됨) */}
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

        {/* 매트릭스 (거래내역 없으면 텍스트 표시) */}
        <div className={style.matrixContainer}>
          <h3 className={style.sectionTitle}>자산 상관관계</h3>
          <div className={style.matrixCard}>
            {hasTransactions ? (
              <CorrelationMatrixChart />
            ) : (
              <div className={style.matrixCard__empty}>
                <p>거래 내역을 추가하면</p>
                <p>자산 간 상관관계를 분석해드립니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
