let inputFile = document.getElementById("imgUpload");
let previewImage = document.getElementById("previewImage");
let downloadBtn = document.querySelector(".downloadBtn");
let applyBtn = document.getElementById("applyBtn");
let transformSelect = document.getElementById("transformSelect");
let form = document.getElementById("imageForm");

let originalImageURL = "";

downloadBtn.style.display = "none";
applyBtn.disabled = true;

inputFile.addEventListener("change", function () {
    let file = this.files[0];
    if (file) {
        originalImageURL = URL.createObjectURL(file);
        previewImage.src = originalImageURL;
        applyBtn.disabled = false;
        downloadBtn.style.display = "none"; 
    } else {
        previewImage.src = "";
        applyBtn.disabled = true;
    }
});

transformSelect.addEventListener("change", function() {
    document.querySelectorAll('.param-input').forEach(el => el.remove());
    
    const transform = this.value;

    function createInput(id, placeholder, labelText) {
        const div = document.createElement('div');
        div.className = 'param-input';
        div.innerHTML = `
            <label for="${id}" style="display: block; margin-top: 10px; color: white;">${labelText}</label>
            <input type="number" id="${id}" placeholder="${placeholder}" value="0" style="width: 100%; padding: 10px; border-radius: 5px; border: none;">
        `;
        return div;
    }

    let inputField;
    switch (transform) {
        case 'Translation':
            form.insertBefore(createInput('param1', 'Horizontal Shift (tx)', 'Horizontal Shift (tx)'), applyBtn);
            form.insertBefore(createInput('param2', 'Vertical Shift (ty)', 'Vertical Shift (ty)'), applyBtn);
            break;
        case 'Rotating':
            inputField = createInput('param1', 'Angle in Degrees', 'Rotation Angle (Degrees)');
            form.insertBefore(inputField, applyBtn);
            break;
        case 'Scaling':
            form.insertBefore(createInput('param1', 'Scaling Factor X (sx)', 'Scaling Factor X (sx)'), applyBtn);
            form.insertBefore(createInput('param2', 'Scaling Factor Y (sy)', 'Scaling Factor Y (sy)'), applyBtn);s
            document.getElementById('param1').value = 1;
            document.getElementById('param2').value = 1;
            break;
        case 'Contrast of image':
            inputField = createInput('param1', 'Contrast Level (-100 to 100)', 'Contrast Level');
            form.insertBefore(inputField, applyBtn);
            break;
        case 'Image Sharpening':
            inputField = createInput('param1', 'Sharpness Strength (0 to 100)', 'Sharpening Strength');
            form.insertBefore(inputField, applyBtn);
            break;
    }
});

applyBtn.addEventListener("click", async function() {
    const file = inputFile.files[0];
    const transformationType = transformSelect.value;

    if (!file || !transformationType) {
        alert("Please upload an image and select a transformation.");
        return;
    }

    applyBtn.textContent = 'Processing...';
    applyBtn.disabled = true;
    downloadBtn.style.display = "none";
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('transformation', transformationType);
    formData.append('param1', document.getElementById('param1')?.value || '0');
    formData.append('param2', document.getElementById('param2')?.value || '0');

    try {
        const response = await fetch('/api/process_image', {
            method: 'POST',
            body: formData 
        });

        const result = await response.json();

        if (response.ok && result.success) {
            previewImage.src = result.processed_image_url + '?t=' + new Date().getTime();
            downloadBtn.style.display = "block";
        } else {
            alert("Error: " + (result.error || "Unknown error occurred."));
            previewImage.src = originalImageURL; 
        }

    } catch (error) {
        console.error('Fetch error:', error);
        alert('Network Error: Could not connect to the server.');
        previewImage.src = originalImageURL; 
    } finally {
        applyBtn.textContent = 'Apply Transformation';
        applyBtn.disabled = false;
    }
});


downloadBtn.addEventListener("click", function (){
    const imageUrl = previewImage.src;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `transformed_result.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});