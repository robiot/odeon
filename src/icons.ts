import type { Icon } from 'phosphor-react-native';

// Each icon is loaded from its own file. Importing from the package root
// bundles all ~1,500 Phosphor icons (adds ~6MB to the app).
/* eslint-disable @typescript-eslint/no-require-imports */
export const ApertureIcon: Icon = require('phosphor-react-native/src/icons/Aperture').ApertureIcon;
export const CameraIcon: Icon = require('phosphor-react-native/src/icons/Camera').CameraIcon;
export const CameraRotateIcon: Icon = require('phosphor-react-native/src/icons/CameraRotate').CameraRotateIcon;
export const CheckIcon: Icon = require('phosphor-react-native/src/icons/Check').CheckIcon;
export const LightbulbIcon: Icon = require('phosphor-react-native/src/icons/Lightbulb').LightbulbIcon;
export const WarningCircleIcon: Icon = require('phosphor-react-native/src/icons/WarningCircle').WarningCircleIcon;
export const XIcon: Icon = require('phosphor-react-native/src/icons/X').XIcon;

/** Icons Claude may pick for a quick fact. Keys double as the schema enum. */
export const FACT_ICONS: Record<string, Icon> = {
  calendar: require('phosphor-react-native/src/icons/Calendar').CalendarIcon,
  clock: require('phosphor-react-native/src/icons/Clock').ClockIcon,
  hourglass: require('phosphor-react-native/src/icons/Hourglass').HourglassIcon,
  'map-pin': require('phosphor-react-native/src/icons/MapPin').MapPinIcon,
  globe: require('phosphor-react-native/src/icons/Globe').GlobeIcon,
  ruler: require('phosphor-react-native/src/icons/Ruler').RulerIcon,
  scales: require('phosphor-react-native/src/icons/Scales').ScalesIcon,
  gauge: require('phosphor-react-native/src/icons/Gauge').GaugeIcon,
  lightning: require('phosphor-react-native/src/icons/Lightning').LightningIcon,
  thermometer: require('phosphor-react-native/src/icons/Thermometer').ThermometerIcon,
  drop: require('phosphor-react-native/src/icons/Drop').DropIcon,
  leaf: require('phosphor-react-native/src/icons/Leaf').LeafIcon,
  mountains: require('phosphor-react-native/src/icons/Mountains').MountainsIcon,
  buildings: require('phosphor-react-native/src/icons/Buildings').BuildingsIcon,
  bank: require('phosphor-react-native/src/icons/Bank').BankIcon,
  'paint-brush': require('phosphor-react-native/src/icons/PaintBrush').PaintBrushIcon,
  users: require('phosphor-react-native/src/icons/Users').UsersIcon,
  crown: require('phosphor-react-native/src/icons/Crown').CrownIcon,
  coins: require('phosphor-react-native/src/icons/Coins').CoinsIcon,
  ticket: require('phosphor-react-native/src/icons/Ticket').TicketIcon,
  flask: require('phosphor-react-native/src/icons/Flask').FlaskIcon,
  heart: require('phosphor-react-native/src/icons/Heart').HeartIcon,
  star: require('phosphor-react-native/src/icons/Star').StarIcon,
  info: require('phosphor-react-native/src/icons/Info').InfoIcon,
};
/* eslint-enable @typescript-eslint/no-require-imports */

export const FACT_ICON_NAMES = ['calendar', 'clock', 'hourglass', 'map-pin', 'globe', 'ruler', 'scales', 'gauge', 'lightning', 'thermometer', 'drop', 'leaf', 'mountains', 'buildings', 'bank', 'paint-brush', 'users', 'crown', 'coins', 'ticket', 'flask', 'heart', 'star', 'info'] as const;
export type FactIconName = (typeof FACT_ICON_NAMES)[number];
