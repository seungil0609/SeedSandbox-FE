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
} from "../store/dashboard/atoms";
import HistoricalLineChart from "../widgets/HistoricalLineChart";
import { selectedPortfolioIdAtom } from "../store/portfolios/atoms";
import { Link } from "react-router-dom";
import RiskComparisonBar from "../widgets/RiskComparisonBar";
import { Bot } from "lucide-react";

// 버튼 그룹
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

// HTML 파서
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

  const [interval, setInterval] = useState("1d");
  const [range, setRange] = useState("7d");
  const [marketIndex, setMarketIndex] = useState("nasdaq");

  // ✅ [복구 완료] 간격 옵션
  const intervalOptions = [
    { label: "1일", value: "1d" },
    { label: "5일", value: "5d" },
    { label: "7일", value: "1wk" },
    { label: "30일", value: "1mo" },
    { label: "90일", value: "3mo" },
  ];

  // ✅ [복구 완료] 기간 옵션 (6개월, 3년 추가)
  const rangeOptions = [
    { label: "1주", value: "7d" },
    { label: "1개월", value: "1mo" },
    { label: "3개월", value: "3mo" },
    { label: "6개월", value: "6mo" },
    { label: "1년", value: "1y" },
    { label: "3년", value: "3y" },
    { label: "전체", value: "max" },
  ];

  // ✅ [복구 완료] 시장 지수 (KOSPI, KOSDAQ 포함)
  const indexOptions = [
    { label: "S&P500", value: "sp500" },
    { label: "Dow", value: "dowjones" },
    { label: "Nasdaq", value: "nasdaq" },
    { label: "KOSPI", value: "kospi" },
    { label: "KOSDAQ", value: "kosdaq" },
  ];

  const getBenchmarkName = () =>
    indexOptions.find((opt) => opt.value === marketIndex)?.label || "Market";

  useEffect(() => {
    if (!selectedPortfolioId) return;
    getPortfolioChartData(range, interval);
    getMarketIndexChartData(range, interval, marketIndex);
  }, [interval, range, marketIndex, selectedPortfolioId]);

  useEffect(() => {
    if (!selectedPortfolioId) return;
    getPortfolioRiskData(marketIndex);
    getPortfolioDashboardData();
    getPortfolioChartData(range, interval);
    getMarketIndexChartData(range, interval, marketIndex);
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

  const kpiItems = totals
    ? [
        {
          label: "총 자산 가치",
          value: `${
            totals.baseCurrency
          } ${totals.totalPortfolioValue.toLocaleString()}`,
          sub: "Total Value",
          status: "neutral",
        },
        {
          label: "총 수익",
          value: `${
            totals.baseCurrency
          } ${totals.totalPortfolioProfitLoss.toLocaleString()}`,
          sub: totals.totalPortfolioProfitLoss > 0 ? "▲ Profit" : "▼ Loss",
          status:
            totals.totalPortfolioProfitLoss >= 0 ? "positive" : "negative",
        },
        {
          label: "원금",
          value: `${
            totals.baseCurrency
          } ${totals.totalPortfolioCostBasis.toLocaleString()}`,
          sub: "Cost Basis",
          status: "neutral",
        },
        {
          label: "수익률",
          value: `${totals.totalPortfolioReturnPercentage.toFixed(2)}%`,
          sub: "Return Rate",
          status:
            totals.totalPortfolioReturnPercentage >= 0
              ? "positive"
              : "negative",
        },
      ]
    : [];

  const riskComparisonItems =
    riskData && riskData.metrics && riskData.benchmark
      ? [
          {
            key: "volatility",
            label: "변동성 (Volatility)",
            desc: "낮을수록 안정적",
            portfolioValue: riskData.metrics.volatility ?? 0,
            benchmarkValue: riskData.benchmark.volatility ?? 0,
          },
          {
            key: "beta",
            label: "베타 (Beta)",
            desc: "시장 민감도 (기준 1.0)",
            portfolioValue: riskData.metrics.beta ?? 0,
            benchmarkValue: 1.0,
          },
          {
            key: "maxDrawdown",
            label: "최대 낙폭 (MDD)",
            desc: "0에 가까울수록 좋음",
            portfolioValue: riskData.metrics.maxDrawdown ?? 0,
            benchmarkValue: riskData.benchmark.maxDrawdown ?? 0,
            isNegative: true,
          },
          {
            key: "sharpeRatio",
            label: "샤프 지수 (Sharpe)",
            desc: "클수록 좋음",
            portfolioValue: riskData.metrics.sharpeRatio ?? 0,
            benchmarkValue: riskData.benchmark.sharpeRatio ?? 0,
          },
        ]
      : [];

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
          <ButtonGroup
            options={intervalOptions}
            value={interval}
            onChange={setInterval}
          />
        </div>
      </div>

      <div className={style.kpiRow}>
        {kpiItems.map((kpi, idx) => (
          <div key={idx} className={`${style.kpiCard} ${style[kpi.status]}`}>
            <span className={style.kpiCard__label}>{kpi.label}</span>
            <span className={style.kpiCard__value}>{kpi.value}</span>
            <span
              className={`${style.kpiCard__sub} ${
                kpi.status === "positive"
                  ? style.profit
                  : kpi.status === "negative"
                  ? style.loss
                  : ""
              }`}
            >
              {kpi.sub}
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
            ) : (
              "데이터를 분석 중입니다..."
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
                {/* 차트 영역 */}
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

        <div className={style.matrixContainer}>
          <h3 className={style.sectionTitle}>자산 상관관계</h3>
          <div className={style.matrixCard}>
            <CorrelationMatrixChart />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
