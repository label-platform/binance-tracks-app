import { PermissionsAndroid, Platform } from "react-native"
import RNFS from 'react-native-fs'


export const onCheckPermission = async () => {
  if (Platform.OS === 'android') {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    const hasPermission = await PermissionsAndroid.check(permission)
    if (!hasPermission) {
      await PermissionsAndroid.request(permission)
    }
  }
}

export const getPath = () => {
  // let path = RNFS.DownloadDirectoryPath + '/PlayList'
  let path = RNFS.DocumentDirectoryPath + '/PlayList'
  return path
}

export const checkFileExists = async (fileName: string) => {
  let checkFileExits = await RNFS.exists(fileName)
  return checkFileExits
}

export const createFolderSaveRootPlayList = async () => {
  await onCheckPermission()
  const existed = await checkFileExists(getPath())
  if (!existed) {
    await RNFS.mkdir(getPath(), { NSURLIsExcludedFromBackupKey: true })
  }
}

export const createFolder = async (path: string) => {
  await RNFS.mkdir(path, { NSURLIsExcludedFromBackupKey: true })
  
}