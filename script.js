let db;
let editingStudentId = null;

const request = indexedDB.open("SchoolDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const studentStore = db.createObjectStore("students", { keyPath: "admissionNumber" });
};

request.onsuccess = function(event) {
    db = event.target.result;
    displayStudents();
};

request.onerror = function(event) {
    console.error("Database error: " + event.target.error);
};

document.getElementById('studentForm').onsubmit = function(event) {
    event.preventDefault();
    const admissionNumber = document.getElementById('admissionNumber').value;

    const student = {
        admissionNumber,
        studentName: document.getElementById('studentName').value,
        admissionDate: document.getElementById('admissionDate').value,
        admissionGrade: document.getElementById('admissionGrade').value,
        address: document.getElementById('address').value,
        dob: document.getElementById('dob').value,
        guardianName: document.getElementById('guardianName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        siblingClass: document.getElementById('siblingClass').value,
        siblingName: document.getElementById('siblingName').value,
        exitDate: document.getElementById('exitDate').value,
        leaveReason: document.getElementById('leaveReason').value,
        guardianOccupation: document.getElementById('guardianOccupation').value,
        firstSubject: document.getElementById('firstSubject').value,
        secondSubject: document.getElementById('secondSubject').value,
        thirdSubject: document.getElementById('thirdSubject').value,
    };

    if (editingStudentId) {
        updateStudent(student);
    } else {
        checkAndSaveStudent(student);
    }
};

function checkAndSaveStudent(student) {
    const transaction = db.transaction(["students"], "readwrite");
    const store = transaction.objectStore("students");
    const request = store.get(student.admissionNumber);

    request.onsuccess = function(event) {
        if (event.target.result) {
            alert("ඇතුලත් විමේ අංකය දැනටමත් භාවිතා කර ඇත.");
        } else {
            saveStudent(student);
        }
    };
}

function saveStudent(student) {
    const transaction = db.transaction(["students"], "readwrite");
    const store = transaction.objectStore("students");
    const request = store.add(student);

    request.onsuccess = function() {
        alert("සිසුවා සාර්ථකව ඇතුළත් කරන ලදී.");
        document.getElementById('studentForm').reset();
        displayStudents();
    };

    request.onerror = function() {
        alert("සිසුවා ඇතුළත් කිරීමේදී දෝෂයක් ඇති විය.");
    };
}

function updateStudent(student) {
    const transaction = db.transaction(["students"], "readwrite");
    const store = transaction.objectStore("students");
    const request = store.put(student);

    request.onsuccess = function() {
        alert("සිසුවාගේ තොරතුරු සාර්ථකව යාවත්කාලීන කරන ලදී.");
        document.getElementById('studentForm').reset();
        editingStudentId = null;
        displayStudents();
    };

    request.onerror = function() {
        alert("සිසුවාගේ තොරතුරු යාවත්කාලීන කිරීමේදී දෝෂයක් ඇති විය.");
    };
}

function displayStudents() {
    const transaction = db.transaction(["students"], "readonly");
    const store = transaction.objectStore("students");
    const request = store.getAll();

    request.onsuccess = function(event) {
        const students = event.target.result;
        const studentList = document.getElementById('studentList');
        studentList.innerHTML = '';

        students.forEach(student => {
            const li = document.createElement('li');
            li.textContent = `${student.admissionNumber} - ${student.studentName} (${student.admissionGrade})`;
            
            const editButton = document.createElement('button');
            editButton.textContent = 'සංස්කරණය කරන්න';
            editButton.onclick = () => editStudent(student.admissionNumber);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'මකන්න';
            deleteButton.onclick = () => deleteStudent(student.admissionNumber);

            li.appendChild(editButton);
            li.appendChild(deleteButton);
            studentList.appendChild(li);
        });
    };
}

function editStudent(admissionNumber) {
    const transaction = db.transaction(["students"], "readonly");
    const store = transaction.objectStore("students");
    const request = store.get(admissionNumber);

    request.onsuccess = function(event) {
        const student = event.target.result;
        if (student) {
            document.getElementById('admissionNumber').value = student.admissionNumber;
            document.getElementById('studentName').value = student.studentName;
            document.getElementById('admissionDate').value = student.admissionDate;
            document.getElementById('admissionGrade').value = student.admissionGrade;
            document.getElementById('address').value = student.address;
            document.getElementById('dob').value = student.dob;
            document.getElementById('guardianName').value = student.guardianName;
            document.getElementById('phoneNumber').value = student.phoneNumber;
            document.getElementById('siblingClass').value = student.siblingClass;
            document.getElementById('siblingName').value = student.siblingName;
            document.getElementById('exitDate').value = student.exitDate;
            document.getElementById('leaveReason').value = student.leaveReason;
            document.getElementById('guardianOccupation').value = student.guardianOccupation;
            document.getElementById('firstSubject').value = student.firstSubject;
            document.getElementById('secondSubject').value = student.secondSubject;
            document.getElementById('thirdSubject').value = student.thirdSubject;

            editingStudentId = student.admissionNumber;
        }
    };
}

function deleteStudent(admissionNumber) {
    if (confirm("ඔබට මෙම සිසුවා මකා දැමීමට අවශ්‍ය බව විශ්වාසද?")) {
        const transaction = db.transaction(["students"], "readwrite");
        const store = transaction.objectStore("students");
        const request = store.delete(admissionNumber);

        request.onsuccess = function() {
            alert("සිසුවා සාර්ථකව මකා දමන ලදී.");
            displayStudents();
        };

        request.onerror = function() {
            alert("සිසුවා මකා දැමීමේදී දෝෂයක් ඇති විය.");
        };
    }
}

document.getElementById('searchButton').onclick = function() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const transaction = db.transaction(["students"], "readonly");
    const store = transaction.objectStore("students");
    const request = store.getAll();

    request.onsuccess = function(event) {
        const students = event.target.result;
        const filteredStudents = students.filter(student => 
            student.admissionNumber.toLowerCase().includes(searchTerm) || 
            student.studentName.toLowerCase().includes(searchTerm)
        );
        displayFilteredStudents(filteredStudents);
    };
};

