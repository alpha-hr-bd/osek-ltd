import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    set,
    onValue,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDbslFgD45fmc3FrEL0RaHadM_PmfuU0ZM",
    authDomain: "osek-ltd.firebaseapp.com",
    databaseURL: "https://osek-ltd-default-rtdb.firebaseio.com",
    projectId: "osek-ltd",
    storageBucket: "osek-ltd.firebasestorage.app",
    messagingSenderId: "499922941529",
    appId: "1:499922941529:web:925b75878c19e146c4a348",
    measurementId: "G-9H5X23S9PH"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export {
    database,
    ref,
    push,
    set,
    onValue,
    update,
    remove
};
