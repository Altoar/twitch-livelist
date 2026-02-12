import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faHeart,
  faArrowsRotate,
  faSpinner,
  faArrowRightFromBracket,
  faList,
  faArrowDown19,
  faArrowDown91,
  faGamepad,
  faRotateLeft,
  faGear,
  faAddressBook,
  faCircleCheck,
  faStar
} from "@fortawesome/free-solid-svg-icons";

import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

import { faTwitch } from "@fortawesome/free-brands-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* add icons to the library */
library.add(
  faHeart,
  faArrowsRotate,
  faSpinner,
  faArrowRightFromBracket,
  faTwitch,
  faList,
  faArrowDown19,
  faArrowDown91,
  faGamepad,
  faRotateLeft,
  faGear,
  faAddressBook,
  faCircleCheck,
  faStar,
  faStarRegular
);

export default FontAwesomeIcon;
