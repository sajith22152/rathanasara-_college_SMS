let db;
let editingStudentId = null;

const request = indexedDB.open("SchoolDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore("students", { keyPath: "admissionNumber" });
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
            li.textContent = `${student.admissionNumber} - ${student.studentName}`;
            
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

// ... (previous code remains unchanged)

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
        li.textContent = `${student.admissionNumber} - ${student.studentName}`;
        
        const editButton = document.createElement('button');
        editButton.textContent = 'සංස්කරණය කරන්න';
        editButton.onclick = () => editStudent(student.admissionNumber);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'මකන්න';
        deleteButton.onclick = () => deleteStudent(student.admissionNumber);

        const printButton = document.createElement('button');
        printButton.textContent = 'මුද්‍රණය කරන්න';
        printButton.onclick = () => printSingleStudent(student);

        li.appendChild(editButton);
        li.appendChild(deleteButton);
        li.appendChild(printButton);
        studentList.appendChild(li);
    });
}

function printSingleStudent(student) {
    let printContent = "<h1>සිසුවාගේ සම්පූර්ණ තොරතුරු</h1>";
    printContent += `
        <div>
            <strong>ඇතුලත් විමේ අංකය:</strong> ${student.admissionNumber}<br>
            <strong>ළමයාගේ නම:</strong> ${student.studentName}<br>
            <strong>ලිපිනය:</strong> ${student.address}<br>
            <strong>උපන් දිනය:</strong> ${student.dob}<br>
            <strong>දෙමපිය භාරකරුගේ නම:</strong> ${student.guardianName}<br>
            <strong>දුරකථන අංකය:</strong> ${student.phoneNumber}<br>
            <strong>සහොදර සහොදරියන් සිටින පන්තිය:</strong> ${student.siblingClass}<br>
            <strong>සහොදර සහොදරියන්ගේ නම:</strong> ${student.siblingName}<br>
            <strong>පාසලෙන් ඉවත් වූ දිනය:</strong> ${student.exitDate}<br>
            <strong>පාසලෙන් ඉවත් වීමට හේතුව:</strong> ${student.leaveReason}<br>
            <strong>දෙමාපිය භාරකරුගේ රැකියාව:</strong> ${student.guardianOccupation}<br>
            <strong>අධ්‍යාපනය ලබන පළමු කාණ්ඩයේ විෂය:</strong> ${student.firstSubject}<br>
            <strong>අධ්‍යාපනය ලබන දෙවන කාණ්ඩයේ විෂය:</strong> ${student.secondSubject}<br>
            <strong>අධ්‍යාපනය ලබන තෙවන කාණ්ඩයේ විෂය:</strong> ${student.thirdSubject}
        </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>සිසුවාගේ තොරතුරු මුද්‍රණය කරන්න</title></head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// ... (rest of the code remains unchanged)
document.getElementById('backupButton').onclick = function() {
    const transaction = db.transaction(["students"], "readonly");
    const store = transaction.objectStore("students");
    const request = store.getAll();

    request.onsuccess = function(event) {
        const students = event.target.result;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "student_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };
};

document.getElementById('restoreButton').onclick = function() {
    document.getElementById('fileInput').click();
};

document.getElementById('fileInput').onchange = function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const students = JSON.parse(e.target.result);
        const transaction = db.transaction(["students"], "readwrite");
        const store = transaction.objectStore("students");

        students.forEach(student => {
            store.put(student);
        });

        transaction.oncomplete = function() {
            alert("දත්ත සාර්ථකව ප්‍රතිස්ථාපනය කරන ලදී.");
            displayStudents();
        };
    };

    reader.readAsText(file);
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
    let printContent = "<h1>සිසුන්ගේ සම්පූර්ණ තොරතුරු</h1><ul>";
    students.forEach(student => {
        printContent += `
            <li>
                <strong>ඇතුලත් විමේ අංකය:</strong> ${student.admissionNumber}<br>
                <strong>ළමයාගේ නම:</strong> ${student.studentName}<br>
                <strong>ලිපිනය:</strong> ${student.address}<br>
                <strong>උපන් දිනය:</strong> ${student.dob}<br>
                <strong>දෙමපිය භාරකරුගේ නම:</strong> ${student.guardianName}<br>
                <strong>දුරකථන අංකය:</strong> ${student.phoneNumber}<br>
                <strong>සහොදර සහොදරියන් සිටින පන්තිය:</strong> ${student.siblingClass}<br>
                <strong>සහොදර සහොදරියන්ගේ නම:</strong> ${student.siblingName}<br>
                <strong>පාසලෙන් ඉවත් වූ දිනය:</strong> ${student.exitDate}<br>
                <strong>පාසලෙන් ඉවත් වීමට හේතුව:</strong> ${student.leaveReason}<br>
                <strong>දෙමාපිය භාරකරුගේ රැකියාව:</strong> ${student.guardianOccupation}<br>
                <strong>අධ්‍යාපනය ලබන පළමු කාණ්ඩයේ විෂය:</strong> ${student.firstSubject}<br>
                <strong>අධ්‍යාපනය ලබන දෙවන කාණ්ඩයේ විෂය:</strong> ${student.secondSubject}<br>
                <strong>අධ්‍යාපනය ලබන තෙවන කාණ්ඩයේ විෂය:</strong> ${student.thirdSubject}
            </li>
        `;
    });
    printContent += "</ul>";

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>මුද්‍රණය කරන්න</title></head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}