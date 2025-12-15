import { useEffect, useState, useMemo } from "react";
import style from "./styles/CommunityPage.module.scss";
import { useAtom, useSetAtom } from "jotai";
import {
  getAllPostDataAtom,
  getPostDataByIdAtom,
  deletePostByIdAtom, // 🟢 [가정] 게시글 삭제 액션 (없다면 store/post/action에 추가 필요)
} from "../store/post/action";
import { AllPostDataAtom } from "../store/post/atoms";
import { UserProfileAtom } from "../store/auth/atoms"; // 🟢 로그인 유저 정보
import PostDetailModal from "../widgets/PostDetailModal";
import PostCreateModal from "../widgets/PostCreateModal";
import { getProfileAtom } from "../store/auth/action";
import { Trash2 } from "lucide-react"; // 🟢 휴지통 아이콘

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const BOARD_TYPES = ["전체보기", "공지", "질문", "자유", "정보"];

function CommunityPage() {
  const getPostDataById = useSetAtom(getPostDataByIdAtom);
  const getAllPostData = useSetAtom(getAllPostDataAtom);
  const deletePostById = useSetAtom(deletePostByIdAtom); // 🟢 삭제 함수
  const getUserData = useSetAtom(getProfileAtom);

  const [allPosts] = useAtom(AllPostDataAtom);
  const [userProfile] = useAtom(UserProfileAtom); // 🟢 현재 로그인 유저 정보

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState("전체보기");

  useEffect(() => {
    getAllPostData();
    getUserData();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!allPosts) return [];
    if (selectedBoard === "전체보기") return allPosts;
    return allPosts.filter((post) => post.boardType === selectedBoard);
  }, [allPosts, selectedBoard]);

  const handleDetailOpen = (id: string) => {
    setIsDetailOpen(true);
    getPostDataById(id);
  };

  // 🟢 게시글 삭제 핸들러
  const handleDeletePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation(); // 부모(상세보기) 클릭 이벤트 전파 중단
    if (window.confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      await deletePostById(postId);
      // 삭제 후 목록 갱신은 atom 내부 로직에 따름 (보통 자동 갱신됨)
    }
  };

  return (
    <div className={style.pageWrapper}>
      <div className={style.header}>
        <div className={style.title}>커뮤니티</div>
        <button
          className={style.writeButton}
          onClick={() => setIsCreateOpen(true)}
        >
          글쓰기
        </button>
      </div>

      <div className={style.contentContainer}>
        {/* 사이드바 */}
        <aside className={style.sidebar}>
          {/* 🟢 [추가] 게시판 선택 헤더 (스타일 통일) */}
          <div className={style.sidebarHeader} style={{ color: "#ffffff" }}>
            게시판
          </div>
          {BOARD_TYPES.map((type) => (
            <button
              key={type}
              className={`${style.sidebarItem} ${
                selectedBoard === type ? style.active : ""
              }`}
              onClick={() => setSelectedBoard(type)}
            >
              {type}
            </button>
          ))}
        </aside>

        {/* 리스트 목록 */}
        <div className={style.listContainer}>
          {filteredPosts.map((post) => (
            // 🟢 [변경] button -> div (내부에 삭제 버튼을 넣기 위해)
            <div
              key={post._id}
              className={style.listItem}
              onClick={() => handleDetailOpen(post._id)}
            >
              {/* 1. 배지 */}
              <span className={style.badge}>{post.boardType}</span>

              {/* 2. 제목 */}
              <span className={style.itemTitle}>{post.title}</span>

              {/* 3. 작성자 */}
              <span className={style.itemAuthor}>
                {post.user?.nickname ??
                  post.user?.email?.split("@")[0] ??
                  "익명"}
              </span>

              {/* 4. 날짜 */}
              <span className={style.itemDate}>
                {formatDate(post.createdAt)}
              </span>

              {/* 5. 삭제 버튼 (작성자 본인인 경우에만 표시) */}
              {/* userProfile._id와 post.user._id(혹은 user) 비교 */}
              {userProfile &&
              post.user &&
              (userProfile._id === post.user._id ||
                userProfile.email === post.user.email) ? (
                <button
                  className={style.deleteButton}
                  onClick={(e) => handleDeletePost(e, post._id)}
                  title="게시글 삭제"
                >
                  <Trash2 size={18} />
                </button>
              ) : (
                // 본인 글이 아니면 빈 공간 유지
                <span style={{ width: 34 }}></span>
              )}
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className={style.emptyState}>게시글이 없습니다.</div>
          )}
        </div>
      </div>

      {isDetailOpen && (
        <PostDetailModal onClose={() => setIsDetailOpen(false)} />
      )}
      {isCreateOpen && (
        <PostCreateModal onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}

export default CommunityPage;
