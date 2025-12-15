import { Link, useNavigate } from "react-router-dom";
import GuestHeader from "../widgets/GuestHeader";
import style from "./styles/SignInPage.module.scss";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../store/auth/firebase";
import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { useSetAtom } from "jotai";
import { getAllPortfoliosAtom } from "../store/portfolios/action";

function SignInPage() {
  const getPortfolio = useSetAtom(getAllPortfoliosAtom);

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleSignInError = (error: FirebaseError) => {
    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        setStatus("아이디 또는 비밀번호를 다시 확인해주세요.");
        break;
      case "auth/invalid-email":
        setStatus("올바른 이메일 형식이 아닙니다.");
        break;
      case "auth/too-many-requests":
        setStatus("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.");
        break;
      default:
        setStatus(`로그인 중 문제가 발생했습니다: ${error.code}`);
    }
    setTimeout(() => setStatus(""), 3000);
  };

  const handleLogin = () => {
    if (!id || !password) {
      setStatus("아이디와 비밀번호를 입력해주세요.");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    signInWithEmailAndPassword(auth, id, password)
      .then(async () => {
        await getPortfolio();
        navigate("/dashboard");
      })
      .catch((error) => {
        handleSignInError(error);
      });
  };

  return (
    <>
      <GuestHeader />
      <div className={style.pageWrapper}>
        <section className={style.signUpSection}>
          <h1>다시 오셨군요!</h1>
          <p>SeedSandbox | 투자의 시작, 가장 안전한 실험실</p>

          <form
            className={style.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            {/* 🟢 [수정] inputGroup div로 감싸서 라벨과 인풋을 붙여줍니다 */}
            <div className={style.inputGroup}>
              <label>아이디</label>
              <input
                className={style.input}
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="example@email.com"
              />
            </div>

            {/* 🟢 [수정] inputGroup div로 감싸기 */}
            <div className={style.inputGroup}>
              <label>비밀번호</label>
              <input
                className={style.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
              />
            </div>

            <div className={style.rowWrapper}>
              <label
                className={style.status}
                style={{ color: "#ff6b6b", minHeight: "20px" }}
              >
                {status}
              </label>
            </div>

            <button className={style.submitButton} type="submit">
              로그인
            </button>
          </form>
        </section>
        <div className={style.rowWrapper}>
          <p>회원이 아니시라면?</p>
          <Link to="/signup" className={style.loginTextButton}>
            회원가입
          </Link>
        </div>
      </div>
    </>
  );
}

export default SignInPage;
