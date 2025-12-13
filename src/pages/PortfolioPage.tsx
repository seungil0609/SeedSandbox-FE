import { useAtom, useSetAtom } from "jotai";
import style from "./styles/PortfolioPage.module.scss";
import {
  allPortfolios,
  portfolioItems,
  selectedPortfolio,
  selectedPortfolioIdAtom,
} from "../store/portfolios/atoms";
import { useEffect, useState, useMemo } from "react"; // 🟢 useMemo 추가
import {
  deleteCurrentPortfolioAtom,
  getAllPortfoliosAtom,
  getPortfolioItemsByIdAtom,
  setCurrentPortfolioAtom,
} from "../store/portfolios/action";
import modalStyle from "../widgets/styles/TransactionCreateModal.module.scss";
import PortfolioCreateModal from "../widgets/PortfolioCreateModal";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";

// 🟢 [상수] 환율 (1 USD = 1450 KRW)
const EXCHANGE_RATE = 1450;

const formatMoney = (value: number, currency: string) => {
  const symbol =
    currency === "KRW"
      ? "₩"
      : currency === "USD"
      ? "$"
      : currency === "JPY"
      ? "¥"
      : currency === "EUR"
      ? "€"
      : "";

  const options =
    currency === "KRW"
      ? { maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 };

  return `${symbol} ${value.toLocaleString(undefined, options)}`;
};

