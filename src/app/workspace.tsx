import type { ReactNode } from 'react';
import { WorkspaceContext, type Workspace } from './workspace-context';

export function WorkspaceProvider({ value, children }: { value: Workspace; children: ReactNode }) {
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
