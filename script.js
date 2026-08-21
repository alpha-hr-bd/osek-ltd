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


// ===============================
// OSEK LTD LIVE DATABASE
// ===============================


// নতুন Report Add করার Function
window.addReport = async function (reportData) {

    try {

        const reportsRef = ref(database, "reports");

        const newReportRef = push(reportsRef);

        const data = {
            ...reportData,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await set(newReportRef, data);


        // History তে Save
        await addHistory({
            action: "New Report Added",
            reportId: newReportRef.key,
            data: data,
            time: Date.now()
        });


        console.log("Report added successfully!");

        return true;

    } catch (error) {

        console.error("Error adding report:", error);

        alert("Database error: " + error.message);

        return false;
    }
};



// ===============================
// REPORT UPDATE
// ===============================

window.updateReport = async function (reportId, updatedData) {

    try {

        const reportRef = ref(
            database,
            `reports/${reportId}`
        );

        await update(reportRef, {
            ...updatedData,
            updatedAt: Date.now()
        });


        // History
        await addHistory({
            action: "Report Updated",
            reportId: reportId,
            data: updatedData,
            time: Date.now()
        });


        console.log("Report updated!");

        return true;

    } catch (error) {

        console.error(error);

        alert("Update failed!");

        return false;
    }
};



// ===============================
// DELETE REPORT
// ===============================

window.deleteReport = async function (reportId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) return;


    try {

        await remove(
            ref(database, `reports/${reportId}`)
        );


        // History
        await addHistory({
            action: "Report Deleted",
            reportId: reportId,
            time: Date.now()
        });


        console.log("Report deleted!");

    } catch (error) {

        console.error(error);

        alert("Delete failed!");
    }
};



// ===============================
// ADD HISTORY
// ===============================

async function addHistory(historyData) {

    const historyRef = ref(database, "history");

    const newHistoryRef = push(historyRef);

    await set(newHistoryRef, {
        ...historyData,
        timestamp: Date.now()
    });
}



// ===============================
// LIVE REPORT LISTENER
// ===============================

export function listenToReports(callback) {

    const reportsRef = ref(database, "reports");


    onValue(reportsRef, (snapshot) => {

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

    });

}



// ===============================
// LIVE HISTORY LISTENER
// ===============================

export function listenToHistory(callback) {

    const historyRef = ref(database, "history");


    onValue(historyRef, (snapshot) => {

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


        // নতুনটা আগে দেখাবে
        history.sort(
            (a, b) => b.timestamp - a.timestamp
        );


        callback(history);

    });

}



// ===============================
// CLEAR ALL HISTORY
// ===============================

window.clearHistory = async function () {

    const confirmClear = confirm(
        "Clear all history?"
    );

    if (!confirmClear) return;


    try {

        await remove(
            ref(database, "history")
        );

        alert("History cleared!");

    } catch (error) {

        console.error(error);

        alert("Failed to clear history!");
    }
};



// ===============================
// CHECK DATABASE CONNECTION
// ===============================

window.checkFirebaseConnection = async function () {

    try {

        await get(ref(database));

        console.log(
            "Firebase connected successfully!"
        );

        return true;

    } catch (error) {

        console.error(
            "Firebase connection failed:",
            error
        );

        return false;
    }
};



// Firebase Connection Check
checkFirebaseConnection();
