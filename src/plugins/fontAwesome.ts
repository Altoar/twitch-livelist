import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faHeart,
  faArrowsRotate,
  faSpinner,
  faArrowRightFromBracket
} from "@fortawesome/free-solid-svg-icons";

import { faTwitch } from "@fortawesome/free-brands-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* add icons to the library */
library.add(
  faHeart,
  faArrowsRotate,
  faSpinner,
  faArrowRightFromBracket,
  faTwitch
);

export default FontAwesomeIcon;
