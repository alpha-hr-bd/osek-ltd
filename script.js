let trades = JSON.parse(localStorage.getItem("osekTrades")) || [];

let settings = JSON.parse(localStorage.getItem("osekSettings")) || {
    startingBalance: 0,
    target: 100000
};


const tradeModal = document.getElementById("tradeModal");

const formatMoney = (amount) => {
    return "৳" + Number(amount || 0).toLocaleString();
};


function saveData() {
    localStorage.setItem("osekTrades", JSON.stringify(trades));
    localStorage.setItem("osekSettings", JSON.stringify(settings));
}


function getCurrentBalance() {

    let balance = Number(settings.startingBalance);

    trades.forEach(trade => {

        if (trade.status === "win") {
            balance += Number(trade.profit);
        } else {
            balance -= Number(trade.profit);
        }

    });

    return balance;
}


function updateDashboard() {

    const balance = getCurrentBalance();

    const today = new Date().toISOString().split("T")[0];

    const todayTradeList = trades.filter(trade =>
        trade.datetime.startsWith(today)
    );

    let todayProfit = 0;

    todayTradeList.forEach(trade => {

        if (trade.status === "win") {
            todayProfit += Number(trade.profit);
        } else {
            todayProfit -= Number(trade.profit);
        }

    });


    const totalWins = trades.filter(t => t.status === "win").length;

    const totalLossAmount = trades
        .filter(t => t.status === "loss")
        .reduce((sum, t) => sum + Number(t.profit), 0);

    const profitPercent =
        settings.startingBalance > 0
        ? ((balance - settings.startingBalance) / settings.startingBalance) * 100
        : 0;

    const winRate =
        trades.length > 0
        ? (totalWins / trades.length) * 100
        : 0;


    document.getElementById("currentBalance").textContent =
        formatMoney(balance);

    document.getElementById("todayProfit").textContent =
        formatMoney(todayProfit);

    document.getElementById("profitPercent").textContent =
        profitPercent.toFixed(2) + "%";

    document.getElementById("todayTrades").textContent =
        todayTradeList.length;

    document.getElementById("totalTrades").textContent =
        trades.length;

    document.getElementById("totalWins").textContent =
        totalWins;

    document.getElementById("totalLoss").textContent =
        formatMoney(totalLossAmount);

    document.getElementById("winRate").textContent =
        winRate.toFixed(1) + "%";


    updateProgress(balance);

    renderRecentTrades();
    renderTradeHistory();
}


function updateProgress(balance) {

    const target = Number(settings.target);

    let progress = target > 0
        ? (balance / target) * 100
        : 0;

    progress = Math.max(0, progress);

    const visualProgress = Math.min(progress, 100);

    const remaining = Math.max(target - balance, 0);


    document.getElementById("mainProgress").style.width =
        visualProgress + "%";

    document.getElementById("sideProgress").style.width =
        visualProgress + "%";

    document.getElementById("progressPercent").textContent =
        progress.toFixed(1) + "%";

    document.getElementById("circlePercent").textContent =
        progress.toFixed(1) + "%";

    document.getElementById("progressCurrent").textContent =
        formatMoney(balance);

    document.getElementById("progressTarget").textContent =
        formatMoney(target);

    document.getElementById("remainingAmount").textContent =
        formatMoney(remaining);

    document.getElementById("sideTarget").textContent =
        formatMoney(target);

    document.getElementById("heroTarget").textContent =
        target.toLocaleString();

    document.getElementById("heroCurrent").textContent =
        formatMoney(balance);


    const circle = document.querySelector(".circle-progress");

    circle.style.background =
        `conic-gradient(#2563eb ${visualProgress * 3.6}deg,#e2e8f0 0deg)`;


    let motivation = "🚀 Keep going! Every smart step counts.";

    if (progress >= 100) {
        motivation = "🏆 CONGRATULATIONS! ৳1 Lakh Target Achieved!";
    }
    else if (progress >= 75) {
        motivation = "⚡ Amazing! You are very close to your target!";
    }
    else if (progress >= 50) {
        motivation = "🔥 Halfway completed! Keep the momentum!";
    }
    else if (progress >= 25) {
        motivation = "🌱 Great start! Your success journey is growing.";
    }

    document.getElementById("motivationText").textContent =
        motivation;

    document.getElementById("heroText").textContent =
        motivation;


    document.querySelectorAll(".milestone").forEach(item => {

        const required = Number(item.dataset.percent);

        if (progress >= required) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }

    });

}


function renderRecentTrades() {

    const container =
        document.getElementById("recentTrades");

    const recent = [...trades]
        .sort((a,b) => new Date(b.datetime) - new Date(a.datetime))
        .slice(0,5);


    if (recent.length === 0) {

        container.innerHTML =
            `<tr>
                <td colspan="4" style="text-align:center;padding:30px;">
                    No trades yet. Add your first trade 🚀
                </td>
            </tr>`;

        return;
    }


    container.innerHTML = recent.map(trade => {

        const date = new Date(trade.datetime);

        return `
        <tr>

            <td>
                ${date.toLocaleDateString()}
                <br>
                <small>${date.toLocaleTimeString()}</small>
            </td>

            <td>${formatMoney(trade.amount)}</td>

            <td class="${trade.status === "win" ? "green" : "red"}">
                ${trade.status === "win" ? "+" : "-"}
                ${formatMoney(trade.profit)}
            </td>

            <td>
                <span class="status ${trade.status}">
                    ${trade.status.toUpperCase()}
                </span>
            </td>

        </tr>`;

    }).join("");

}


