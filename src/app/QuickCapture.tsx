import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from './workspace-context';
import { t } from '../shared/i18n';
import { ErrorNotice, Modal, Notice } from '../shared/ui/primitives';
import { createDecision, emptyDecision } from '../features/decision-trace/domain';
import { createStory, emptyStory } from '../features/story-gap/domain';
import { errorMessage } from '../shared/lib/utils';

export default function QuickCapture() {
  const { project, save } = useWorkspace();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false),
    [kind, setKind] = useState<'decision' | 'story'>(project.captureDraft?.kind ?? 'decision');
  const [title, setTitle] = useState(project.captureDraft?.title ?? ''),
    [text, setText] = useState(project.captureDraft?.text ?? '');
  const [revision, setRevision] = useState(project.revision),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function persist(create: boolean) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (project.revision !== revision)
        throw new Error('This project changed in another tab. Reload it before saving again.');
      if (!create) {
        await save({ ...project, captureDraft: { kind, title, text } });
        setRevision(revision + 1);
        setMessage(t('Draft saved in this project.'));
        return;
      }
      if (kind === 'decision') {
        const d = createDecision({ ...emptyDecision(), title, context: text });
        await save({ ...project, captureDraft: null, decisions: [...project.decisions, d] });
        setOpen(false);
        navigate(`/decisions?id=${d.id}`);
      } else {
        const s = createStory({ ...emptyStory(), title, description: text });
        await save({ ...project, captureDraft: null, stories: [...project.stories, s] });
        setOpen(false);
        navigate(`/stories?id=${s.id}`);
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        className="button secondary"
        onClick={() => {
          setOpen(true);
        }}
      >
        {t(project.captureDraft ? 'Resume capture draft' : 'Quick capture')}
      </button>
      {open && (
        <Modal
          title={t('Capture meeting notes')}
          open
          onClose={() => {
            if (!busy) setOpen(false);
          }}
        >
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              void persist(true);
            }}
          >
            <Notice>
              {t(
                'Pasted notes are source material. A decision is created as proposed; no agreement or business rule is inferred.',
              )}
            </Notice>
            <label className="field">
              {t('Capture as')}
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as 'decision' | 'story')}
              >
                <option value="decision">{t('Proposed decision')}</option>
                <option value="story">{t('User story')}</option>
              </select>
            </label>
            <label className="field">
              {t('Title')}
              <input
                aria-label={t('Title')}
                required
                value={title}
                maxLength={180}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="field">
              {t('Source notes')}
              <textarea
                aria-label={t('Source notes')}
                value={text}
                rows={8}
                maxLength={30_000}
                onChange={(e) => setText(e.target.value)}
              />
            </label>
            {error && <ErrorNotice>{error}</ErrorNotice>}
            <p role="status">{message}</p>
            <div className="form-actions">
              <button
                className="button secondary"
                type="button"
                disabled={busy}
                onClick={() => void persist(false)}
              >
                {t('Save capture draft')}
              </button>
              <button className="button primary" disabled={busy}>
                {t('Create for review')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
