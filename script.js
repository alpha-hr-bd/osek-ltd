import {
    database,
    ref,
    push,
    set,
    onValue,
    update,
    remove
} from "./firebase-config.js";


// ================================
// ADD REPORT
// ================================

export async function addReport(data) {

    const reportRef = push(
        ref(database, "reports")
    );

    const now = Date.now();

    await set(reportRef, {
        ...data,
        createdAt: now,
        updatedAt: now
    });

    await addHistory(
        "New Report Added",
        reportRef.key
    );

    return reportRef.key;
}


// ================================
// UPDATE
// ================================

export async function updateReport(id, data) {

    await update(
        ref(database, `reports/${id}`),
        {
            ...data,
            updatedAt: Date.now()
        }
    );

    await addHistory(
        "Report Updated",
        id
    );
}


// ================================
// DELETE
// ================================

export async function deleteReport(id) {

    await remove(
        ref(database, `reports/${id}`)
    );

    await addHistory(
        "Report Deleted",
        id
    );
}


// ================================
// HISTORY
// ================================

async function addHistory(action, reportId) {

    const historyRef =
        push(ref(database, "history"));

    await set(historyRef, {
        action,
        reportId,
        timestamp: Date.now()
    });
}


// ================================
// REPORT LISTENER
// ================================

export function listenToReports(callback) {

    onValue(
        ref(database, "reports"),
        snapshot => {

            const data = snapshot.val() || {};

            const reports = Object.entries(data)
                .map(([id, value]) => ({
                    id,
                    ...value
                }))
                .sort(
                    (a, b) =>
                        (b.updatedAt || 0) -
                        (a.updatedAt || 0)
                );

            callback(reports);
        }
    );
}


// ================================
// HISTORY LISTENER
// ================================

export function listenToHistory(callback) {

    onValue(
        ref(database, "history"),
        snapshot => {

            const data = snapshot.val() || {};

            const history = Object.entries(data)
                .map(([id, value]) => ({
                    id,
                    ...value
                }))
                .sort(
                    (a, b) =>
                        (b.timestamp || 0) -
                        (a.timestamp || 0)
                );

            callback(history);
        }
    );
}


// ================================
// CLEAR HISTORY
// ================================

export async function clearHistory() {

    await remove(
        ref(database, "history")
    );
}