function renderTradeHistory() {

    const container =
        document.getElementById("tradeHistory");

    const filter =
        document.getElementById("dateFilter").value;


    let filteredTrades = [...trades];

    if (filter) {

        filteredTrades =
            filteredTrades.filter(trade =>
                trade.datetime.startsWith(filter)
            );

    }


    filteredTrades.sort(
        (a,b) => new Date(b.datetime) - new Date(a.datetime)
    );


    if (filteredTrades.length === 0) {

        container.innerHTML =
            `<tr>
                <td colspan="6" style="text-align:center;padding:30px;">
                    No trade found.
                </td>
            </tr>`;

        return;
    }


    container.innerHTML =
        filteredTrades.map(trade => {

            const date = new Date(trade.datetime);

            return `

            <tr>

                <td>${date.toLocaleDateString()}</td>

                <td>${date.toLocaleTimeString()}</td>

                <td>${formatMoney(trade.amount)}</td>

                <td class="${trade.status === "win" ? "green" : "red"}">
                    ${trade.status === "win" ? "+" : "-"}
                    ${formatMoney(trade.profit)}
                </td>

                <td>
                    <span class="status ${trade.status}">
                        ${trade.status.toUpperCase()}
                    </span>
                </td>

                <td>
                    <button class="delete-btn"
                        onclick="deleteTrade('${trade.id}')">
                        Delete
                    </button>
                </td>

            </tr>`;

        }).join("");

}


function deleteTrade(id) {

    if (!confirm("Are you sure you want to delete this trade?")) {
        return;
    }

    trades =
        trades.filter(trade => trade.id !== id);

    saveData();

    updateDashboard();

}


function openModal() {

    tradeModal.classList.add("show");

    const now = new Date();

    now.setMinutes(
        now.getMinutes() - now.getTimezoneOffset()
    );

    document.getElementById("tradeDateTime").value =
        now.toISOString().slice(0,16);

}


function closeModal() {
    tradeModal.classList.remove("show");
}


document.getElementById("addTradeTop")
.addEventListener("click", openModal);


document.getElementById("closeModal")
.addEventListener("click", closeModal);


tradeModal.addEventListener("click", (e) => {

    if (e.target === tradeModal) {
        closeModal();
    }

});


document.getElementById("saveTrade")
.addEventListener("click", () => {

    const amount =
        document.getElementById("tradeAmount").value;

    const profit =
        document.getElementById("tradeProfit").value;

    const status =
        document.getElementById("tradeStatus").value;

    const datetime =
        document.getElementById("tradeDateTime").value;


    if (!amount || !profit || !datetime) {

        alert("Please fill all fields!");

        return;
    }


    const newTrade = {

        id: Date.now().toString(),

        amount: Number(amount),

        profit: Number(profit),

        status: status,

        datetime: datetime

    };


    trades.push(newTrade);

    saveData();

    updateDashboard();

    closeModal();


    document.getElementById("tradeAmount").value = "";

    document.getElementById("tradeProfit").value = "";

});


document.getElementById("dateFilter")
.addEventListener("change", renderTradeHistory);


document.getElementById("clearFilter")
.addEventListener("click", () => {

    document.getElementById("dateFilter").value = "";

    renderTradeHistory();

});


document.getElementById("saveSettings")
.addEventListener("click", () => {

    const starting =
        document.getElementById("startingBalanceInput").value;

    const target =
        document.getElementById("targetInput").value;


    if (starting !== "") {
        settings.startingBalance = Number(starting);
    }

    if (target !== "") {
        settings.target = Number(target);
    }


    saveData();

    updateDashboard();

    alert("Settings saved successfully!");

});


document.getElementById("resetAll")
.addEventListener("click", () => {

    if (!confirm("This will delete ALL trades and data. Continue?")) {
        return;
    }

    trades = [];

    settings = {
        startingBalance: 0,
        target: 100000
    };


    saveData();

    updateDashboard();

    document.getElementById("startingBalanceInput").value = 0;

    document.getElementById("targetInput").value = 100000;

});


document.querySelectorAll(".nav-btn")
.forEach(button => {

    button.addEventListener("click", () => {

        const section =
            button.dataset.section;

        document.querySelectorAll(".nav-btn")
        .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");


        document.querySelectorAll(".page-section")
        .forEach(page => page.classList.remove("active"));


        document.getElementById(section)
        .classList.add("active");


        document.getElementById("pageTitle").textContent =
            button.textContent.trim().replace(/^[^\w]+/, "");

    });

});


document.querySelectorAll("[data-section-go]")
.forEach(button => {

    button.addEventListener("click", () => {

        const section =
            button.dataset.sectionGo;

        document.querySelector(
            `[data-section="${section}"]`
        ).click();

    });

});


document.querySelectorAll(".page-section")
.forEach((section,index) => {

    if (index !== 0) {
        section.style.display = "none";
    }

});


const originalNavigation = () => {

    document.querySelectorAll(".nav-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            document.querySelectorAll(".page-section")
            .forEach(section => {
                section.style.display = "none";
            });

            document.getElementById(
                button.dataset.section
            ).style.display = "block";

        });

    });

};


originalNavigation();


const today = new Date();

document.getElementById("todayDate").textContent =
    today.toLocaleDateString(
        "en-US",
        {
            weekday:"long",
            year:"numeric",
            month:"long",
            day:"numeric"
        }
    );


document.getElementById("startingBalanceInput").value =
    settings.startingBalance;

document.getElementById("targetInput").value =
    settings.target;


updateDashboard();
