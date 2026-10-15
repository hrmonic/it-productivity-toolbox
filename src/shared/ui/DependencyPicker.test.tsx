import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DependencyPicker } from './DependencyPicker';
import { Form } from './primitives';

describe('dependency selection', () => {
  it('retains selected dependencies when searching and submits all selections', async () => {
    const user = userEvent.setup(),
      save = vi.fn<(data: FormData) => Promise<void>>().mockResolvedValue(undefined);
    render(
      <Form onSave={save}>
        <DependencyPicker
          name="dependencies"
          label="Affected dependencies"
          options={Array.from({ length: 8 }, (_, i) => ({
            value: `item-${i + 1}`,
            label: `Deliverable ${i + 1}`,
          }))}
        />
      </Form>,
    );
    const group = screen.getByRole('group', { name: /Affected dependencies/ });
    await user.click(within(group).getByRole('checkbox', { name: 'Deliverable 1' }));
    await user.type(screen.getByLabelText('Search dependencies'), 'Deliverable 8');
    await user.click(within(group).getByRole('checkbox', { name: 'Deliverable 8' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(save).toHaveBeenCalledOnce();
    expect(save.mock.calls[0]?.[0].getAll('dependencies')).toEqual(['item-1', 'item-8']);
  });
});
