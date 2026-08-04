export const IpcChannel = {
  AppGetVersion: 'app:get-version',
  DialogSelectDirectory: 'dialog:select-directory',
  AppGetDefaultProjectsDirectory: 'app:get-default-projects-directory',
  MinecraftGetReleaseVersions: 'minecraft:get-release-versions',
  PaperGetSupportedVersions: 'paper:get-supported-versions',
  DownloadPlugin: 'download:plugin',
  SearchPlugins: 'search:plugins',
  DownloadProgress: 'download:progress',
  GenerateProject: 'generate:project',
  GenerateProgress: 'generate:progress',
  CheckPrerequisites: 'check:prerequisites',
  DownloadJava: 'download:java',
  ShellShowItemInFolder: 'shell:show-item-in-folder',
  UpdateCheck: 'update:check',
  UpdateDownload: 'update:download',
  UpdateInstall: 'update:install',
  UpdateStatus: 'update:status',
  TemplatesList: 'templates:list',
  TemplatesSave: 'templates:save',
  TemplatesDelete: 'templates:delete'
} as const

export type IpcChannel = (typeof IpcChannel)[keyof typeof IpcChannel]
