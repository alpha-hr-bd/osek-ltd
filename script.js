import {
    database,
    ref,
    set,
    push,
    onValue,
    update,
    remove,
    get
} from "./firebase-config.js";


// ========================================
// OSEK LTD - FIREBASE LIVE DATABASE
// ========================================


// ========================================
// ADD REPORT
// ========================================

export async function addReport(reportData) {

    try {

        const reportsRef = ref(database, "reports");

        const newReportRef = push(reportsRef);

        const now = Date.now();

        const data = {
            ...reportData,
            createdAt: now,
            updatedAt: now
        };

        await set(newReportRef, data);


        // Save activity to history
        await addHistory({
            action: "New Report Added",
            reportId: newReportRef.key,
            data: data,
            time: now
        });


        console.log("✅ Report added:", newReportRef.key);

        return true;

    } catch (error) {

        console.error("❌ Add report error:", error);

        alert("Database error: " + error.message);

        return false;
    }
}


// ========================================
// UPDATE REPORT
// ========================================

export async function updateReport(reportId, updatedData) {

    try {

        const reportRef = ref(
            database,
            `reports/${reportId}`
        );

        const now = Date.now();

        await update(reportRef, {
            ...updatedData,
            updatedAt: now
        });


        await addHistory({
            action: "Report Updated",
            reportId: reportId,
            data: updatedData,
            time: now
        });


        console.log("✅ Report updated!");

        return true;

    } catch (error) {

        console.error("❌ Update error:", error);

        alert("Update failed: " + error.message);

        return false;
    }
}


// ========================================
// DELETE REPORT
// ========================================

export async function deleteReport(reportId) {

    const confirmed = confirm(
        "Are you sure you want to delete this report?"
    );

    if (!confirmed) {
        return false;
    }


    try {

        await remove(
            ref(database, `reports/${reportId}`)
        );


        await addHistory({
            action: "Report Deleted",
            reportId: reportId,
            time: Date.now()
        });


        console.log("✅ Report deleted!");

        return true;

    } catch (error) {

        console.error("❌ Delete error:", error);

        alert("Delete failed: " + error.message);

        return false;
    }
}


// Make available globally too
window.updateReport = updateReport;
window.deleteReport = deleteReport;


// ========================================
// ADD HISTORY
// ========================================

async function addHistory(historyData) {

    const historyRef = ref(database, "history");

    const newHistoryRef = push(historyRef);

    await set(newHistoryRef, {
        ...historyData,
        timestamp: Date.now()
    });
}


// ========================================
// LIVE REPORT LISTENER
// ========================================

export function listenToReports(callback) {

    const reportsRef = ref(database, "reports");

    onValue(
        reportsRef,

        (snapshot) => {

            const data = snapshot.val();

            const reports = [];


            if (data) {

                Object.keys(data).forEach((key) => {

                    reports.push({
                        id: key,
                        ...data[key]
                    });

                });

            }


            callback(reports);

        },

        (error) => {

            console.error(
                "❌ Reports listener error:",
                error
            );

        }
    );
}


// ========================================
// LIVE HISTORY LISTENER
// ========================================

export function listenToHistory(callback) {

    const historyRef = ref(database, "history");

    onValue(
        historyRef,

        (snapshot) => {

            const data = snapshot.val();

            const history = [];


            if (data) {

                Object.keys(data).forEach((key) => {

                    history.push({
                        id: key,
                        ...data[key]
                    });

                });

            }


            // Newest first
            history.sort(
                (a, b) =>
                    (b.timestamp || 0) -
                    (a.timestamp || 0)
            );


            callback(history);

        },

        (error) => {

            console.error(
                "❌ History listener error:",
                error
            );

        }
    );
}


// ========================================
// CLEAR HISTORY
// ========================================

export async function clearHistory() {

    const confirmed = confirm(
        "Are you sure you want to clear ALL history?"
    );

    if (!confirmed) {
        return;
    }


    try {

        await remove(
            ref(database, "history")
        );


        alert("History cleared successfully!");

        console.log("✅ History cleared!");

    } catch (error) {

        console.error(
            "❌ Clear history error:",
            error
        );

        alert(
            "Failed to clear history: " +
            error.message
        );
    }
}


window.clearHistory = clearHistory;


// ========================================
// FIREBASE CONNECTION CHECK
// ========================================

export async function checkFirebaseConnection() {

    try {

        await get(
            ref(database)
        );


        console.log(
            "🔥 Firebase connected successfully!"
        );


        return true;

    } catch (error) {

        console.error(
            "❌ Firebase connection failed:",
            error
        );


        return false;
    }
}


window.checkFirebaseConnection =
    checkFirebaseConnection;


// ========================================
// STARTUP CHECK
// ========================================

checkFirebaseConnection();
