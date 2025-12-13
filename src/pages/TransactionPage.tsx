import { useAtom, useSetAtom } from "jotai";
import { AllTransactionAtom } from "../store/transaction/atom";
import style from "./styles/TransactionPage.module.scss";
import {
  deleteTransactionByIdAtom,
  getAllTransactionAtom,
} from "../store/transaction/action";
import { useEffect, useState } from "react";
import { Trash, Plus } from "lucide-react"; // 🟢 Plus 아이콘
import TransactionCreateModal from "../widgets/TransactionCreateModal";
import modalStyle from "../widgets/styles/TransactionCreateModal.module.scss";
import { useNavigate } from "react-router-dom";
import {
  allPortfolios,
  selectedPortfolioIdAtom,
} from "../store/portfolios/atoms";
import { setCurrentPortfolioAtom } from "../store/portfolios/action";

function TransactionPage() {
  const [transactionData] = useAtom(AllTransactionAtom);
  const [selectedPortfolioId] = useAtom(selectedPortfolioIdAtom);
  const [portfolios] = useAtom(allPortfolios);

  const getAllTransactionData = useSetAtom(getAllTransactionAtom);
  const setCurrentPortfolio = useSetAtom(setCurrentPortfolioAtom);
  const deleteTransactionById = useSetAtom(deleteTransactionByIdAtom);

  const [toggleTransactionCreateModal, setToggleTransactionCreateModal] =
    useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllTransactionData();
  }, [selectedPortfolioId, getAllTransactionData]);

  const handleNavigateToPortfolioPage = () => {
    navigate("/portfolio");
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm("이 거래 내역을 삭제하시겠습니까?")) {
      await deleteTransactionById(transactionId);
    }
  };

  // 🟢 [추가] 사이드바의 + 버튼 클릭 시 해당 포트폴리오 선택 후 모달 오픈
  const handleAddTransaction = (e: React.MouseEvent, portfolioId: string) => {
    e.stopPropagation(); // 부모(포트폴리오 선택) 클릭 방지
    setCurrentPortfolio(portfolioId); // 해당 포트폴리오 선택
    setToggleTransactionCreateModal(true); // 모달 열기
  };

  // 현재 선택된 포트폴리오 이름
  const currentPortfolioName =
    portfolios.find((p) => p._id === selectedPortfolioId)?.name || "";

  return (
    <div className={style.pageWrapper}>
      <div className={style.header}>
        {/* 타이틀 */}
        <div className={style.title}>거래내역</div>

        {/* 우측 상단 버튼 레일 */}
        <div className={style.buttonRail}>
          <button
            className={style.createButton}
            onClick={handleNavigateToPortfolioPage}
          >
            포트폴리오 보기
          </button>
        </div>
      </div>

      {/* 🟢 [복구] 포트폴리오 페이지와 동일한 레이아웃 구조 */}
      <div className={style.contentContainer}>
        {/* 왼쪽 사이드바 */}
        <aside className={style.sidebar}>
          <div className={style.sidebarHeader}>포트폴리오 선택</div>

          {portfolios.map((portfolio) => (
            <div
              key={portfolio._id}
              className={`${style.sidebarItem} ${
                selectedPortfolioId === portfolio._id ? style.active : ""
              }`}
              onClick={() => setCurrentPortfolio(portfolio._id)}
            >
              <span className={style.sidebarName}>{portfolio.name}</span>

              {/* 🟢 [요청반영] 각 포트폴리오 옆에 거래내역 추가(+) 버튼 */}
              <button
                className={style.sidebarAddBtn}
                onClick={(e) => handleAddTransaction(e, portfolio._id)}
                title="거래내역 추가"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </aside>

        {/* 오른쪽 메인 콘텐츠 */}
        <div className={style.mainContent}>
          <table className={style.portfolioTable}>
            <thead>
              <tr>
                <th>티커</th>
                <th>종류</th>
                <th>수량</th>
                <th>가격</th>
                <th>통화</th>
                <th>일자</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {transactionData && transactionData.length > 0 ? (
                transactionData.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.asset?.ticker}</td>
                    <td
                      className={
                        transaction.transactionType === "BUY"
                          ? style.buy
                          : style.sell
                      }
                    >
                      {transaction.transactionType}
                    </td>
                    <td>{transaction.quantity}</td>
                    <td className={style.price}>
                      {transaction.price.toLocaleString()}
                    </td>
                    <td>{transaction.currency}</td>
                    <td>
                      {transaction.transactionDate
                        .split("T")[0]
                        .replace(/-/g, ".")}
                    </td>
                    <td>
                      <button
                        className={style.actionButton}
                        onClick={() => handleDeleteTransaction(transaction._id)}
                      >
                        <Trash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#666",
                    }}
                  >
                    거래 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toggleTransactionCreateModal && (
        <div
          className={modalStyle.overlay}
          onClick={() => setToggleTransactionCreateModal(false)}
        >
          <TransactionCreateModal
            onClose={() => setToggleTransactionCreateModal(false)}
          />
        </div>
      )}
    </div>
  );
}

export default TransactionPage;
