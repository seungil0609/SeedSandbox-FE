import { useAtom, useSetAtom } from 'jotai';
import { AllTransactionAtom } from '../store/transaction/atom';
import style from './styles/TransactionPage.module.scss';
import { deleteTransactionByIdAtom, getAllTransactionAtom } from '../store/transaction/action';
import { useEffect, useState } from 'react';
import { ChevronDown, Trash } from 'lucide-react';
import TransactionCreateModal from '../widgets/TransactionCreateModal';
import modalStyle from '../widgets/styles/TransactionCreateModal.module.scss';
import { useNavigate } from 'react-router-dom';
import { allPortfolios, selectedPortfolioIdAtom } from '../store/portfolios/atoms';
import { setCurrentPortfolioAtom } from '../store/portfolios/action';

function TransactionPage() {
    // atoms
    const [transactionData] = useAtom(AllTransactionAtom);
    const [selectedPortfolioId] = useAtom(selectedPortfolioIdAtom);
    const [portfolios] = useAtom(allPortfolios);
    const getAllTransactionData = useSetAtom(getAllTransactionAtom);
    const setCurrentPortfolio = useSetAtom(setCurrentPortfolioAtom);
    const deleteTransactionById = useSetAtom(deleteTransactionByIdAtom);
    //
    const [toggleTransactionCreateModal, setToggleTransactionCreateModal] = useState(false);
    const [toggleDropdown, setToggleDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getAllTransactionData();
    }, [selectedPortfolioId, getAllTransactionData]);

    const handleNavigateToPortfolioPage = () => {
        navigate('/portfolio');
    };

    const handleDeleteTransaction = async (transactionId: string) => {
        await deleteTransactionById(transactionId);
    };

    return (
        <div className={style.pageWrapper}>
            <div className={style.portfolioContainer}>
                <div className={style.header}>
                    <div className={style.rowWrapper}>
                        <div className={style.title}>
                            내 포트폴리오 |{' '}
                            {portfolios.find((item) => item._id === selectedPortfolioId)?.name}{' '}
                            거래내역
                        </div>
                        <div className={style.dropDown}>
                            <ChevronDown
                                className={style.dropDownIcon}
                                onClick={() => setToggleDropdown(!toggleDropdown)}
                            />
                            <div className={style.dropDown__wrapper}>
                                {toggleDropdown &&
                                    portfolios.map((portfolio) => (
                                        <button
                                            className={style.dropDown__button}
                                            key={portfolio._id}
                                            onClick={() => {
                                                setCurrentPortfolio(portfolio._id);
                                                setToggleDropdown(false);
                                            }}>
                                            {portfolio.name}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                    <div className={style.rowWrapper}>
                        <button
                            className={style.createButton}
                            onClick={handleNavigateToPortfolioPage}>
                            포트폴리오
                        </button>
                        <button
                            className={style.createButton}
                            onClick={() => setToggleTransactionCreateModal(true)}>
                            거래내역 추가/수정
                        </button>
                    </div>
                </div>
                <table className={style.portfolioTable}>
                    <thead>
                        <tr>
                            <th>티커</th>
                            <th>거래 종류</th>
                            <th>수량</th>
                            <th>거래 가격</th>
                            <th>통화</th>
                            <th>거래 일자</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactionData
                            ? transactionData.map((transaction) => (
                                  <tr key={transaction._id}>
                                      <td>{transaction.asset?.ticker}</td>
                                      <td
                                          className={`${
                                              transaction.transactionType === 'BUY'
                                                  ? style.buy
                                                  : style.sell
                                          }`}>
                                          {transaction.transactionType}
                                      </td>
                                      <td>{transaction.quantity}주</td>
                                      <td className={style.price}>{transaction.price}</td>
                                      <td>{transaction.currency}</td>
                                      <td>{transaction.transactionDate.split('T')[0]}</td>
                                      <td>
                                          <button
                                              className={style.actionButton}
                                              onClick={() =>
                                                  handleDeleteTransaction(transaction._id)
                                              }>
                                              <Trash className={style.actionLogo} />
                                          </button>
                                      </td>
                                  </tr>
                              ))
                            : ''}
                    </tbody>
                </table>
            </div>
            {toggleTransactionCreateModal && (
                <div
                    className={modalStyle.overlay}
                    onClick={() => setToggleTransactionCreateModal(false)}>
                    <TransactionCreateModal
                        onClose={() => setToggleTransactionCreateModal(false)}
                    />
                </div>
            )}
        </div>
    );
}

export default TransactionPage;
