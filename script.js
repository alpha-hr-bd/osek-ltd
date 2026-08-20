import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";



/* =====================================================
   FIREBASE
===================================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);



/* =====================================================
   ADMIN UID
=====================================================

   IMPORTANT:

   Replace this with your Firebase Admin user's UID.

===================================================== */

const ADMIN_UID = "YOUR_ADMIN_UID";



/* =====================================================
   APP STATE
===================================================== */

let trades = [];

let settings = {
  startingBalance: 0,
  target: 100000
};



/* =====================================================
   ELEMENTS
===================================================== */

const loadingScreen =
  document.getElementById("loadingScreen");

const loginButton =
  document.getElementById("loginButton");

const logoutButton =
  document.getElementById("logoutButton");

const adminBadge =
  document.getElementById("adminBadge");

const loginPanel =
  document.getElementById("loginPanel");

const adminPanel =
  document.getElementById("adminPanel");



/* =====================================================
   FORMAT MONEY
===================================================== */

function formatMoney(value) {

  return "৳" +
    Number(value || 0).toLocaleString(
      "en-BD",
      {
        maximumFractionDigits: 2
      }
    );

}



/* =====================================================
   FORMAT DATE
===================================================== */

function formatDateTime(value) {

  if (!value) {
    return {
      date: "-",
      time: "-"
    };
  }


  let date;

  if (value?.toDate) {

    date = value.toDate();

  } else {

    date = new Date(value);

  }


  return {

    date: date.toLocaleDateString(
      "en-BD"
    ),

    time: date.toLocaleTimeString(
      "en-BD",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    )

  };

}



/* =====================================================
   TODAY STRING
===================================================== */

function todayString() {

  const d = new Date();

  const year = d.getFullYear();

  const month =
    String(d.getMonth() + 1).padStart(2, "0");

  const day =
    String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;

}



/* =====================================================
   CURRENT BALANCE
===================================================== */

function calculateBalance() {

  let balance =
    Number(settings.startingBalance || 0);


  trades.forEach(trade => {

    const profit =
      Number(trade.profit || 0);


    if (trade.status === "win") {

      balance += profit;

    } else {

      balance -= profit;

    }

  });


  return balance;

}



/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

  const balance =
    calculateBalance();


  const today =
    todayString();


  const todayTrades =
    trades.filter(
      trade => trade.dateKey === today
    );


  let todayProfit = 0;


  todayTrades.forEach(trade => {

    if (trade.status === "win") {

      todayProfit += Number(trade.profit || 0);

    } else {

      todayProfit -= Number(trade.profit || 0);

    }

  });


  const totalWins =
    trades.filter(
      trade => trade.status === "win"
    ).length;


  const totalLosses =
    trades.filter(
      trade => trade.status === "loss"
    ).length;


  const netProfit =
    balance -
    Number(settings.startingBalance || 0);


  const winRate =
    trades.length > 0
      ? (totalWins / trades.length) * 100
      : 0;


  const profitPercent =
    Number(settings.startingBalance) > 0
      ? (netProfit /
        Number(settings.startingBalance)) * 100
      : 0;



  document.getElementById(
    "currentBalance"
  ).textContent =
    formatMoney(balance);


  document.getElementById(
    "todayProfit"
  ).textContent =
    formatMoney(todayProfit);


  document.getElementById(
    "profitPercent"
  ).textContent =
    profitPercent.toFixed(2) + "%";


  document.getElementById(
    "todayTrades"
  ).textContent =
    todayTrades.length;


  document.getElementById(
    "totalTrades"
  ).textContent =
    trades.length;


  document.getElementById(
    "totalWins"
  ).textContent =
    totalWins;


  document.getElementById(
    "totalLosses"
  ).textContent =
    totalLosses;


  document.getElementById(
    "netProfit"
  ).textContent =
    formatMoney(netProfit);


  document.getElementById(
    "winRate"
  ).textContent =
    winRate.toFixed(1) + "%";


  updateProgress(balance);

  renderRecentTrades();

  renderTradeHistory();

}