function displayFilteredStudents(students) {
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '';

    students.forEach(student => {
        const li = document.createElement('li');
        li.textContent = `${student.admissionNumber} - ${student.studentName} (${student.admissionGrade})`;
        
        const editButton = document.createElement('button');
        editButton.textContent = 'සංස්කරණය කරන්න';
        editButton.onclick = () => editStudent(student.admissionNumber);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'මකන්න';
        deleteButton.onclick = () => deleteStudent(student.admissionNumber);

        li.appendChild(editButton);
        li.appendChild(deleteButton);
        studentList.appendChild(li);
    });
}

// Enhanced backup functionality
document.getElementById('backupButton').onclick = async function() {
    try {
        const transaction = db.transaction(["students"], "readonly");
        const store = transaction.objectStore("students");
        
        // Get all students from the database
        const students = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        // Create backup object with metadata
        const backupData = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            schoolName: "රතනසාර විද්‍යාලය",
            totalRecords: students.length,
            data: students,
            metadata: {
                exportedBy: "School Management System",
                exportDate: new Date().toLocaleDateString(),
                exportTime: new Date().toLocaleTimeString()
            }
        };

        // Convert to JSON and create blob
        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `student_backup_${timestamp}.json`;

        // Create download link and trigger download
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);

        alert("දත්ත සාර්ථකව backup කර ඇත.");
    } catch (error) {
        console.error("Backup error:", error);
        alert("දත්ත backup කිරීමේදී දෝෂයක් ඇති විය.");
    }
};

// Enhanced restore functionality
document.getElementById('restoreButton').onclick = function() {
    document.getElementById('fileInput').click();
};

