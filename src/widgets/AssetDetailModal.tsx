import { X } from 'lucide-react';
import style from './styles/AssetDetailModal.module.scss';
import { SelectedAssetDetailDataAtom } from '../store/search/atoms';
import { useAtom } from 'jotai';
import { PortfolioTotalsAtom } from '../store/dashboard/atoms';
import { ResponsiveLine } from '@nivo/line';

interface Props {
    onClose: () => void;
}

const AssetSummaryCard = ({ header, print }: { header: string; print: React.ReactNode }) => {
    return (
        <div className={style.card}>
            <h2 className={style.card__header}>{header}</h2>
            <p className={style.card__data}>{print}</p>
        </div>
    );
};

function AssetDetailModal({ onClose }: Props) {
    const [detailData] = useAtom(SelectedAssetDetailDataAtom);
    const portfolioInfo = useAtom(PortfolioTotalsAtom);

    const nfInt = new Intl.NumberFormat('ko-KR');
    const nfFloat2 = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 });
    const nfFloat3 = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 3 });

    const f = detailData?.fundamentals;
    const baseCurrency = portfolioInfo[0]?.baseCurrency || 'USD';

    const formatCurrency = (value: number, digits = 0) =>
        `${baseCurrency} ${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: digits }).format(
            value
        )}`;

    // 주요 지표
    const cards = f
        ? [
              { header: '시가총액', print: formatCurrency(f.marketCap) },
              { header: '매출', print: formatCurrency(f.totalRevenue) },
              { header: '현금', print: formatCurrency(f.totalCash) },
              { header: '부채', print: formatCurrency(f.totalDebt) },
              { header: '목표가', print: formatCurrency(f.targetPrice, 2) },
              { header: '배당수익률', print: `${nfFloat3.format(f.dividendYield * 100)}%` },
          ]
        : [];

    // 보조 지표
    const listItems = f
        ? [
              { label: 'TTM P/E', value: nfFloat2.format(f.trailingPE) },
              { label: '포워드 P/E', value: nfFloat2.format(f.forwardPE) },
              { label: 'P/B', value: nfFloat2.format(f.priceToBook) },
              { label: 'EPS', value: nfFloat2.format(f.eps) },
              { label: '이익률', value: `${nfFloat3.format(f.profitMargins * 100)}%` },
              { label: '베타', value: nfFloat3.format(f.beta) },
              { label: '52주 최고가', value: formatCurrency(f.fiftyTwoWeekHigh, 2) },
              { label: '52주 최저가', value: formatCurrency(f.fiftyTwoWeekLow, 2) },
              { label: '거래량', value: nfInt.format(f.volume) },
              {
                  label: '추천',
                  value: f.recommendationKey === 'buy' ? '매수' : f.recommendationKey,
              },
          ]
        : [];

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

    const lineData = detailData?.chartData?.length
        ? [
              {
                  id: detailData.meta.symbol,
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
                    <h1 className={style.title}>
                        {detailData?.meta.longName} | {detailData?.meta.symbol}
                    </h1>
                    <button className={style.closeButton} onClick={onClose}>
                        <X />
                    </button>
                </header>
                <div className={style.meta}>
                    <span className={style.boardType}>{detailData?.meta.exchange}</span>
                </div>
                <div className={style.content}>
                    {cards.map((c) => (
                        <AssetSummaryCard key={c.header} header={c.header} print={c.print} />
                    ))}
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
                                    xScale={{ type: 'time', format: '%Y-%m-%d', precision: 'day' }}
                                    xFormat="time:%Y-%m-%d"
                                    yScale={{
                                        type: 'linear',
                                        min: 'auto',
                                        max: 'auto',
                                        stacked: false,
                                    }}
                                    enableGridX={false}
                                    enableGridY={false}
                                    axisBottom={null}
                                    axisLeft={null}
                                    curve="monotoneX"
                                    colors={{ scheme: 'category10' }}
                                    enablePoints={false}
                                    useMesh={true}
                                    theme={{
                                        text: { color: '#fff' },
                                        tooltip: {
                                            container: {
                                                background: 'rgba(20,20,20,0.9)',
                                                color: '#fff',
                                                borderRadius: 8,
                                            },
                                        },
                                    }}
                                    tooltip={({ point }) => (
                                        <div style={{ padding: '6px 8px', fontSize: 12 }}>
                                            <div>{point.data.xFormatted}</div>
                                            <div style={{ fontWeight: 700 }}>
                                                {point.data.yFormatted}
                                            </div>
                                        </div>
                                    )}
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
                                        className={style.news__item}>
                                        <img
                                            className={style.news__thumb}
                                            src={n.thumbnail}
                                            alt={n.title}
                                        />
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