/* =====================================================
   SUCCESS PROGRESS
===================================================== */

function updateProgress(balance) {

  const target =
    Number(settings.target || 100000);


  let progress =
    target > 0
      ? (balance / target) * 100
      : 0;


  progress =
    Math.max(0, progress);


  const visualProgress =
    Math.min(progress, 100);


  const remaining =
    Math.max(target - balance, 0);



  document.getElementById(
    "mainProgress"
  ).style.width =
    visualProgress + "%";


  document.getElementById(
    "sideProgress"
  ).style.width =
    visualProgress + "%";


  document.getElementById(
    "progressPercent"
  ).textContent =
    progress.toFixed(1) + "%";


  document.getElementById(
    "circlePercent"
  ).textContent =
    progress.toFixed(1) + "%";


  document.getElementById(
    "progressCurrent"
  ).textContent =
    formatMoney(balance);


  document.getElementById(
    "progressTarget"
  ).textContent =
    formatMoney(target);


  document.getElementById(
    "remainingAmount"
  ).textContent =
    formatMoney(remaining);


  document.getElementById(
    "sideTarget"
  ).textContent =
    formatMoney(target);


  document.getElementById(
    "heroTarget"
  ).textContent =
    formatMoney(target);


  document.getElementById(
    "heroCurrent"
  ).textContent =
    formatMoney(balance);



  const circle =
    document.querySelector(
      ".circle-progress"
    );


  circle.style.background =
    `conic-gradient(
      #2563eb ${visualProgress * 3.6}deg,
      #e2e8f0 0deg
    )`;



  let motivation =
    "🚀 OSEK LTD. success journey starts today!";


  if (progress >= 100) {

    motivation =
      "🏆 TARGET ACHIEVED! OSEK LTD. reached the goal!";

  } else if (progress >= 75) {

    motivation =
      "⚡ Amazing! OSEK LTD. is very close!";

  } else if (progress >= 50) {

    motivation =
      "🔥 50% completed! Keep going!";

  } else if (progress >= 25) {

    motivation =
      "🌱 Great start! Keep building the journey.";

  }



  document.getElementById(
    "motivationText"
  ).textContent =
    motivation;


  document.getElementById(
    "heroText"
  ).textContent =
    motivation;



  document.querySelectorAll(
    ".milestone"
  ).forEach(item => {

    const required =
      Number(item.dataset.percent);


    if (progress >= required) {

      item.classList.add("active");

    } else {

      item.classList.remove("active");

    }

  });

}



/* =====================================================
   RECENT TRADES
===================================================== */

