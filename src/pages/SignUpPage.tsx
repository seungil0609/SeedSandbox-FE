import { Link, useNavigate } from "react-router-dom";
import GuestHeader from "../widgets/GuestHeader";
import style from "./styles/SignUpPage.module.scss";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../store/auth/firebase";
import { register } from "../store/auth/action";
import { useSetAtom } from "jotai";
import { idTokenAtom, isAuthenticatedAtom } from "../store/auth/atoms"; // Atom 추가 임포트

function SignUpPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickName, setNickName] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState("");

  const navigate = useNavigate();
  const setRegister = useSetAtom(register);

  // 🚨 [추가] 토큰 상태를 수동으로 업데이트하기 위한 훅
  const setToken = useSetAtom(idTokenAtom);
  const setAuth = useSetAtom(isAuthenticatedAtom);

  const handleSignUpError = (error: FirebaseError) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        setStatus("이미 사용 중인 이메일입니다.");
        break;
      case "auth/invalid-email":
        setStatus("올바른 이메일 형식이 아닙니다.");
        break;
      case "auth/weak-password":
        setStatus("비밀번호는 최소 6자 이상이어야 합니다.");
        break;
      default:
        setStatus(`알 수 없는 오류입니다: ${error.code}`);
    }
    setTimeout(() => setStatus(""), 3000);
  };

  const handleSignUp = () => {
    if (!agree) {
      setStatus("약관에 동의해야합니다.");
      setTimeout(() => setStatus(""), 3000);
      return;
    }
    if (password !== passwordConfirm) {
      setStatus("비밀번호가 일치하지 않습니다.");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    createUserWithEmailAndPassword(auth, id, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // 1. 백엔드에 회원 정보 등록
        await setRegister({
          firebaseUid: user.uid,
          email: id,
          nickName: nickName,
        });

        // 2. 🚨 [핵심 수정] 토큰을 강제로 가져와서 상태에 즉시 주입
        // Firebase 리스너가 감지하기 전에 우리가 먼저 넣어줍니다.
        const token = await user.getIdToken();
        setToken(token);
        setAuth(true);

        // 3. 상태 업데이트가 완료된 후 대시보드로 이동
        navigate("/dashboard");
      })
      .catch((error) => {
        handleSignUpError(error);
      });
  };

  return (
    <>
      <GuestHeader />
      <div className={style.pageWrapper}>
        <section className={style.signUpSection}>
          <h1>SeedUp과 함께해요</h1>
          <p>투자자 커뮤니티에 가입하고 나만의 포트폴리오를 시작해보세요</p>

          <div className={style.form}>
            <label>아이디(이메일)</label>
            <input
              className={style.input}
              value={id}
              onChange={(e) => setId(e.target.value)}
            ></input>
            <label>닉네임</label>
            <input
              className={style.input}
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
            ></input>
            <label>비밀번호</label>
            <input
              className={style.input}
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <label>비밀번호 재입력</label>
            <input
              className={style.input}
              value={passwordConfirm}
              type="password"
              onChange={(e) => setPasswordConfirm(e.target.value)}
            ></input>
            <div className={style.rowWrapper}>
              <div className={style.checkboxWrapper}>
                <input
                  type="checkbox"
                  className={style.radioButton}
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  required
                />
                <label htmlFor="terms">SeedUp의 이용약관에 동의합니다</label>
              </div>
              <label className={style.status}>{status}</label>
            </div>
            <button
              className={style.submitButton}
              onClick={(e) => {
                e.preventDefault();
                handleSignUp();
              }}
            >
              회원가입
            </button>
          </div>
        </section>
        <div className={style.rowWrapper}>
          <p>회원이 아니라면</p>
          <Link to="/signIn" className={style.loginTextButton}>
            로그인
          </Link>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;
