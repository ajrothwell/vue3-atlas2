import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import "@phila/phila-ui-core/dist/styles/scss/all.scss";
import "bulma";
import './assets/style.scss'
import PhilaUICore from "@phila/phila-ui-core";
import AppHeader from "@phila/phila-ui-app-header";
import AppFooter from "@phila/phila-ui-app-footer";
import Dropdown from "@phila/phila-ui-dropdown";
import MobileNav from "@phila/phila-ui-mobile-nav";
import NavLink from "@phila/phila-ui-nav-link";
import Textbox from "@phila/phila-ui-textbox";

const app = createApp(App);

app.component("AppHeader", AppHeader);
app.component("AppFooter", AppFooter);
app.component("Dropdown", Dropdown);
app.component("MobileNav", MobileNav);
app.component("NavLink", NavLink);
app.component("Textbox", Textbox);
app.use(PhilaUICore);

// import $config from './config'
// app.config.globalProperties.$config = config;

import { library } from '@fortawesome/fontawesome-svg-core';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { faUniversity } from '@fortawesome/free-solid-svg-icons';
import { faGavel } from '@fortawesome/free-solid-svg-icons';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
library.add(
  faMagnifyingGlass,
  faHome,
  faBook,
  faWrench,
  faUniversity,
  faGavel,
  faMapMarkerAlt,
  faSpinner,
  faBuilding,
  faExternalLinkAlt,
  faAngleDown,
);

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