function renderRecentTrades() {

  const tbody =
    document.getElementById(
      "recentTrades"
    );


  const recent =
    [...trades]
      .sort(
        (a, b) =>
          new Date(b.datetime) -
          new Date(a.datetime)
      )
      .slice(0, 5);



  if (recent.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="5"
            style="text-align:center;padding:35px;">
          No trades published yet.
        </td>
      </tr>
    `;

    return;

  }



  tbody.innerHTML =
    recent.map(trade => {

      const dt =
        formatDateTime(
          trade.datetime
        );


      return `
        <tr>

          <td>${dt.date}</td>

          <td>${dt.time}</td>

          <td>
            ${formatMoney(trade.amount)}
          </td>

          <td class="${
            trade.status === "win"
              ? "green"
              : "red"
          }">

            ${
              trade.status === "win"
                ? "+"
                : "-"
            }

            ${formatMoney(trade.profit)}

          </td>

          <td>

            <span class="status ${
              trade.status
            }">

              ${trade.status.toUpperCase()}

            </span>

          </td>

        </tr>
      `;

    }).join("");

}



/* =====================================================
   TRADE HISTORY
===================================================== */

function renderTradeHistory() {

  const tbody =
    document.getElementById(
      "tradeHistory"
    );


  const filter =
    document.getElementById(
      "dateFilter"
    ).value;


  let list =
    [...trades];


  if (filter) {

    list =
      list.filter(
        trade =>
          trade.dateKey === filter
      );

  }


  list.sort(
    (a, b) =>
      new Date(b.datetime) -
      new Date(a.datetime)
  );



  if (list.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="7"
            style="text-align:center;padding:35px;">
          No trade found.
        </td>
      </tr>
    `;

    return;

  }



  tbody.innerHTML =
    list.map(trade => {

      const dt =
        formatDateTime(
          trade.datetime
        );


      const action =
        isAdmin()
          ? `
            <button
              class="delete-btn"
              data-delete="${trade.id}">
              Delete
            </button>
          `
          : `<span style="color:#94a3b8">View only</span>`;


      return `
        <tr>

          <td>${dt.date}</td>

          <td>${dt.time}</td>

          <td>
            ${formatMoney(trade.amount)}
          </td>

          <td class="${
            trade.status === "win"
              ? "green"
              : "red"
          }">

            ${
              trade.status === "win"
                ? "+"
                : "-"
            }

            ${formatMoney(trade.profit)}

          </td>

          <td>

            <span class="status ${
              trade.status
            }">

              ${trade.status.toUpperCase()}

            </span>

          </td>

          <td>
            ${escapeHtml(trade.note || "-")}
          </td>

          <td>
            ${action}
          </td>

        </tr>
      `;

    }).join("");



  document
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          deleteTrade(
            button.dataset.delete
          )
      );

    });

}



/* =====================================================
   SECURITY HELPER
===================================================== */

function isAdmin() {

  const user =
    auth.currentUser;


  return (
    user &&
    user.uid === ADMIN_UID
  );

}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}



/* =====================================================
   LOAD FIRESTORE SETTINGS
===================================================== */

function listenToSettings() {

  const settingsRef =
    doc(
      db,
      "settings",
      "business"
    );


  onSnapshot(
    settingsRef,
    snapshot => {

      if (snapshot.exists()) {

        const data =
          snapshot.data();


        settings = {

          startingBalance:
            Number(
              data.startingBalance || 0
            ),

          target:
            Number(
              data.target || 100000
            )

        };

      } else {

        settings = {
          startingBalance: 0,
          target: 100000
        };

      }


      updateDashboard();

    },

    error => {

      console.error(
        "Settings listener error:",
        error
      );

    }
  );

}



/* =====================================================
   LIVE TRADE LISTENER
===================================================== */

function listenToTrades() {

  const tradesRef =
    collection(
      db,
      "trades"
    );


  const tradesQuery =
    query(
      tradesRef,
      orderBy(
        "datetime",
        "desc"
      )
    );


  onSnapshot(
    tradesQuery,
    snapshot => {

      trades =
        snapshot.docs.map(
          item => ({
            id: item.id,
            ...item.data()
          })
        );


      updateDashboard();

      hideLoading();

    },

    error => {

      console.error(
        "Trade listener error:",
        error
      );

      hideLoading();

    }
  );

}



/* =====================================================
   ADD TRADE
===================================================== */

async function addTrade() {

  if (!isAdmin()) {

    showMessage(
      "tradeMessage",
      "❌ Admin login required.",
      true
    );

    return;

  }


  const amount =
    Number(
      document.getElementById(
        "tradeAmount"
      ).value
    );


  const profit =
    Number(
      document.getElementById(
        "tradeProfit"
      ).value
    );


  const status =
    document.getElementById(
      "tradeStatus"
    ).value;


  const datetime =
    document.getElementById(
      "tradeDateTime"
    ).value;


  const note =
    document.getElementById(
      "tradeNote"
    ).value.trim();



  if (
    !amount ||
    amount < 0 ||
    !profit ||
    profit < 0 ||
    !datetime
  ) {

    showMessage(
      "tradeMessage",
      "Please fill all required fields.",
      true
    );

    return;

  }



  try {

    await addDoc(
      collection(
        db,
        "trades"
      ),
      {

        amount,

        profit,

        status,

        datetime,

        dateKey:
          datetime.substring(
            0,
            10
          ),

        note,

        createdBy:
          auth.currentUser.uid,

        createdAt:
          serverTimestamp()

      }
    );


    document.getElementById(
      "tradeAmount"
    ).value = "";


    document.getElementById(
      "tradeProfit"
    ).value = "";


    document.getElementById(
      "tradeNote"
    ).value = "";


    showMessage(
      "tradeMessage",
      "✅ Trade published LIVE.",
      false
    );


  } catch (error) {

    console.error(error);


    showMessage(
      "tradeMessage",
      "❌ Failed to publish trade.",
      true
    );

  }

}



