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
  // atom
  const getPortfolio = useSetAtom(getAllPortfoliosAtom);
  //
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleSignInError = (error: FirebaseError) => {
    switch (error.code) {
      case "auth/user-not-found":
        setStatus("존재하지 않는 계정입니다.");
        break;
      case "auth/wrong-password":
        setStatus("비밀번호가 올바르지 않습니다.");
        break;
      case "auth/invalid-email":
        setStatus("올바른 이메일 형식이 아닙니다.");
        break;
      case "auth/too-many-requests":
        setStatus("잠시 후 다시 시도해주세요.");
        break;
      default:
        setStatus(`알 수 없는 오류입니다: ${error.code}`);
    }
    setTimeout(() => setStatus(""), 3000);
  };
  const handleLogin = () => {
    signInWithEmailAndPassword(auth, id, password)
      .then(async () => {
        await getPortfolio();
        navigate("/dashboard"); // ▼ '/' 대신 '/dashboard'로 변경
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
          <h1 className="">돌아오신 것을 환영합니다</h1>
          <form className={style.form}>
            <label>아이디(이메일)</label>
            <input
              className={style.input}
              value={id}
              onChange={(e) => setId(e.target.value)}
            ></input>
            <label>비밀번호</label>
            <input
              className={style.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <div className={style.rowWrapper}>
              <label className={style.status}>{status}</label>
            </div>
            <button
              className={style.submitButton}
              onClick={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              로그인
            </button>
          </form>
        </section>
        <div className={style.rowWrapper}>
          <p>회원이 아니라면</p>
          <Link to="/signUp" className={style.loginTextButton}>
            회원가입
          </Link>
        </div>
      </div>
    </>
  );
}

export default SignInPage;
