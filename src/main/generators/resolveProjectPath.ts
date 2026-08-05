import { isAbsolute, relative, resolve } from 'path'
import { sanitizeFolderName } from './sanitizeFolderName'

export interface ResolvedProjectPath {
  installRoot: string
  projectPath: string
  folderName: string
}

/**
 * Works out where the server folder goes and refuses anything that would escape the chosen
 * install directory.
 *
 * The containment check uses `relative` rather than comparing string prefixes. A prefix compare
 * has to append a separator to avoid matching a sibling like `C:\Servers2`, but a drive root such
 * as `D:\` already ends in one — appending a second produced `D:\\` and rejected every path under
 * a drive root.
 */
export function resolveProjectPath(installDirectory: string, projectName: string): ResolvedProjectPath {
  const folderName = sanitizeFolderName(projectName)
  const installRoot = resolve(installDirectory)
  const projectPath = resolve(installRoot, folderName)
  const relativePath = relative(installRoot, projectPath)

  if (relativePath === '' || relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error('The server folder would end up outside the chosen install directory.')
  }

  return { installRoot, projectPath, folderName }
}
