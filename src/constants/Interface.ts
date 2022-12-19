export interface User {
  createdAt: string,
  updatedAt: string,
  id: number,
  username: string,
  role: string,
  email: string,
  activationCodeId: number,
  walletAddress: string,
  energyCap: number,
  availableEnergy: number,
  activationCodes: [],
  spendingBalances: [],
  totalEarnBLB: number,
  totalPlayedTime: {
    totalMins: number,
    days: string,
    hours: string,
    mins: string,
    secs: string,
  },
  dailyEarningCap: {
    max: string,
    currency: string
  },
  dailyEarning: {
    amount: string,
    currency: string
  },
  totalEnergyCap: {
    max: string,
    used: string
  }
}

export interface AppContextInterface {
  user: StatusUser
  logOut: () => void
  logIn: ({userInfo, accessToken, refreshToken}: {userInfo: User, accessToken: string, refreshToken: string}) => void
  changeToken: (token: string) => void;
  changeWalletAddress: (address: string) => void;
}

export interface PropsUserProvider {
  userData?: User
  accessToken?: string
  refreshToken?: string
  isLogin: boolean
  children?: any
  setLogin: (isLogin: boolean) => void
}

export interface StatusUser {
  user: User
  accessToken: string
  refreshToken?: string
  isLogin?: boolean
}

export interface DataPlaying {
  position: number,
  buffer?: number
  track:number
  duration: number
}

export interface PlayListProps {
  playList: PlayList
}

export interface PlayListContextProps {
  showMiniControl: boolean,
  showPopupPlayer: boolean,
  updateMiniControl: (value: boolean) => void,
  updatePopupPlayer: (value: boolean) => void
  playList: PlayListProps,
  headphone: HeadPhone,
  energy: number,
  updateEnergy: (data: number) => void,
  updateHeadPhone: (data: HeadPhone) => void,
  updatePlayList: ({dataPlayList}: {dataPlayList: PlayList}) => void
  positionModalPlayer: number
  updatePositionModalPlayer: (position: number) => void
}
export interface PlayList {
    createdAt: string,
    updatedAt: string,
    id: number,
    name: string,
    img: string,
    display: string,
    order: number,
    playlistImg: string
    playlistName: string
    playlistDetail: ItemSong[] 
}

export interface ItemSong {
  createdAt: string,
  updatedAt: string,
  id: number,
  song: Song
}

export interface Song {
  createdAt: string,
  updatedAt: string,
  id: number,
  name: string,
  s3Name: string,
  description: string,
  status: string,
  artists?: [Artist],
  duration: number
}

export interface Artist {
  createdAt: string,
  updatedAt: string,
  id: number,
  song: number,
  artistInfo: ArtistInfo
}
export interface ItemSpendingBalance {
  tokenSymbol: string,
  balance: number,
  availableBalance: number
}

export interface Energy {
  energyCap: number,
  availableEnergy: number,
  userId?: number
}

export interface HeadPhone {
  headphoneID: number,
  battery: number,
  detail: DetailHeadPhone | {}
}

export interface ArtistInfo{
  createdAt: string,
  updatedAt:string,
  id: number,
  name: string,
  description: string,
  image: string
}

export interface SocketEnergy {
  energy: number,
  battery: number
}

export interface EarningLimit {
  dailyTokenEarningLimit: number,
  remainedTokenEarningLimit: number
}

export interface DetailHeadPhone {
  item: {
    createdAt: string,
    updatedAt: string,
    id: number,
    imgUrl: string,
    type: string,
    itemStatus: string,
    itemSale: null
  },
    parentId1: null,
    parentId2: null,
    baseLuck: number,
    levelLuck: number,
    itemLuck: number,
    luck: number,
    baseEfficiency: number,
    levelEfficiency: number,
    itemEfficiency: number,
    efficiency: number,
    baseComfort: number,
    levelComfort: number,
    itemComfort: number,
    comfort: number,
    baseResilience: number,
    levelResilience: number,
    itemResilience: number,
    resilience: number,
    battery: number,
    level: number,
    quality: string,
    mintCount: number,
    availableMintCount: number,
    remainedStat: number,
    levelUpCompletionTime: null,
    cooldownTime: string,
    headphoneDocks: [
        {
          sticker: null,
          position: number,
          dockStatus: string,
          quality: string,
          attribute: string
        },
        {
          sticker: null,
          position: number,
          dockStatus: string,
          quality: string,
          attribute: string
        },
        {
          sticker: null,
          position: number,
          dockStatus: string,
          quality: string,
          attribute: string
        },
        {
          sticker: null,
          position: number,
          dockStatus: string,
          quality: string,
          attribute: string
        },
    ]
}

export interface StateModalPlayer {
  isVisible: boolean
  textPositive: string
  textNegative: string
  showNegativeButton?: boolean
  typeModal: 'battery' | 'energy' | 'off' | '',
  description: string
}

