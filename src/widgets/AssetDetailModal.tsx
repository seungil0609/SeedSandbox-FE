import { X } from "lucide-react";
import style from "./styles/AssetDetailModal.module.scss";
import { SelectedAssetDetailDataAtom } from "../store/search/atoms";
import { useAtom } from "jotai";
import { ResponsiveLine } from "@nivo/line";

interface Props {
  onClose: () => void;
}

// (참고) 현재 로직에서는 사용되지 않지만, 나중에 카드로 보여주고 싶을 때를 대비해 남겨둘 수 있습니다.
const AssetSummaryCard = ({
  header,
  print,
}: {
  header: string;
  print: React.ReactNode;
}) => {
  if (!print || print === "-" || print === "0%" || print === "NaN%")
    return null;

  return (
    <div className={style.card}>
      <h2 className={style.card__header}>{header}</h2>
      <p className={style.card__data}>{print}</p>
    </div>
  );
};

function AssetDetailModal({ onClose }: Props) {
  const [detailData] = useAtom(SelectedAssetDetailDataAtom);

  const nfInt = new Intl.NumberFormat("ko-KR");
  const nfFloat2 = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 });
  const nfFloat3 = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 3 });

  const meta = detailData?.meta;
  const f = detailData?.fundamentals;

  const assetCurrency = meta?.currency?.toUpperCase() || "USD";

  // 유효한 숫자인지 확인하는 함수
  const isValid = (num: any) => typeof num === "number" && !isNaN(num);

  // formatCurrency 함수 업데이트
  const formatCurrency = (value: number | undefined, digits = 0) => {
    if (!isValid(value)) return "-";
    if (value === 0) return `${assetCurrency} 0`;

    return `${assetCurrency} ${new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: digits,
      notation: "compact",
      compactDisplay: "short",
    }).format(value!)}`;
  };

  const assetType = meta?.assetType || "EQUITY";

  let listItems: { label: string; value: string }[] = [];

  if (f) {
    const commonItems = [
      { label: "52주 최고가", value: formatCurrency(f.fiftyTwoWeekHigh, 2) },
      { label: "52주 최저가", value: formatCurrency(f.fiftyTwoWeekLow, 2) },
      {
        label: "거래량",
        value: isValid(f.volume) ? nfInt.format(f.volume!) : "-",
      },
    ];

    if (assetType === "EQUITY") {
      listItems = [
        // 1. 핵심 재무 정보
        { label: "시가총액", value: formatCurrency(f.marketCap) },
        { label: "매출", value: formatCurrency(f.totalRevenue) },
        { label: "현금", value: formatCurrency(f.totalCash) },
        { label: "부채", value: formatCurrency(f.totalDebt) },

        // 2. 밸류에이션 및 수익성
        {
          label: "PER (TTM)",
          value: isValid(f.trailingPE) ? nfFloat2.format(f.trailingPE!) : "-",
        },
        {
          label: "PER (Fwd)",
          value: isValid(f.forwardPE) ? nfFloat2.format(f.forwardPE!) : "-",
        },
        { label: "EPS", value: isValid(f.eps) ? nfFloat2.format(f.eps!) : "-" },
        {
          label: "이익률",
          value: isValid(f.profitMargins)
            ? `${nfFloat3.format(f.profitMargins! * 100)}%`
            : "-",
        },

        // 3. 배당 및 목표가
        {
          label: "배당수익률",
          value: isValid(f.dividendYield)
            ? `${nfFloat3.format(f.dividendYield! * 100)}%`
            : "-",
        },
        { label: "목표 주가", value: formatCurrency(f.targetPrice, 2) },

        // 4. 기타 및 공통
        {
          label: "베타",
          value: isValid(f.beta) ? nfFloat3.format(f.beta!) : "-",
        },
        {
          label: "추천",
          value: f.recommendationKey
            ? f.recommendationKey.replace(/_/g, " ").toUpperCase()
            : "-",
        },
        ...commonItems,
      ];
    } else {
      listItems = [
        ...commonItems,
        {
          label: "베타",
          value: isValid(f.beta) ? nfFloat3.format(f.beta!) : "-",
        },
      ];
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const lineData = detailData?.chartData?.length
    ? [
        {
          id: meta?.symbol || "Price",
          data: detailData.chartData.map((d) => ({
            x: d.date,
            y: d.close.toFixed(2),
          })),
        },
      ]
    : [];

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.container} onClick={(e) => e.stopPropagation()}>
        <header className={style.header}>
          <div className={style.titleWrapper}>
            <h1 className={style.title}>{meta?.longName || meta?.shortName}</h1>
            <span className={style.ticker}>{meta?.symbol}</span>
          </div>
          <button className={style.closeButton} onClick={onClose}>
            <X />
          </button>
        </header>

        <div className={style.meta}>
          {meta?.assetType && (
            <span className={style.boardType}>{meta.assetType}</span>
          )}
          <span className={style.boardType} style={{ marginLeft: "6px" }}>
            {meta?.exchange}
          </span>
          <span className={style.boardType} style={{ marginLeft: "6px" }}>
            {assetCurrency}
          </span>
        </div>

        <div className={style.content}>
          <div className={style.details}>
            {listItems.map((item) => (
              <div key={item.label} className={style.details__item}>
                <span className={style.details__label}>{item.label}</span>
                <span className={style.details__value}>{item.value}</span>
              </div>
            ))}
          </div>

          {lineData.length ? (
            <section className={style.chart}>
              <h3 className={style.chart__title}>가격 추이</h3>
              <div className={style.chart__canvas}>
                <ResponsiveLine
                  data={lineData}
                  margin={{ top: 10, right: 20, bottom: 40, left: 50 }}
                  xScale={{
                    type: "time",
                    format: "%Y-%m-%d",
                    precision: "day",
                  }}
                  xFormat="time:%Y-%m-%d"
                  yScale={{
                    type: "linear",
                    min: "auto",
                    max: "auto",
                    stacked: false,
                  }}
                  enableGridX={false}
                  enableGridY={true}
                  axisBottom={{ format: "%m.%d", tickSize: 0, tickPadding: 10 }}
                  axisLeft={{ tickSize: 0, tickPadding: 10 }}
                  curve="monotoneX"
                  colors={["#00bfff"]}
                  enablePoints={false}
                  useMesh={true}
                  enableArea={true}
                  areaOpacity={0.1}
                  // 🟢 [수정] 툴팁 스타일 커스터마이징 (검은 배경, 가로 정렬)
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
                        whiteSpace: "nowrap", // 줄바꿈 방지
                      }}
                    >
                      <div
                        style={{
                          color: "#aaa",
                          marginBottom: "4px",
                          fontSize: "11px",
                        }}
                      >
                        {point.data.xFormatted}
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#00bfff",
                          fontSize: "14px",
                        }}
                      >
                        {assetCurrency} {point.data.yFormatted}
                      </div>
                    </div>
                  )}
                  // 🟢 [수정] 테마 설정 (기본 스타일 덮어쓰기)
                  theme={{
                    text: { fill: "#888", fontSize: 11 },
                    grid: {
                      line: { stroke: "#333", strokeDasharray: "4 4" },
                    },
                    tooltip: {
                      container: {
                        background: "#222",
                        color: "#fff",
                        fontSize: "12px",
                        border: "1px solid #444",
                      },
                    },
                    axis: { ticks: { text: { fill: "#666" } } },
                  }}
                />
              </div>
            </section>
          ) : null}

          {detailData?.news?.length ? (
            <section className={style.news}>
              <h3 className={style.news__title}>관련 뉴스</h3>
              <div className={style.news__list}>
                {detailData.news.map((n) => (
                  <a
                    key={`${n.link}-${n.providerPublishTime}`}
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={style.news__item}
                  >
                    {n.thumbnail && (
                      <img
                        className={style.news__thumb}
                        src={n.thumbnail}
                        alt="thumb"
                      />
                    )}
                    <div className={style.news__meta}>
                      <div className={style.news__headline}>{n.title}</div>
                      <div className={style.news__info}>
                        <span className={style.news__publisher}>
                          {n.publisher}
                        </span>
                        <span className={style.news__dot}>·</span>
                        <span className={style.news__time}>
                          {formatDate(n.providerPublishTime)}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default AssetDetailModal;
