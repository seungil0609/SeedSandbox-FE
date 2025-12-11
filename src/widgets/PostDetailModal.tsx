import { useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { SelectedPostDataAtom } from '../store/post/atoms';
import { SelectedCommentDataAtom } from '../store/comment/atoms';
import {
    deleteCommentDataAtom,
    getCommentDataAtom,
    postCommentDataAtom,
} from '../store/comment/action';
import style from './styles/PostDetailModal.module.scss';
import { Trash, X } from 'lucide-react';
import { UserProfileAtom } from '../store/auth/atoms';

interface Props {
    onClose: () => void;
}

function PostDetailModal({ onClose }: Props) {
    const [post] = useAtom(SelectedPostDataAtom);
    const [comments] = useAtom(SelectedCommentDataAtom);
    const [userInfo] = useAtom(UserProfileAtom);
    const getComments = useSetAtom(getCommentDataAtom);
    const postComment = useSetAtom(postCommentDataAtom);
    const deleteComment = useSetAtom(deleteCommentDataAtom);

    const [content, setContent] = useState('');

    useEffect(() => {
        if (post?._id) getComments();
    }, [post?._id, getComments]);

    if (!post) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = content.trim();
        if (!text) return;
        await postComment(text);
        setContent('');
    };

    const handleDeleteComment = async (commentId: string) => {
        await deleteComment(commentId);
    };

    return (
        <div className={style.overlay} onClick={onClose}>
            <div className={style.container} onClick={(e) => e.stopPropagation()}>
                <header className={style.header}>
                    <h1 className={style.title}>{post?.title ?? ''}</h1>
                    <button className={style.closeButton} onClick={onClose}>
                        <X />
                    </button>
                </header>
                <div className={style.meta}>
                    <span className={style.boardType}>{post?.boardType ?? ''}</span>
                    <span className={style.author}>
                        {post?.user?.nickname ?? post?.user?.email ?? ''}
                    </span>
                    <span className={style.date}>
                        {post?.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
                    </span>
                </div>

                <div className={style.content}>{post?.content ?? ''}</div>

                <section className={style.commentSection}>
                    <h2 className={style.commentTitle}>댓글</h2>

                    <form className={style.commentForm} onSubmit={handleSubmit}>
                        <textarea
                            className={style.commentInput}
                            placeholder="댓글을 입력하세요"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={3}
                        />
                        <div className={style.commentActions}>
                            <button
                                type="submit"
                                className={style.button__save}
                                disabled={!content.trim()}>
                                등록
                            </button>
                        </div>
                    </form>

                    <div className={style.commentList}>
                        {comments?.length ? (
                            comments.map((c) => (
                                <div key={c._id} className={style.commentItem}>
                                    <div className={style.commentHeader}>
                                        <span className={style.commentAuthor}>
                                            {c.user?.nickname ?? c.user?.email ?? '익명'}
                                        </span>
                                        <span className={style.commentDate}>
                                            {new Date(c.createdAt).toLocaleString()}
                                        </span>
                                        {userInfo?.id === c.user._id ? (
                                            <button
                                                className={style.commentDeleteButton}
                                                onClick={() => handleDeleteComment(c._id)}
                                                type="button">
                                                <Trash size={16} />
                                            </button>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                    <div className={style.commentContent}>{c.content}</div>
                                </div>
                            ))
                        ) : (
                            <div className={style.commentEmpty}>아직 댓글이 없습니다.</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default PostDetailModal;
