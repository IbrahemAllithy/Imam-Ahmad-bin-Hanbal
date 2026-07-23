import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useLectures } from '../hooks/useLectures';
import useProgress from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FiCheckCircle,
  FiBookOpen,
  FiVolume2,
  FiHelpCircle,
  FiExternalLink,
  FiChevronRight,
  FiChevronLeft,
  FiMessageCircle,
} from 'react-icons/fi';
import VideoPlayer from '../components/lectures/VideoPlayer';
import Loader from '../components/ui/Loader';
import './LectureDetail.css';

const sortLessons = (lessons) =>
  [...lessons].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });

const LectureDetail = () => {
  const { id } = useParams();
  const { isStudent, isAdmin } = useAuth();
  const { isCompleted, markComplete, unmarkComplete, syncing } = useProgress();
  const { data, loading, error } = useFetch(`/lectures/${id}`);

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [loginHint, setLoginHint] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [myQuestions, setMyQuestions] = useState([]);
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState('');
  const [qSuccess, setQSuccess] = useState('');

  const lecture = data?.data;
  const seriesName = lecture?.series || '';
  const categoryName = lecture?.category || '';

  const { data: seriesData } = useLectures(
    seriesName ? { series: seriesName } : {},
    Boolean(seriesName)
  );

  const playlist = useMemo(() => {
    let items = seriesData?.data || [];
    if (seriesName) {
      items = items.filter((l) => l.series === seriesName);
    } else if (categoryName) {
      items = items.filter((l) => l.category === categoryName);
    }
    items = sortLessons(items.length ? items : lecture ? [lecture] : []);
    if (lecture && !items.some((p) => p._id === lecture._id)) {
      items = sortLessons([lecture, ...items]);
    }
    return items;
  }, [seriesData, seriesName, categoryName, lecture]);

  const currentIndex = playlist.findIndex((p) => p._id === id);
  const prevLesson = currentIndex > 0 ? playlist[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < playlist.length - 1
    ? playlist[currentIndex + 1]
    : null;

  const isCurrentDone = isCompleted(id);
  const canAskQuestion = isStudent || isAdmin;
  const hasMcqQuiz = lecture?.quizItems?.length > 0;

  useEffect(() => {
    setLoginHint('');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizPassed(false);
  }, [id]);

  useEffect(() => {
    if (!showQuizModal) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowQuizModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showQuizModal]);

  useEffect(() => {
    if (!canAskQuestion || !id) return;
    const fetchQuestions = async () => {
      try {
        const { data: res } = await api.get('/lesson-questions/mine', {
          params: { lectureId: id },
        });
        setMyQuestions(res.data || []);
      } catch {
        setMyQuestions([]);
      }
    };
    fetchQuestions();
  }, [id, canAskQuestion]);

  const handleToggleComplete = async () => {
    if (isCurrentDone) {
      await unmarkComplete(id);
      setLoginHint('');
      return;
    }
    if (hasMcqQuiz) {
      setShowQuizModal(true);
      setLoginHint('أكمل الاختبار واجتزه بنسبة 60% على الأقل قبل إكمال الدرس.');
      return;
    }
    const result = await markComplete(id);
    if (result?.needsLogin) {
      setLoginHint('سجّل دخولك لحفظ التقدم على حسابك — التقدم محفوظ مؤقتاً على هذا الجهاز.');
    } else if (result?.success === false) {
      setLoginHint(result.message || 'تعذر حفظ التقدم');
    }
  };

  const handleQuizSubmit = async () => {
    if (!hasMcqQuiz) return;
    const answers = lecture.quizItems.map((_, idx) =>
      quizAnswers[idx] === undefined ? -1 : Number(quizAnswers[idx])
    );

    const token = sessionStorage.getItem('accessToken');
    if (!token || token.startsWith('local_') || token.startsWith('demo_')) {
      setLoginHint('سجّل دخولك لتصحيح الاختبار وحفظ الدرجة على حسابك.');
      return;
    }

    try {
      const { data } = await api.post(`/lectures/${id}/quiz`, { answers });
      setQuizScore(data.data.score);
      setQuizPassed(Boolean(data.data.passed));
      setQuizSubmitted(true);
      if (!data.data.passed) {
        setLoginHint(
          `درجتك ${data.data.score}% — المطلوب ${data.data.passScore || 60}% على الأقل لإكمال الدرس.`
        );
      } else {
        setLoginHint('');
      }
    } catch (err) {
      setLoginHint(err.response?.data?.message || 'تعذر تصحيح الاختبار');
    }
  };

  const handleSaveWithQuiz = async () => {
    if (quizScore == null || quizScore < 60) {
      setLoginHint('يجب اجتياز الاختبار بنسبة 60% على الأقل قبل إكمال الدرس.');
      return;
    }
    const result = await markComplete(id, quizScore);
    if (result?.needsLogin) {
      setLoginHint('سجّل دخولك لحفظ نتيجة الاختبار والتقدم على حسابك.');
    } else if (result?.success === false) {
      setLoginHint(result.message || 'تعذر حفظ التقدم');
    } else if (result?.success) {
      setShowQuizModal(false);
      setLoginHint('');
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setQLoading(true);
    setQError('');
    setQSuccess('');
    try {
      const { data: res } = await api.post('/lesson-questions', {
        lectureId: id,
        question: questionText.trim(),
      });
      setMyQuestions((prev) => [res.data, ...prev]);
      setQuestionText('');
      setQSuccess('تم إرسال سؤالك — سيرد عليه الشيخ أو الإدارة قريباً.');
    } catch (err) {
      setQError(err.response?.data?.message || 'تعذر إرسال السؤال');
    } finally {
      setQLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error || !lecture) {
    return <div className="alert alert-error">{error || 'الدرس غير موجود'}</div>;
  }

  const youtubeId = lecture.youtubeId;
  const pdfUrl = lecture.pdfUrl || 'https://archive.org/embed/20230616_20230616_1912';
  const audioUrl = lecture.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  const courseLink = seriesName
    ? `/courses/${encodeURIComponent(seriesName)}`
    : '/lectures';

  return (
    <div className="sketch-lecture-page">
      <div className="sketch-page-header">
        <div className="sketch-header-inner">
          <div className="sketch-breadcrumbs">
            <Link to="/">الرئيسية</Link> <span>/</span>{' '}
            <Link to="/lectures">الدروس والدورات</Link>
          </div>
          <h1 className="sketch-header-title">الدروس والدورات</h1>
          <p className="sketch-header-subtitle">
            مكتبة صوتية ومرئية ومقروءة للدروس والدورات العلمية لفضيلة الشيخ شعبان العودة.
          </p>
        </div>
      </div>

      <div className="sketch-container">
        <div className="sketch-back-row">
          <Link to={courseLink} className="sketch-back-link">
            &rarr; الرجوع للدورة
          </Link>
          <div className="sketch-nav-buttons" style={{ display: 'flex', gap: '0.75rem' }}>
            {prevLesson && (
              <Link to={`/lectures/${prevLesson._id}`} className="sketch-back-link">
                <FiChevronRight /> الدرس السابق
              </Link>
            )}
            {nextLesson && (
              <Link to={`/lectures/${nextLesson._id}`} className="sketch-back-link">
                الدرس التالي <FiChevronLeft />
              </Link>
            )}
          </div>
        </div>

        <h2 className="sketch-lesson-title">{lecture.title}</h2>

        <div className="sketch-grid-layout">
          <div className="sketch-media-columns">
            <div className="sketch-book-box">
              <div className="sketch-box-header">
                <FiBookOpen />
                <span>الكتاب PDF</span>
              </div>
              <div className="sketch-pdf-container">
                <iframe
                  src={pdfUrl}
                  title="الكتاب PDF"
                  className="sketch-pdf-iframe"
                  allowFullScreen
                />
              </div>
              <div className="sketch-pdf-footer">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pdf-external"
                >
                  <FiExternalLink /> فتح الكتاب في نافذة مستقلة
                </a>
              </div>
            </div>

            <div className="sketch-video-box-col">
              <div className="sketch-video-wrapper">
                <VideoPlayer
                  youtubeId={youtubeId}
                  youtubeUrl={lecture.youtubeUrl}
                  title={lecture.title}
                />
              </div>

              <div className="sketch-audio-box">
                <div className="sketch-audio-header">
                  <FiVolume2 />
                  <span>صوتي (الاستماع للدرس)</span>
                </div>
                <audio controls className="sketch-audio-player" src={audioUrl}>
                  متصفحك لا يدعم مشغل الصوت.
                </audio>
              </div>
            </div>
          </div>

          <aside className="sketch-sidebar">
            <div className="sketch-playlist-card">
              <h3 className="sketch-playlist-title">{seriesName || categoryName}</h3>
              <div className="sketch-playlist-list">
                {playlist.map((item, idx) => {
                  const isCurrent = item._id === lecture._id;
                  const itemDone = isCompleted(item._id);
                  return (
                    <Link
                      key={item._id}
                      to={`/lectures/${item._id}`}
                      className={`sketch-playlist-item ${isCurrent ? 'active' : ''}`}
                    >
                      <span className="sketch-item-title">{item.title}</span>
                      <span className={`sketch-item-num ${itemDone ? 'done' : ''}`}>
                        {idx + 1}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>

        <div className="sketch-middle-row">
          <div className="sketch-quiz-box">
            <h4>اختبر نفسك</h4>
            <button
              type="button"
              className="btn-quiz-start"
              onClick={() => setShowQuizModal(true)}
            >
              <FiHelpCircle style={{ margin: '0 0 -2px 6px' }} />
              {hasMcqQuiz ? 'اختبار متعدد الخيارات' : 'أسئلة خاصة بالدرس'}
            </button>
          </div>

          <div className="sketch-summary-box">
            <h4>محتوى الدرس والتفريغ</h4>
            <div className="sketch-content-line">
              <div
                className="sketch-line-fill"
                style={{ width: isCurrentDone ? '100%' : '40%' }}
              />
            </div>
            {lecture.description && (
              <p style={{ marginTop: '1rem', fontSize: '0.95rem', textAlign: 'right' }}>
                {lecture.description}
              </p>
            )}
          </div>
        </div>

        {canAskQuestion && (
          <div className="sketch-qa-section" style={{ marginBottom: '1.5rem' }}>
            <div className="sketch-quiz-box" style={{ textAlign: 'right' }}>
              <h4>
                <FiMessageCircle style={{ marginLeft: 6 }} />
                أسئلة الدرس
              </h4>
              <form onSubmit={handleAskQuestion}>
                <textarea
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="اكتب سؤالك حول هذا الدرس..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 10,
                    border: '1px solid var(--primary-border)',
                    marginBottom: '0.75rem',
                    fontFamily: 'inherit',
                    direction: 'rtl',
                  }}
                />
                {qError && <div className="alert alert-error">{qError}</div>}
                {qSuccess && <div className="alert alert-success">{qSuccess}</div>}
                <button type="submit" className="btn-quiz-start" disabled={qLoading}>
                  {qLoading ? 'جاري الإرسال...' : 'إرسال السؤال'}
                </button>
              </form>

              {myQuestions.length > 0 && (
                <div style={{ marginTop: '1.25rem' }}>
                  <h5 style={{ marginBottom: '0.75rem' }}>أسئلتي السابقة</h5>
                  {myQuestions.map((q) => (
                    <div
                      key={q._id}
                      style={{
                        background: '#faf4eb',
                        padding: '0.75rem',
                        borderRadius: 10,
                        marginBottom: '0.5rem',
                        textAlign: 'right',
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 600 }}>{q.question}</p>
                      {q.adminReply && (
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>
                          <strong>الرد:</strong> {q.adminReply}
                        </p>
                      )}
                      {!q.adminReply && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {q.status === 'pending' ? 'بانتظار الرد' : q.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {loginHint && (
          <p
            className="alert"
            style={{
              background: '#fff8e1',
              padding: '0.75rem 1rem',
              borderRadius: 10,
              marginBottom: '1rem',
              textAlign: 'center',
            }}
          >
            {loginHint}{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--accent-color)' }}>
              تسجيل الدخول
            </Link>
          </p>
        )}

        {!isCurrentDone && hasMcqQuiz && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            لإكمال هذا الدرس يجب اجتياز الاختبار بنسبة 60% على الأقل.
          </p>
        )}

        {!canAskQuestion && (
          <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--accent-color)' }}>
              سجّل دخولك لحفظ تقدمك والحصول على الشهادة
            </Link>
          </p>
        )}

        <div className="sketch-bottom-action">
          <button
            type="button"
            className={`btn-sketch-completed ${isCurrentDone ? 'completed' : ''}`}
            onClick={handleToggleComplete}
            disabled={syncing}
          >
            <FiCheckCircle style={{ fontSize: '1.25rem' }} />
            {isCurrentDone ? 'تم إكمال الدرس ✓' : 'أكملت الدرس'}
          </button>

          {isCurrentDone && nextLesson && (
            <Link
              to={`/lectures/${nextLesson._id}`}
              className="btn-sketch-completed"
              style={{ marginRight: '1rem', textDecoration: 'none' }}
            >
              الدرس التالي <FiChevronLeft />
            </Link>
          )}
        </div>
      </div>

      {showQuizModal && (
        <div
          className="sketch-modal-overlay"
          onClick={() => setShowQuizModal(false)}
          role="presentation"
        >
          <div
            className="sketch-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-dialog-title"
          >
            <h3 id="quiz-dialog-title">أسئلة واختبار الدرس</h3>
            <p className="sketch-modal-sub">اختبر معلوماتك وفهمك لمحتوى هذا المجلس المبارك:</p>

            {hasMcqQuiz ? (
              <div className="quiz-mcq-list" style={{ textAlign: 'right' }}>
                {lecture.quizItems.map((item, idx) => (
                  <fieldset key={idx} style={{ marginBottom: '1.25rem', border: 0, padding: 0 }}>
                    <legend style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                      {idx + 1}. {item.question}
                    </legend>
                    {(item.options || []).map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        style={{
                          display: 'block',
                          padding: '0.4rem 0',
                          cursor: quizSubmitted ? 'default' : 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name={`quiz-${idx}`}
                          value={oIdx}
                          checked={Number(quizAnswers[idx]) === oIdx}
                          disabled={quizSubmitted}
                          onChange={() =>
                            setQuizAnswers((prev) => ({ ...prev, [idx]: oIdx }))
                          }
                          style={{ marginLeft: 8 }}
                        />
                        {opt}
                      </label>
                    ))}
                  </fieldset>
                ))}

                {!quizSubmitted ? (
                  <button type="button" className="btn-quiz-start" onClick={handleQuizSubmit}>
                    تسليم الإجابات
                  </button>
                ) : (
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--primary-text)' }}>
                      نتيجتك: {quizScore}%
                      {quizPassed ? ' — ناجح' : ' — لم تجتز بعد'}
                    </p>
                    <button
                      type="button"
                      className="btn-quiz-start"
                      onClick={handleSaveWithQuiz}
                      disabled={syncing || !quizPassed}
                      style={{ marginTop: '0.75rem' }}
                    >
                      حفظ النتيجة وإكمال الدرس
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <ol className="quiz-questions-list">
                {(lecture.quizQuestions || [
                  'ما هي المسألة الرئيسية التي تناولها هذا المجلس؟',
                  'اذكر ثلاثة من القواعد والفوائد المستنبطة من الدرس.',
                  'ما أهمية كتاب القواعد المثلى في باب أسماء الله وصفاته؟',
                ]).map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            )}

            <button
              type="button"
              className="btn-modal-close"
              onClick={() => setShowQuizModal(false)}
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureDetail;
