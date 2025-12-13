import { Link, useNavigate } from "react-router-dom";
import GuestHeader from "../widgets/GuestHeader";
import style from "./styles/SignUpPage.module.scss";
import { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth"; // signOut 추가
import { FirebaseError } from "firebase/app";
import { auth } from "../store/auth/firebase";
import { useSetAtom } from "jotai";
import { idTokenAtom, isAuthenticatedAtom } from "../store/auth/atoms";
import axios from "axios";
import { SERVER_IP } from "../constants/env";

function SignUpPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickName, setNickName] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  // Jotai 상태 업데이트 훅
  const setToken = useSetAtom(idTokenAtom);
  const setAuth = useSetAtom(isAuthenticatedAtom);

  const handleSignUpError = (error: any) => {
    // Firebase 에러 처리
    if (error instanceof FirebaseError) {
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
          setStatus(`오류: ${error.code}`);
      }
    }
    // 백엔드(Axios) 에러 처리
    else if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 409) {
        setStatus("이미 가입된 이메일입니다.");
        alert("이미 가입된 이메일입니다. 로그인 페이지로 이동합니다.");
        navigate("/signin");
      } else {
        setStatus("서버 등록 중 오류가 발생했습니다.");
      }
    } else {
      setStatus("알 수 없는 오류가 발생했습니다.");
    }
    setTimeout(() => setStatus(""), 3000);
  };

  const handleSignUp = async () => {
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

    try {
      // 1. Firebase 계정 생성 시도
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        id,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      // 2. 백엔드에 회원 정보 등록 요청 (직접 axios 호출하여 에러 캐치)
      // 🚨 이 부분이 실패하면 catch로 넘어가서 롤백됩니다.
      await axios.post(
        `${SERVER_IP}/api/users/register`,
        {
          firebaseUid: user.uid,
          email: id,
          nickname: nickName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 3. 백엔드 등록까지 성공해야만 상태 업데이트 및 이동
      setToken(token);
      setAuth(true);
      navigate("/dashboard");
    } catch (error) {
      console.error("회원가입 프로세스 실패:", error);

      // 🚨 [핵심] 실패 시 즉시 Firebase 로그아웃 (롤백)
      // 이걸 안 하면 리스너가 '로그인됨'으로 착각하고 대시보드로 보내버림 -> 401 발생
      await signOut(auth);
      setToken(null);
      setAuth(false);

      // 에러 메시지 출력
      handleSignUpError(error);
    }
  };

  return (
    <>
      <GuestHeader />
      <div className={style.pageWrapper}>
        <section className={style.signUpSection}>
          <h1>SeedSandbox과 함께해요</h1>
          <p>나만의 포트폴리오를 시작해보세요</p>

          <form
            className={style.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            <label>아이디(이메일)</label>
            <input
              className={style.input}
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="example@email.com"
            />
            <label>닉네임</label>
            <input
              className={style.input}
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              placeholder="닉네임 입력"
            />
            <label>비밀번호</label>
            <input
              className={style.input}
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력"
            />
            <label>비밀번호 재입력</label>
            <input
              className={style.input}
              value={passwordConfirm}
              type="password"
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 확인"
            />
            <div className={style.rowWrapper}>
              <div className={style.checkboxWrapper}>
                <input
                  type="checkbox"
                  id="terms"
                  className={style.radioButton}
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  required
                />
                <label htmlFor="terms">
                  SeedSandbox의 이용약관에 동의합니다
                </label>
              </div>
              <label className={style.status}>{status}</label>
            </div>
            <button className={style.submitButton} type="submit">
              회원가입
            </button>
          </form>
        </section>
        <div className={style.rowWrapper}>
          <p>회원이 아니라면</p>
          <Link to="/signin" className={style.loginTextButton}>
            로그인
          </Link>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;
