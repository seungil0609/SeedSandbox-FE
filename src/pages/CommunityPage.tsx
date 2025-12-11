import { useEffect, useState } from 'react';
import style from './styles/CommunityPage.module.scss';
import { useAtom, useSetAtom } from 'jotai';
import { getAllPostDataAtom, getPostDataByIdAtom } from '../store/post/action';
import { AllPostDataAtom } from '../store/post/atoms';
import PostDetailModal from '../widgets/PostDetailModal';
import PostCreateModal from '../widgets/PostCreateModal';
import { getProfileAtom } from '../store/auth/action';

function CommunityPage() {
    // atom
    const getPostDataById = useSetAtom(getPostDataByIdAtom);
    const getAllPostData = useSetAtom(getAllPostDataAtom);
    const getUserData = useSetAtom(getProfileAtom);
    const [allPosts] = useAtom(AllPostDataAtom);
    // 모달 상태
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        getAllPostData();
        getUserData();
    }, []);

    const handleDetailOpen = (id: string) => {
        setIsDetailOpen(true);
        getPostDataById(id);
    };

    const handleDetailClose = () => {
        setIsDetailOpen(false);
    };

    const handleOpenWrite = () => {
        setIsCreateOpen(true);
    };
    const handleCloseWrite = () => {
        setIsCreateOpen(false);
    };

    return (
        <div className={style.pageWrapper}>
            <div className={style.header}>
                <div className={style.title}>커뮤니티</div>
                <button className={style.writeButton} onClick={handleOpenWrite}>
                    글쓰기
                </button>
            </div>
            <div className={style.cardList}>
                {allPosts?.map((post) => (
                    <button
                        key={post._id}
                        className={style.card}
                        onClick={() => handleDetailOpen(post._id)}>
                        <div className={style.cardHeader}>
                            <span className={style.cardBoardType}>{post.boardType}</span>
                            <span className={style.cardDate}>
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className={style.cardTitle}>{post.title}</div>
                        <div className={style.cardMeta}>
                            <span className={style.cardAuthor}>
                                {post.user?.nickname ?? post.user?.email}
                            </span>
                        </div>
                        <div className={style.cardContent}>{post.content}</div>
                    </button>
                ))}
            </div>
            {isDetailOpen && <PostDetailModal onClose={handleDetailClose} />}
            {isCreateOpen && <PostCreateModal onClose={handleCloseWrite} />}
        </div>
    );
}

export default CommunityPage;
