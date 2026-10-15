import { createContext, useContext } from 'react';
import type { Project } from '../shared/types/models';

export type Workspace = { project: Project; save: (next: Project) => Promise<void> };
export const WorkspaceContext = createContext<Workspace | null>(null);
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('Select a project to use this tool.');
  return value;
}
