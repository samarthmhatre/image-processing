let inputFile = document.getElementById("imgUpload");
let previewImage = document.getElementById("previewImage");
let downloadBtn = document.querySelector(".downloadBtn");
let applyBtn = document.getElementById("applyBtn");
let transformSelect = document.getElementById("transformSelect");
let form = document.getElementById("imageForm"); 
let infoBox = document.getElementById("infoBox");

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
    let infoText = "";
    let infoTitle = transform ? transform : "Transformation Information";

   
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
            
            infoText = `
                <p>Translation shifts the image horizontally (tx) or vertically (ty) without changing its size.</p>
                <hr style="border-color: #555;">
                <p><strong>Theoretical Math:</strong><br>
                It uses an Affine Transformation Matrix (Homogeneous Coordinates):</p>
                <pre style="background: #333; padding: 5px; border-radius: 4px;">
[ 1   0   0 ]
[ 0   1   0 ]
[ tx  ty  1 ]</pre>
                <p><strong>Equations:</strong><br>
                x' = x + tx<br>
                y' = y + ty</p>
            `;
            break;

        case 'Rotating':
            inputField = createInput('param1', 'Angle in Degrees', 'Rotation Angle (Degrees)');
            form.insertBefore(inputField, applyBtn);
            
            infoText = `
                <p>Rotation turns the image around its center by the specified angle in degrees.</p>
                <hr style="border-color: #555;">
                <p><strong>Theoretical Math:</strong><br>
                It maps pixels using trigonometric functions of theta (θ):</p>
                <pre style="background: #333; padding: 5px; border-radius: 4px;">
[ cos(θ)  -sin(θ)  0 ]
[ sin(θ)   cos(θ)  0 ]
[   0        0     1 ]</pre>
                <p><strong>Equations:</strong><br>
                x' = x*cos(θ) + y*sin(θ)<br>
                y' = -x*sin(θ) + y*cos(θ)</p>
            `;
            break;

        case 'Scaling':
            form.insertBefore(createInput('param1', 'Scaling Factor X (sx)', 'Scaling Factor X (sx)'), applyBtn);
            form.insertBefore(createInput('param2', 'Scaling Factor Y (sy)', 'Scaling Factor Y (sy)'), applyBtn);
            
            infoText = `
                <p>Scaling resizes the image. Values > 1 zoom in, values < 1 zoom out.</p>
                <hr style="border-color: #555;">
                <p><strong>Theoretical Math:</strong><br>
                It uses a diagonal matrix to multiply coordinate axes:</p>
                <pre style="background: #333; padding: 5px; border-radius: 4px;">
[ sx  0   0 ]
[ 0   sy  0 ]
[ 0   0   1 ]</pre>
                <p><strong>Equations:</strong><br>
                x' = x * sx<br>
                y' = y * sy</p>
            `;
            break;

        case 'Contrast of image':
            inputField = createInput('param1', 'Contrast Level (-100 to 100)', 'Contrast Level');
            form.insertBefore(inputField, applyBtn);
            
            infoText = `
                <p>Contrast adjusts the difference between light and dark areas.</p>
                <hr style="border-color: #555;">
                <p><strong>Theoretical Math (Linear Mapping):</strong><br>
                <strong>Increase (Level > 0):</strong> Histogram Stretching.<br>
                <em>Formula:</em> Output = (Input - low) / (high - low)<br>
                <br>
                <strong>Decrease (Level < 0):</strong> Histogram Shrinking.<br>
                <em>Formula:</em> Output = Input * range + low
                </p>
            `;
            break;

        case 'Image Sharpening':
            inputField = createInput('param1', 'Sharpness Strength (0 to 100)', 'Sharpening Strength');
            form.insertBefore(inputField, applyBtn);
            
            infoText = `
                <p>Sharpening enhances the edges and fine details within the image.</p>
                <hr style="border-color: #555;">
                <p><strong>Theoretical Math (Unsharp Masking):</strong><br>
                It adds a high-pass filtered version of the image back onto itself.</p>
                <p><strong>Equation:</strong><br>
                I_sharp = I_original + Strength * (I_original - I_smooth)<br>
                <br>
                <em>(I_original - I_smooth) isolates the edges.</em></p>
            `;
            break;

        case 'Negative':
            
            infoText = `
                <p>Negative transformation inverts all pixel colors.</p>
                <hr style="border-color: #555;">
                <p><strong>Theoretical Math (Set Complement):</strong><br>
                This is a point operation. It subtracts the pixel value from the maximum intensity.</p>
                <p><strong>Equation:</strong><br>
                Pixel_new = 1.0 - Pixel_old<br>
                (assuming normalized 0-1 range)</p>
            `;
            break;

        default:
            infoText = "Select a transformation from the menu to see details and configure parameters.";
            infoTitle = "Transformation Information";
    }

   
    infoBox.innerHTML = `<h3>${infoTitle}</h3><div>${infoText}</div>`;
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
        const response = await fetch('https://Image-Processing.azurewebsites.net/api/process_image', {
            method: 'POST',
            body: formData 
        });

        const result = await response.json();

        if (response.ok && result.success) {
            previewImage.src = 'https://Image-Processing.azurewebsites.net' + result.processed_image_url;
            downloadBtn.style.display = "block";
        } else {
            alert("Error: " + (result.error || "Unknown error occurred on the server."));
            previewImage.src = originalImageURL; 
        }

    } catch (error) {
        console.error('Fetch error:', error);
        alert('Network Error: Could not connect to the Python Flask server.');
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
    link.download = `transformed_${transformSelect.value}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});