let dropZone = document.getElementById("dropZone");
let fileInput = document.getElementById("pdfFile");
let convertBtn = document.getElementById("convertBtn");
let outputDiv = document.getElementById("output");

// Drag & Drop File Upload
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "#f0f8ff";
});
dropZone.addEventListener("dragleave", () => {
    dropZone.style.backgroundColor = "white";
});
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
});

// Convert PDF to PNG
convertBtn.addEventListener("click", function () {
    let files = fileInput.files;
    if (files.length === 0) {
        alert("Please select at least one PDF file.");
        return;
    }

    outputDiv.innerHTML = "";
    for (let file of files) {
        processPDF(file);
    }
});

function processPDF(file) {
    let fileReader = new FileReader();
    fileReader.onload = function () {
        let typedarray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
            for (let i = 1; i <= pdf.numPages; i++) {
                pdf.getPage(i).then(function (page) {
                    let scale = 2;
                    let viewport = page.getViewport({ scale: scale });

                    let canvas = document.createElement("canvas");
                    let context = canvas.getContext("2d");
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    let renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };

                    page.render(renderContext).promise.then(() => {
                        let img = document.createElement("img");
                        img.src = canvas.toDataURL("image/png");

                        let downloadBtn = document.createElement("button");
                        downloadBtn.innerText = "Download Page " + i;
                        downloadBtn.className = "download-btn";
                        downloadBtn.onclick = function () {
                            let link = document.createElement("a");
                            link.href = img.src;
                            link.download = file.name.replace(".pdf", "-page-" + i + ".png");
                            link.click();
                        };

                        let pageContainer = document.createElement("div");
                        pageContainer.appendChild(img);
                        pageContainer.appendChild(downloadBtn);

                        outputDiv.appendChild(pageContainer);
                    });
                });
            }
        });
    };
    fileReader.readAsArrayBuffer(file);
}