function PortfolioPage() {
  const [portfolios] = useAtom(allPortfolios);
  const [selectedPortfolioId] = useAtom(selectedPortfolioIdAtom);
  const [portfolioData] = useAtom(portfolioItems);
  const getAllPortfolios = useSetAtom(getAllPortfoliosAtom);
  const getPortfolioItemsById = useSetAtom(getPortfolioItemsByIdAtom);
  const setCurrentPortfolio = useSetAtom(setCurrentPortfolioAtom);
  const deleteCurrentPortfolio = useSetAtom(deleteCurrentPortfolioAtom);

  const [togglePortfolioCreateModal, setTogglePortfolioCreateModal] =
    useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllPortfolios();
  }, [getAllPortfolios]);

  useEffect(() => {
    if (selectedPortfolioId === null) {
      getAllPortfolios();
    } else if (selectedPortfolioId) {
      getPortfolioItemsById(selectedPortfolioId);
    }
  }, [
    portfolios,
    getPortfolioItemsById,
    selectedPortfolioId,
    getAllPortfolios,
  ]);

  const handleNavigateToTransactionPage = () => {
    navigate("/transactions");
  };

  const handleDeletePortfolio = async (
    e: React.MouseEvent,
    portfolioId: string
  ) => {
    e.stopPropagation();
    if (window.confirm("정말 이 포트폴리오를 삭제하시겠습니까?")) {
      if (selectedPortfolioId !== portfolioId) setCurrentPortfolio(portfolioId);
      await deleteCurrentPortfolio();
    }
  };

  const currentPortfolioObj = portfolios.find(
    (p) => p._id === selectedPortfolioId
  );
  const baseCurrency = currentPortfolioObj?.baseCurrency || "USD";

  // 🟢 [정렬 로직] 최근에 추가된(배열의 뒤쪽) 종목이 위로 오도록 뒤집기
  const sortedPortfolioData = useMemo(() => {
    if (!portfolioData) return [];
    return [...portfolioData].reverse();
  }, [portfolioData]);

  return (
    <div className={style.pageWrapper}>
      <div className={style.header}>
        <div className={style.title}>포트폴리오</div>

        <div className={style.buttonRail}>
          <button
            className={style.createButton}
            onClick={handleNavigateToTransactionPage}
          >
            거래내역 보기
          </button>
        </div>
      </div>

      <div className={style.contentContainer}>
        {/* 왼쪽 사이드바 */}
        <aside className={style.sidebar}>
          <div className={style.sidebarHeader}>
            <span>목록</span>
            <button
              className={style.miniAddButton}
              onClick={() => setTogglePortfolioCreateModal(true)}
              title="새 포트폴리오 추가"
            >
              <Plus size={18} />
            </button>
          </div>

          {portfolios.map((portfolio) => (
            <div
              key={portfolio._id}
              className={`${style.sidebarItem} ${
                selectedPortfolioId === portfolio._id ? style.active : ""
              }`}
              onClick={() => setCurrentPortfolio(portfolio._id)}
            >
              <span className={style.sidebarName}>
                {portfolio.name}
                <span
                  style={{
                    fontSize: "0.85em",
                    opacity: 0.6,
                    marginLeft: "4px",
                  }}
                >
                  ({portfolio.baseCurrency})
                </span>
              </span>

              <button
                className={style.sidebarIconBtn}
                onClick={(e) => handleDeletePortfolio(e, portfolio._id)}
                title="삭제"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {portfolios.length === 0 && (
            <div className={style.emptySidebar}>
              포트폴리오를
              <br />
              생성해주세요
            </div>
          )}
        </aside>

        {/* 오른쪽 테이블 */}
        <div className={style.portfolioContainer}>
          <table className={style.portfolioTable}>
            <thead>
              <tr>
                <th>티커</th>
                <th style={{ textAlign: "right" }}>수량</th>
                <th style={{ textAlign: "right" }}>평균 단가</th>
                <th style={{ textAlign: "right" }}>현재가</th>
                <th style={{ textAlign: "right" }}>변화율</th>
                <th style={{ textAlign: "right" }}>평가액</th>
              </tr>
            </thead>
            <tbody>
              {/* 🟢 [수정] sortedPortfolioData 사용 */}
              {sortedPortfolioData && sortedPortfolioData.length > 0 ? (
                sortedPortfolioData.map((item) => {
                  const itemCurrency = item.currency;

                  const getConverted = (val: number) => {
                    if (baseCurrency === itemCurrency) return null;
                    if (baseCurrency === "KRW" && itemCurrency === "USD") {
                      return val * EXCHANGE_RATE;
                    }
                    if (baseCurrency === "USD" && itemCurrency === "KRW") {
                      return val / EXCHANGE_RATE;
                    }
                    return null;
                  };

                  const convertedAvg = getConverted(item.averagePrice);
                  const convertedCurrent = getConverted(item.currentPrice);
                  const convertedTotal = getConverted(
                    item.currentPrice * item.quantity
                  );

                  return (
                    <tr key={item.ticker}>
                      <td style={{ fontWeight: "600", color: "#fff" }}>
                        {item.ticker}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {item.quantity.toLocaleString()}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        {formatMoney(item.averagePrice, item.currency)}
                        {convertedAvg !== null && (
                          <span
                            style={{
                              fontSize: "0.85em",
                              color: "rgba(255,255,255,0.5)",
                              marginLeft: "6px",
                              fontWeight: 400,
                            }}
                          >
                            ({formatMoney(convertedAvg, baseCurrency)})
                          </span>
                        )}
                      </td>

                      <td
                        style={{ textAlign: "right" }}
                        className={style.currentPrice}
                      >
                        {formatMoney(item.currentPrice, item.currency)}
                        {convertedCurrent !== null && (
                          <span
                            style={{
                              fontSize: "0.85em",
                              color: "rgba(255,255,255,0.5)",
                              marginLeft: "6px",
                              fontWeight: 400,
                            }}
                          >
                            ({formatMoney(convertedCurrent, baseCurrency)})
                          </span>
                        )}
                      </td>

                      <td
                        style={{ textAlign: "right" }}
                        className={`${style.returnRate} ${
                          item.returnRate > 0 ? style.profit : style.loss
                        }`}
                      >
                        {item.returnRate > 0 ? "+" : ""}
                        {(item.returnRate || 0).toFixed(2)}%
                      </td>

                      <td style={{ textAlign: "right" }}>
                        {formatMoney(
                          item.currentPrice * item.quantity,
                          item.currency
                        )}
                        {convertedTotal !== null && (
                          <span
                            style={{
                              fontSize: "0.85em",
                              color: "rgba(255,255,255,0.5)",
                              marginLeft: "6px",
                              fontWeight: 400,
                            }}
                          >
                            ({formatMoney(convertedTotal, baseCurrency)})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#666",
                    }}
                  >
                    보유 중인 자산이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {togglePortfolioCreateModal && (
        <div
          className={modalStyle.overlay}
          onClick={() => setTogglePortfolioCreateModal(false)}
        >
          <PortfolioCreateModal
            onClose={() => setTogglePortfolioCreateModal(false)}
          />
        </div>
      )}
    </div>
  );
}

export default PortfolioPage;
