import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Field, Form, Modal } from './primitives';

describe('accessible editing and error feedback', () => {
  it('refuses a stale open form even if live data has refreshed', async () => {
    const save = vi.fn(async () => {}),
      user = userEvent.setup();
    const { rerender } = render(
      <Form version={1} onSave={save}>
        <Field name="title" label="Title" value="My draft" />
      </Form>,
    );
    rerender(
      <Form version={2} onSave={save}>
        <Field name="title" label="Title" value="New remote data" />
      </Form>,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('alert')).toHaveTextContent('another tab');
    expect(save).not.toHaveBeenCalled();
  });
  it('keeps failed edits visible and announces the error', async () => {
    const user = userEvent.setup();
    render(
      <Form
        onSave={async () => {
          throw new Error('Storage is full.');
        }}
      >
        <Field name="title" label="Decision title" required />
      </Form>,
    );
    await user.type(screen.getByLabelText('Decision title *'), 'Keep my work');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Storage is full.');
    expect(screen.getByLabelText('Decision title *')).toHaveValue('Keep my work');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });
  it('provides a labelled dialog and supports Escape', async () => {
    const user = userEvent.setup(),
      close = vi.fn();
    render(
      <Modal title="Edit a decision" open onClose={close}>
        <button>Save</button>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Edit a decision' })).toBeVisible();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(close).toHaveBeenCalled());
  });
});
