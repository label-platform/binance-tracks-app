import { Subject } from 'rxjs';

export const EventBusName = {
  MANAGER_HEADPHONE: 'MANAGER_HEADPHONE',
  CHANGE_HEADPHONE: 'CHANGE_HEADPHONE',
  PRESS_BACK: 'PRESS_BACK',
  CHECK_PASS_FROM_WEBVIEW: 'CHECK_PASS_FROM_WEBVIEW',
  CHECK_UPDATE_MINI_PLAYER: 'CHECK_UPDATE_MINI_PLAYER',
  PRESS_ACTION_ON_MINI_PLAYER: 'PRESS_ACTION_ON_MINI_PLAYER',
  PRESS_TURN_OFF_MINI_PLAYER: 'PRESS_TURN_OFF_MINI_PLAYER',
  CONNECT_SOCKET: 'CONNECT_SOCKET',
  DISCONNECT_SOCKET: 'DISCONNECT_SOCKET',
  BLOCK_PRESS_MENU: 'BLOCK_PRESS_MENU',
  UN_BLOCK_PRESS_MENU: 'UN_BLOCK_PRESS_MENU',
  RE_LOAD_BALANCE: 'RE_LOAD_BALANCE',
  UPDATE_BALANCE_EARNING: 'UPDATE_BALANCE_EARNING',
  SEEK_TO: 'SEEK_TO',
  SETUP_WALLET: 'SETUP_WALLET',
  DETAIL_WALLET: 'DETAIL_WALLET',
  PLAY_NEW_LIST: 'PLAY_NEW_LIST',
  UPDATE_NEW_TOKEN: 'UPDATE_NEW_TOKEN',
  IS_PLAYING: 'IS_PLAYING',
  SEND_INFO_CURRENT_SONG: 'SEND_INFO_CURRENT_SONG',
  SEND_PLAY_SONG: 'SEND_PLAY_SONG',
  LOG_OUT: 'LOG_OUT',
  READ_CLIPBOARD: 'READ_CLIPBOARD',
};

export default class EventBus {
  static instance: any;
  eventSubject = new Subject();
  static getInstance() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  get events() {
    return this.eventSubject.asObservable();
  }

  post(event:any) {
    this.eventSubject.next(event);
  }
}

export const onPushEventBus = ({type, payload}: {type: string , payload?: any}) => {
  EventBus.getInstance().post({
    type,
    payload,
  });
};