/* =====================================================
   DELETE TRADE
===================================================== */

async function deleteTrade(id) {

  if (!isAdmin()) {

    alert(
      "Only the OSEK LTD. admin can delete trades."
    );

    return;

  }


  if (
    !confirm(
      "Delete this trade permanently?"
    )
  ) {

    return;

  }



  try {

    await deleteDoc(
      doc(
        db,
        "trades",
        id
      )
    );

  } catch (error) {

    console.error(error);

    alert(
      "Failed to delete trade."
    );

  }

}



/* =====================================================
   SAVE SETTINGS
===================================================== */

async function saveSettings() {

  if (!isAdmin()) {

    showMessage(
      "settingsMessage",
      "❌ Admin login required.",
      true
    );

    return;

  }


  const startingBalance =
    Number(
      document.getElementById(
        "startingBalanceInput"
      ).value
    );


  const target =
    Number(
      document.getElementById(
        "targetInput"
      ).value
    );



  if (
    startingBalance < 0 ||
    target <= 0
  ) {

    showMessage(
      "settingsMessage",
      "Please enter valid values.",
      true
    );

    return;

  }



  try {

    await setDoc(
      doc(
        db,
        "settings",
        "business"
      ),
      {

        startingBalance,

        target,

        updatedBy:
          auth.currentUser.uid,

        updatedAt:
          serverTimestamp()

      },
      {
        merge: true
      }
    );


    showMessage(
      "settingsMessage",
      "✅ Settings published LIVE.",
      false
    );


  } catch (error) {

    console.error(error);


    showMessage(
      "settingsMessage",
      "❌ Failed to update settings.",
      true
    );

  }

}



/* =====================================================
   LOGIN
===================================================== */

async function login(email, password, messageId) {

  try {

    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    if (
      credential.user.uid !==
      ADMIN_UID
    ) {

      await signOut(auth);


      showMessage(
        messageId,
        "❌ This account is not authorized.",
        true
      );

      return;

    }


    showMessage(
      messageId,
      "✅ Login successful.",
      false
    );


    closeLoginModal();


    showSection(
      "admin"
    );


  } catch (error) {

    console.error(error);


    showMessage(
      messageId,
      "❌ Invalid email or password.",
      true
    );

  }

}



/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
  auth,
  user => {

    if (
      user &&
      user.uid === ADMIN_UID
    ) {

      loginButton.classList.add(
        "hidden"
      );

      logoutButton.classList.remove(
        "hidden"
      );

      adminBadge.classList.remove(
        "hidden"
      );

      loginPanel.classList.add(
        "hidden"
      );

      adminPanel.classList.remove(
        "hidden"
      );


      document.getElementById(
        "startingBalanceInput"
      ).value =
        settings.startingBalance;


      document.getElementById(
        "targetInput"
      ).value =
        settings.target;


    } else {

      loginButton.classList.remove(
        "hidden"
      );

      logoutButton.classList.add(
        "hidden"
      );

      adminBadge.classList.add(
        "hidden"
      );

      loginPanel.classList.remove(
        "hidden"
      );

      adminPanel.classList.add(
        "hidden"
      );

    }


    renderTradeHistory();

  }
);



/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
  "click",
  async () => {

    await signOut(auth);

    showSection(
      "dashboard"
    );

  }
);



/* =====================================================
   LOGIN BUTTON
===================================================== */

