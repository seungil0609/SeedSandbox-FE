import { useAtom, useSetAtom } from 'jotai';
import style from './styles/DashboardPage.module.scss';
import CorrelationMatrixChart from '../widgets/CorrelationMatrixChart';
import {
    getPortfolioAIReviewAtom,
    getPortfolioChartDataAtom,
    getPortfolioChartIndexDataAtom,
    getPortfolioDashboardDataAtom,
    getPortfolioRiskDataAtom,
} from '../store/dashboard/action';
import { useEffect, useState } from 'react';
import {
    PortfolioAIReviewAnswerAtom,
    PortfolioRiskAtom,
    PortfolioTotalsAtom,
} from '../store/dashboard/atoms';
import HistoricalLineChart from '../widgets/HistoricalLineChart';

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
                className={`${style.button} ${value === opt.value ? style.active : ''}`}
                onClick={() => onChange(opt.value)}>
                {opt.label}
            </button>
        ))}
    </div>
);

// 마크업 HTML로 변환
const toHtmlWithEmphasis = (raw: string) => {
    const escape = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return raw
        .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
        .filter(Boolean)
        .map((part) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return `<strong>${escape(part.slice(2, -2))}</strong>`;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return `<em>${escape(part.slice(1, -1))}</em>`;
            }
            return escape(part);
        })
        .join('');
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

    const [interval, setInterval] = useState('1d');
    const [range, setRange] = useState('7d');
    const [marketIndex, setMarketIndex] = useState('nasdaq');

    const intervalOptions = [
        { label: '1일', value: '1d' },
        { label: '5일', value: '5d' },
        { label: '7일', value: '1wk' },
        { label: '30일', value: '1mo' },
        { label: '90일', value: '3mo' },
    ];

    const rangeOptions = [
        { label: '7일', value: '7d' },
        { label: '1개월', value: '1mo' },
        { label: '3개월', value: '3mo' },
        { label: '6개월', value: '6mo' },
        { label: '1년', value: '1y' },
        { label: '3년', value: '3y' },
        { label: '전체', value: 'max' },
    ];

    const indexOptions = [
        { label: 'S&P500', value: 'sp500' },
        { label: 'Dow Jones', value: 'dowjones' },
        { label: 'Nasdaq', value: 'nasdaq' },
        { label: 'KOSPI', value: 'kospi' },
        { label: 'KOSDAQ', value: 'kosdaq' },
    ];

    useEffect(() => {
        getPortfolioChartData(range, interval);
        getMarketIndexChartData(range, interval, marketIndex);
    }, [interval, range, marketIndex]);

    useEffect(() => {
        getPortfolioRiskData(marketIndex);
        getPortfolioDashboardData();
        getPortfolioChartData(range, interval);
        getMarketIndexChartData(range, interval, marketIndex);
        getPortfolioAIReview();
    }, []);

    const summaryItems = totals
        ? [
              {
                  key: 'totalPortfolioValue',
                  label: '총 포트폴리오 가치',
                  value: totals.totalPortfolioValue,
                  print: totals.totalPortfolioValue.toFixed(2) + ' ' + totals.baseCurrency,
              },
              {
                  key: 'totalPortfolioCostBasis',
                  label: '총 매입 원가',
                  value: totals.totalPortfolioCostBasis,
                  print: totals.totalPortfolioCostBasis.toFixed(2) + ' ' + totals.baseCurrency,
              },
              {
                  key: 'totalPortfolioProfitLoss',
                  label: '총 손익',
                  value: totals.totalPortfolioProfitLoss,
                  print: totals.totalPortfolioProfitLoss.toFixed(2) + ' ' + totals.baseCurrency,
              },
              {
                  key: 'totalPortfolioReturnPercentage',
                  label: '총 수익률(%)',
                  value: totals.totalPortfolioReturnPercentage,
                  print: totals.totalPortfolioReturnPercentage.toFixed(2) + '%',
              },
          ]
        : [];

    // 위험 요약 아이템 생성
    const riskSummaryItems = riskData
        ? [
              {
                  key: 'volatility',
                  label: '변동성',
                  value: riskData.metrics.volatility,
                  print: riskData.metrics.volatility.toFixed(2),
              },
              {
                  key: 'beta',
                  label: '베타',
                  value: riskData.metrics.beta,
                  print: riskData.metrics.beta.toFixed(2),
              },
              {
                  key: 'maxDrawdown',
                  label: '최대 낙폭',
                  value: riskData.metrics.maxDrawdown,
                  print: riskData.metrics.maxDrawdown.toFixed(2),
              },
              {
                  key: 'sharpeRatio',
                  label: '샤프 지수',
                  value: riskData.metrics.sharpeRatio,
                  print: riskData.metrics.sharpeRatio.toFixed(2),
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
                <p className={`${style.card__data} ${data > 0 ? style.profit : style.loss}`}>
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
                            <div>
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
                            dangerouslySetInnerHTML={{ __html: toHtmlWithEmphasis(aiReviewText) }}
                        />
                    ) : (
                        <p className={style.aiReview__content}>AI 분석을 불러오는 중입니다...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
