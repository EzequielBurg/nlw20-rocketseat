import lib from 'dayjs'
import 'dayjs/locale/pt'
import relativeTime from 'dayjs/plugin/relativeTime'

lib.locale('pt')
lib.extend(relativeTime)

export const dayjs = lib