document.getElementById('fileInput').onchange = async function(event) {
    try {
        const file = event.target.files[0];
        const fileContent = await file.text();
        const backupData = JSON.parse(fileContent);

        // Validate backup file structure
        if (!backupData.data || !Array.isArray(backupData.data)) {
            throw new Error("Invalid backup file format");
        }

        // Begin database transaction
        const transaction = db.transaction(["students"], "readwrite");
        const store = transaction.objectStore("students");

        // Clear existing data
        await new Promise((resolve, reject) => {
            const clearRequest = store.clear();
            clearRequest.onsuccess = () => resolve();
            clearRequest.onerror = () => reject(clearRequest.error);
        });

        // Restore all records
        for (const student of backupData.data) {
            await new Promise((resolve, reject) => {
                const request = store.add(student);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }

        alert(`දත්ත සාර්ථකව ප්‍රතිස්ථාපනය කරන ලදී. මුළු වාර්තා ගණන: ${backupData.data.length}`);
        displayStudents();
    } catch (error) {
        console.error("Restore error:", error);
        alert("දත්ත ප්‍රතිස්ථාපනය කිරීමේදී දෝෂයක් ඇති විය.");
    }
};

document.getElementById('printButton').onclick = function() {
    const transaction = db.transaction(["students"], "readonly");
    const store = transaction.objectStore("students");
    const request = store.getAll();

    request.onsuccess = function(event) {
        const students = event.target.result;
        printStudents(students);
    };
};

function printStudents(students) {
    let printContent = `
        <html>
        <head>
            <title>සිසුන්ගේ සම්පූර්ණ තොරතුරු</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px;
                    line-height: 1.6;
                }
                .student-info { 
                    border: 1px solid #ccc; 
                    margin: 10px 0; 
                    padding: 15px;
                    page-break-inside: avoid;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 20px; 
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                }
                .metadata { 
                    margin-bottom: 20px;
                    background: #f5f5f5;
                    padding: 10px;
                }
                .field-label {
                    font-weight: bold;
                    min-width: 200px;
                    display: inline-block;
                }
                @media print {
                    .student-info {
                        page-break-inside: avoid;
                    }
                    .header {
                        position: fixed;
                        top: 0;
                        width: 100%;
                    }
                    .metadata {
                        margin-top: 100px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>රතනසාර විද්‍යාලය</h1>
                <h2>සිසුන්ගේ සම්පූර්ණ තොරතුරු</h2>
            </div>
            <div class="metadata">
                <p><span class="field-label">මුළු සිසුන් ගණන:</span> ${students.length}</p>
                <p><span class="field-label">වාර්තාව මුද්‍රණය කළ දිනය:</span> ${new Date().toLocaleDateString()}</p>
                <p><span class="field-label">වාර්තාව මුද්‍රණය කළ වේලාව:</span> ${new Date().toLocaleTimeString()}</p>
            </div>
    `;

    students.forEach((student, index) => {
        printContent += `
            <div class="student-info">
                <h3>${index + 1}. ${student.studentName}</h3>
                <p><span class="field-label">ඇතුලත් විමේ අංකය:</span> ${student.admissionNumber}</p>
                <p><span class="field-label">ඇතුලත් වූ දිනය:</span> ${student.admissionDate}</p>
                <p><span class="field-label">ඇතුලත් කළ ශ්‍රේණිය:</span> ${student.admissionGrade}</p>
                <p><span class="field-label">ලිපිනය:</span> ${student.address}</p>
                <p><span class="field-label">උපන් දිනය:</span> ${student.dob}</p>
                <p><span class="field-label">දෙමපිය භාරකරුගේ නම:</span> ${student.guardianName}</p>
                <p><span class="field-label">දුරකථන අංකය:</span> ${student.phoneNumber}</p>
                <p><span class="field-label">සහොදර සහොදරියන් සිටින පන්තිය:</span> ${student.siblingClass}</p>
                <p><span class="field-label">සහොදර සහොදරියන්ගේ නම:</span> ${student.siblingName}</p>
                <p><span class="field-label">පාසලෙන් ඉවත් වූ දිනය:</span> ${student.exitDate}</p>
                <p><span class="field-label">පාසලෙන් ඉවත් වීමට හේතුව:</span> ${student.leaveReason}</p>
                <p><span class="field-label">දෙමාපිය භාරකරුගේ රැකියාව:</span> ${student.guardianOccupation}</p>
                <p><span class="field-label">අධ්‍යාපනය ලබන පළමු කාණ්ඩයේ විෂය:</span> ${student.firstSubject}</p>
                <p><span class="field-label">අධ්‍යාපනය ලබන දෙවන කාණ්ඩයේ විෂය:</span> ${student.secondSubject}</p>
                <p><span class="field-label">අධ්‍යාපනය ලබන තෙවන කාණ්ඩයේ විෂය:</span> ${student.thirdSubject}</p>
            </div>
        `;
    });

    printContent += `
            <div style="text-align: center; margin-top: 20px; font-size: 12px;">
                <p>මෙම වාර්තාව පරිගණක ජනිත වාර්තාවකි</p>
                <p>© ${new Date().getFullYear()} රතනසාර විද්‍යාලය</p>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Add slight delay to ensure proper loading of styles
    setTimeout(() => {
        printWindow.print();
    }, 500);
}