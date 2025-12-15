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
    // 🟢 에러 메시지 개선
    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential": // 최신 파이어베이스 에러 코드 대응
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
          {/* 🟢 문구 수정 */}
          <h1>다시 오셨군요!</h1>
          <p>주식 투자의 첫 걸음, SeedSandbox</p>

          <form
            className={style.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <label>아이디</label>
            <input
              className={style.input}
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="example@email.com"
            />
            <label>비밀번호</label>
            <input
              className={style.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
            />

            <div className={style.rowWrapper}>
              {/* 에러 메시지 스타일을 위해 클래스 추가 권장 (예: style.errorStatus) */}
              <label className={style.status} style={{ color: "#ff6b6b" }}>
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
          <Link to="/signUp" className={style.loginTextButton}>
            회원가입
          </Link>
        </div>
      </div>
    </>
  );
}

export default SignInPage;
