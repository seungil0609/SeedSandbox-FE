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

// 버튼 그룹
const ButtonGroup = ({
  options,
  value,
  onChange,
  className,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) => (
  <div className={className || style.buttonRail}>
    {options.map((opt) => (
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
      if (part.startsWith("*") && part.endsWith("*")) {
        return `<em>${escape(part.slice(1, -1))}</em>`;
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

  // Options (생략 없이 그대로 둠)
  const intervalOptions = [
    { label: "1일", value: "1d" },
    { label: "5일", value: "5d" },
    { label: "7일", value: "1wk" },
    { label: "30일", value: "1mo" },
    { label: "90일", value: "3mo" },
  ];

  const rangeOptions = [
    { label: "7일", value: "7d" },
    { label: "1개월", value: "1mo" },
    { label: "3개월", value: "3mo" },
    { label: "6개월", value: "6mo" },
    { label: "1년", value: "1y" },
    { label: "3년", value: "3y" },
    { label: "전체", value: "max" },
  ];

  const indexOptions = [
    { label: "S&P500", value: "sp500" },
    { label: "Dow Jones", value: "dowjones" },
    { label: "Nasdaq", value: "nasdaq" },
    { label: "KOSPI", value: "kospi" },
    { label: "KOSDAQ", value: "kosdaq" },
  ];

  // API 호출
  useEffect(() => {
    if (!selectedPortfolioId) return;
    getPortfolioChartData(range, interval);
    getMarketIndexChartData(range, interval, marketIndex);
  }, [
    interval,
    range,
    marketIndex,
    selectedPortfolioId,
    getPortfolioChartData,
    getMarketIndexChartData,
  ]);

  useEffect(() => {
    if (!selectedPortfolioId) return;
    getPortfolioRiskData(marketIndex);
    getPortfolioDashboardData();
    getPortfolioChartData(range, interval);
    getMarketIndexChartData(range, interval, marketIndex);
    getPortfolioAIReview();
  }, [
    selectedPortfolioId,
    getPortfolioRiskData,
    getPortfolioDashboardData,
    getPortfolioChartData,
    getMarketIndexChartData,
    getPortfolioAIReview,
    marketIndex,
  ]);

  // Case 1: 포트폴리오 ID 자체가 없을 때 (생성 유도)
  if (!selectedPortfolioId) {
    return (
      <div
        className={style.pageWrapper}
        style={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "#fff" }}>
          선택된 포트폴리오가 없습니다.
        </h2>
        <p style={{ marginBottom: "2rem", color: "#aaa" }}>
          상단 메뉴의 '포트폴리오' 탭에서 새 포트폴리오를 생성하거나
          선택해주세요.
        </p>
        <Link
          to="/portfolio"
          style={{
            padding: "10px 20px",
            backgroundColor: "#00bfff",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          포트폴리오 관리로 이동
        </Link>
      </div>
    );
  }

  // Case 2: 포트폴리오는 있지만 자산(매입금액)이 0원일 때 (거래내역 추가 유도)
  // totals 데이터가 로드된 상태(null이 아님)에서 CostBasis가 0이면 빈 깡통으로 간주
  if (totals && totals.totalPortfolioCostBasis === 0) {
    return (
      <div
        className={style.pageWrapper}
        style={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "#fff" }}>
          아직 거래 내역이 없습니다.
        </h2>
        <p style={{ marginBottom: "2rem", color: "#aaa" }}>
          매수/매도 내역을 입력하면 AI가 포트폴리오를 분석해드립니다.
          <br />첫 번째 자산을 추가해보세요!
        </p>
        <Link
          to="/transactions"
          style={{
            padding: "12px 24px",
            backgroundColor: "#28a745",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          거래내역 추가하기
        </Link>
      </div>
    );
  }

  // 정상 데이터 렌더링
  const summaryItems = totals
    ? [
        {
          key: "totalPortfolioValue",
          label: "총 포트폴리오 가치",
          value: totals.totalPortfolioValue ?? 0,
          print:
            (totals.totalPortfolioValue || 0).toFixed(2) +
            " " +
            (totals.baseCurrency || "USD"),
        },
        {
          key: "totalPortfolioCostBasis",
          label: "총 매입 원가",
          value: totals.totalPortfolioCostBasis ?? 0,
          print:
            (totals.totalPortfolioCostBasis || 0).toFixed(2) +
            " " +
            (totals.baseCurrency || "USD"),
        },
        {
          key: "totalPortfolioProfitLoss",
          label: "총 손익",
          value: totals.totalPortfolioProfitLoss ?? 0,
          print:
            (totals.totalPortfolioProfitLoss || 0).toFixed(2) +
            " " +
            (totals.baseCurrency || "USD"),
        },
        {
          key: "totalPortfolioReturnPercentage",
          label: "총 수익률(%)",
          value: totals.totalPortfolioReturnPercentage ?? 0,
          print: (totals.totalPortfolioReturnPercentage || 0).toFixed(2) + "%",
        },
      ]
    : [];

  const riskSummaryItems =
    riskData && riskData.metrics
      ? [
          {
            key: "volatility",
            label: "변동성",
            value: riskData.metrics.volatility ?? 0,
            print: (riskData.metrics.volatility || 0).toFixed(2),
          },
          {
            key: "beta",
            label: "베타",
            value: riskData.metrics.beta ?? 0,
            print: (riskData.metrics.beta || 0).toFixed(2),
          },
          {
            key: "maxDrawdown",
            label: "최대 낙폭",
            value: riskData.metrics.maxDrawdown ?? 0,
            print: (riskData.metrics.maxDrawdown || 0).toFixed(2),
          },
          {
            key: "sharpeRatio",
            label: "샤프 지수",
            value: riskData.metrics.sharpeRatio ?? 0,
            print: (riskData.metrics.sharpeRatio || 0).toFixed(2),
          },
        ]
      : [];

  const DashboardSummaryCard = ({
    header,
    data,
    print,
  }: {
    header: string;
    data: number;
    print: string;
  }) => {
    return (
      <div className={style.card}>
        <h2 className={style.card__header}>{header}</h2>
        <p
          className={`${style.card__data} ${
            data > 0 ? style.profit : data < 0 ? style.loss : ""
          }`}
        >
          {print}
        </p>
      </div>
    );
  };

  return (
    <div className={style.pageWrapper}>
      <div className={style.header}>
        <div className={style.title}>대시보드</div>
      </div>
      <div className={style.gridWrapper}>
        <div className={style.chartWrapper__line}>
          <div className={style.columnWrapper}>
            <h3 className={style.aiReview__header}>포트폴리오 가치 추이</h3>
            <HistoricalLineChart />
            <div>
              <div style={{ marginTop: "10px" }}>
                <div className={style.buttonGroupHeader}>비교 시장 지수</div>
                <ButtonGroup
                  options={indexOptions}
                  value={marketIndex}
                  onChange={setMarketIndex}
                />
              </div>
              <div>
                <div className={style.buttonGroupHeader}>간격</div>
                <ButtonGroup
                  options={intervalOptions}
                  value={interval}
                  onChange={setInterval}
                />
              </div>
              <div>
                <div className={style.buttonGroupHeader}>기간</div>
                <ButtonGroup
                  options={rangeOptions}
                  value={range}
                  onChange={setRange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={style.riskSummaryGrid}>
          {summaryItems.map((item) => (
            <DashboardSummaryCard
              key={item.key}
              header={item.label}
              data={item.value}
              print={item.print}
            />
          ))}
          {riskSummaryItems.map((item) => (
            <DashboardSummaryCard
              key={item.key}
              header={item.label}
              data={item.value}
              print={item.print}
            />
          ))}
        </div>
      </div>

      <div className={style.gridWrapper}>
        <div className={style.chartWrapper__matrix}>
          <div className={style.columnWrapper}>
            <h3 className={style.aiReview__header}>자산 상관관계 매트릭스</h3>
            <CorrelationMatrixChart />
          </div>
        </div>
        <div className={style.aiReview}>
          <h3 className={style.aiReview__header}>AI 포트폴리오 분석</h3>
          {aiReviewText && aiReviewText.trim().length > 0 ? (
            <div
              className={style.aiReview__content}
              dangerouslySetInnerHTML={{
                __html: toHtmlWithEmphasis(aiReviewText),
              }}
            />
          ) : (
            <p className={style.aiReview__content}>
              AI 분석을 불러오는 중입니다...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
