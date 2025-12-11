import { useMemo, useState } from 'react';
import style from './styles/PostCreateModal.module.scss';
import { X } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { createPostDataAtom } from '../store/post/action';

interface Props {
    onClose: () => void;
}

const BOARD_TYPES = ['자유', '질문', '정보', '수익률 자랑', '종목 토론', '공지'];

function PostCreateModal({ onClose }: Props) {
    const createPost = useSetAtom(createPostDataAtom);
    const [boardType, setBoardType] = useState(BOARD_TYPES[0]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const isValid = useMemo(
        () => title.trim().length > 0 && content.trim().length > 0,
        [title, content]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        createPost(boardType, title, content);
        onClose();
    };

    return (
        <div className={style.overlay} onClick={onClose}>
            <div className={style.container} onClick={(e) => e.stopPropagation()}>
                <header className={style.header}>
                    <h1 className={style.title}>글쓰기</h1>
                    <button className={style.closeButton} onClick={onClose}>
                        <X />
                    </button>
                </header>

                <form className={style.form} onSubmit={handleSubmit}>
                    <div className={style.row}>
                        <label className={style.label}>게시판</label>
                        <select
                            id="boardType"
                            className={style.select}
                            value={boardType}
                            onChange={(e) => setBoardType(e.target.value)}>
                            {BOARD_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={style.row}>
                        <label className={style.label}>제목</label>
                        <input
                            className={style.input}
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className={style.row}>
                        <label className={style.label}>내용</label>
                        <textarea
                            className={style.textarea}
                            placeholder="내용을 입력하세요"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={10}
                        />
                    </div>

                    <div className={style.buttonRail}>
                        <button type="button" className={style.button__cancel} onClick={onClose}>
                            취소
                        </button>
                        <button type="submit" className={style.button__save} disabled={!isValid}>
                            등록
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostCreateModal;
