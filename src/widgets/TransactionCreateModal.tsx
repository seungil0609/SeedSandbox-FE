import { useState, useEffect } from "react";
import style from "./styles/TransactionCreateModal.module.scss";
import { useAtom, useSetAtom } from "jotai";
import {
  getAllTransactionAtom,
  postTransactionAtom,
} from "../store/transaction/action";
import { getPortfolioItemsByIdAtom } from "../store/portfolios/action";
import { selectedPortfolioIdAtom } from "../store/portfolios/atoms";
import { AssetSearchResultAtom } from "../store/search/atoms";
import { getAssetSearchData } from "../store/search/action";

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
  const [assetTicker, setAssetTicker] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [transactionDate, setTransactionDate] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      setSearchQuery("");
    }
  }, [dropdownOpen]);

  // 🟢 [수정] 종목 선택 및 통화 자동 설정 로직
  const handleSuggestionClick = (item: any) => {
    setAssetTicker(item.symbol);
    setDropdownOpen(false);
    setSearchQuery("");

    // 1. API 데이터에 currency 정보가 있으면 우선 사용
    if (item.currency) {
      setCurrency(item.currency.toUpperCase());
    }
    // 2. 없다면 exchange 정보로 추론
    else if (item.exchange) {
      const exchange = item.exchange.toUpperCase();

      // 미국 거래소 (나스닥, 뉴욕 등) -> USD
      if (
        ["NMS", "NGM", "NYQ", "NYS", "NASDAQ", "NYSE", "AMEX", "PCX"].some(
          (code) => exchange.includes(code)
        )
      ) {
        setCurrency("USD");
      }
      // 한국 거래소 (코스피, 코스닥) -> KRW
      else if (
        ["KSC", "KOE", "KOSPI", "KOSDAQ", "KRX", "KS"].some((code) =>
          exchange.includes(code)
        )
      ) {
        setCurrency("KRW");
      }
      // 필요 시 다른 국가(JPY, CNY 등) 추가 가능
    }
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
        <label className={style.label}>티커 혹은 이름을 입력하세요.</label>
        <div className={style.autocomplete}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            placeholder={assetTicker || "Samsung, AAPL"}
          />
          {dropdownOpen && results && results.length > 0 && (
            <div className={style.dropdown}>
              {results.map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  className={style.dropdown__item}
                  onMouseDown={(e) => e.preventDefault()}
                  // 🟢 [수정] item 객체 전체를 넘겨줍니다.
                  onClick={() => handleSuggestionClick(item)}
                  aria-label={`${item.shortname} 선택`}
                >
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
        <label className={style.label}>거래 종류를 선택하세요.</label>
        <div className={style.rowWrapper__type}>
          <button
            type="button"
            className={`${style.button__buy} ${
              transactionType === "BUY" ? style.button__buy__active : ""
            }`}
            onClick={() => setTransactionType("BUY")}
          >
            매수
          </button>
          <button
            type="button"
            className={`${style.button__sell} ${
              transactionType === "SELL" ? style.button__sell__active : ""
            }`}
            onClick={() => setTransactionType("SELL")}
          >
            매도
          </button>
        </div>
        <div className={style.rowWrapper__number}>
          <div className={style.columnWrapper}>
            <label className={style.label}>수량</label>
            <input
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            ></input>
          </div>
          <div className={style.columnWrapper}>
            <label className={style.label}>가격</label>
            <input
              className={style.label}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            ></input>
          </div>
          {/* 🟢 [수정] 통화 선택 드롭다운 -> 읽기 전용 텍스트로 변경 */}
          <div className={style.columnWrapper}>
            <label className={style.label}>통화</label>
            <input
              className={style.readOnlyInput}
              value={currency}
              readOnly // ⭐️ 수정 불가능하게 설정
              tabIndex={-1} // 탭 키로 포커스 안 되게 설정 (편의성)
            />
          </div>
        </div>
        <label className={style.label}>거래 일자</label>
        <input
          type="datetime-local"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
        />
        <span></span>
        <div className={style.buttonRail}>
          <button
            type="button"
            onClick={onClose}
            className={style.button__cancel}
          >
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
