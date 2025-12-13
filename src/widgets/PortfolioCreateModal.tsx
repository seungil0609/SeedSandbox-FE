import { useState } from "react";
import style from "./styles/TransactionCreateModal.module.scss";
import { useSetAtom } from "jotai";
import {
  createNewPortfolioAtom,
  getAllPortfoliosAtom,
} from "../store/portfolios/action";

interface ModalProps {
  onClose: () => void;
}
function PortfolioCreateModal({ onClose }: ModalProps) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("KRW");
  const createNewPortfolio = useSetAtom(createNewPortfolioAtom);
  const getAllPortfolios = useSetAtom(getAllPortfoliosAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createNewPortfolio(name, currency);
    if (res === 201) {
      await getAllPortfolios();
      onClose();
    }
  };
  return (
    <div className={style.container} onClick={(e) => e.stopPropagation()}>
      <header>
        <h1>포트폴리오를 추가하세요.</h1>
        <p>아래에 상세 사항을 기입하세요.</p>
      </header>

      <form onSubmit={handleSubmit} className={style.columnWrapper}>
        <label className={style.label}>포트폴리오 이름을 입력하세요</label>
        <input value={name} onChange={(e) => setName(e.target.value)}></input>

        <div className={style.rowWrapper__number}>
          <div className={style.columnWrapper}>
            <label className={style.label}>포트폴리오 기준 통화</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="KRW">KRW</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
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
            추가
          </button>
        </div>
      </form>
    </div>
  );
}

export default PortfolioCreateModal;
