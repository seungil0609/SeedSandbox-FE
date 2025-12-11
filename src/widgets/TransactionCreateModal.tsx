import { useState, useEffect } from 'react';
import style from './styles/TransactionCreateModal.module.scss';
import { useAtom, useSetAtom } from 'jotai';
import { getAllTransactionAtom, postTransactionAtom } from '../store/transaction/action';
import { getPortfolioItemsByIdAtom } from '../store/portfolios/action';
import { selectedPortfolioIdAtom } from '../store/portfolios/atoms';
import { AssetSearchResultAtom } from '../store/search/atoms';
import { getAssetSearchData } from '../store/search/action';

interface ModalProps {
    onClose: () => void;
}

function TransactionCreateModal({ onClose }: ModalProps) {
    // atom
    const [selectedPortfolioId] = useAtom(selectedPortfolioIdAtom);
    const getPortfolioItemsById = useSetAtom(getPortfolioItemsByIdAtom);
    const getAllTransactionData = useSetAtom(getAllTransactionAtom);
    const postTransaction = useSetAtom(postTransactionAtom);
    const [results] = useAtom(AssetSearchResultAtom);
    const fetchSearch = useSetAtom(getAssetSearchData);
    //
    const [assetTicker, setAssetTicker] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [price, setPrice] = useState(0);
    const [currency, setCurrency] = useState('USD');
    const [transactionDate, setTransactionDate] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const q = searchQuery.trim();
        if (!q) {
            return;
        }
        const t = setTimeout(() => {
            fetchSearch(q);
            setDropdownOpen(true);
        }, 250);
        return () => clearTimeout(t);
    }, [searchQuery, fetchSearch]);

    // 드롭다운 닫힐 때 검색어 비우기
    useEffect(() => {
        if (!dropdownOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearchQuery('');
        }
    }, [dropdownOpen]);

    const handleSuggestionClick = (symbol: string) => {
        setAssetTicker(symbol);
        setDropdownOpen(false);
        setSearchQuery('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await postTransaction(
            assetTicker,
            transactionType,
            quantity,
            price,
            currency,
            transactionDate
        );
        if (res === 201) {
            if (selectedPortfolioId !== null) {
                getPortfolioItemsById(selectedPortfolioId);
                getAllTransactionData();
            }
            onClose();
        }
    };
    return (
        <div className={style.container} onClick={(e) => e.stopPropagation()}>
            <header>
                <h1>거래내역을 추가하세요.</h1>
                <p>아래에 거래내역의 상세 사항을 기입하세요.</p>
            </header>

            <form onSubmit={handleSubmit} className={style.columnWrapper}>
                <label className={style.label}>티커나 이름을 입력하세요</label>
                <div className={style.autocomplete}>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.trim() && setDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                        placeholder={assetTicker || '예: AAPL, 삼성전자'}
                    />
                    {dropdownOpen && results && results.length > 0 && (
                        <div className={style.dropdown}>
                            {results.map((item) => (
                                <button
                                    key={item.symbol}
                                    type="button"
                                    className={style.dropdown__item}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSuggestionClick(item.symbol)}
                                    aria-label={`${item.shortname} 선택`}>
                                    <span className={style.dropdown__symbol}>{item.symbol}</span>
                                    <span className={style.dropdown__name}>{item.shortname}</span>
                                    <span className={style.dropdown__meta}>
                                        {item.exchange} · {item.typeDisp}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <label className={style.label}>거래 종류를 선택하세요</label>
                <div className={style.rowWrapper__type}>
                    <button
                        type="button"
                        className={`${style.button__sell} ${
                            transactionType === 'SELL' ? style.button__sell__active : ''
                        }`}
                        onClick={() => setTransactionType('SELL')}>
                        매도
                    </button>
                    <button
                        type="button"
                        className={`${style.button__buy} ${
                            transactionType === 'BUY' ? style.button__buy__active : ''
                        }`}
                        onClick={() => setTransactionType('BUY')}>
                        매수
                    </button>
                </div>
                <div className={style.rowWrapper__number}>
                    <div className={style.columnWrapper}>
                        <label className={style.label}>수량</label>
                        <input
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}></input>
                    </div>
                    <div className={style.columnWrapper}>
                        <label className={style.label}>가격</label>
                        <input
                            className={style.label}
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}></input>
                    </div>
                    <div className={style.columnWrapper}>
                        <label className={style.label}>통화</label>
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                            <option value="KRW">한국 원</option>
                            <option value="USD">미국 달러</option>
                            <option value="JPY">일본 엔</option>
                            <option value="CNY">중국 위안</option>
                            <option value="EUR">유럽 유로</option>
                            <option value="GBP">영국 파운드</option>
                        </select>
                    </div>
                </div>
                <label className={style.label}>
                    거래시간 (예: 2025년 11월 29일 오후 11시 33분)
                </label>
                <input
                    type="datetime-local"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                />
                <span></span>
                <div className={style.buttonRail}>
                    <button type="button" onClick={onClose} className={style.button__cancel}>
                        취소
                    </button>
                    <button type="submit" className={style.button__save}>
                        저장
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TransactionCreateModal;