loginButton.addEventListener(
  "click",
  () => {

    document
      .getElementById(
        "loginModal"
      )
      .classList.add(
        "show"
      );

  }
);



/* =====================================================
   MODAL LOGIN
===================================================== */

document
  .getElementById(
    "modalLogin"
  )
  .addEventListener(
    "click",
    () => {

      const email =
        document.getElementById(
          "modalEmail"
        ).value.trim();


      const password =
        document.getElementById(
          "modalPassword"
        ).value;


      login(
        email,
        password,
        "modalLoginMessage"
      );

    }
  );



/* =====================================================
   CLOSE MODAL
===================================================== */

function closeLoginModal() {

  document
    .getElementById(
      "loginModal"
    )
    .classList.remove(
      "show"
    );

}


document
  .getElementById(
    "closeLoginModal"
  )
  .addEventListener(
    "click",
    closeLoginModal
  );



/* =====================================================
   LOGIN PAGE
===================================================== */

document
  .getElementById(
    "loginSubmit"
  )
  .addEventListener(
    "click",
    () => {

      const email =
        document.getElementById(
          "adminEmail"
        ).value.trim();


      const password =
        document.getElementById(
          "adminPassword"
        ).value;


      login(
        email,
        password,
        "loginMessage"
      );

    }
  );



/* =====================================================
   ADD TRADE BUTTON
===================================================== */

document
  .getElementById(
    "saveTrade"
  )
  .addEventListener(
    "click",
    addTrade
  );



/* =====================================================
   SETTINGS BUTTON
===================================================== */

document
  .getElementById(
    "saveSettings"
  )
  .addEventListener(
    "click",
    saveSettings
  );



/* =====================================================
   DATE FILTER
===================================================== */

document
  .getElementById(
    "dateFilter"
  )
  .addEventListener(
    "change",
    renderTradeHistory
  );


document
  .getElementById(
    "clearFilter"
  )
  .addEventListener(
    "click",
    () => {

      document.getElementById(
        "dateFilter"
      ).value = "";

      renderTradeHistory();

    }
  );



/* =====================================================
   NAVIGATION
===================================================== */

function showSection(sectionName) {

  document
    .querySelectorAll(
      ".page-section"
    )
    .forEach(section => {

      section.classList.remove(
        "active"
      );

    });


  const target =
    document.getElementById(
      sectionName
    );


  if (target) {

    target.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(
      ".nav-btn"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.section ===
          sectionName
      );

    });


  const activeButton =
    document.querySelector(
      `.nav-btn[data-section="${sectionName}"]`
    );


  if (activeButton) {

    document.getElementById(
      "pageTitle"
    ).textContent =
      activeButton.textContent.trim();

  }

}



document
  .querySelectorAll(
    ".nav-btn"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        showSection(
          button.dataset.section
        );

      }
    );

  });



document
  .querySelectorAll(
    "[data-section-go]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        showSection(
          button.dataset.sectionGo
        );

      }
    );

  });



/* =====================================================
   MESSAGE
===================================================== */

function showMessage(
  elementId,
  message,
  error
) {

  const element =
    document.getElementById(
      elementId
    );


  element.textContent =
    message;


  element.style.color =
    error
      ? "#dc2626"
      : "#16a34a";

}



/* =====================================================
   DEFAULT DATE/TIME
===================================================== */

function setDefaultDateTime() {

  const now =
    new Date();


  now.setMinutes(
    now.getMinutes() -
    now.getTimezoneOffset()
  );


  document.getElementById(
    "tradeDateTime"
  ).value =
    now.toISOString()
      .slice(0, 16);

}



/* =====================================================
   DATE DISPLAY
===================================================== */

document.getElementById(
  "todayDate"
).textContent =
  new Date().toLocaleDateString(
    "en-BD",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );



/* =====================================================
   INITIALIZATION
===================================================== */

function hideLoading() {

  loadingScreen.style.display =
    "none";

}


setDefaultDateTime();

listenToSettings();

listenToTrades();

setTimeout(
  hideLoading,
  5000
);
