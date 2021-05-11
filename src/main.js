import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import VueTextareaAutosize from 'vue-textarea-autosize';
import firebase from 'firebase/app';
import 'firebase/firestore';

Vue.use(VueTextareaAutosize);

Vue.config.productionTip = false

/* mit firebase verbinden */
firebase.initializeApp({
  apiKey: "AIzaSyCluDT_RZG_MrP2BvhmqTMibVSP0Ja_Ul8",
    authDomain: "vfr-planner-61ddb.firebaseapp.com",
    projectId: "vfr-planner-61ddb",
    storageBucket: "vfr-planner-61ddb.appspot.com",
    messagingSenderId: "221768248960",
    appId: "1:221768248960:web:ace6bdc9859392cd800065",
    measurementId: "G-W9HLVN0L49"
});

export const db = firebase.firestore();

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
