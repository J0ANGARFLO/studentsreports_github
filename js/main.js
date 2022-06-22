const reportFileInput = document.getElementById('report_file_input');
reportFileInput.addEventListener('change', filePicked, false);

function filePicked(e) {
    const reportFile = e.target.files[0];
    excelToJSON(reportFile)
}

function excelToJSON(file) {
    let students = []
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, {
            type: 'binary'
        });

        workbook.SheetNames.forEach(function (sheetName) {
            const excelJson = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

            excelJson.map(student => {
                let tempStudent = {
                    student: student["NOMBRE DEL ALUMNO"],
                    position: student["PUESTO ALUMNO"],
                    schoolParents: student["ESCUELA DE PADRES"],
                    institutionalPerformance: student["DESEMPEÑO INSTITUCIONAL"],
                    average: student["PROMEDIO ALUMNO"],
                    reprovedSubjects: student["ASIGNATURAS REPROBADAS"],
                    failures: student["FALLAS ACUMULADAS"],
                    courses: []
                }

                for (const property in student) {
                    if (
                        property !== "NOMBRE DEL ALUMNO" &&
                        property !== "PUESTO ALUMNO" &&
                        property !== "ESCUELA DE PADRES" &&
                        property !== "DESEMPEÑO INSTITUCIONAL" &&
                        property !== "PROMEDIO ALUMNO" &&
                        property !== "ÁREAS REPROBADAS" &&
                        property !== "ASIGNATURAS REPROBADAS" &&
                        property !== "FALLAS ACUMULADAS"
                    ) {
                        tempStudent.courses.push({
                            course: property,
                            score: student[property]
                        })
                    }
                }

                students.push(tempStudent)
            })

            analyzeData(students)
        })
    };

    reader.onerror = function (ex) { console.error(ex); };
    reader.readAsBinaryString(file);
};

function analyzeData(students) {
    let arrPerformances = []

    for (const student of students) {
        let tempStudent = {
            student: student.student,
            info: [
                { name: "Puesto", value: student.position ? student.position : "" },
                { name: "Escuela de Padres", value: student.schoolParents ? student.schoolParents : "" },
                { name: "Desempeño Institucional", value: student.institutionalPerformance ? student.institutionalPerformance : "" },
                { name: "Promedio", value: student.average ? student.average : "" },
                { name: "Asignaturas Reprobadas", value: student.reprovedSubjects ? student.reprovedSubjects : "" },
                { name: "Fallas", value: student.failures ? student.failures : "" }
            ],
            low: [],
            basic: [],
            high: []
        }

        for (course of student.courses) {
            const floatScore = course.score.replace(',', '.')
            switch (true) {
                case (parseFloat(floatScore) <= 3.2):
                    tempStudent.low.push(course)
                    break;
                case (parseFloat(floatScore) <= 3.9):
                    tempStudent.basic.push(course)
                    break;
                default:
                    tempStudent.high.push(course)
                    break;
            }
        }

        arrPerformances.push(tempStudent)
    }

    let flagStudent = 0
    for (const student of arrPerformances) {
        const contStudent = document.createElement("div");
        if (flagStudent % 2 == 0) {
            contStudent.className = "contStudent contStudentEven";
        } else {
            contStudent.className = "contStudent contStudentOdd";
        }
        const nodeTitle = document.createElement("h2");
        nodeTitle.className = "nameStudent";
        nodeTitle.appendChild(document.createTextNode(student.student));
        contStudent.appendChild(nodeTitle);

        if (student.info.length > 0) {
            const contInfo = document.createElement("div");
            contInfo.className = "contInfo";
            student.info.map(info => {
                const contItemInfo = document.createElement("div");
                const namePosition = document.createElement("strong");
                namePosition.className = "nameInfo";
                namePosition.appendChild(document.createTextNode(info.name + ": "));
                contItemInfo.appendChild(namePosition);
                const position = document.createElement("span");
                position.appendChild(document.createTextNode(info.value));
                contItemInfo.appendChild(position);
                contInfo.appendChild(contItemInfo);
            })
            contStudent.appendChild(contInfo);
        }

        if (student.low.length > 0) {
            const nodeUL = document.createElement("ul");
            nodeUL.className = "ulPerformance ulLowPerformance";
            const nodeLI = document.createElement("li");
            nodeLI.className = "liPerformance liLowPerformance";
            let textNodeLI = null

            if (student.low.length === 1) {
                textNodeLI = document.createTextNode("Obtiene Desempeño Bajo en " + student.low.length + " asignatura");
            } else {
                textNodeLI = document.createTextNode("Obtiene Desempeño Bajo en " + student.low.length + " asignaturas");
            }

            const nodeULLow = document.createElement("ul");
            for (course of student.low) {
                const nodeLILow = document.createElement("li");
                const nameCourse = document.createElement("strong");
                nameCourse.appendChild(document.createTextNode(course.course + ": "));
                nameCourse.className = "nameCourse";
                nodeLILow.appendChild(nameCourse);
                nodeLILow.appendChild(document.createTextNode(course.score));
                nodeULLow.appendChild(nodeLILow);
            }

            nodeLI.appendChild(textNodeLI);
            nodeUL.appendChild(nodeLI);
            nodeUL.appendChild(nodeULLow);
            contStudent.appendChild(nodeUL);
        }
        if (student.basic.length > 0) {
            const nodeUL = document.createElement("ul");
            nodeUL.className = "ulPerformance ulBasicPerformance";
            const nodeLI = document.createElement("li");
            nodeLI.className = "liPerformance liBasicPerformance";
            let textNodeLI = null

            if (student.basic.length === 1) {
                textNodeLI = document.createTextNode("Obtiene Desempeño Básico en " + student.basic.length + " asignatura");
            } else {
                textNodeLI = document.createTextNode("Obtiene Desempeño Básico en " + student.basic.length + " asignaturas");
            }

            const nodeULBasic = document.createElement("ul");
            for (course of student.basic) {
                const nodeLIBasic = document.createElement("li");
                const nameCourse = document.createElement("strong");
                nameCourse.appendChild(document.createTextNode(course.course + ": "));
                nameCourse.className = "nameCourse";
                nodeLIBasic.appendChild(nameCourse);
                nodeLIBasic.appendChild(document.createTextNode(course.score));
                nodeULBasic.appendChild(nodeLIBasic);
            }

            nodeLI.appendChild(textNodeLI);
            nodeUL.appendChild(nodeLI);
            nodeUL.appendChild(nodeULBasic);
            contStudent.appendChild(nodeUL);
        }

        document.getElementById("list-obs").appendChild(contStudent);
        flagStudent++
    }
};